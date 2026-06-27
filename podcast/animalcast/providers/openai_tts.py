"""OpenAI text-to-speech. Cheap, fast, preset voices (no cloning)."""

from __future__ import annotations

from pathlib import Path

from ..config import require_env
from .base import TTSProvider


class OpenAITTS(TTSProvider):
    ext = "mp3"

    def __init__(self, cfg: dict):
        super().__init__(cfg)
        require_env("OPENAI_API_KEY", "OpenAI TTS")
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise SystemExit("pip install openai") from exc
        self.client = OpenAI()
        self.opts = cfg["tts"]["openai"]

    def voice_for(self, animal_slug: str | None) -> str:
        overrides = self.cfg["tts"].get("per_animal_voice") or {}
        if animal_slug and animal_slug in overrides:
            return overrides[animal_slug]
        return self.opts["voice"]

    def synth_chunk(self, text: str, out_path: Path, voice: str) -> None:
        # Streaming response straight to file keeps memory flat for long runs.
        with self.client.audio.speech.with_streaming_response.create(
            model=self.opts["model"],
            voice=voice,
            input=text,
            response_format=self.opts.get("format", "mp3"),
        ) as resp:
            resp.stream_to_file(str(out_path))
