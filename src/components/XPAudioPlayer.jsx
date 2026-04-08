import React, { useState, useRef, useEffect, useCallback } from 'react';
import './XPAudioPlayer.css';

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function XPAudioPlayer({ audioUrl, title, duration: initialDuration }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update duration when metadata loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleError = () => {
      setError('Unable to load audio');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setError('Playback failed'));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, error]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleSpeedChange = useCallback((e) => {
    setPlaybackRate(parseFloat(e.target.value));
  }, []);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond if focused on player or no other input is focused
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space' && e.target.closest('.xp-audio-player')) {
        e.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  if (error) {
    return (
      <div className="xp-audio-player xp-audio-error">
        <span className="error-icon">!</span>
        <span className="error-text">{error}</span>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="xp-audio-player" tabIndex={0}>
      <div className="player-header">
        <span className="player-icon">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="#4a7cb4" stroke="#2d5a8a" strokeWidth="1"/>
            <polygon points="6,5 11,8 6,11" fill="white"/>
          </svg>
        </span>
        <span className="player-title">Listen to this essay</span>
      </div>

      <div className="player-controls">
        <button
          className="xp-btn play-btn"
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="1" width="3" height="10" fill="currentColor"/>
              <rect x="7" y="1" width="3" height="10" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon points="2,0 12,6 2,12" fill="currentColor"/>
            </svg>
          )}
        </button>

        <div
          className="progress-container"
          ref={progressRef}
          onClick={handleSeek}
        >
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div
              className="progress-thumb"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        <div className="time-display">
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span className="time-duration">{formatTime(duration)}</span>
        </div>

        <select
          className="xp-dropdown speed-select"
          value={playbackRate}
          onChange={handleSpeedChange}
          title="Playback speed"
        >
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
