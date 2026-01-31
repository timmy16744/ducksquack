import React, { useRef, useCallback, useState } from 'react';

// XP-style back arrow icon
const BackIcon = ({ disabled = false }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ opacity: disabled ? 0.4 : 1 }}>
    <defs>
      <linearGradient id="backGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7ED87E"/>
        <stop offset="50%" stopColor="#4AB84A"/>
        <stop offset="100%" stopColor="#2A982A"/>
      </linearGradient>
    </defs>
    <circle cx="11" cy="11" r="9" fill="url(#backGreen)" stroke="#1A6A1A" strokeWidth="1"/>
    <path d="M12 7L8 11L12 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// XP-style forward arrow icon
const ForwardIcon = ({ disabled = false }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ opacity: disabled ? 0.4 : 1 }}>
    <defs>
      <linearGradient id="fwdGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7ED87E"/>
        <stop offset="50%" stopColor="#4AB84A"/>
        <stop offset="100%" stopColor="#2A982A"/>
      </linearGradient>
    </defs>
    <circle cx="11" cy="11" r="9" fill="url(#fwdGreen)" stroke="#1A6A1A" strokeWidth="1"/>
    <path d="M10 7L14 11L10 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Home icon - House
const HomeIcon = ({ active = false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="homeRoof" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? "#D84848" : "#C85040"}/>
        <stop offset="100%" stopColor={active ? "#A82020" : "#983028"}/>
      </linearGradient>
      <linearGradient id="homeWall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? "#FFF8D0" : "#F0E8C0"}/>
        <stop offset="100%" stopColor={active ? "#E8D898" : "#D8C888"}/>
      </linearGradient>
    </defs>
    <path d="M10 2L2 9H4V17H16V9H18L10 2Z" fill="url(#homeWall)" stroke="#705830" strokeWidth="0.75"/>
    <path d="M10 2L2 9H4L10 4L16 9H18L10 2Z" fill="url(#homeRoof)" stroke="#602820" strokeWidth="0.75"/>
    <rect x="8" y="11" width="4" height="6" fill="#6080A0" stroke="#404040" strokeWidth="0.5"/>
    <rect x="5" y="10" width="3" height="3" fill="#88C8F8" stroke="#404040" strokeWidth="0.5"/>
    <rect x="12" y="10" width="3" height="3" fill="#88C8F8" stroke="#404040" strokeWidth="0.5"/>
  </svg>
);

// About icon - Person
const PersonIcon = ({ active = false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="personHead" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? "#FFE0C0" : "#F8D8B8"}/>
        <stop offset="100%" stopColor={active ? "#E8C098" : "#D8B088"}/>
      </linearGradient>
      <linearGradient id="personBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? "#5898D8" : "#4888C8"}/>
        <stop offset="100%" stopColor={active ? "#2868A8" : "#185898"}/>
      </linearGradient>
    </defs>
    <circle cx="10" cy="6" r="4" fill="url(#personHead)" stroke="#A08060" strokeWidth="0.75"/>
    <path d="M3 18C3 13 6 11 10 11C14 11 17 13 17 18" fill="url(#personBody)" stroke="#184878" strokeWidth="0.75"/>
    <ellipse cx="8.5" cy="5.5" rx="0.8" ry="1" fill="#404040"/>
    <ellipse cx="11.5" cy="5.5" rx="0.8" ry="1" fill="#404040"/>
    <path d="M8.5 7.5Q10 8.5 11.5 7.5" fill="none" stroke="#A08060" strokeWidth="0.5"/>
  </svg>
);

// Speaker icon for audio playback
const SpeakerIcon = ({ isPlaying = false, volume = 1 }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="speakerBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={isPlaying ? "#6090D0" : "#808080"}/>
        <stop offset="100%" stopColor={isPlaying ? "#3060A0" : "#505050"}/>
      </linearGradient>
    </defs>
    {/* Speaker body */}
    <path d="M3 8v4h3l4 4V4L6 8H3z" fill="url(#speakerBody)" stroke={isPlaying ? "#204080" : "#303030"} strokeWidth="0.75"/>
    {/* Sound waves - show based on volume */}
    {volume === 0 ? (
      /* Muted - show X */
      <path d="M12 7l5 6M17 7l-5 6" fill="none" stroke="#C04040" strokeWidth="1.5" strokeLinecap="round"/>
    ) : isPlaying ? (
      <>
        <path d="M12 7c1.5 1 1.5 5 0 6" fill="none" stroke="#4080C0" strokeWidth="1.5" strokeLinecap="round" opacity={volume > 0.3 ? 1 : 0.4}/>
        <path d="M14 5c2.5 2 2.5 8 0 10" fill="none" stroke="#4080C0" strokeWidth="1.5" strokeLinecap="round" opacity={volume > 0.6 ? 1 : 0.3}/>
      </>
    ) : (
      <>
        <path d="M12 7c1.5 1 1.5 5 0 6" fill="none" stroke="#707070" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 5c2.5 2 2.5 8 0 10" fill="none" stroke="#707070" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

// Volume slider component
const VolumeSlider = ({ volume, onChange }) => {
  const sliderRef = useRef(null);

  const handleClick = useCallback((e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    onChange(newVolume);
  }, [onChange]);

  const handleDrag = useCallback((e) => {
    if (e.buttons !== 1) return;
    handleClick(e);
  }, [handleClick]);

  const percentage = volume * 100;

  return (
    <div
      ref={sliderRef}
      className="volume-slider"
      onClick={handleClick}
      onMouseMove={handleDrag}
      title={`Volume: ${Math.round(percentage)}%`}
    >
      <div className="volume-track">
        <div className="volume-fill" style={{ width: `${percentage}%` }} />
        <div className="volume-thumb" style={{ left: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Writings icon - Documents/Files
const DocumentsIcon = ({ active = false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="doc1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#FFFFFF" : "#F8F8F8"}/>
        <stop offset="100%" stopColor={active ? "#D8E8F8" : "#C8D8E8"}/>
      </linearGradient>
      <linearGradient id="doc2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? "#FFFFF8" : "#F8F8F0"}/>
        <stop offset="100%" stopColor={active ? "#E8E0C8" : "#D8D0B8"}/>
      </linearGradient>
    </defs>
    {/* Back document */}
    <path d="M6 3h6l3 3v10H6V3z" fill="url(#doc2)" stroke="#908870" strokeWidth="0.75"/>
    <path d="M12 3v3h3" fill="#D8D0B8" stroke="#908870" strokeWidth="0.5"/>
    {/* Front document */}
    <path d="M3 5h6l3 3v10H3V5z" fill="url(#doc1)" stroke="#7090B0" strokeWidth="0.75"/>
    <path d="M9 5v3h3" fill="#B8C8D8" stroke="#7090B0" strokeWidth="0.5"/>
    <line x1="5" y1="10" x2="10" y2="10" stroke="#5080A0" strokeWidth="0.75"/>
    <line x1="5" y1="12" x2="10" y2="12" stroke="#5080A0" strokeWidth="0.75"/>
    <line x1="5" y1="14" x2="8" y2="14" stroke="#5080A0" strokeWidth="0.75"/>
  </svg>
);

// Format time as mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function XPToolbar({ currentPage, onNavigate, canGoBack = false, canGoForward = false, onBack, onForward, audioUrl, isPlaying, onToggleAudio, currentTime = 0, duration = 0, onSeek, volume = 0.8, onVolumeChange }) {
  const progressRef = useRef(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleProgressClick = useCallback((e) => {
    if (!progressRef.current || !duration || !onSeek) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percent * duration);
  }, [duration, onSeek]);

  const handleProgressDrag = useCallback((e) => {
    if (e.buttons !== 1) return; // Only left mouse button
    handleProgressClick(e);
  }, [handleProgressClick]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="xp-global-toolbar">
      <div className="toolbar-section toolbar-nav">
        <button
          className="toolbar-btn toolbar-btn-nav"
          title="Back"
          disabled={!canGoBack}
          onClick={onBack}
        >
          <BackIcon disabled={!canGoBack} />
          <span className="toolbar-label">Back</span>
          <span className="toolbar-dropdown">▾</span>
        </button>
        <button
          className="toolbar-btn toolbar-btn-nav toolbar-btn-small"
          title="Forward"
          disabled={!canGoForward}
          onClick={onForward}
        >
          <ForwardIcon disabled={!canGoForward} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-section toolbar-pages">
        <button
          className={`toolbar-btn ${currentPage === 'home' ? 'active' : ''}`}
          title="Home"
          onClick={() => onNavigate('home')}
        >
          <HomeIcon active={currentPage === 'home'} />
          <span className="toolbar-label">Home</span>
        </button>
        <button
          className={`toolbar-btn ${currentPage === 'about' ? 'active' : ''}`}
          title="About"
          onClick={() => onNavigate('about')}
        >
          <PersonIcon active={currentPage === 'about'} />
          <span className="toolbar-label">About</span>
        </button>
        <button
          className={`toolbar-btn ${currentPage === 'writings' || currentPage === 'post' ? 'active' : ''}`}
          title="Writings"
          onClick={() => onNavigate('writings')}
        >
          <DocumentsIcon active={currentPage === 'writings' || currentPage === 'post'} />
          <span className="toolbar-label">Writings</span>
        </button>
      </div>

      {audioUrl && (
        <>
          <div className="toolbar-separator"></div>
          <div className="toolbar-section toolbar-audio">
            <button
              className={`toolbar-btn ${isPlaying ? 'active' : ''}`}
              title={isPlaying ? "Pause audio" : "Play audio"}
              onClick={onToggleAudio}
            >
              <SpeakerIcon isPlaying={isPlaying} volume={volume} />
              <span className="toolbar-label">{isPlaying ? 'Pause' : 'Listen'}</span>
            </button>
            {(isPlaying || currentTime > 0) && (
              <div className="audio-timeline">
                <span className="audio-time">{formatTime(currentTime)}</span>
                <div
                  ref={progressRef}
                  className="audio-progress-bar"
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressDrag}
                >
                  <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
                  <div className="audio-progress-thumb" style={{ left: `${progress}%` }} />
                </div>
                <span className="audio-time">{formatTime(duration)}</span>
              </div>
            )}
            {onVolumeChange && (
              <div className="audio-volume-control">
                <button
                  className="volume-btn"
                  onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
                  title={volume === 0 ? "Unmute" : "Mute"}
                >
                  <SpeakerIcon isPlaying={true} volume={volume} />
                </button>
                <VolumeSlider volume={volume} onChange={onVolumeChange} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
