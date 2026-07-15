#!/usr/bin/env python3
"""
Generate placeholder 3000x3000 cover art for the podcast (Spotify requires
1400-3000px square art). Replace public/podcast/cover.png with real artwork
whenever you like - the feed just points at that file.

Usage:
    pip install pillow
    python scripts/podcast/make_cover.py
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SIZE = 3000
OUT = ROOT / "public" / "podcast" / "cover.png"


def font(size):
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    ]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    cfg = json.loads((ROOT / "podcast" / "config.json").read_text())
    img = Image.new("RGB", (SIZE, SIZE))
    draw = ImageDraw.Draw(img)

    # Night-sky vertical gradient
    top, bottom = (10, 14, 40), (35, 28, 70)
    for y in range(SIZE):
        t = y / SIZE
        draw.line(
            [(0, y), (SIZE, y)],
            fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)),
        )

    # Moon
    draw.ellipse([2050, 350, 2650, 950], fill=(240, 236, 210))
    draw.ellipse([1980, 320, 2540, 880], fill=None)

    # Fireflies
    import random

    rng = random.Random(7)
    for _ in range(60):
        x, y = rng.randint(100, SIZE - 100), rng.randint(1200, SIZE - 300)
        r = rng.randint(6, 16)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(210, 220, 120))

    # Grass silhouette
    for x in range(0, SIZE, 18):
        h = 200 + (x * 7919) % 260
        draw.line([(x, SIZE), (x + 30, SIZE - h)], fill=(6, 10, 24), width=14)

    # Title
    title = cfg["title"].split(":")[0]
    subtitle = "Sleep Stories"
    f1, f2 = font(280), font(120)
    w = draw.textlength(title, font=f1)
    draw.text(((SIZE - w) / 2, 1150), title, font=f1, fill=(235, 232, 220))
    w2 = draw.textlength(subtitle, font=f2)
    draw.text(((SIZE - w2) / 2, 1500), subtitle, font=f2, fill=(180, 178, 200))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"Wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
