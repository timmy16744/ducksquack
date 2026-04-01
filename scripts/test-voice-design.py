#!/usr/bin/env python3
"""Quick test of voice design (no voice cloning needed)."""

import json
import re
from pathlib import Path

import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

# Paths
PROJECT_DIR = Path(__file__).parent.parent
WRITINGS_DIR = PROJECT_DIR / "public" / "writings"
AUDIO_DIR = PROJECT_DIR / "public" / "audio"

VOICE_DESCRIPTION = """A deep-voiced male speaker with an Australian accent, speaking with a slightly rough, gravelly edge to his tone. The voice is low-pitched and resonant with a hint of harshness that conveys authenticity and directness. He speaks with the relaxed cadence typical of Australians, using natural pauses and a conversational flow. The delivery is intimate but carries weight - like a thoughtful, no-nonsense podcast host sharing hard truths late at night."""

def preprocess_for_speech(text: str) -> str:
    """Convert markdown to speech-friendly text."""
    text = re.sub(r'"([^"]+)"\s*\(\/writings\/[a-z0-9-]+\/?\)', r'\1', text)
    text = re.sub(r'\(\/writings\/[a-z0-9-]+\/?\)', '', text)
    text = re.sub(r'\b(AI)\b', 'A.I.', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = text.replace('—', ', ')
    text = ' '.join(text.split())
    return text.strip()

def main():
    AUDIO_DIR.mkdir(exist_ok=True)

    # Load essay
    essay_path = WRITINGS_DIR / "teaching-arthur.json"
    essay = json.loads(essay_path.read_text())
    print(f"Loaded: {essay['title']} ({essay['wordCount']} words)")

    # Preprocess
    text = preprocess_for_speech(essay['content'])
    print(f"Preprocessed text length: {len(text)} chars")

    # Take just the first paragraph for quick test
    first_para = text.split('\n\n')[0][:500]
    print(f"\nGenerating audio for first 500 chars...")
    print(f"Text: {first_para[:100]}...")

    # Load VoiceDesign model
    print("\nLoading Qwen3-TTS VoiceDesign model...")
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device_map=device,
        dtype=torch.bfloat16,
        attn_implementation="sdpa",
    )

    print("Generating audio with voice design...")
    wavs, sr = model.generate_voice_design(
        text=first_para,
        language="English",
        instruct=VOICE_DESCRIPTION,
    )

    output_path = AUDIO_DIR / "teaching-arthur-test.wav"
    sf.write(str(output_path), wavs[0], sr)
    print(f"\nSaved: {output_path}")
    print("Done!")

if __name__ == "__main__":
    main()
