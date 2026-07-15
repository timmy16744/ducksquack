# Sleep Podcast Pipeline

A single GitHub Actions workflow that **writes** a 6-hour sleep-story episode
with Claude, **narrates** it with a calm neural voice, and **publishes** it to
an RSS feed that Spotify ingests automatically.

## The concept

Each episode is the complete life of one small creature — a bug, spider,
frog, bird — told in the first person, slowly, from hatching to a peaceful
death. The creature that takes the narrator's life at the end of an episode
becomes the narrator of the next one, and opens by remembering that moment.
The episodes chain together forever.

## How it works

```
.github/workflows/sleep-podcast.yml   the whole pipeline, on a weekly cron + manual button
scripts/podcast/write_episode.py      Claude plans + writes ~38,000 words in 12 chapters
scripts/podcast/synthesize.py         edge-tts narration -> pauses -> ffmpeg -> one MP3 (-16 LUFS)
scripts/podcast/build_feed.py         builds public/podcast/feed.xml (Spotify-ready RSS)
scripts/podcast/make_cover.py         regenerates the placeholder cover art
podcast/config.json                   title, voice, pacing, length — edit everything here
podcast/state.json                    the predator chain (who narrates next, and why)
podcast/episodes/<slug>/              script.md + meta.json per episode (committed)
```

Audio files are **not** committed — each MP3 (~150–200 MB) is uploaded as a
GitHub Release asset, and the RSS feed points at the release URL. The feed
itself is served by the site at `https://ducksquack.me/podcast/feed.xml`.

## One-time setup

1. **Add the API key secret**: repo → Settings → Secrets and variables →
   Actions → new secret `ANTHROPIC_API_KEY`.
2. **Test run**: Actions → "Sleep Podcast" → Run workflow → tick
   *test_mode*. This produces a ~5-minute episode end-to-end so you can
   verify everything before burning a full 6-hour run.
3. **Deploy the site** so `feed.xml` and `cover.png` are live (they're in
   `public/podcast/`, so the normal site deploy picks them up).
4. **Connect Spotify**: go to [Spotify for Creators](https://creators.spotify.com/),
   choose *Add your podcast* → *I have a podcast* → paste
   `https://ducksquack.me/podcast/feed.xml`. Spotify emails a verification
   code to the feed's owner email (`podcast/config.json → email`). After
   that, every new episode in the feed appears on Spotify automatically —
   no per-episode uploads.

## Knobs (podcast/config.json)

| Key | What it does |
|---|---|
| `target_hours` / `words_per_minute` / `chapters` | Episode length. 6 h ≈ 38k words ≈ 12 chapters |
| `tts_engine` | `"edge"` (Microsoft neural voices, best quality, needs network) or `"piper"` (fully offline, no external service — the reliable fallback if edge-tts ever starts failing) |
| `voice` | Any edge-tts voice (`edge-tts --list-voices`). Calm picks: `en-US-ChristopherNeural`, `en-GB-RyanNeural`, `en-US-GuyNeural` |
| `rate` / `pitch` | Slower + lower = sleepier (edge engine). Defaults: `-15%`, `-6Hz` |
| `piper_voice` / `piper_length_scale` | Piper voice + slowdown factor (1.25 = 25% slower) when `tts_engine` is `"piper"` |
| `paragraph_pause_s` / `chapter_pause_s` | Silence inserted between paragraphs / chapters |
| `seed_animal` | Only used for episode 1; after that the chain takes over |
| `title`, `description`, `cover_url`, … | Feed metadata |

The cron schedule lives at the top of the workflow file (default: weekly,
Mondays 02:00 UTC).

## Costs & notes

- **Writing**: ~12 Claude calls per episode (Opus). A full episode costs a
  few dollars of API usage; test mode costs cents.
- **Narration**: edge-tts is free. To upgrade to a premium voice
  (ElevenLabs etc.), swap the synth call in `synthesize.py` — everything
  else stays the same. (Note: 6 h/episode on ElevenLabs costs hundreds of
  dollars, which is why the free voice is the default.)
- **Runtime**: a full episode takes roughly 1–2 hours in Actions (well
  inside the 6-hour job limit).
- **⚠️ Title**: "A Bug's Life" is a Pixar/Disney trademark. Spotify may
  reject or later remove a podcast with that exact name — strongly consider
  one of the alternative titles before connecting the feed. Change it in
  `podcast/config.json`, rerun `make_cover.py`, and rebuild the feed.
- To re-do an episode: delete its folder from `podcast/episodes/`, remove
  its entry (and fix `next`) in `podcast/state.json`, delete the GitHub
  release, and rerun the workflow.

## Running locally

```bash
pip install -r scripts/podcast/requirements.txt   # plus: ffmpeg on PATH
export ANTHROPIC_API_KEY=...
python scripts/podcast/write_episode.py --test
python scripts/podcast/synthesize.py
open output/*.mp3
```
