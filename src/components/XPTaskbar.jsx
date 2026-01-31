import React, { useState, useEffect } from 'react';
import { MSNTrayIcon } from './MSNMessenger';

// Windows XP Start button logo
const StartLogo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <linearGradient id="winRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B4A"/>
        <stop offset="100%" stopColor="#D62A17"/>
      </linearGradient>
      <linearGradient id="winGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7FD62A"/>
        <stop offset="100%" stopColor="#3BA117"/>
      </linearGradient>
      <linearGradient id="winBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4AA6FF"/>
        <stop offset="100%" stopColor="#0066CC"/>
      </linearGradient>
      <linearGradient id="winYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFDA2A"/>
        <stop offset="100%" stopColor="#FFAA00"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="6" height="6" rx="1" fill="url(#winRed)"/>
    <rect x="9" y="1" width="6" height="6" rx="1" fill="url(#winGreen)"/>
    <rect x="1" y="9" width="6" height="6" rx="1" fill="url(#winBlue)"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="url(#winYellow)"/>
  </svg>
);

// Notepad icon for taskbar
const NotepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <linearGradient id="notepadBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#E8E4D8"/>
      </linearGradient>
    </defs>
    <rect x="2" y="1" width="12" height="14" rx="1" fill="url(#notepadBody)" stroke="#7A97B8" strokeWidth="0.5"/>
    <line x1="4" y1="4" x2="12" y2="4" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="6" x2="12" y2="6" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="8" x2="10" y2="8" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="10" x2="12" y2="10" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="12" x2="8" y2="12" stroke="#4A6A8A" strokeWidth="0.75"/>
  </svg>
);

export default function XPTaskbar({
  minimizedWindows,
  onRestoreWindow,
  onStartClick,
  onClockClick,
  startMenuOpen,
  notificationWindows,
  onNotificationClick,
  onMSNClick
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="xp-taskbar">
      <button
        className={`start-button ${startMenuOpen ? 'active' : ''}`}
        onClick={onStartClick}
      >
        <StartLogo />
        <span>start</span>
      </button>

      <div className="taskbar-divider"></div>

      <div className="taskbar-windows">
        {minimizedWindows.map((window) => (
          <button
            key={window.id}
            className="taskbar-window-btn"
            onClick={() => onRestoreWindow(window.id)}
          >
            <NotepadIcon />
            <span className="taskbar-window-title">{window.title}</span>
          </button>
        ))}
        {notificationWindows?.map((win) => (
          <button
            key={win.id}
            className="taskbar-window-btn flashing"
            onClick={() => onNotificationClick(win.id)}
          >
            <NotepadIcon />
            <span className="taskbar-window-title">{win.title}</span>
          </button>
        ))}
      </div>

      <div className="taskbar-tray">
        <div className="tray-divider"></div>
        <MSNTrayIcon onClick={onMSNClick} />
        <div
          className="taskbar-clock"
          onClick={onClockClick}
          title="Click to open Date and Time Properties"
        >
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
}
