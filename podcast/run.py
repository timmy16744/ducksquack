#!/usr/bin/env python3
"""AnimalCast orchestrator — build (and optionally publish) one daily episode.

Examples:
    python run.py --dry-run                 # script only, no audio/upload
    python run.py --animal platypus         # full local build of one animal
    python run.py --minutes 420             # a 7-hour episode
    python run.py --publish                 # next animal in rotation, upload + feed
    python run.py --tts elevenlabs --publish

Run from the podcast/ directory.
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from animalcast import config, state, script_gen, textproc  # noqa: E402

ROOT = Path(__file__).resolve().parent
EPISODES = ROOT / "episodes"


def log(msg: str) -> None:
    print(msg, flush=True)


def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _overrides(args) -> dict:
    o: dict = {}
    if args.minutes:
        o.setdefault("episode", {})["target_minutes"] = args.minutes
    if args.tts:
        o.setdefault("tts", {})["provider"] = args.tts
    if args.script_provider:
        o.setdefault("script", {})["provider"] = args.script_provider
    return o


def pick_animal(args, st, cfg):
    if args.animal:
        a = state.find_animal(args.animal)
        if a:
            return a
        # Not in the seed list — treat the arg as an ad-hoc animal name.
        slug = args.animal.strip().lower().replace(" ", "-")
        return {"name": args.animal.strip().title(), "slug": slug, "hint": ""}

    a = state.next_animal(st, cfg["rotation"].get("order", "sequential"))
    if a:
        return a
    if cfg["rotation"].get("auto_extend_with_llm"):
        log("Seed list exhausted — asking the LLM for new animals...")
        existing = [x["name"] for x in state.load_animals()]
        proposed = script_gen.propose_new_animals(cfg, existing, count=10)
        for p in proposed:
            state.add_animal(st, p)
        return state.next_animal(st, cfg["rotation"].get("order", "sequential"))
    raise SystemExit("No animals left and auto_extend_with_llm is off.")


def write_script_artifacts(out_dir: Path, script) -> None:
    import json
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "outline.json").write_text(json.dumps(
        {"title": script.title, "persona_note": script.persona_note,
         "chapters": [{"title": c.title, "beat": c.beat} for c in script.chapters]},
        indent=2))
    (out_dir / "script.json").write_text(json.dumps(script.to_dict(), indent=2))
    md = [f"# {script.title}\n", f"_{script.persona_note}_\n"]
    for c in script.chapters:
        md.append(f"\n## {c.title}\n\n{c.text}\n")
    (out_dir / "script.md").write_text("\n".join(md))


def synth_chapters(script, cfg, out_dir: Path):
    """Synthesize audio per chapter; return chapter_segments for assemble."""
    from animalcast import providers
    provider = providers.get_provider(cfg)
    voice = provider.voice_for(script.animal.get("slug"))
    seg_dir = out_dir / "segments"
    seg_dir.mkdir(parents=True, exist_ok=True)

    ep = cfg["episode"]
    intro = ep.get("intro", "").format(animal=script.animal["name"].lower())
    outro = ep.get("outro", "").format(animal=script.animal["name"].lower())

    chapter_segments = []
    for ci, ch in enumerate(script.chapters):
        body = ch.text
        if ci == 0 and intro:
            body = f"{intro}\n\n{body}"
        if ci == len(script.chapters) - 1 and outro:
            body = f"{body}\n\n{outro}"
        speak = textproc.preprocess_for_speech(body)
        files = []
        for cj, chunk in enumerate(provider.chunk(speak)):
            fp = seg_dir / f"ch{ci:03d}_{cj:03d}.{provider.ext}"
            log(f"    tts ch{ci + 1}.{cj + 1} ({len(chunk)} chars)")
            provider.synth_chunk(chunk, fp, voice)
            files.append(fp)
        chapter_segments.append({"title": ch.title, "files": files})
    return chapter_segments


def main() -> None:
    p = argparse.ArgumentParser(description="Build a daily AnimalCast episode")
    p.add_argument("--animal", help="slug/name to produce (default: next in rotation)")
    p.add_argument("--minutes", type=int, help="override target length in minutes")
    p.add_argument("--tts", choices=["openai", "elevenlabs", "qwen_local"])
    p.add_argument("--script-provider", choices=["anthropic", "openai"])
    p.add_argument("--dry-run", action="store_true", help="script only; no audio/upload")
    p.add_argument("--no-audio", action="store_true", help="alias for --dry-run")
    p.add_argument("--publish", action="store_true", help="upload audio + refresh feed")
    args = p.parse_args()

    cfg = config.load_config(_overrides(args))
    st = state.load_state()
    animal = pick_animal(args, st, cfg)
    date = _today()
    slug = animal["slug"]
    out_dir = EPISODES / f"{date}-{slug}"

    log(f"\n🐾 {animal['name']} — {cfg['episode']['target_minutes']} min target — {date}")

    # 1) Script
    log("→ Writing script...")
    script = script_gen.generate_episode_script(animal, cfg, progress=log)
    write_script_artifacts(out_dir, script)
    log(f"   script saved to {out_dir}")

    if args.dry_run or args.no_audio:
        log("✓ Dry run complete (script only).")
        return

    # 2) Audio
    log("→ Synthesizing voice...")
    chapter_segments = synth_chapters(script, cfg, out_dir)

    # 3) Assemble
    from animalcast import assemble
    log("→ Assembling episode...")
    episode_mp3 = out_dir / "episode.mp3"
    tags = {
        "title": script.title,
        "artist": cfg["show"]["author"],
        "album": cfg["show"]["title"],
        "genre": "Podcast",
        "date": date,
    }
    result = assemble.build_episode(chapter_segments, episode_mp3, cfg, tags, progress=log)
    mins = result["duration_seconds"] / 60
    log(f"   episode.mp3 — {mins:.1f} min, {result['bytes'] / 1e6:.1f} MB")

    # 4) Episode metadata + registry
    import json
    episode_number = len(st.get("episodes", [])) + 1
    guid = f"animalcast-{date}-{slug}"
    description = (f"First-person, one full day in the life of a {animal['name'].lower()}. "
                  f"{script.persona_note}").strip()
    episode_meta = {
        "slug": slug, "name": animal["name"], "title": script.title, "date": date,
        "guid": guid, "episode_number": episode_number,
        "duration_seconds": round(result["duration_seconds"]),
        "bytes": result["bytes"], "description": description,
        "chapters": result["chapters"],
    }
    (out_dir / "episode.json").write_text(json.dumps(episode_meta, indent=2))

    # 5) Publish
    if args.publish:
        from animalcast import publish
        log("→ Uploading + refreshing feed...")
        key = f"episodes/{date}-{slug}.mp3"
        audio_url = publish.upload_audio(cfg, episode_mp3, key)
        episode_meta["audio_url"] = audio_url
        state.register_episode(st, episode_meta)
        state.mark_used(st, slug)
        feed_path = publish.publish_feed(cfg, st["episodes"])
        state.save_state(st)
        log(f"   audio: {audio_url}")
        log(f"   feed:  {feed_path}")
        log("✓ Published. Spotify/Apple will ingest on their next poll.")
    else:
        # Local build still advances the rotation so reruns vary.
        state.mark_used(st, slug)
        state.save_state(st)
        log("✓ Built locally (not published). Add --publish to upload.")


if __name__ == "__main__":
    main()
