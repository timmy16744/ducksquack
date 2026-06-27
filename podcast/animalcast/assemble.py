"""Stitch synthesized segments into one normalized mp3 with chapter markers.

Requires the `ffmpeg` and `ffprobe` binaries on PATH.

build_episode(chapter_segments, out_path, cfg, tags) where chapter_segments is:
    [ { "title": str, "files": [Path, ...] }, ... ]
Returns: { "duration_seconds": float, "bytes": int, "chapters": [{title,start,end}] }
"""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path


def _need(binary: str) -> None:
    if shutil.which(binary) is None:
        raise SystemExit(f"`{binary}` not found on PATH. Install ffmpeg.")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def _concat(files: list[Path], out_path: Path) -> None:
    """Concat audio files (re-encode to a common format for safety)."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as lst:
        for f in files:
            lst.write(f"file '{f.resolve()}'\n")
        list_path = lst.name
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
         "-ar", "44100", "-ac", "1", str(out_path)],
        check=True, capture_output=True,
    )
    Path(list_path).unlink(missing_ok=True)


def _silence(ms: int, out_path: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i",
         f"anullsrc=r=44100:cl=mono", "-t", f"{ms / 1000:.3f}", str(out_path)],
        check=True, capture_output=True,
    )


def _ffmetadata(tags: dict, chapters: list[dict]) -> str:
    """Build an ffmetadata file body with ID3 tags + chapters."""
    lines = [";FFMETADATA1"]
    for k, v in tags.items():
        if v:
            esc = str(v).replace("\\", "\\\\").replace("=", "\\=").replace(";", "\\;").replace("#", "\\#").replace("\n", "\\\n")
            lines.append(f"{k}={esc}")
    for ch in chapters:
        lines.append("[CHAPTER]")
        lines.append("TIMEBASE=1/1000")
        lines.append(f"START={int(ch['start'] * 1000)}")
        lines.append(f"END={int(ch['end'] * 1000)}")
        lines.append(f"title={ch['title']}")
    return "\n".join(lines) + "\n"


def build_episode(chapter_segments: list[dict], out_path: Path, cfg: dict,
                  tags: dict, *, progress=lambda s: None) -> dict:
    _need("ffmpeg")
    _need("ffprobe")
    ep = cfg["episode"]
    gap_ms = ep.get("silence_between_chapters_ms", 700)
    add_chapters = ep.get("add_chapter_markers", True)

    work = Path(tempfile.mkdtemp(prefix="animalcast_"))
    try:
        silence = work / "silence.wav"
        _silence(gap_ms, silence)

        # 1) Concat each chapter's chunks into one chapter file; record durations.
        chapter_files: list[Path] = []
        chapters_meta: list[dict] = []
        cursor = 0.0
        for i, seg in enumerate(chapter_segments):
            cf = work / f"chapter_{i:03d}.wav"
            _concat(seg["files"], cf)
            dur = probe_duration(cf)
            chapter_files.append(cf)
            chapters_meta.append({"title": seg["title"], "start": cursor, "end": cursor + dur})
            cursor += dur + (gap_ms / 1000 if i < len(chapter_segments) - 1 else 0)
            progress(f"  assembled chapter {i + 1}/{len(chapter_segments)} ({dur:.0f}s)")

        # 2) Interleave chapter files with silence.
        ordered: list[Path] = []
        for i, cf in enumerate(chapter_files):
            ordered.append(cf)
            if i < len(chapter_files) - 1:
                ordered.append(silence)
        joined = work / "joined.wav"
        _concat(ordered, joined)

        # 3) Loudness-normalize to podcast target (-16 LUFS) and export mp3 + metadata.
        meta_path = work / "meta.txt"
        meta_path.write_text(_ffmetadata(tags, chapters_meta if add_chapters else []))
        progress("  normalizing loudness + encoding mp3...")
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(joined), "-i", str(meta_path),
             "-map_metadata", "1", "-map_chapters", "1",
             "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-c:a", "libmp3lame", "-b:a", "128k", str(out_path)],
            check=True, capture_output=True,
        )

        duration = probe_duration(out_path)
        return {
            "duration_seconds": duration,
            "bytes": out_path.stat().st_size,
            "chapters": chapters_meta,
        }
    finally:
        shutil.rmtree(work, ignore_errors=True)
