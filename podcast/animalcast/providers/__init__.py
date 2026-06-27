"""TTS provider registry. Each provider implements TTSProvider (see base.py)."""

from __future__ import annotations

from .base import TTSProvider


def get_provider(cfg: dict) -> TTSProvider:
    name = cfg["tts"]["provider"]
    if name == "openai":
        from .openai_tts import OpenAITTS
        return OpenAITTS(cfg)
    if name == "elevenlabs":
        from .elevenlabs_tts import ElevenLabsTTS
        return ElevenLabsTTS(cfg)
    if name == "qwen_local":
        from .qwen_local import QwenLocalTTS
        return QwenLocalTTS(cfg)
    raise SystemExit(f"Unknown tts.provider: {name!r} (use openai|elevenlabs|qwen_local)")
