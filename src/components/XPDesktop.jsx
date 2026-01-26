import React, { useState, useCallback } from 'react';
import XPNotepad from './XPNotepad';
import XPTaskbar from './XPTaskbar';
import WindowsBubbles from './WindowsBubbles';
import DateTimeDialog from './dialogs/DateTimeDialog';
import StartMenu from './menus/StartMenu';

export default function XPDesktop() {
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowVisible, setWindowVisible] = useState(true);
  const [windowTitle, setWindowTitle] = useState('DuckSquack');
  const [dateTimeDialogOpen, setDateTimeDialogOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

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

  return (
    <div className="xp-desktop">
      <WindowsBubbles paused={!windowVisible} />
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
      />

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
