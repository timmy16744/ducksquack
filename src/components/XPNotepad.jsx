import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute } from '../hooks/useRoute';
import { useWriting } from '../hooks/useWriting';
import XPToolbar from './XPToolbar';
import XPContent from './XPContent';

export default function XPNotepad() {
  const { page, slug, navigate } = useRoute();
  const { data: currentPost, loading } = useWriting(slug);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Window position and size state
  const [position, setPosition] = useState({ x: 40, y: 20 });
  const [size, setSize] = useState({ width: 1100, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // History tracking for back/forward navigation
  const [history, setHistory] = useState([{ page: page, slug: slug }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isNavigatingRef = useRef(false);

  // Track page changes in history
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    const currentEntry = history[historyIndex];
    if (currentEntry && currentEntry.page === page && currentEntry.slug === slug) {
      return;
    }

    // Add new entry to history, truncating forward history if we navigated back then went somewhere new
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ page, slug });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [page, slug]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  // Dragging handlers
  const handleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    if (e.target.closest('.title-bar-controls')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [isMaximized, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50));
      setPosition({ x: newX, y: newY });
    }

    if (isResizing && resizeDirection) {
      const rect = windowRef.current?.getBoundingClientRect();
      if (!rect) return;

      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(400, e.clientX - position.x);
      }
      if (resizeDirection.includes('w')) {
        const delta = position.x - e.clientX;
        newWidth = Math.max(400, size.width + delta);
        if (newWidth !== size.width) {
          newX = e.clientX;
        }
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(300, e.clientY - position.y);
      }
      if (resizeDirection.includes('n')) {
        const delta = position.y - e.clientY;
        newHeight = Math.max(300, size.height + delta);
        if (newHeight !== size.height) {
          newY = e.clientY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, resizeDirection, dragOffset, position, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  const handleResizeStart = useCallback((direction) => (e) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  }, [isMaximized]);

  // Add global mouse event listeners for dragging/resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Double-click title bar to maximize/restore
  const handleTitleBarDoubleClick = useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  const handleBack = () => {
    if (canGoBack) {
      isNavigatingRef.current = true;
      const prevEntry = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      navigate(prevEntry.page, prevEntry.slug);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      isNavigatingRef.current = true;
      const nextEntry = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      navigate(nextEntry.page, nextEntry.slug);
    }
  };

  const handleSelectPost = (post) => {
    navigate('post', post.slug);
  };

  const getWindowTitle = () => {
    switch (page) {
      case 'home':
        return 'DuckSquack - Home';
      case 'about':
        return 'DuckSquack - About';
      case 'writings':
        return 'DuckSquack - Writings';
      case 'post':
        return currentPost ? `DuckSquack - ${currentPost.title}` : 'DuckSquack';
      default:
        return 'DuckSquack';
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    if (window.confirm('Thanks for visiting DuckSquack! Close this window?')) {
      window.location.href = 'about:blank';
    }
  };

  if (isMinimized) {
    return null;
  }

  const windowStyle = isMaximized ? {} : {
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
  };

  return (
    <div
      ref={windowRef}
      className={`window xp-notepad-window ${isMaximized ? 'maximized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={windowStyle}
    >
      {/* Resize handles */}
      {!isMaximized && (
        <>
          <div className="resize-handle resize-n" onMouseDown={handleResizeStart('n')} />
          <div className="resize-handle resize-s" onMouseDown={handleResizeStart('s')} />
          <div className="resize-handle resize-e" onMouseDown={handleResizeStart('e')} />
          <div className="resize-handle resize-w" onMouseDown={handleResizeStart('w')} />
          <div className="resize-handle resize-ne" onMouseDown={handleResizeStart('ne')} />
          <div className="resize-handle resize-nw" onMouseDown={handleResizeStart('nw')} />
          <div className="resize-handle resize-se" onMouseDown={handleResizeStart('se')} />
          <div className="resize-handle resize-sw" onMouseDown={handleResizeStart('sw')} />
        </>
      )}

      <div
        className="title-bar"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <div className="title-bar-text">
          {getWindowTitle()}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={handleMinimize}>
            <span style={{
              display: 'block',
              width: '8px',
              height: '2px',
              background: 'white',
              marginTop: '6px'
            }}></span>
          </button>
          <button aria-label={isMaximized ? "Restore" : "Maximize"} onClick={handleMaximize}>
            {isMaximized ? (
              <span style={{
                display: 'block',
                width: '8px',
                height: '8px',
                border: '1px solid white',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '3px',
                  width: '8px',
                  height: '8px',
                  border: '1px solid white',
                  borderBottom: 'none',
                  borderLeft: 'none',
                  background: 'transparent'
                }}></span>
              </span>
            ) : (
              <span style={{
                display: 'block',
                width: '9px',
                height: '9px',
                border: '1px solid white',
                borderTop: '2px solid white'
              }}></span>
            )}
          </button>
          <button aria-label="Close" onClick={handleClose}>
            <span style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              lineHeight: '1'
            }}>×</span>
          </button>
        </div>
      </div>

      <XPToolbar
        currentPage={page}
        onNavigate={navigate}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={handleBack}
        onForward={handleForward}
      />

      <div className="xp-content-area">
        <XPContent
          currentPage={page}
          currentPost={currentPost}
          loading={loading}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      </div>
    </div>
  );
}
