"""Rotation queue + episode registry, persisted to state.json.

state.json shape:
{
  "used_slugs": ["platypus", ...],          # animals already produced, in order
  "episodes": [                              # published episode registry -> feed
    {
      "slug": "platypus",
      "name": "Platypus",
      "title": "...",
      "date": "2026-06-27",
      "audio_url": "https://media.../platypus.mp3",
      "bytes": 123,
      "duration_seconds": 7200,
      "description": "...",
      "episode_number": 1,
      "guid": "animalcast-2026-06-27-platypus"
    }
  ]
}
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
STATE_FILE = ROOT / "state.json"
ANIMALS_FILE = ROOT / "animals.json"


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"used_slugs": [], "episodes": []}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2) + "\n")


def load_animals() -> list[dict]:
    data = json.loads(ANIMALS_FILE.read_text())
    return data["animals"]


def find_animal(slug_or_name: str) -> dict | None:
    needle = slug_or_name.strip().lower()
    for a in load_animals():
        if a["slug"].lower() == needle or a["name"].lower() == needle:
            return a
    return None


def next_animal(state: dict, order: str = "sequential") -> dict | None:
    """Return the next unused animal from the seed list (or None if exhausted)."""
    used = set(state.get("used_slugs", []))
    pool = [a for a in load_animals() if a["slug"] not in used]
    if not pool:
        return None
    if order == "shuffle":
        # Deterministic-ish shuffle without importing random (banned in some envs):
        # pick by hash of slug+count so reruns are stable within a day.
        pool.sort(key=lambda a: hash(a["slug"] + str(len(used))))
    return pool[0]


def mark_used(state: dict, slug: str) -> None:
    if slug not in state.setdefault("used_slugs", []):
        state["used_slugs"].append(slug)


def register_episode(state: dict, episode: dict[str, Any]) -> None:
    eps = state.setdefault("episodes", [])
    # Replace if same guid already present (idempotent re-publish).
    eps[:] = [e for e in eps if e.get("guid") != episode.get("guid")]
    eps.append(episode)


def add_animal(state: dict, animal: dict) -> None:
    """Append an LLM-proposed animal into animals.json (auto-extend)."""
    data = json.loads(ANIMALS_FILE.read_text())
    if any(a["slug"] == animal["slug"] for a in data["animals"]):
        return
    data["animals"].append(animal)
    ANIMALS_FILE.write_text(json.dumps(data, indent=2) + "\n")
