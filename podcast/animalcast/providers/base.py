"""TTS provider interface + shared text chunking."""

from __future__ import annotations

import re
from pathlib import Path


class TTSProvider:
    """Synthesize text to an audio file. Subclasses implement synth_chunk()."""

    #: file extension (without dot) the provider writes, e.g. "mp3" or "wav"
    ext = "mp3"

    def __init__(self, cfg: dict):
        self.cfg = cfg

    def voice_for(self, animal_slug: str | None) -> str:
        """Resolve the voice id/name, honouring per-animal overrides."""
        raise NotImplementedError

    def synth_chunk(self, text: str, out_path: Path, voice: str) -> None:
        """Write audio for a single chunk to out_path."""
        raise NotImplementedError

    # -- shared --------------------------------------------------------------
    def chunk(self, text: str) -> list[str]:
        return chunk_text(text, self.cfg["tts"]["max_chars_per_request"])


def chunk_text(text: str, max_chars: int) -> list[str]:
    """Split text on paragraph then sentence boundaries, staying under max_chars."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    cur = ""
    for para in paragraphs:
        if len(cur) + len(para) + 2 > max_chars and cur:
            chunks.append(cur.strip())
            cur = para
        else:
            cur = f"{cur}\n\n{para}" if cur else para
    if cur.strip():
        chunks.append(cur.strip())

    out: list[str] = []
    for ch in chunks:
        if len(ch) <= max_chars:
            out.append(ch)
            continue
        sub = ""
        for sentence in re.split(r"(?<=[.!?])\s+", ch):
            if len(sub) + len(sentence) + 1 > max_chars and sub:
                out.append(sub.strip())
                sub = sentence
            else:
                sub = f"{sub} {sentence}".strip()
        if sub:
            out.append(sub.strip())
    return out
