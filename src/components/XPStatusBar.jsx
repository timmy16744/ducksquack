import React from 'react';

export default function XPStatusBar({
  currentPage,
  currentPost,
  writingsCount = 0,
  fontSize,
  onFontSizeChange,
  canDecrease,
  canIncrease
}) {
  const getStatusText = () => {
    switch (currentPage) {
      case 'home':
        return 'Welcome to DuckSquack';
      case 'about':
        return 'About Tim Hughes';
      case 'writings':
        return `${writingsCount} writings`;
      case 'post':
        return currentPost?.title || 'Reading...';
      default:
        return 'Ready';
    }
  };

  const showFontControl = currentPage === 'writings' || currentPage === 'post';

  return (
    <div className="xp-status-bar">
      <div className="status-left">
        {getStatusText()}
      </div>
      <div className="status-right">
        {showFontControl && (
          <div className="font-size-control">
            <button
              className="font-btn"
              onClick={() => onFontSizeChange(-1)}
              disabled={!canDecrease}
              title="Decrease font size"
            >
              A<span className="font-arrow">-</span>
            </button>
            <span className="font-size-display">{fontSize}</span>
            <button
              className="font-btn"
              onClick={() => onFontSizeChange(1)}
              disabled={!canIncrease}
              title="Increase font size"
            >
              A<span className="font-arrow">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
