"""Make raw script text speak well (strip markdown, expand abbreviations)."""

from __future__ import annotations

import re

_ABBREV = {
    "AI": "A.I.", "US": "U.S.", "UK": "U.K.", "EU": "E.U.",
    "UV": "U.V.", "km": "kilometres", "kg": "kilograms",
}


def preprocess_for_speech(text: str) -> str:
    # markdown emphasis / headings / fences
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"_([^_]+)_", r"\1", text)
    text = text.replace("`", "")
    # standalone abbreviations
    for abbr, exp in _ABBREV.items():
        text = re.sub(rf"\b{abbr}\b", exp, text)
    # em/en dashes -> short pause
    text = text.replace("—", ", ").replace("–", ", ")
    # tidy whitespace, keep paragraphs
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
