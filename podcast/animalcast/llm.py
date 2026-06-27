"""Provider-agnostic LLM text completion (Anthropic or OpenAI).

Exposes one function: complete(system, user, cfg, *, model=None, max_tokens, json_mode).
The official SDKs respect HTTPS_PROXY/HTTP_PROXY automatically.
"""

from __future__ import annotations

import json
import os
from typing import Any

from .config import require_env


def complete(
    system: str,
    user: str,
    cfg: dict,
    *,
    model: str | None = None,
    max_tokens: int = 4096,
    json_mode: bool = False,
) -> str:
    provider = cfg["script"]["provider"]
    temperature = cfg["script"].get("temperature", 0.8)

    if provider == "anthropic":
        return _anthropic(system, user, model, max_tokens, temperature, json_mode)
    if provider == "openai":
        return _openai(system, user, model, max_tokens, temperature, json_mode)
    raise SystemExit(f"Unknown script.provider: {provider!r} (use anthropic|openai)")


def complete_json(system: str, user: str, cfg: dict, *, model: str | None = None,
                  max_tokens: int = 4096) -> Any:
    """Call complete() in JSON mode and parse, tolerating ```json fences."""
    raw = complete(system, user, cfg, model=model, max_tokens=max_tokens, json_mode=True)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.lstrip().startswith("json"):
            raw = raw.lstrip()[4:]
    return json.loads(raw)


def _anthropic(system, user, model, max_tokens, temperature, json_mode):
    try:
        import anthropic
    except ImportError as exc:
        raise SystemExit("pip install anthropic") from exc
    require_env("ANTHROPIC_API_KEY", "Anthropic script generation")
    client = anthropic.Anthropic()
    if json_mode:
        system = system + "\n\nRespond with ONLY valid JSON. No prose, no markdown fences."
    resp = client.messages.create(
        model=model or "claude-sonnet-4-6",
        max_tokens=max_tokens,
        temperature=temperature,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in resp.content if block.type == "text")


def _openai(system, user, model, max_tokens, temperature, json_mode):
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise SystemExit("pip install openai") from exc
    require_env("OPENAI_API_KEY", "OpenAI script generation")
    client = OpenAI()
    kwargs: dict = {
        "model": model or "gpt-4o",
        "max_tokens": max_tokens,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""
