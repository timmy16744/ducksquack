import React, { useState, useCallback } from 'react';
import XPNotepad from './XPNotepad';
import XPTaskbar from './XPTaskbar';
import WindowsBubbles from './WindowsBubbles';
import DateTimeDialog from './dialogs/DateTimeDialog';
import StartMenu from './menus/StartMenu';
import MSNMessenger from './MSNMessenger';

export default function XPDesktop() {
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowVisible, setWindowVisible] = useState(true);
  const [windowTitle, setWindowTitle] = useState('DuckSquack');
  const [dateTimeDialogOpen, setDateTimeDialogOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [msnOpen, setMsnOpen] = useState(false);

  const handleMinimize = (title) => {
    setWindowVisible(false);
    setMinimizedWindows([{ id: 'ducksquack', title }]);
  };

  const handleRestore = (id) => {
    setWindowVisible(true);
    setMinimizedWindows([]);
  };

  const handleTitleChange = (title) => {
    setWindowTitle(title);
    // Update minimized window title if minimized
    if (minimizedWindows.length > 0) {
      setMinimizedWindows([{ id: 'ducksquack', title }]);
    }
  };

  const handleClockClick = useCallback(() => {
    setStartMenuOpen(false);
    setDateTimeDialogOpen(true);
  }, []);

  const handleStartClick = useCallback(() => {
    setDateTimeDialogOpen(false);
    setStartMenuOpen(prev => !prev);
  }, []);

  const handleCloseDateTimeDialog = useCallback(() => {
    setDateTimeDialogOpen(false);
  }, []);

  const handleCloseStartMenu = useCallback(() => {
    setStartMenuOpen(false);
  }, []);

  const handleStartMenuNavigate = useCallback((path) => {
    // Map paths to route format
    let url = '/';
    if (path === '/writings') {
      url = '/writings/';
    } else if (path === '/about') {
      url = '/about/';
    }
    window.history.pushState({}, '', url);
    // Trigger popstate event for useRoute hook to pick up
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const handleAllBubblesPopped = useCallback(() => {
    setSecretUnlocked(true);
  }, []);

  const handleSecretClick = useCallback(() => {
    window.history.pushState({}, '', '/writings/for-arthur/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    setWindowVisible(true);
    setMinimizedWindows([]);
    setSecretUnlocked(false);
  }, []);

  const handleMSNClick = useCallback(() => {
    setMsnOpen(prev => !prev);
    setStartMenuOpen(false);
    setDateTimeDialogOpen(false);
  }, []);

  const handleMSNClose = useCallback(() => {
    setMsnOpen(false);
  }, []);

  return (
    <div className="xp-desktop">
      <WindowsBubbles onAllPopped={handleAllBubblesPopped} />
      <XPNotepad
        isVisible={windowVisible}
        onMinimize={handleMinimize}
        onTitleChange={handleTitleChange}
      />
      <XPTaskbar
        minimizedWindows={minimizedWindows}
        onRestoreWindow={handleRestore}
        onClockClick={handleClockClick}
        onStartClick={handleStartClick}
        startMenuOpen={startMenuOpen}
        notificationWindows={secretUnlocked ? [{ id: 'secret', title: 'For Arthur' }] : []}
        onNotificationClick={handleSecretClick}
        onMSNClick={handleMSNClick}
      />

      <MSNMessenger isOpen={msnOpen} onClose={handleMSNClose} />

      {startMenuOpen && (
        <StartMenu
          onClose={handleCloseStartMenu}
          onNavigate={handleStartMenuNavigate}
          userName="Tim Hughes"
        />
      )}

      {dateTimeDialogOpen && (
        <DateTimeDialog onClose={handleCloseDateTimeDialog} />
      )}
    </div>
  );
}
