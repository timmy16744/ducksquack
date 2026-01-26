import React, { useState } from 'react';
import XPNotepad from './XPNotepad';
import XPTaskbar from './XPTaskbar';
import WindowsBubbles from './WindowsBubbles';

export default function XPDesktop() {
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [windowVisible, setWindowVisible] = useState(true);
  const [windowTitle, setWindowTitle] = useState('DuckSquack');

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

  return (
    <div className="xp-desktop">
      <WindowsBubbles bubbleCount={15} />
      <XPNotepad
        isVisible={windowVisible}
        onMinimize={handleMinimize}
        onTitleChange={handleTitleChange}
      />
      <XPTaskbar
        minimizedWindows={minimizedWindows}
        onRestoreWindow={handleRestore}
      />
    </div>
  );
}
