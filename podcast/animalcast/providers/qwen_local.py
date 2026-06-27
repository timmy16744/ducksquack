"""Local Qwen3-TTS voice cloning — reuses the repo's existing approach.

Free compute, but needs a GPU for any real throughput and the heavy deps
(torch, qwen-tts, soundfile). Clones the reference voice in voice_samples/.
Writes WAV (lossless); assemble.py converts to mp3.
"""

from __future__ import annotations

from pathlib import Path

from .base import TTSProvider

_MODELS = {
    "1.7B": "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
    "0.6B": "Qwen/Qwen3-TTS-12Hz-0.6B-Base",
}


class QwenLocalTTS(TTSProvider):
    ext = "wav"

    def __init__(self, cfg: dict):
        super().__init__(cfg)
        self.opts = cfg["tts"]["qwen_local"]
        try:
            import torch
            import soundfile as sf  # noqa: F401
            from qwen_tts import Qwen3TTSModel
        except ImportError as exc:
            raise SystemExit(
                "qwen_local needs: pip install torch soundfile numpy qwen-tts"
            ) from exc

        self._sf = __import__("soundfile")
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        dtype = torch.bfloat16 if device.startswith("cuda") else torch.float32
        attn = "sdpa"
        try:
            import flash_attn  # noqa: F401
            attn = "flash_attention_2"
        except ImportError:
            pass

        self.model = Qwen3TTSModel.from_pretrained(
            _MODELS[self.opts.get("model", "1.7B")],
            device_map=device, dtype=dtype, attn_implementation=attn,
        )
        ref_audio = (Path(__file__).resolve().parent.parent.parent / self.opts["ref_audio"]).resolve()
        ref_text = (Path(__file__).resolve().parent.parent.parent / self.opts["ref_transcript"]).resolve()
        self.voice_prompt = self.model.create_voice_clone_prompt(
            ref_audio=str(ref_audio),
            ref_text=ref_text.read_text().strip(),
            x_vector_only_mode=False,
        )

    def voice_for(self, animal_slug: str | None) -> str:
        # Single cloned voice; per-animal cloning would supply more prompts here.
        return "clone"

    def synth_chunk(self, text: str, out_path: Path, voice: str) -> None:
        wavs, sr = self.model.generate_voice_clone(
            text=text, language="English", voice_clone_prompt=self.voice_prompt,
        )
        self._sf.write(str(out_path), wavs[0], sr)
