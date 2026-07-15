#!/usr/bin/env python3
"""
Write one episode of the sleep podcast with the Claude API.

Each episode is the complete life story of one small creature, told in the
first person, slowly, for sleep. The narrator of episode N+1 is the animal
that took the narrator of episode N at the end of its story, so the episodes
chain together seamlessly.

Outputs (per episode):
    podcast/episodes/<slug>/script.md   - the full narration script
    podcast/episodes/<slug>/meta.json   - title, description, chain info
    podcast/state.json                  - updated chain state
    podcast/.last_episode               - slug of the episode just written

Usage:
    ANTHROPIC_API_KEY=... python scripts/podcast/write_episode.py
    ANTHROPIC_API_KEY=... python scripts/podcast/write_episode.py --test
"""

import argparse
import datetime
import json
import re
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parents[2]
PODCAST_DIR = ROOT / "podcast"
EPISODES_DIR = PODCAST_DIR / "episodes"
STATE_FILE = PODCAST_DIR / "state.json"

STYLE_RULES = """\
You are the writer for an overnight sleep podcast. Each episode is the
complete life story of one small creature - an insect, spider, amphibian,
bird, or other small animal - told entirely in the first person by the
creature itself, from its first moment of awareness to its final one.

Non-negotiable style rules:
- The listener is falling asleep. The prose must be calm, slow, warm, and
  hypnotic. Long, gentle sentences. Soft repetition of images and phrases.
  Rich, unhurried sensory detail of a very small world: dew, soil, bark,
  moonlight, the hum of other lives.
- Nothing startles. There are no cliffhangers, no sudden action, no dread.
  Even hunger, weather, and predators are described softly, as facts of a
  small life, never as horror.
- The death at the end is peaceful and accepting - a warm passing, a
  returning, almost a relief. The narrator is never afraid at the end.
- Biologically grounded: the real life cycle, senses, and habits of the
  species, rendered poetically but accurately.
- Plain flowing paragraphs only. No headings, no lists, no dialogue
  formatting, no asides to the listener after the opening, no breaking
  character, no mention of podcasts or episodes.
- Present the story in past tense, as a life remembered."""


def load_json(path: Path, default):
    if path.exists():
        return json.loads(path.read_text())
    return default


def slugify(text: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text[:40] or "creature"


PLAN_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["species", "title", "description", "setting", "chapters", "death"],
    "properties": {
        "species": {
            "type": "string",
            "description": "Common name of the narrator species, lowercase, e.g. 'garden orb-weaver spider'",
        },
        "title": {
            "type": "string",
            "description": "Episode title, e.g. 'The Firefly Who Loved the Dark Between Flashes'",
        },
        "description": {
            "type": "string",
            "description": "Two or three calm sentences describing this episode for the podcast feed.",
        },
        "setting": {"type": "string", "description": "Where and when this life takes place."},
        "chapters": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["title", "summary"],
                "properties": {
                    "title": {"type": "string"},
                    "summary": {
                        "type": "string",
                        "description": "3-5 sentences describing what this chapter of the life covers.",
                    },
                },
            },
        },
        "death": {
            "type": "object",
            "additionalProperties": False,
            "required": ["predator_species", "scene"],
            "properties": {
                "predator_species": {
                    "type": "string",
                    "description": "Common name of the creature that gently takes the narrator at the end. Must itself be a small animal whose own life story could narrate the next episode.",
                },
                "scene": {
                    "type": "string",
                    "description": "How the final moment happens, described so the next episode can open from the predator's point of view remembering it.",
                },
            },
        },
    },
}


def plan_episode(client, cfg, state, n_chapters, test):
    episodes = state.get("episodes", [])
    number = len(episodes) + 1
    link = state.get("next")  # {"species", "kill_context", "victim"} or None

    if link:
        narrator_line = (
            f"The narrator of this episode is: {link['species']}.\n"
            f"In the previous episode, this creature took the life of the previous "
            f"narrator ({link['victim']}). That moment: {link['kill_context']}\n"
            "Chapter 1 must OPEN with the narrator quietly remembering that very "
            "moment - the small life it carried away - before drifting back to the "
            "beginning of its own life. This is how the episodes chain together."
        )
    else:
        narrator_line = (
            f"This is the first episode. The narrator is: {cfg['seed_animal']}.\n"
            "Chapter 1 may open with a brief, gentle welcome that folds into the "
            "story (a soft invitation to close your eyes and become very small), "
            "then begins at the narrator's first moment of awareness."
        )

    prompt = f"""{STYLE_RULES}

Plan episode {number} of the podcast.

{narrator_line}

Produce a plan with EXACTLY {n_chapters} chapters covering the narrator's whole
life in order: emergence, first senses, growth and molts or metamorphosis,
daily rhythms, seasons, encounters with other small lives, aging, and in the
final chapter, the peaceful ending. Chapters should each cover a distinct
stretch of the life so a very long story never repeats itself.

For the death: choose a predator species that would genuinely prey on this
narrator in this habitat, that has NOT narrated a previous episode, and whose
own life would make a rich next episode. Previously used narrators: {json.dumps([e.get("narrator") for e in episodes]) if episodes else "none yet"}.
"""

    response = client.messages.create(
        model=cfg["writer_model"],
        max_tokens=8000,
        thinking={"type": "adaptive"},
        output_config={"format": {"type": "json_schema", "schema": PLAN_SCHEMA}},
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("Planning request was refused; try re-running.")
    text = next(b.text for b in response.content if b.type == "text")
    plan = json.loads(text)
    plan["number"] = number
    # Guarantee the requested chapter count even if the model over/under-delivers
    plan["chapters"] = plan["chapters"][:n_chapters]
    while len(plan["chapters"]) < n_chapters:
        plan["chapters"].append(
            {"title": "The days between", "summary": "Quiet, uneventful stretches of this life, in loving detail."}
        )
    return plan


def write_chapter(client, cfg, plan, index, words, prev_tail, link):
    chapter = plan["chapters"][index]
    total = len(plan["chapters"])
    is_first = index == 0
    is_last = index == total - 1

    special = ""
    if is_first and link:
        special = (
            "OPENING RULE: begin with the narrator softly remembering the moment it "
            f"took the previous narrator's life ({link['victim']}): {link['kill_context']} "
            "Treat that memory with tenderness, then drift back to the narrator's own beginning."
        )
    elif is_first:
        special = (
            "OPENING RULE: begin with one short, gentle paragraph welcoming the "
            "listener to close their eyes and become very small, folding seamlessly "
            "into the narrator's first moment of awareness."
        )
    if is_last:
        special += (
            "\nENDING RULE: this chapter ends the life. The narrator is taken by "
            f"a {plan['death']['predator_species']}: {plan['death']['scene']} "
            "Render it as peaceful, warm, and complete - a soft closing of the day. "
            "End on stillness, suitable for a sleeping listener."
        )

    continuity = (
        f"The previous chapter ended with:\n...{prev_tail}\n\nContinue smoothly from there."
        if prev_tail
        else "This is the start of the episode."
    )

    prompt = f"""{STYLE_RULES}

You are writing chapter {index + 1} of {total} of one episode.

Narrator: {plan['species']}
Setting: {plan['setting']}
Full outline: {json.dumps([c['title'] for c in plan['chapters']])}
This chapter - "{chapter['title']}": {chapter['summary']}

{special}

{continuity}

Write approximately {words} words of continuous narration for this chapter.
Plain paragraphs separated by blank lines. No heading, no chapter number,
no title - only the narration itself."""

    with client.messages.stream(
        model=cfg["writer_model"],
        max_tokens=16000,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        message = stream.get_final_message()
    if message.stop_reason == "refusal":
        raise RuntimeError(f"Chapter {index + 1} request was refused; try re-running.")
    return next(b.text for b in message.content if b.type == "text").strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Write a tiny 2-chapter episode for pipeline testing")
    args = parser.parse_args()

    cfg = json.loads((PODCAST_DIR / "config.json").read_text())
    state = load_json(STATE_FILE, {"next": None, "episodes": []})

    if args.test:
        n_chapters, words_per_chapter = 2, 250
    else:
        n_chapters = cfg["chapters"]
        total_words = int(cfg["target_hours"] * 60 * cfg["words_per_minute"])
        words_per_chapter = total_words // n_chapters

    client = anthropic.Anthropic(max_retries=4)

    print(f"Planning episode {len(state['episodes']) + 1}...")
    plan = plan_episode(client, cfg, state, n_chapters, args.test)
    slug = f"ep-{plan['number']:03d}-{slugify(plan['species'])}"
    print(f"  narrator: {plan['species']}")
    print(f"  title:    {plan['title']}")
    print(f"  ends by:  {plan['death']['predator_species']}")

    link = state.get("next")
    chapters_text = []
    tail = ""
    for i in range(n_chapters):
        print(f"Writing chapter {i + 1}/{n_chapters} (~{words_per_chapter} words)...")
        text = write_chapter(client, cfg, plan, i, words_per_chapter, tail, link)
        chapters_text.append(text)
        tail = text[-1500:]

    ep_dir = EPISODES_DIR / slug
    ep_dir.mkdir(parents=True, exist_ok=True)

    script_lines = [f"# {plan['title']}", ""]
    for i, text in enumerate(chapters_text):
        script_lines += [f"## {plan['chapters'][i]['title']}", "", text, ""]
    script = "\n".join(script_lines)
    (ep_dir / "script.md").write_text(script)

    word_count = len(re.findall(r"\S+", script))
    meta = {
        "number": plan["number"],
        "slug": slug,
        "title": plan["title"],
        "narrator": plan["species"],
        "description": plan["description"],
        "setting": plan["setting"],
        "next_predator": plan["death"]["predator_species"],
        "date": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "words": word_count,
        "test": args.test,
        "audio": {"url": None, "bytes": None, "seconds": None},
    }
    (ep_dir / "meta.json").write_text(json.dumps(meta, indent=2))

    state["episodes"].append({"number": plan["number"], "slug": slug, "narrator": plan["species"], "title": plan["title"]})
    state["next"] = {
        "species": plan["death"]["predator_species"],
        "victim": plan["species"],
        "kill_context": plan["death"]["scene"],
    }
    STATE_FILE.write_text(json.dumps(state, indent=2))
    (PODCAST_DIR / ".last_episode").write_text(slug)

    print(f"Done: {slug} ({word_count} words). Next narrator: {plan['death']['predator_species']}")


if __name__ == "__main__":
    sys.exit(main())
