# Voice Samples for TTS

This directory contains the reference voice files used for voice cloning.

## Required Files

1. **tim_voice_sample.wav** - A 15-30 second audio recording of your voice
   - Clear speech with minimal background noise
   - Read natural prose (not just isolated words)
   - WAV format, any sample rate (will be resampled automatically)

2. **tim_voice_transcript.txt** - Exact transcript of the voice sample
   - Must match the audio word-for-word
   - Plain text, no special formatting needed

## Recording Tips

- Use a quiet environment
- Speak at your natural pace and tone
- Read a paragraph from one of your essays for natural cadence
- Aim for 15-30 seconds (longer samples improve quality up to ~30 seconds)

## Example Transcript

If you record yourself reading this paragraph:

```
I have been thinking about curriculum lately. Not the formal kind that schools
distribute in glossy brochures, but the actual lessons a parent transmits to
a child through accumulated days of living together. Arthur is still small
enough that most of his learning is implicit, absorbed rather than taught.
```

Then your `tim_voice_transcript.txt` would contain that exact text.
