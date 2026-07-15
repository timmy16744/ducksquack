#!/usr/bin/env python3
"""
Build the Spotify-ready podcast RSS feed at public/podcast/feed.xml.

Only episodes whose meta.json has an audio URL are included. Use
--set-audio-url to record the hosted MP3 URL (e.g. a GitHub Release asset)
before rebuilding the feed.

Usage:
    python scripts/podcast/build_feed.py
    python scripts/podcast/build_feed.py --set-audio-url ep-001-firefly https://.../ep-001-firefly.mp3
"""

import argparse
import email.utils
import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
PODCAST_DIR = ROOT / "podcast"
EPISODES_DIR = PODCAST_DIR / "episodes"
FEED_PATH = ROOT / "public" / "podcast" / "feed.xml"


def rfc2822(iso: str) -> str:
    import datetime

    dt = datetime.datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").replace(
        tzinfo=datetime.timezone.utc
    )
    return email.utils.format_datetime(dt)


def hms(seconds) -> str:
    seconds = int(seconds or 0)
    return f"{seconds // 3600:02d}:{seconds % 3600 // 60:02d}:{seconds % 60:02d}"


def load_episodes():
    episodes = []
    if EPISODES_DIR.exists():
        for meta_path in sorted(EPISODES_DIR.glob("*/meta.json")):
            episodes.append(json.loads(meta_path.read_text()))
    return sorted(episodes, key=lambda m: m["number"])


def build_feed(cfg, episodes):
    items = []
    for m in episodes:
        if not m.get("audio", {}).get("url"):
            continue
        a = m["audio"]
        items.append(f"""    <item>
      <title>{escape(m["title"])}</title>
      <description>{escape(m["description"])}</description>
      <pubDate>{rfc2822(m["date"])}</pubDate>
      <guid isPermaLink="false">{escape(cfg["feed_url"])}#{m["slug"]}</guid>
      <enclosure url="{escape(a["url"])}" length="{a["bytes"]}" type="audio/mpeg"/>
      <itunes:episode>{m["number"]}</itunes:episode>
      <itunes:duration>{hms(a.get("seconds"))}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:author>{escape(cfg["author"])}</itunes:author>
    </item>""")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{escape(cfg["title"])}</title>
    <link>{escape(cfg["site_url"])}</link>
    <description>{escape(cfg["description"])}</description>
    <language>{cfg["language"]}</language>
    <itunes:subtitle>{escape(cfg["subtitle"])}</itunes:subtitle>
    <itunes:author>{escape(cfg["author"])}</itunes:author>
    <itunes:owner>
      <itunes:name>{escape(cfg["author"])}</itunes:name>
      <itunes:email>{escape(cfg["email"])}</itunes:email>
    </itunes:owner>
    <itunes:image href="{escape(cfg["cover_url"])}"/>
    <itunes:category text="{escape(cfg["category"])}">
      <itunes:category text="{escape(cfg["subcategory"])}"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
{chr(10).join(items)}
  </channel>
</rss>
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--set-audio-url",
        nargs=2,
        metavar=("SLUG", "URL"),
        help="Record the hosted MP3 URL for an episode before building the feed",
    )
    args = parser.parse_args()

    cfg = json.loads((PODCAST_DIR / "config.json").read_text())

    if args.set_audio_url:
        slug, url = args.set_audio_url
        meta_path = EPISODES_DIR / slug / "meta.json"
        meta = json.loads(meta_path.read_text())
        meta["audio"]["url"] = url
        meta_path.write_text(json.dumps(meta, indent=2))
        print(f"{slug}: audio url set")

    episodes = load_episodes()
    FEED_PATH.parent.mkdir(parents=True, exist_ok=True)
    FEED_PATH.write_text(build_feed(cfg, episodes))
    published = sum(1 for m in episodes if m.get("audio", {}).get("url"))
    print(f"Wrote {FEED_PATH.relative_to(ROOT)} ({published} published episodes)")


if __name__ == "__main__":
    main()
