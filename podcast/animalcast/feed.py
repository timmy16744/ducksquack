"""Build a Spotify/Apple-compatible podcast RSS feed from the episode registry."""

from __future__ import annotations

from email.utils import format_datetime
from datetime import datetime, timezone
from xml.sax.saxutils import escape


def _fmt_duration(seconds: float) -> str:
    s = int(round(seconds))
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{sec:02d}" if h else f"{m:d}:{sec:02d}"


def _rfc2822(date_str: str) -> str:
    # date_str is "YYYY-MM-DD"; emit at 12:00 UTC for stable ordering.
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(hour=12, tzinfo=timezone.utc)
    return format_datetime(dt)


def build_feed(cfg: dict, episodes: list[dict]) -> str:
    show = cfg["show"]
    itunes = "http://www.itunes.com/dtds/podcast-1.0.dtd"
    podcast_ns = "https://podcastindex.org/namespace/1.0"
    now = format_datetime(datetime.now(timezone.utc))

    items = []
    # Newest first.
    for ep in sorted(episodes, key=lambda e: (e["date"], e.get("episode_number", 0)), reverse=True):
        desc = escape(ep.get("description", ""))
        items.append(f"""    <item>
      <title>{escape(ep['title'])}</title>
      <itunes:title>{escape(ep['title'])}</itunes:title>
      <itunes:episode>{ep.get('episode_number', 1)}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <guid isPermaLink="false">{escape(ep['guid'])}</guid>
      <pubDate>{_rfc2822(ep['date'])}</pubDate>
      <enclosure url="{escape(ep['audio_url'])}" length="{ep.get('bytes', 0)}" type="audio/mpeg"/>
      <itunes:duration>{_fmt_duration(ep.get('duration_seconds', 0))}</itunes:duration>
      <description>{desc}</description>
      <itunes:summary>{desc}</itunes:summary>
      <itunes:explicit>{'true' if show.get('explicit') else 'false'}</itunes:explicit>
    </item>""")

    explicit = "true" if show.get("explicit") else "false"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="{itunes}"
     xmlns:podcast="{podcast_ns}"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{escape(show['title'])}</title>
    <link>{escape(show['site_url'])}</link>
    <language>{escape(show.get('language', 'en'))}</language>
    <description>{escape(show.get('subtitle', ''))}</description>
    <itunes:author>{escape(show.get('author', ''))}</itunes:author>
    <itunes:summary>{escape(show.get('subtitle', ''))}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>{explicit}</itunes:explicit>
    <itunes:image href="{escape(show.get('cover_image_url', ''))}"/>
    <itunes:owner>
      <itunes:name>{escape(show.get('author', ''))}</itunes:name>
      <itunes:email>{escape(show.get('email', ''))}</itunes:email>
    </itunes:owner>
    <itunes:category text="{escape(show.get('category', 'Science'))}">
      <itunes:category text="{escape(show.get('subcategory', ''))}"/>
    </itunes:category>
    <atom:link href="{escape(show['site_url'].rstrip('/'))}/{cfg['publish']['feed_filename']}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
