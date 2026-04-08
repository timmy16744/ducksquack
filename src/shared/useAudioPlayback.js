import { useState, useEffect, useRef, useCallback } from 'react';

// Actual playback rate = displayed rate + SPEED_OFFSET
// So "1.0x" displayed = 1.15x actual playback
const SPEED_OFFSET = 0.15;
const DEFAULT_DISPLAY_RATE = 1.0;
const MIN_DISPLAY_RATE = 0.5;
const MAX_DISPLAY_RATE = 2.5;

function clampDisplay(v) {
  return Math.round(Math.max(MIN_DISPLAY_RATE, Math.min(MAX_DISPLAY_RATE, v)) * 20) / 20; // snap to 0.05
}

/**
 * Shared audio playback hook for non-XP themes
 */
export function useAudioPlayback(audioUrl) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('audioVolume');
    return saved ? parseFloat(saved) : 0.8;
  });
  // displayRate is what the user sees. Actual rate = displayRate + SPEED_OFFSET
  const [displayRate, setDisplayRate] = useState(() => {
    const saved = localStorage.getItem('audioDisplayRate');
    return saved ? parseFloat(saved) : DEFAULT_DISPLAY_RATE;
  });

  const actualRate = displayRate + SPEED_OFFSET;

  // Create/update audio element
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.playbackRate = displayRate + SPEED_OFFSET;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); updateMediaSession(false); };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoaded = () => setDuration(audio.duration);
    const handlePlay = () => { setIsPlaying(true); updateMediaSession(true); };
    const handlePause = () => { setIsPlaying(false); updateMediaSession(false); };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, [audioUrl]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = displayRate + SPEED_OFFSET;
  }, [displayRate]);

  // Media Session API — enables background playback on mobile and lock screen controls
  const mediaMetaRef = useRef(null);

  const updateMediaSession = useCallback((playing) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioUrl) return;

    // Set metadata (title from URL slug)
    const slug = audioUrl.split('/').pop()?.replace(/^AI_/, '').replace(/\.mp3$/, '').replace(/-/g, ' ') || 'DuckSquack';
    const title = slug.replace(/\b\w/g, c => c.toUpperCase());

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'Tim Hughes',
      album: 'DuckSquack',
    });
    mediaMetaRef.current = true;

    // Wire lock screen / notification controls to our audio element
    const audio = audioRef.current;
    if (!audio) return;

    navigator.mediaSession.setActionHandler('play', () => {
      audio.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (details.seekOffset || 10));
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) audio.currentTime = details.seekTime;
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      mediaMetaRef.current = false;
    };
  }, [audioUrl]);

  // Keep media session position state in sync
  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioRef.current || !mediaMetaRef.current) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: displayRate + SPEED_OFFSET,
        position: Math.min(currentTime, duration || 0),
      });
    } catch {}
  }, [currentTime, duration, displayRate]);

  // Screen Wake Lock — keep device awake during audio playback
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    if (isPlaying) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLockRef.current = lock;
        lock.addEventListener('release', () => { wakeLockRef.current = null; });
      }).catch(() => {});
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolume(clamped);
    localStorage.setItem('audioVolume', clamped.toString());
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const setSpeed = useCallback((newDisplay) => {
    const clamped = clampDisplay(newDisplay);
    setDisplayRate(clamped);
    localStorage.setItem('audioDisplayRate', clamped.toString());
    if (audioRef.current) audioRef.current.playbackRate = clamped + SPEED_OFFSET;
  }, []);

  // Format display rate for UI
  const displayRateLabel = displayRate === DEFAULT_DISPLAY_RATE
    ? '1.0x'
    : `${displayRate.toFixed(1)}x`;

  return {
    isPlaying, currentTime, duration, volume,
    displayRate, displayRateLabel, actualRate,
    toggle, seek, changeVolume, setSpeed,
  };
}
