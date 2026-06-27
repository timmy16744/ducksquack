"""ElevenLabs text-to-speech. Best-in-class custom + cloned voices.

Per-animal custom voices: put ElevenLabs voice ids in config under
tts.per_animal_voice, e.g.  great-white-shark: "21m00Tcm4TlvDq8ikWAM".
Create/clone voices once in the ElevenLabs dashboard or via their API.
"""

from __future__ import annotations

from pathlib import Path

from ..config import require_env
from .base import TTSProvider


class ElevenLabsTTS(TTSProvider):
    ext = "mp3"

    def __init__(self, cfg: dict):
        super().__init__(cfg)
        self.api_key = require_env("ELEVENLABS_API_KEY", "ElevenLabs TTS")
        try:
            from elevenlabs.client import ElevenLabs
        except ImportError as exc:
            raise SystemExit("pip install elevenlabs") from exc
        self.client = ElevenLabs(api_key=self.api_key)
        self.opts = cfg["tts"]["elevenlabs"]

    def voice_for(self, animal_slug: str | None) -> str:
        overrides = self.cfg["tts"].get("per_animal_voice") or {}
        if animal_slug and animal_slug in overrides:
            return overrides[animal_slug]
        return self.opts["voice_id"]

    def synth_chunk(self, text: str, out_path: Path, voice: str) -> None:
        from elevenlabs import VoiceSettings

        audio = self.client.text_to_speech.convert(
            voice_id=voice,
            model_id=self.opts.get("model", "eleven_turbo_v2_5"),
            text=text,
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=self.opts.get("stability", 0.4),
                similarity_boost=self.opts.get("similarity_boost", 0.75),
                style=self.opts.get("style", 0.0),
            ),
        )
        with open(out_path, "wb") as fh:
            for chunk in audio:
                if chunk:
                    fh.write(chunk)
