"""Upload audio to S3-compatible storage and refresh the public RSS feed.

Works with AWS S3, Cloudflare R2, and Backblaze B2 (all S3-compatible).
Credentials come from env: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.
For R2/B2 set publish.storage.endpoint_url in config.
"""

from __future__ import annotations

from pathlib import Path

from . import feed


def _client(cfg: dict):
    try:
        import boto3
    except ImportError as exc:
        raise SystemExit("pip install boto3") from exc
    st = cfg["publish"]["storage"]
    kwargs = {"region_name": st.get("region") or "auto"}
    if st.get("endpoint_url"):
        kwargs["endpoint_url"] = st["endpoint_url"]
    return boto3.client("s3", **kwargs)


def upload_audio(cfg: dict, local_path: Path, key: str) -> str:
    """Upload an mp3 and return its public URL."""
    st = cfg["publish"]["storage"]
    client = _client(cfg)
    client.upload_file(
        str(local_path), st["bucket"], key,
        ExtraArgs={"ContentType": "audio/mpeg"},
    )
    base = st["public_base_url"].rstrip("/")
    return f"{base}/{key}"


def publish_feed(cfg: dict, episodes: list[dict]) -> str:
    """Render feed.xml from the registry and (optionally) upload it."""
    xml = feed.build_feed(cfg, episodes)
    out = Path(__file__).resolve().parent.parent / cfg["publish"]["feed_filename"]
    out.write_text(xml)

    if cfg["publish"].get("upload_feed"):
        st = cfg["publish"]["storage"]
        client = _client(cfg)
        client.put_object(
            Bucket=st["bucket"],
            Key=cfg["publish"]["feed_filename"],
            Body=xml.encode("utf-8"),
            ContentType="application/rss+xml",
            CacheControl="max-age=300",
        )
    return str(out)
