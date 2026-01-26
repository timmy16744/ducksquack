import React, { useEffect, useRef } from 'react';

// Icons for menu items
const InternetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#4aa6ff"/>
    <ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke="#fff" strokeWidth="1"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="#fff" strokeWidth="1"/>
    <ellipse cx="12" cy="8" rx="8" ry="3" fill="none" stroke="#fff" strokeWidth="0.75"/>
    <ellipse cx="12" cy="16" rx="8" ry="3" fill="none" stroke="#fff" strokeWidth="0.75"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" fill="#f0c040"/>
    <polygon points="2,5 12,13 22,5" fill="none" stroke="#c09030" strokeWidth="1"/>
    <rect x="3" y="6" width="18" height="12" rx="1" fill="#fff8e0"/>
    <polygon points="3,6 12,13 21,6" fill="none" stroke="#a08020" strokeWidth="0.5"/>
  </svg>
);

const NotepadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="1" fill="#fff" stroke="#7a97b8" strokeWidth="1"/>
    <line x1="6" y1="6" x2="18" y2="6" stroke="#4a6a8a" strokeWidth="1"/>
    <line x1="6" y1="9" x2="18" y2="9" stroke="#4a6a8a" strokeWidth="1"/>
    <line x1="6" y1="12" x2="15" y2="12" stroke="#4a6a8a" strokeWidth="1"/>
    <line x1="6" y1="15" x2="18" y2="15" stroke="#4a6a8a" strokeWidth="1"/>
    <line x1="6" y1="18" x2="12" y2="18" stroke="#4a6a8a" strokeWidth="1"/>
  </svg>
);

const DocumentsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="1" fill="#f5dc7a" stroke="#c4a030" strokeWidth="1"/>
    <rect x="5" y="2" width="14" height="3" rx="1" fill="#f5dc7a" stroke="#c4a030" strokeWidth="0.5"/>
  </svg>
);

const PicturesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="1" fill="#90c0f0" stroke="#6090c0" strokeWidth="1"/>
    <circle cx="8" cy="10" r="2" fill="#ffff00"/>
    <polygon points="6,18 10,12 14,16 16,13 20,18" fill="#60a060"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="16" rx="1" fill="#c0a0f0" stroke="#9070c0" strokeWidth="1"/>
    <circle cx="9" cy="15" r="3" fill="#4040a0"/>
    <circle cx="15" cy="13" r="3" fill="#4040a0"/>
    <line x1="12" y1="15" x2="12" y2="6" stroke="#4040a0" strokeWidth="2"/>
    <line x1="18" y1="13" x2="18" y2="4" stroke="#4040a0" strokeWidth="2"/>
    <rect x="12" y="4" width="6" height="3" fill="#4040a0"/>
  </svg>
);

const ComputerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2" fill="#d0d0d0" stroke="#808080" strokeWidth="1"/>
    <rect x="4" y="5" width="16" height="10" fill="#000080"/>
    <rect x="8" y="17" width="8" height="2" fill="#c0c0c0"/>
    <rect x="6" y="19" width="12" height="2" rx="1" fill="#d0d0d0" stroke="#808080" strokeWidth="0.5"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="10" cy="10" r="6" fill="#f0f0e0" stroke="#808080" strokeWidth="2"/>
    <line x1="14" y1="14" x2="20" y2="20" stroke="#808080" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="10" cy="10" r="3" fill="none" stroke="#c0c0a0" strokeWidth="1"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#fff" stroke="#4080c0" strokeWidth="2"/>
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4080c0">?</text>
  </svg>
);

const LogOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="3" y="3" width="14" height="14" rx="2" fill="#f0c040" stroke="#c09030" strokeWidth="1"/>
    <rect x="6" y="6" width="8" height="8" rx="1" fill="#fff"/>
    <polygon points="7,10 10,7 10,9 13,9 13,11 10,11 10,13" fill="#c09030"/>
  </svg>
);

const ShutdownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="#c04040" stroke="#802020" strokeWidth="1"/>
    <circle cx="10" cy="10" r="4" fill="none" stroke="#fff" strokeWidth="2"/>
    <line x1="10" y1="3" x2="10" y2="8" stroke="#c04040" strokeWidth="3"/>
    <line x1="10" y1="3" x2="10" y2="8" stroke="#fff" strokeWidth="2"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8">
    <polygon points="0,0 8,4 0,8" fill="currentColor"/>
  </svg>
);

// User avatar placeholder
const UserAvatar = () => (
  <div className="start-menu-avatar">
    <svg width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6090c0"/>
          <stop offset="100%" stopColor="#4070a0"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="4" fill="url(#avatarBg)"/>
      <circle cx="24" cy="18" r="10" fill="#e0d0c0"/>
      <ellipse cx="24" cy="44" rx="16" ry="14" fill="#e0d0c0"/>
    </svg>
  </div>
);

export default function StartMenu({ onClose, onNavigate, userName = 'Tim Hughes' }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // Check if click was on start button
        if (!e.target.closest('.start-button')) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleItemClick = (action) => {
    if (action === 'close') {
      onClose();
    } else if (action === 'external') {
      window.open('https://twitter.com/timjhughes88', '_blank');
      onClose();
    } else if (action === 'shutdown') {
      // Trigger shutdown confirmation - for now just close
      if (window.confirm('Are you sure you want to turn off the computer?')) {
        // Could trigger a special animation or redirect
        onClose();
      }
    } else if (action) {
      onNavigate(action);
      onClose();
    }
  };

  return (
    <div className="start-menu" ref={menuRef}>
      {/* Header with user info */}
      <div className="start-menu-header">
        <UserAvatar />
        <span className="start-menu-username">{userName}</span>
      </div>

      {/* Main content area */}
      <div className="start-menu-body">
        {/* Left column - frequently used programs */}
        <div className="start-menu-left">
          <div
            className="start-menu-item"
            onClick={() => handleItemClick('external')}
          >
            <InternetIcon />
            <div className="start-menu-item-text">
              <span className="start-menu-item-title">Internet</span>
              <span className="start-menu-item-subtitle">Internet Explorer</span>
            </div>
          </div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('external')}
          >
            <EmailIcon />
            <div className="start-menu-item-text">
              <span className="start-menu-item-title">E-mail</span>
              <span className="start-menu-item-subtitle">Outlook Express</span>
            </div>
          </div>

          <div className="start-menu-separator"></div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/')}
          >
            <NotepadIcon />
            <span className="start-menu-item-title">DuckSquack</span>
          </div>

          <div className="start-menu-spacer"></div>

          <div className="start-menu-item start-menu-all-programs">
            <span className="start-menu-item-title">All Programs</span>
            <ArrowIcon />
          </div>
        </div>

        {/* Right column - places */}
        <div className="start-menu-right">
          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/writings')}
          >
            <DocumentsIcon />
            <span className="start-menu-item-title">My Documents</span>
          </div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/writings')}
          >
            <PicturesIcon />
            <span className="start-menu-item-title">My Pictures</span>
          </div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/writings')}
          >
            <MusicIcon />
            <span className="start-menu-item-title">My Music</span>
          </div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/about')}
          >
            <ComputerIcon />
            <span className="start-menu-item-title">My Computer</span>
          </div>

          <div className="start-menu-separator"></div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/writings')}
          >
            <SearchIcon />
            <span className="start-menu-item-title">Search</span>
          </div>

          <div
            className="start-menu-item"
            onClick={() => handleItemClick('/about')}
          >
            <HelpIcon />
            <span className="start-menu-item-title">Help and Support</span>
          </div>
        </div>
      </div>

      {/* Footer with log off / shutdown */}
      <div className="start-menu-footer">
        <button
          className="start-menu-footer-btn"
          onClick={() => handleItemClick('close')}
        >
          <LogOffIcon />
          <span>Log Off</span>
        </button>
        <button
          className="start-menu-footer-btn shutdown"
          onClick={() => handleItemClick('shutdown')}
        >
          <ShutdownIcon />
          <span>Turn Off Computer</span>
        </button>
      </div>
    </div>
  );
}
