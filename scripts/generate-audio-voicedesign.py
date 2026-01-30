#!/usr/bin/env python3
"""Generate audio using voice design (text description instead of voice cloning)."""

import argparse
import hashlib
import json
import re
from pathlib import Path

import numpy as np
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
WRITINGS_DIR = PROJECT_DIR / "public" / "writings"
AUDIO_DIR = PROJECT_DIR / "public" / "audio"
CACHE_FILE = SCRIPT_DIR / ".audio_cache.json"

# Voice description for Tim
VOICE_DESCRIPTION = """A deep-voiced male speaker with an Australian accent, speaking with a slightly rough, gravelly edge to his tone. The voice is low-pitched and resonant with a hint of harshness that conveys authenticity and directness. He speaks with the relaxed cadence typical of Australians, using natural pauses and a conversational flow. The delivery is intimate but carries weight - like a thoughtful, no-nonsense podcast host sharing hard truths late at night."""


def load_cache() -> dict:
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache: dict):
    CACHE_FILE.write_text(json.dumps(cache, indent=2))


def get_content_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()


def preprocess_for_speech(text: str) -> str:
    """Convert markdown to speech-friendly text."""
    text = re.sub(r'"([^"]+)"\s*\(\/writings\/[a-z0-9-]+\/?\)', r'\1', text)
    text = re.sub(r'\(\/writings\/[a-z0-9-]+\/?\)', '', text)

    abbreviations = {
        'AI': 'A.I.',
        'GDP': 'G.D.P.',
        'US': 'U.S.',
        'UK': 'U.K.',
    }
    for abbr, expansion in abbreviations.items():
        text = re.sub(rf'\b{abbr}\b', expansion, text)

    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = text.replace('—', ', ')
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def chunk_text(text: str, max_chars: int = 2000) -> list[str]:
    """Split text into chunks at paragraph boundaries."""
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) + 2 > max_chars and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk = (current_chunk + "\n\n" + para).strip()

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def generate_audio(model, text: str, output_path: Path):
    """Generate audio with voice design."""
    chunks = chunk_text(text)
    audio_segments = []
    sample_rate = None

    print(f"  Processing {len(chunks)} chunk(s)...")

    for i, chunk in enumerate(chunks, 1):
        print(f"    Chunk {i}/{len(chunks)} ({len(chunk)} chars)...")

        wavs, sr = model.generate_voice_design(
            text=chunk,
            language="English",
            instruct=VOICE_DESCRIPTION,
        )

        audio_segments.append(wavs[0])
        sample_rate = sr

    # Concatenate with brief silence between chunks
    if len(audio_segments) == 1:
        combined = audio_segments[0]
    else:
        silence = np.zeros(int(sample_rate * 0.4))
        combined_parts = []
        for i, segment in enumerate(audio_segments):
            combined_parts.append(segment)
            if i < len(audio_segments) - 1:
                combined_parts.append(silence)
        combined = np.concatenate(combined_parts)

    # Save as WAV first
    wav_path = output_path.with_suffix('.wav')
    sf.write(str(wav_path), combined, sample_rate)

    # Convert to MP3
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_wav(str(wav_path))
        audio.export(str(output_path), format="mp3", bitrate="128k")
        wav_path.unlink()
        print(f"    Saved: {output_path.name}")
    except ImportError:
        wav_path.rename(output_path.with_suffix('.wav'))
        print(f"    Saved as WAV: {output_path.with_suffix('.wav').name}")

    return len(combined) / sample_rate


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Generate for specific essay only")
    parser.add_argument("--force", action="store_true", help="Regenerate all")
    args = parser.parse_args()

    AUDIO_DIR.mkdir(exist_ok=True)
    cache = load_cache()

    # Load essays
    index = json.loads((WRITINGS_DIR / "index.json").read_text())

    if args.slug:
        index = [e for e in index if e["slug"] == args.slug]
        if not index:
            print(f"Essay '{args.slug}' not found")
            return

    # Find essays to process
    to_process = []
    for essay in index:
        slug = essay["slug"]
        essay_data = json.loads((WRITINGS_DIR / f"{slug}.json").read_text())
        content_hash = get_content_hash(essay_data["content"])

        needs_gen = args.force or slug not in cache or cache[slug].get("hash") != content_hash
        if not needs_gen:
            audio_path = AUDIO_DIR / f"AI_{slug}.mp3"
            needs_gen = not audio_path.exists()

        if needs_gen:
            to_process.append({
                "slug": slug,
                "title": essay["title"],
                "content": essay_data["content"],
                "hash": content_hash,
            })

    if not to_process:
        print("All audio files are up to date.")
        return

    print(f"\nProcessing {len(to_process)} essay(s)...")
    print("Model: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign\n")

    # Load model
    print("Loading model...")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device_map=device,
        dtype=torch.bfloat16,
        attn_implementation="sdpa",
    )

    # Process essays
    successful = 0
    failed = []

    for essay in to_process:
        slug = essay["slug"]
        print(f"\nGenerating: {essay['title']}")

        try:
            speech_text = preprocess_for_speech(essay["content"])
            output_path = AUDIO_DIR / f"AI_{slug}.mp3"

            duration = generate_audio(model, speech_text, output_path)

            cache[slug] = {"hash": essay["hash"], "duration": int(duration)}
            successful += 1
        except Exception as e:
            print(f"  Error: {e}")
            failed.append(slug)

    save_cache(cache)

    print(f"\n{'='*50}")
    print(f"Generated: {successful}/{len(to_process)} essays")
    if failed:
        print(f"Failed: {', '.join(failed)}")


if __name__ == "__main__":
    main()
