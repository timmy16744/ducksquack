"""Generate a full first-person episode script for an animal.

Strategy (so we can reliably hit 2h–7h):
    1. outline()  -> episode title + ordered chapters (each a beat of the day)
    2. expand()   -> turn each chapter beat into N words of interior monologue,
                     feeding a short rolling summary of prior chapters for continuity.
The chapter structure also gives us natural chapter markers for the player.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field, asdict
from typing import Any

from . import llm


@dataclass
class Chapter:
    title: str
    beat: str                 # one-line direction for this part of the day
    text: str = ""            # filled by expand()


@dataclass
class EpisodeScript:
    animal: dict
    title: str
    persona_note: str
    chapters: list[Chapter] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        return "\n\n".join(c.text for c in self.chapters if c.text)

    @property
    def word_count(self) -> int:
        return len(self.full_text.split())

    def to_dict(self) -> dict:
        d = asdict(self)
        d["word_count"] = self.word_count
        return d


def _budget(cfg: dict) -> tuple[int, int]:
    """Return (total_words, num_chapters) for the configured length."""
    ep = cfg["episode"]
    total_words = int(ep["target_minutes"] * ep["words_per_minute"])
    n = max(3, math.ceil(total_words / ep["words_per_chapter"]))
    return total_words, n


def outline(animal: dict, cfg: dict) -> EpisodeScript:
    total_words, n_chapters = _budget(cfg)
    persona = cfg["script"]["persona"]
    system = persona
    user = (
        f"Plan one full day in the life of a {animal['name']}.\n"
        f"Grounding details to honour: {animal.get('hint', '')}\n\n"
        f"Break the day into exactly {n_chapters} sequential chapters, from before "
        f"first light to deep night. Each chapter is one beat of the day (a place, a "
        f"hunt, a rest, a danger, a small sensory world). Together they should feel "
        f"like a complete, varied arc — not repetitive.\n\n"
        f"Return JSON: {{\"title\": str, \"persona_note\": str, "
        f"\"chapters\": [{{\"title\": str, \"beat\": str}}]}}. "
        f"persona_note is a 1-2 sentence reminder of this individual's voice, mood, "
        f"age and circumstances to keep narration consistent."
    )
    data = llm.complete_json(system, user, cfg, model=cfg["script"]["outline_model"],
                             max_tokens=2000)
    chapters = [Chapter(title=c["title"], beat=c["beat"]) for c in data["chapters"]]
    return EpisodeScript(
        animal=animal,
        title=data.get("title") or f"A Day As A {animal['name']}",
        persona_note=data.get("persona_note", ""),
        chapters=chapters,
    )


def _rolling_summary(chapters: list[Chapter], upto: int) -> str:
    if upto == 0:
        return "(this is the opening — the day has not yet begun)"
    prev = chapters[upto - 1]
    tail = " ".join(prev.text.split()[-120:])
    return f"Previously ({prev.title}): ...{tail}"


def expand(script: EpisodeScript, cfg: dict, *, progress=lambda s: None) -> EpisodeScript:
    total_words, n = _budget(cfg)
    per_chapter = max(400, round(total_words / max(1, len(script.chapters))))
    persona = cfg["script"]["persona"]

    for i, ch in enumerate(script.chapters):
        progress(f"  chapter {i + 1}/{len(script.chapters)}: {ch.title}")
        system = persona
        user = (
            f"You are narrating the interior monologue of this individual:\n"
            f"{script.persona_note}\n"
            f"Animal: {script.animal['name']}. Details: {script.animal.get('hint','')}\n\n"
            f"{_rolling_summary(script.chapters, i)}\n\n"
            f"Now write chapter {i + 1} of {len(script.chapters)} — \"{ch.title}\".\n"
            f"This beat: {ch.beat}\n\n"
            f"Write approximately {per_chapter} words of vivid present-tense first-person "
            f"monologue. Continue seamlessly from before. No headings, no chapter label, "
            f"no meta commentary — only the animal's lived experience. End mid-flow so the "
            f"next chapter can pick up."
        )
        # ~1.4 tokens/word, plus headroom.
        max_tokens = min(8000, int(per_chapter * 2.2) + 200)
        ch.text = _clean(llm.complete(system, user, cfg,
                                       model=cfg["script"]["chapter_model"],
                                       max_tokens=max_tokens))
    return script


def _clean(text: str) -> str:
    text = text.strip()
    # Strip any stray markdown headings or "Chapter N" labels the model may add.
    text = re.sub(r"^#{1,6}\s.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*Chapter\s+\d+.*$", "", text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def generate_episode_script(animal: dict, cfg: dict, *, progress=lambda s: None) -> EpisodeScript:
    progress("  building outline...")
    script = outline(animal, cfg)
    progress(f"  outline: {len(script.chapters)} chapters — \"{script.title}\"")
    expand(script, cfg, progress=progress)
    progress(f"  script complete: {script.word_count} words "
             f"(~{script.word_count / cfg['episode']['words_per_minute']:.0f} min)")
    return script


def propose_new_animals(cfg: dict, existing: list[str], count: int = 10) -> list[dict]:
    """Ask the LLM for fresh real animals when the seed list is exhausted."""
    system = "You are a zoologist curating a list of fascinating real animals for a podcast."
    user = (
        f"Propose {count} real animal species NOT in this list: {', '.join(existing)}.\n"
        f"Favour species with vivid, distinctive sensory worlds and daily lives.\n"
        f"Return JSON: {{\"animals\": [{{\"name\": str, \"slug\": str, \"hint\": str}}]}}. "
        f"slug is lowercase-hyphenated; hint is a few comma-separated grounding details."
    )
    data = llm.complete_json(system, user, cfg, model=cfg["script"]["outline_model"],
                             max_tokens=1500)
    return data["animals"]
