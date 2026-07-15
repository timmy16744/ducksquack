#!/usr/bin/env python3
"""
Convert an episode script into a single Spotify-ready MP3.

Pipeline: split the script into paragraphs -> synthesize each paragraph with
a calm voice -> insert sleep pauses between paragraphs and chapters ->
concatenate with ffmpeg -> loudness-normalize to -16 LUFS -> tag and write
output/<slug>.mp3. Duration and file size are written back into the
episode's meta.json.

Two free TTS engines (podcast/config.json -> "tts_engine"):
    "edge"  - Microsoft Edge neural voices via edge-tts. Best quality.
              Needs network + WebSocket access (fine on GitHub Actions).
    "piper" - Piper TTS, runs fully offline on CPU. No network dependency,
              slightly more synthetic voice. The reliable fallback.

Requires ffmpeg + ffprobe on PATH.

Usage:
    python scripts/podcast/synthesize.py                # uses podcast/.last_episode
    python scripts/podcast/synthesize.py --episode ep-001-firefly
    python scripts/podcast/synthesize.py --engine piper # override config
"""

import argparse
import asyncio
import json
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PODCAST_DIR = ROOT / "podcast"
EPISODES_DIR = PODCAST_DIR / "episodes"
OUTPUT_DIR = ROOT / "output"
PIPER_CACHE = ROOT / ".cache" / "piper"

EDGE_SAMPLE_RATE = 24000   # edge-tts mp3 output
PIPER_SAMPLE_RATE = 22050  # piper medium/high voices
CONCURRENCY = 4
MAX_RETRIES = 4

PIPER_VOICE_BASE = "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0"


def parse_script(script: str, cfg):
    """Return a list of ('text', paragraph) / ('pause', seconds) items."""
    items = []
    for block in script.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        if block.startswith("## "):
            # Chapter boundary: a long pause instead of reading the heading
            if items:
                items.append(("pause", float(cfg["chapter_pause_s"])))
            continue
        if block.startswith("# "):
            continue  # episode title, not read aloud
        paragraph = " ".join(line.strip() for line in block.splitlines())
        items.append(("text", paragraph))
        items.append(("pause", float(cfg["paragraph_pause_s"])))
    if items and items[-1][0] == "pause":
        items.pop()
    return items


# ---------------------------------------------------------------- edge-tts

async def edge_synth_one(sem, cfg, text, path, index, total):
    import edge_tts

    async with sem:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts.Communicate(
                    text, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"]
                )
                await communicate.save(str(path))
                if path.stat().st_size > 0:
                    print(f"  [{index + 1}/{total}] ok")
                    return
                raise RuntimeError("empty audio file")
            except Exception as e:
                if attempt == MAX_RETRIES:
                    raise
                wait = 2 ** attempt
                print(f"  [{index + 1}/{total}] retry {attempt} in {wait}s: {e}")
                await asyncio.sleep(wait)


def edge_synthesize(cfg, texts, workdir):
    async def run():
        sem = asyncio.Semaphore(CONCURRENCY)
        await asyncio.gather(
            *(
                edge_synth_one(sem, cfg, text, workdir / f"chunk_{i:05d}.mp3", i, len(texts))
                for i, text in enumerate(texts)
            )
        )

    asyncio.run(run())
    return ".mp3", EDGE_SAMPLE_RATE


# ------------------------------------------------------------------ piper

def ensure_piper_voice(voice: str) -> Path:
    """Download the Piper voice model into a local cache if missing."""
    # e.g. "en_US-ryan-high" -> en/en_US/ryan/high/en_US-ryan-high.onnx
    lang_region, name, quality = voice.rsplit("-", 2)
    lang = lang_region.split("_")[0]
    PIPER_CACHE.mkdir(parents=True, exist_ok=True)
    model = PIPER_CACHE / f"{voice}.onnx"
    for suffix in (".onnx", ".onnx.json"):
        dest = PIPER_CACHE / f"{voice}{suffix}"
        if not dest.exists():
            url = f"{PIPER_VOICE_BASE}/{lang}/{lang_region}/{name}/{quality}/{voice}{suffix}"
            print(f"Downloading {url}")
            urllib.request.urlretrieve(url, dest)
    return model


def piper_synthesize(cfg, texts, workdir):
    voice = cfg.get("piper_voice", "en_US-ryan-high")
    length_scale = str(cfg.get("piper_length_scale", 1.25))
    model = ensure_piper_voice(voice)
    piper = shutil.which("piper")
    if not piper:
        sys.exit("piper not found (pip install piper-tts)")
    for i, text in enumerate(texts):
        path = workdir / f"chunk_{i:05d}.wav"
        subprocess.run(
            [piper, "-m", str(model), "--length-scale", length_scale,
             "--sentence-silence", "0.6", "-f", str(path)],
            input=text, text=True, check=True, capture_output=True,
        )
        print(f"  [{i + 1}/{len(texts)}] ok")
    return ".wav", PIPER_SAMPLE_RATE


# ----------------------------------------------------------------- ffmpeg

def make_silence(seconds, workdir, cache, ext, sample_rate):
    key = f"{seconds:.2f}"
    if key in cache:
        return cache[key]
    path = workdir / f"silence_{key.replace('.', '_')}{ext}"
    codec = ["-c:a", "libmp3lame", "-b:a", "48k"] if ext == ".mp3" else ["-c:a", "pcm_s16le"]
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error",
         "-f", "lavfi", "-i", f"anullsrc=r={sample_rate}:cl=mono",
         "-t", str(seconds), *codec, str(path)],
        check=True,
    )
    cache[key] = path
    return path


def ffprobe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--episode", help="Episode slug (defaults to podcast/.last_episode)")
    parser.add_argument("--engine", choices=["edge", "piper"], help="Override tts_engine from config")
    args = parser.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("ffmpeg and ffprobe are required (apt-get install ffmpeg)")

    cfg = json.loads((PODCAST_DIR / "config.json").read_text())
    engine = args.engine or cfg.get("tts_engine", "edge")
    slug = args.episode or (PODCAST_DIR / ".last_episode").read_text().strip()
    ep_dir = EPISODES_DIR / slug
    meta_path = ep_dir / "meta.json"
    meta = json.loads(meta_path.read_text())
    script = (ep_dir / "script.md").read_text()

    items = parse_script(script, cfg)
    texts = [payload for kind, payload in items if kind == "text"]
    print(f"{slug}: {len(texts)} paragraphs to synthesize with {engine}")

    OUTPUT_DIR.mkdir(exist_ok=True)
    out_path = OUTPUT_DIR / f"{slug}.mp3"

    with tempfile.TemporaryDirectory(prefix="podcast_tts_") as tmp:
        workdir = Path(tmp)
        if engine == "piper":
            ext, sample_rate = piper_synthesize(cfg, texts, workdir)
        else:
            ext, sample_rate = edge_synthesize(cfg, texts, workdir)

        # Build the concat list in script order
        silence_cache = {}
        concat_lines = []
        chunk_index = 0
        for kind, payload in items:
            if kind == "text":
                concat_lines.append(f"file '{workdir / f'chunk_{chunk_index:05d}{ext}'}'")
                chunk_index += 1
            else:
                concat_lines.append(
                    f"file '{make_silence(payload, workdir, silence_cache, ext, sample_rate)}'"
                )
        concat_file = workdir / "concat.txt"
        concat_file.write_text("\n".join(concat_lines) + "\n")

        print("Concatenating and normalizing (this can take a while for long episodes)...")
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-f", "concat", "-safe", "0", "-i", str(concat_file),
                "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k",
                "-metadata", f"title={meta['title']}",
                "-metadata", f"artist={cfg['author']}",
                "-metadata", f"album={cfg['title']}",
                "-metadata", f"track={meta['number']}",
                str(out_path),
            ],
            check=True,
        )

    seconds = ffprobe_duration(out_path)
    size = out_path.stat().st_size
    meta["audio"]["bytes"] = size
    meta["audio"]["seconds"] = round(seconds, 1)
    meta_path.write_text(json.dumps(meta, indent=2))

    print(f"Wrote {out_path} ({size / 1e6:.1f} MB, {seconds / 3600:.2f} h)")


if __name__ == "__main__":
    main()
