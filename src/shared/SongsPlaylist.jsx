import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatDate } from '../utils/date';

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getPalette(variant) {
  switch (variant) {
    case 'xp':
      return {
        background: '#f3f0e0',
        border: '#aca899',
        color: '#1b1b1b',
        accent: '#245edb',
        buttonBg: 'linear-gradient(180deg, #fcfcfb 0%, #e5e1d2 100%)',
        buttonBorder: '#7f9db9',
        secondaryBg: '#ffffff',
        muted: '#5e5e5e',
        font: 'Tahoma, "Segoe UI", sans-serif',
        radius: '4px',
      };
    case 'terminal':
      return {
        background: '#031106',
        border: '#1f8f3a',
        color: '#7dff95',
        accent: '#52ff6c',
        buttonBg: '#06210d',
        buttonBorder: '#1f8f3a',
        secondaryBg: '#04170a',
        muted: '#4ecf66',
        font: '"Courier New", monospace',
        radius: '0',
      };
    case 'newspaper':
      return {
        background: '#f7f2e6',
        border: '#1f1b17',
        color: '#1f1b17',
        accent: '#8b0000',
        buttonBg: '#fffaf0',
        buttonBorder: '#1f1b17',
        secondaryBg: '#fffdf7',
        muted: '#574c3f',
        font: 'Georgia, "Times New Roman", serif',
        radius: '0',
      };
    case 'brutalist':
      return {
        background: '#ffffff',
        border: '#000000',
        color: '#000000',
        accent: '#ff2b06',
        buttonBg: '#ffffff',
        buttonBorder: '#000000',
        secondaryBg: '#f3f3f3',
        muted: '#333333',
        font: 'Arial, sans-serif',
        radius: '0',
      };
    case 'synthwave':
      return {
        background: 'rgba(7, 10, 34, 0.88)',
        border: '#00fff5',
        color: '#f5f7ff',
        accent: '#ff2975',
        buttonBg: 'rgba(11, 17, 53, 0.95)',
        buttonBorder: '#ff2975',
        secondaryBg: 'rgba(10, 16, 45, 0.92)',
        muted: 'rgba(245, 247, 255, 0.72)',
        font: 'inherit',
        radius: '18px',
      };
    case 'zen':
    default:
      return {
        background: '#fbfaf7',
        border: '#d8d2c8',
        color: '#1a1a1a',
        accent: '#7a6652',
        buttonBg: '#ffffff',
        buttonBorder: '#c8c0b5',
        secondaryBg: '#fffdfa',
        muted: '#7f776d',
        font: 'Georgia, "Times New Roman", serif',
        radius: '16px',
      };
  }
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PrevIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const NextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const MuteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

function buildButtonStyle(palette, primary = false, variant = 'zen') {
  const isZen = variant === 'zen';
  
  return {
    appearance: 'none',
    border: isZen 
      ? `1px solid ${primary ? palette.accent : palette.border}` 
      : `1px solid ${primary ? palette.accent : palette.buttonBorder}`,
    background: primary ? palette.accent : (isZen ? 'transparent' : palette.buttonBg),
    color: primary ? '#ffffff' : palette.color,
    padding: isZen ? '0.4rem 0.7rem' : '0.55rem 0.8rem',
    borderRadius: palette.radius,
    font: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    opacity: primary ? 1 : 0.85,
  };
}

export default function SongsPlaylist({ writings = [], variant = 'zen', onNavigate, isFloating = true, activeSongUrl = null, onSongActivated }) {
  const songs = useMemo(() => {
    return [...writings]
      .filter((writing) => writing.song?.url)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((writing) => ({
        essaySlug: writing.slug,
        essayTitle: writing.title,
        essayDate: writing.date,
        songTitle: writing.song.title,
        url: writing.song.url,
        duration: writing.song.duration,
      }));
  }, [writings]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);
  const autoplayOnLoadRef = useRef(false);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle external song activation
  useEffect(() => {
    if (activeSongUrl) {
      const index = songs.findIndex(s => s.url === activeSongUrl);
      if (index !== -1) {
        if (index === currentIndex) {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        } else {
          setCurrentIndex(index);
          autoplayOnLoadRef.current = true;
        }
        setIsCollapsed(false);
        if (onSongActivated) onSongActivated();
      }
    }
  }, [activeSongUrl, songs, currentIndex, onSongActivated]);

  useEffect(() => {
    if (!songs.length) {
      setCurrentIndex(0);
      setIsPlaying(false);
      return;
    }

    if (currentIndex > songs.length - 1) {
      setCurrentIndex(0);
    }
  }, [songs.length, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentIndex < songs.length - 1) {
        autoplayOnLoadRef.current = true;
        setCurrentIndex(currentIndex + 1);
      } else {
        autoplayOnLoadRef.current = false;
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, songs.length]);

  const currentSong = songs[currentIndex] || null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.load();
    setCurrentTime(0);
    if (autoplayOnLoadRef.current) {
      audio.play().catch(() => {
        autoplayOnLoadRef.current = false;
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  if (!songs.length) {
    return null;
  }

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setVolume(pct);
  };

  const palette = getPalette(variant);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      autoplayOnLoadRef.current = false;
      audio.pause();
      setIsPlaying(false);
    } else {
      autoplayOnLoadRef.current = true;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        autoplayOnLoadRef.current = false;
        setIsPlaying(false);
      });
      setIsPlaying(true); // Immediate UI update
    }
  };

  const next = (e) => {
    e.stopPropagation();
    if (currentIndex >= songs.length - 1) return;
    autoplayOnLoadRef.current = isPlaying;
    setCurrentIndex(currentIndex + 1);
  };

  const previous = (e) => {
    e.stopPropagation();
    if (currentIndex <= 0) return;
    autoplayOnLoadRef.current = isPlaying;
    setCurrentIndex(currentIndex - 1);
  };

  const selectSong = (index) => {
    const audio = audioRef.current;
    if (!audio) return;
    autoplayOnLoadRef.current = true;
    if (index === currentIndex) {
      audio.play().catch(() => {
        autoplayOnLoadRef.current = false;
      });
      return;
    }
    setCurrentIndex(index);
  };

  // Floating styles
  const floatingContainerStyle = isFloating ? {
    position: 'fixed',
    bottom: variant === 'xp' ? '40px' : '30px',
    right: '30px',
    zIndex: 9999,
    width: isCollapsed ? 'auto' : (variant === 'xp' ? '320px' : '350px'),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxHeight: isCollapsed ? '50px' : '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } : {};

  const containerStyle = {
    padding: variant === 'xp' ? (isCollapsed ? '0' : '2px') : (isCollapsed ? '0.5rem 1rem' : '1.25rem'),
    background: variant === 'xp' ? (isCollapsed ? 'transparent' : '#ECE9D8') : palette.background,
    border: variant === 'xp'
      ? (isCollapsed ? 'none' : '2px solid #003399')
      : `1px solid ${palette.border}`,
    color: palette.color,
    fontFamily: palette.font,
    borderRadius: variant === 'xp' ? (isCollapsed ? '0' : '4px 4px 0 0') : (isCollapsed ? '30px' : palette.radius),
    boxShadow: variant === 'xp'
      ? (isCollapsed ? 'none' : '2px 2px 10px rgba(0,0,0,0.3)')
      : '0 8px 30px rgba(0,0,0,0.08)',
    cursor: isCollapsed ? 'pointer' : 'default',
  };

  const xpTitleBarStyle = {
    background: 'linear-gradient(180deg, #0058EE 0%, #3593FF 4%, #288EFF 6%, #127DFF 40%, #036AFF 50%, #0267FF 51%, #0267FF 100%)',
    padding: '3px 5px 3px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '11px',
    textShadow: '1px 1px 1px #003399',
    height: '25px',
    borderBottom: '1px solid #003399',
  };

  const xpContentStyle = {
    padding: '10px',
    overflowY: 'auto',
    maxHeight: '400px',
  };

  const zenCollapsedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: palette.accent,
  };

  const headingStyle = {
    margin: 0,
    fontSize: variant === 'xp' ? '12px' : '1rem',
    fontWeight: variant === 'newspaper' ? '700' : '600',
    letterSpacing: variant === 'brutalist' ? '0.04em' : 'normal',
    textTransform: variant === 'brutalist' ? 'uppercase' : 'none',
  };

  const subheadingStyle = {
    margin: '0.35rem 0 0',
    color: palette.muted,
    fontSize: variant === 'xp' ? '11px' : '0.85rem',
  };

  const controlsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    alignItems: 'center',
    marginTop: '0.85rem',
  };

  const audioStyle = {
    width: '100%',
    marginTop: '0.85rem',
    accentColor: palette.accent,
    height: variant === 'xp' ? '28px' : '36px',
  };

  const listStyle = {
    listStyle: 'none',
    margin: '1rem 0 0',
    padding: 0,
    display: 'grid',
    gap: '0.4rem',
    overflowY: 'auto',
    maxHeight: '200px',
    paddingRight: '4px',
  };

  const songButtonStyle = (active) => ({
    width: '100%',
    textAlign: 'left',
    background: active ? palette.secondaryBg : 'transparent',
    color: palette.color,
    border: `1px solid ${active ? palette.accent : palette.border}`,
    borderRadius: palette.radius,
    padding: '0.5rem 0.7rem',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '0.85rem',
  });

  // Render Collapsed State
  if (isCollapsed) {
    if (variant === 'xp') {
      return (
        <div style={floatingContainerStyle} onClick={() => setIsCollapsed(false)}>
          <div style={{
            ...containerStyle,
            background: 'linear-gradient(180deg, #0058EE 0%, #3593FF 4%, #288EFF 6%, #127DFF 40%, #036AFF 50%, #0267FF 51%, #0267FF 100%)',
            border: '1px solid #003399',
            borderRadius: '3px 3px 0 0',
            padding: '4px 10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: '14px' }}>📻</span>
            <span>Playlist {isPlaying ? ' (Playing...)' : ''}</span>
          </div>
          <audio ref={audioRef} preload="none" src={currentSong?.url || ''} />
        </div>
      );
    }

    return (
      <div style={floatingContainerStyle} onClick={() => setIsCollapsed(false)}>
        <div style={containerStyle}>
          <div style={zenCollapsedStyle}>
            <span style={{ fontSize: '1.2rem' }}>{isPlaying ? '♪' : '♫'}</span>
            <span>Playlist</span>
            {isPlaying && currentSong && (
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '4px', fontWeight: 'normal' }}>
                — {currentSong.songTitle}
              </span>
            )}
          </div>
        </div>
        <audio ref={audioRef} preload="none" src={currentSong?.url || ''} />
      </div>
    );
  }

  // Render Expanded State
  return (
    <div style={floatingContainerStyle}>
      <section style={containerStyle}>
        {variant === 'xp' && (
          <div style={xpTitleBarStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '14px' }}>📻</span>
              <span>Songs Playlist</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                width: '21px',
                height: '21px',
                background: '#E6E6E6',
                border: '1px solid #FFFFFF',
                boxShadow: 'inset -1px -1px 1px #808080, inset 1px 1px 1px #FFFFFF',
                color: '#333',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 0 2px 0',
                cursor: 'pointer',
              }}
            >
              _
            </button>
          </div>
        )}

        <div style={variant === 'xp' ? xpContentStyle : {}}>
          {variant !== 'xp' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={headingStyle}>Songs Playlist</h2>
                <p style={subheadingStyle}>
                  {songs.length} songs paired with essays.
                </p>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: palette.muted,
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0 5px'
                }}
              >
                ×
              </button>
            </div>
          )}

          <div style={controlsStyle}>
            <button type="button" style={buildButtonStyle(palette, !isPlaying, variant)} onClick={togglePlay}>
              {isPlaying ? (
                <>{variant === 'zen' ? <PauseIcon /> : '❚❚'} Pause</>
              ) : (
                <>{variant === 'zen' ? <PlayIcon /> : '▶'} Play</>
              )}
            </button>
            <button type="button" style={buildButtonStyle(palette, false, variant)} onClick={previous} disabled={currentIndex === 0}>
              {variant === 'zen' ? <PrevIcon /> : '←'}
            </button>
            <button type="button" style={buildButtonStyle(palette, false, variant)} onClick={next} disabled={currentIndex >= songs.length - 1}>
              {variant === 'zen' ? <NextIcon /> : '→'}
            </button>
            {currentSong && onNavigate && (
              <button
                type="button"
                style={{
                  ...buildButtonStyle(palette, false, variant),
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.6rem'
                }}
                onClick={() => onNavigate('post', currentSong.essaySlug)}
              >
                Read Essay
              </button>
            )}
          </div>

          {currentSong && (
            <div style={{ marginTop: '0.85rem', color: palette.muted, fontSize: variant === 'xp' ? '11px' : '0.85rem', lineHeight: '1.4' }}>
              <strong>{currentSong.songTitle}</strong><br/>
              {currentSong.essayTitle}
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            {/* Custom Progress Bar */}
            <div
              onClick={handleSeek}
              style={{
                width: '100%',
                height: variant === 'xp' ? '20px' : '3px',
                background: variant === 'xp' ? '#FFF' : palette.border,
                border: variant === 'xp' ? '1px inset #ACA899' : 'none',
                borderRadius: variant === 'xp' ? '0' : '2px',
                position: 'relative',
                cursor: 'pointer',
                marginBottom: '4px',
                boxShadow: variant === 'xp' ? 'inset 1px 1px 1px #808080' : 'none',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(currentTime / (duration || 1)) * 100}%`,
                  background: variant === 'xp' ? 'linear-gradient(180deg, #10C410 0%, #0BB50B 50%, #009900 100%)' : palette.accent,
                  transition: 'width 0.1s linear',
                  position: 'relative',
                }}
              >
                {variant === 'xp' && (
                  <div style={{
                    position: 'absolute',
                    right: '-2px',
                    top: '-1px',
                    width: '6px',
                    height: '20px',
                    background: '#ECE9D8',
                    border: '1px solid #ACA899',
                    boxShadow: '1px 1px 1px rgba(0,0,0,0.2)',
                  }} />
                )}
              </div>
            </div>
            {/* Time Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontFamily: variant === 'xp' ? 'Tahoma' : 'inherit',
              color: palette.muted,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Volume Control */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
            }}>
              <div 
                style={{ color: palette.muted, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              >
                {volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </div>
              <div
                onClick={handleVolumeChange}
                style={{
                  flex: 1,
                  height: variant === 'xp' ? '12px' : '2px',
                  background: variant === 'xp' ? '#FFF' : palette.border,
                  border: variant === 'xp' ? '1px inset #ACA899' : 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: variant === 'xp' ? 'inset 1px 1px 1px #808080' : 'none',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${volume * 100}%`,
                    background: variant === 'xp' ? 'linear-gradient(180deg, #CECECE 0%, #AAA 100%)' : palette.muted,
                    position: 'relative',
                  }}
                >
                  {variant === 'xp' && (
                    <div style={{
                      position: 'absolute',
                      right: '-4px',
                      top: '-3px',
                      width: '8px',
                      height: '16px',
                      background: '#ECE9D8',
                      border: '1px solid #808080',
                      boxShadow: '1px 1px 1px rgba(0,0,0,0.2)',
                    }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <audio ref={audioRef} preload="none" src={currentSong?.url || ''} />

          <ul style={listStyle} className="playlist-scroll">
            {songs.map((song, index) => (
              <li key={`${song.essaySlug}-${song.songTitle}`} style={{ marginBottom: '2px' }}>
                <button type="button" style={songButtonStyle(index === currentIndex)} onClick={() => selectSong(index)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'baseline' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.songTitle}
                    </span>
                    <span style={{ color: palette.muted, fontSize: '0.75rem', flexShrink: 0 }}>{formatDuration(song.duration)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <style>{`
        .playlist-scroll::-webkit-scrollbar { width: 4px; }
        .playlist-scroll::-webkit-scrollbar-track { background: transparent; }
        .playlist-scroll::-webkit-scrollbar-thumb { background: ${palette.muted}; border-radius: 4px; }
      `}</style>
    </div>
  );
}
