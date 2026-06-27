"""Configuration loading and merging.

Order of precedence (highest first):
    1. CLI overrides passed into load_config(overrides=...)
    2. config.yaml (user copy, gitignored)
    3. config.example.yaml (checked-in defaults)
"""

from __future__ import annotations

import copy
import os
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as exc:  # pragma: no cover
    raise SystemExit("PyYAML is required: pip install -r requirements.txt") from exc

ROOT = Path(__file__).resolve().parent.parent          # the podcast/ dir
EXAMPLE = ROOT / "config.example.yaml"
USER = ROOT / "config.yaml"


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge override into a copy of base."""
    out = copy.deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def load_config(overrides: dict[str, Any] | None = None) -> dict:
    if not EXAMPLE.exists():
        raise SystemExit(f"Missing {EXAMPLE}")
    cfg = yaml.safe_load(EXAMPLE.read_text()) or {}
    if USER.exists():
        cfg = _deep_merge(cfg, yaml.safe_load(USER.read_text()) or {})
    if overrides:
        cfg = _deep_merge(cfg, overrides)
    return cfg


def require_env(name: str, why: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise SystemExit(f"Environment variable {name} is required ({why}).")
    return val
