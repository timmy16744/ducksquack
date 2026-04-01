#!/usr/bin/env python3
"""
Generate audio versions of essays using Qwen3-TTS voice cloning.

Usage:
    python scripts/generate-audio.py          # Generate only new/changed essays
    python scripts/generate-audio.py --force  # Regenerate all essays
    python scripts/generate-audio.py --model 0.6B  # Use smaller model
"""

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# Check for required packages before importing
try:
    import torch
    import soundfile as sf
    import numpy as np
except ImportError as e:
    print(f"Missing required package: {e.name}")
    print("Install with: pip install torch soundfile numpy")
    sys.exit(1)

try:
    from qwen_tts import Qwen3TTSModel
except ImportError:
    print("Qwen TTS not installed. Install with: pip install qwen-tts")
    sys.exit(1)

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
WRITINGS_DIR = PROJECT_DIR / "public" / "writings"
AUDIO_DIR = PROJECT_DIR / "public" / "audio"
VOICE_SAMPLES_DIR = PROJECT_DIR / "voice_samples"
CACHE_FILE = SCRIPT_DIR / ".audio_cache.json"

# Voice sample configuration
VOICE_SAMPLE_FILE = VOICE_SAMPLES_DIR / "tim_voice_sample.wav"
VOICE_TRANSCRIPT_FILE = VOICE_SAMPLES_DIR / "tim_voice_transcript.txt"

# Model configuration
MODELS = {
    "1.7B": "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
    "0.6B": "Qwen/Qwen3-TTS-12Hz-0.6B-Base",
}


def load_cache() -> dict:
    """Load the audio generation cache."""
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache: dict):
    """Save the audio generation cache."""
    CACHE_FILE.write_text(json.dumps(cache, indent=2))


def get_content_hash(content: str) -> str:
    """Get MD5 hash of essay content for change detection."""
    return hashlib.md5(content.encode()).hexdigest()


def needs_regeneration(slug: str, content_hash: str, cache: dict, force: bool) -> bool:
    """Check if an essay's audio needs to be regenerated."""
    if force:
        return True
    if slug not in cache:
        return True
    if cache[slug].get("hash") != content_hash:
        return True
    audio_path = AUDIO_DIR / f"{slug}.mp3"
    if not audio_path.exists():
        return True
    return False


def preprocess_for_speech(text: str) -> str:
    """Convert markdown essay text to speech-friendly format."""
    # Remove internal links like "Title" (/writings/slug/)
    text = re.sub(r'"([^"]+)"\s*\(\/writings\/[a-z0-9-]+\/?\)', r'\1', text)
    # Remove bare link patterns
    text = re.sub(r'\(\/writings\/[a-z0-9-]+\/?\)', '', text)

    # Expand common abbreviations for clearer pronunciation
    abbreviations = {
        'AI': 'A.I.',
        'GDP': 'G.D.P.',
        'OECD': 'O.E.C.D.',
        'US': 'U.S.',
        'UK': 'U.K.',
        'EU': 'E.U.',
        'CEO': 'C.E.O.',
        'PhD': 'P.H.D.',
        'USD': 'U.S. dollars',
        'AUD': 'Australian dollars',
    }
    for abbr, expansion in abbreviations.items():
        # Only replace standalone abbreviations (word boundaries)
        text = re.sub(rf'\b{abbr}\b', expansion, text)

    # Convert markdown emphasis to plain text
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*([^*]+)\*', r'\1', text)       # Italic
    text = re.sub(r'_([^_]+)_', r'\1', text)         # Underscore italic

    # Handle em dashes - add slight pauses
    text = text.replace('—', ', ')
    text = text.replace('–', ', ')

    # Clean up excessive whitespace but preserve paragraph structure
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)

    return text.strip()


def chunk_text(text: str, max_chars: int = 3000) -> list[str]:
    """
    Split text into chunks for processing, respecting paragraph and sentence boundaries.

    Qwen3-TTS handles long text well, but chunking improves consistency
    and allows for progress reporting.
    """
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If adding this paragraph exceeds limit, finalize current chunk
        if len(current_chunk) + len(para) + 2 > max_chars and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para

    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # If any chunk is still too long, split by sentences
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > max_chars:
            sentences = re.split(r'(?<=[.!?])\s+', chunk)
            sub_chunk = ""
            for sentence in sentences:
                if len(sub_chunk) + len(sentence) + 1 > max_chars and sub_chunk:
                    final_chunks.append(sub_chunk.strip())
                    sub_chunk = sentence
                else:
                    sub_chunk = (sub_chunk + " " + sentence).strip()
            if sub_chunk:
                final_chunks.append(sub_chunk.strip())
        else:
            final_chunks.append(chunk)

    return final_chunks


def generate_audio_for_essay(
    model: Qwen3TTSModel,
    text: str,
    output_path: Path,
    voice_prompt: dict,
):
    """Generate audio for an essay using voice cloning."""
    chunks = chunk_text(text)
    audio_segments = []
    sample_rate = None

    print(f"  Processing {len(chunks)} chunk(s)...")

    for i, chunk in enumerate(chunks, 1):
        print(f"    Chunk {i}/{len(chunks)} ({len(chunk)} chars)...")

        wavs, sr = model.generate_voice_clone(
            text=chunk,
            language="English",
            voice_clone_prompt=voice_prompt,
        )

        audio_segments.append(wavs[0])
        sample_rate = sr

    # Concatenate all segments with brief silence between paragraphs
    if len(audio_segments) == 1:
        combined = audio_segments[0]
    else:
        # Add 0.3 second silence between chunks
        silence = np.zeros(int(sample_rate * 0.3))
        combined_parts = []
        for i, segment in enumerate(audio_segments):
            combined_parts.append(segment)
            if i < len(audio_segments) - 1:
                combined_parts.append(silence)
        combined = np.concatenate(combined_parts)

    # Save as WAV first (lossless)
    wav_path = output_path.with_suffix('.wav')
    sf.write(str(wav_path), combined, sample_rate)

    # Convert to MP3 for smaller file size
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_wav(str(wav_path))
        audio.export(str(output_path), format="mp3", bitrate="128k")
        wav_path.unlink()  # Remove temp WAV
        print(f"    Saved: {output_path.name}")
    except ImportError:
        # If pydub not available, keep as WAV
        wav_path.rename(output_path.with_suffix('.wav'))
        print(f"    Saved as WAV (install pydub for MP3): {output_path.with_suffix('.wav').name}")

    return len(combined) / sample_rate  # Duration in seconds


def main():
    parser = argparse.ArgumentParser(description="Generate audio for essays using Qwen3-TTS")
    parser.add_argument("--force", action="store_true", help="Regenerate all audio files")
    parser.add_argument("--model", choices=["1.7B", "0.6B"], default="1.7B", help="Model size to use")
    parser.add_argument("--slug", help="Generate audio for a specific essay only")
    args = parser.parse_args()

    # Check voice sample exists
    if not VOICE_SAMPLE_FILE.exists():
        print(f"Error: Voice sample not found at {VOICE_SAMPLE_FILE}")
        print("Please record a 15-30 second voice sample and save it there.")
        sys.exit(1)

    if not VOICE_TRANSCRIPT_FILE.exists():
        print(f"Error: Voice transcript not found at {VOICE_TRANSCRIPT_FILE}")
        print("Please create a text file with the transcript of your voice sample.")
        sys.exit(1)

    # Check writings exist
    index_path = WRITINGS_DIR / "index.json"
    if not index_path.exists():
        print(f"Error: Writings index not found at {index_path}")
        print("Run 'npm run generate:writings' first.")
        sys.exit(1)

    # Ensure audio directory exists
    AUDIO_DIR.mkdir(exist_ok=True)

    # Load cache and writings index
    cache = load_cache()
    writings = json.loads(index_path.read_text())
    voice_transcript = VOICE_TRANSCRIPT_FILE.read_text().strip()

    # Filter to specific slug if requested
    if args.slug:
        writings = [w for w in writings if w["slug"] == args.slug]
        if not writings:
            print(f"Error: Essay '{args.slug}' not found")
            sys.exit(1)

    # Find essays that need processing
    to_process = []
    for essay in writings:
        slug = essay["slug"]
        essay_path = WRITINGS_DIR / f"{slug}.json"
        if not essay_path.exists():
            print(f"Warning: Essay JSON not found: {slug}")
            continue

        essay_data = json.loads(essay_path.read_text())
        content_hash = get_content_hash(essay_data["content"])

        if needs_regeneration(slug, content_hash, cache, args.force):
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
    print(f"Model: {MODELS[args.model]}")
    print()

    # Load model
    print("Loading Qwen3-TTS model...")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.bfloat16 if device.startswith("cuda") else torch.float32

    # Check for flash attention, fall back to sdpa (PyTorch native)
    attn_impl = "sdpa"  # PyTorch's scaled_dot_product_attention - faster than eager
    try:
        import flash_attn
        attn_impl = "flash_attention_2"
        print("Using FlashAttention 2.")
    except ImportError:
        print("Note: FlashAttention not installed. Using SDPA (PyTorch native).")

    model = Qwen3TTSModel.from_pretrained(
        MODELS[args.model],
        device_map=device,
        dtype=dtype,
        attn_implementation=attn_impl,
    )

    # Create reusable voice prompt (avoids re-processing reference audio)
    print("Processing voice sample...")
    voice_prompt = model.create_voice_clone_prompt(
        ref_audio=str(VOICE_SAMPLE_FILE),
        ref_text=voice_transcript,
        x_vector_only_mode=False,
    )

    # Process each essay
    successful = 0
    failed = []

    for essay in to_process:
        slug = essay["slug"]
        print(f"\nGenerating: {essay['title']}")

        try:
            speech_text = preprocess_for_speech(essay["content"])
            output_path = AUDIO_DIR / f"{slug}.mp3"

            duration = generate_audio_for_essay(
                model=model,
                text=speech_text,
                output_path=output_path,
                voice_prompt=voice_prompt,
            )

            # Update cache
            cache[slug] = {
                "hash": essay["hash"],
                "duration": int(duration),
            }
            successful += 1

        except Exception as e:
            print(f"  Error: {e}")
            failed.append(slug)

    # Save cache
    save_cache(cache)

    # Summary
    print(f"\n{'='*50}")
    print(f"Generated: {successful}/{len(to_process)} essays")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print()


if __name__ == "__main__":
    main()
