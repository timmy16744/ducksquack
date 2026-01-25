import React from 'react';

export default function XPStatusBar({ currentPage, currentPost, writingsCount = 0 }) {
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

  const getLineCol = () => {
    return 'Ln 1, Col 1';
  };

  return (
    <div className="xp-status-bar">
      <div className="status-left">
        {getStatusText()}
      </div>
      <div className="status-right">
        <span>{getLineCol()}</span>
      </div>
    </div>
  );
}
