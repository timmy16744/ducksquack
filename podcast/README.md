# AnimalCast 🐾🎙️

A daily, fully-automated podcast where **every episode is the first-person inner
monologue of a different animal** — one new animal each day, narrated in a custom
voice, ~2 hours long (configurable up to 7h+), and published automatically to
Spotify (and Apple, etc.) via a podcast RSS feed.

This lives alongside the existing `ducksquack` site and **reuses its voice-cloning
setup** (`voice_samples/`, `scripts/generate-audio.py`).

---

## How it actually gets onto Spotify

> **There is no public Spotify API to upload podcast episodes.** Nobody has one.

Every podcast — yours, NPR's, Joe Rogan's — reaches Spotify the same way:

1. You **host your audio files** somewhere public (object storage).
2. You publish a **podcast RSS feed** (an XML file listing your episodes) at a
   stable URL.
3. You submit that feed URL to [Spotify for Creators](https://creators.spotify.com)
   **once**, and to Apple Podcasts, etc.
4. From then on, the platforms **poll your feed automatically** and ingest any new
   `<item>` they find — usually within an hour or two.

So "auto-upload every day" = **our automation appends a new episode to the feed
each day, and Spotify pulls it in on its own.** That's the whole trick, and it's
the same model the existing `generate-rss.cjs` already uses.

```
  ┌────────────┐   ┌───────────┐   ┌──────────┐   ┌─────────────┐   ┌──────────┐
  │ pick animal│──▶│ write     │──▶│ synth    │──▶│ assemble    │──▶│ publish  │
  │ (rotation) │   │ script    │   │ voice    │   │ + normalize │   │ feed+cdn │
  └────────────┘   │ (LLM)     │   │ (TTS)    │   │ (ffmpeg)    │   └─────┬────┘
                   └───────────┘   └──────────┘   └─────────────┘         │
                                                                          ▼
                                                            Spotify / Apple poll RSS
```

---

## Quick start

```bash
cd podcast
pip install -r requirements.txt          # python deps
cp config.example.yaml config.yaml       # your settings live here (gitignored)

# 1) Set API keys (see config for which you need)
export ANTHROPIC_API_KEY=sk-ant-...       # script writing
export OPENAI_API_KEY=sk-...              # TTS (if using OpenAI voices)
export ELEVENLABS_API_KEY=...             # TTS (if using ElevenLabs custom voices)

# 2) Dry run — writes ONLY the script (no audio, no upload). Costs ~$1 of LLM.
python run.py --dry-run

# 3) Full local run for one animal — script + audio + assembled mp3
python run.py --animal "platypus"

# 4) Real daily run: pick next animal, build, publish to your feed
python run.py --publish
```

Every run drops its artifacts in `episodes/YYYY-MM-DD-<slug>/`:
`outline.json`, `script.md`, `script.json`, `episode.mp3`, `episode.json`.

---

## Everything is configurable (`config.yaml`)

This is the "very customisable" part. You can change, per-run or globally:

- **Length** — `target_minutes` (default 120). Set 420 for a 7-hour sleep episode.
- **Voice engine** — `tts.provider`: `openai` (cheap) · `elevenlabs` (custom/cloned) ·
  `qwen_local` (free, GPU, reuses your existing clone).
- **Per-animal voices** — map any animal to any voice id / cloned voice.
- **Persona & tone** — system prompt, narration style, how "scientific" vs "whimsical".
- **Schedule & rotation** — order animals, shuffle, or let the LLM invent new ones
  when the seed list runs out.
- **Compilation mode** — stitch the week's episodes into a 7-hour Sunday megacast.
- **Intro/outro, music beds, chapter markers, loudness target.**

See `config.example.yaml` — every field is commented.

---

## Cost reality (read before you automate 7h/day)

Speech ≈ **140 words/min**, so 2h ≈ ~17k words ≈ ~100k characters; 7h ≈ ~350k chars.

| Piece | 2h/day | 7h/day |
|---|---|---|
| Script (Claude Sonnet) | ~$0.50–2 | ~$2–6 |
| TTS — OpenAI | ~$1.50/day (~$45/mo) | ~$5/day (~$160/mo) |
| TTS — ElevenLabs | ~$15–18/day (~$500/mo) | ~$50–63/day (~$1.5–1.9k/mo) |
| TTS — Qwen local | free (GPU time) | free (GPU time) |
| Storage/bandwidth | a few $/mo on R2/B2 | tens of $/mo |

**Recommendation:** start on OpenAI TTS (or local Qwen) for the bulk, and reserve
ElevenLabs for a signature "host" voice or special episodes. The provider is one
config line, so you can switch any time.

---

## Hosting the audio + feed

Audio files are big and must **not** go in git. Point `publish.storage` at any
S3-compatible bucket:

- **Cloudflare R2** — cheapest egress (free), recommended.
- **Backblaze B2** — very cheap.
- **AWS S3** — works, pricier egress.

`publish.py` uploads `episode.mp3` to the bucket and regenerates `feed.xml`, then
uploads the feed too. You submit the feed's public URL to Spotify once.

---

## Automation

`.github/workflows/daily-podcast.yml` runs `run.py --publish` on a cron each
morning. Add `ANTHROPIC_API_KEY`, your TTS key, and storage creds as repo secrets.
GitHub-hosted runners have no GPU, so for `qwen_local` use a self-hosted runner or
a small GPU box; for `openai`/`elevenlabs` the default runner is fine.

---

## Files

| Path | Purpose |
|---|---|
| `run.py` | CLI entry / orchestrator |
| `animalcast/config.py` | load + merge config and env |
| `animalcast/state.py` | rotation queue, episode registry |
| `animalcast/llm.py` | provider-agnostic LLM client (Anthropic / OpenAI) |
| `animalcast/script_gen.py` | outline → per-chapter expansion → full script |
| `animalcast/providers/` | TTS providers (openai, elevenlabs, qwen_local) |
| `animalcast/assemble.py` | concat segments, loudness-normalize, export mp3 + chapters |
| `animalcast/feed.py` | podcast RSS (iTunes + podcast namespace) builder |
| `animalcast/publish.py` | upload to object storage + refresh feed |
| `animals.json` | seed rotation list |
| `config.example.yaml` | all settings, commented |
| `samples/` | a hand-written sample script so you can see the format now |
