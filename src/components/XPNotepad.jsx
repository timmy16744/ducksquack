import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute } from '../hooks/useRoute';
import { useWriting } from '../hooks/useWriting';
import XPToolbar from './XPToolbar';
import XPContent from './XPContent';
import XPCommentBar from './XPCommentBar';

export default function XPNotepad({ isVisible = true, onMinimize, onTitleChange }) {
  const { page, slug, navigate } = useRoute();
  const { data: currentPost, loading } = useWriting(slug);
  const [isMaximized, setIsMaximized] = useState(false);

  // Window position and size - use refs for smooth dragging performance
  const defaultWidth = 1100;
  const defaultHeight = 865;
  const taskbarHeight = 30;
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [position, setPosition] = useState(() => ({
    x: Math.max(20, (window.innerWidth - defaultWidth) / 2),
    y: Math.max(10, (window.innerHeight - defaultHeight - taskbarHeight) / 2)
  }));

  // Refs for smooth drag/resize (avoid re-renders during movement)
  const windowRef = useRef(null);
  const positionRef = useRef(position);
  const sizeRef = useRef(size);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeDirectionRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

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

  // Keep refs in sync with state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Apply transform directly to DOM for smooth dragging
  const applyTransform = useCallback(() => {
    if (windowRef.current && !isMaximized) {
      windowRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      windowRef.current.style.width = `${sizeRef.current.width}px`;
      windowRef.current.style.height = `${sizeRef.current.height}px`;
    }
  }, [isMaximized]);

  // Dragging handlers - optimized with direct DOM manipulation
  const handleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    if (e.target.closest('.title-bar-controls')) return;

    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };

    if (windowRef.current) {
      windowRef.current.classList.add('dragging');
    }
  }, [isMaximized]);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current && !isResizingRef.current) return;

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (isDraggingRef.current) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - 100));
        const newY = Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - 80)); // Account for taskbar
        positionRef.current = { x: newX, y: newY };
        applyTransform();
      }

      if (isResizingRef.current && resizeDirectionRef.current) {
        let newWidth = sizeRef.current.width;
        let newHeight = sizeRef.current.height;
        let newX = positionRef.current.x;
        let newY = positionRef.current.y;
        const dir = resizeDirectionRef.current;

        if (dir.includes('e')) {
          newWidth = Math.max(400, e.clientX - positionRef.current.x);
        }
        if (dir.includes('w')) {
          const delta = positionRef.current.x - e.clientX;
          const proposedWidth = sizeRef.current.width + delta;
          if (proposedWidth >= 400) {
            newWidth = proposedWidth;
            newX = e.clientX;
          }
        }
        if (dir.includes('s')) {
          newHeight = Math.max(300, e.clientY - positionRef.current.y);
        }
        if (dir.includes('n')) {
          const delta = positionRef.current.y - e.clientY;
          const proposedHeight = sizeRef.current.height + delta;
          if (proposedHeight >= 300) {
            newHeight = proposedHeight;
            newY = e.clientY;
          }
        }

        sizeRef.current = { width: newWidth, height: newHeight };
        positionRef.current = { x: newX, y: newY };
        applyTransform();
      }
    });
  }, [applyTransform]);

  const handleMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Sync refs back to state when done
    if (isDraggingRef.current || isResizingRef.current) {
      setPosition({ ...positionRef.current });
      setSize({ ...sizeRef.current });
    }

    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeDirectionRef.current = null;

    if (windowRef.current) {
      windowRef.current.classList.remove('dragging');
    }
  }, []);

  const handleResizeStart = useCallback((direction) => (e) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeDirectionRef.current = direction;
  }, [isMaximized]);

  // Add global mouse event listeners only when visible
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isVisible, handleMouseMove, handleMouseUp]);

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

  const getWindowTitle = useCallback(() => {
    let title;
    switch (page) {
      case 'home':
        title = 'DuckSquack - Home';
        break;
      case 'about':
        title = 'DuckSquack - About';
        break;
      case 'writings':
        title = 'DuckSquack - Writings';
        break;
      case 'post':
        title = currentPost ? `DuckSquack - ${currentPost.title}` : 'DuckSquack';
        break;
      default:
        title = 'DuckSquack';
    }
    return title;
  }, [page, currentPost]);

  // Notify parent of title changes
  useEffect(() => {
    if (onTitleChange) {
      onTitleChange(getWindowTitle());
    }
  }, [getWindowTitle, onTitleChange]);

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize(getWindowTitle());
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    if (window.confirm('Thanks for visiting DuckSquack! Close this window?')) {
      window.location.href = 'about:blank';
    }
  };

  if (!isVisible) {
    return null;
  }

  const windowStyle = isMaximized ? {} : {
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: size.width,
    height: size.height,
  };

  return (
    <div
      ref={windowRef}
      className={`window xp-notepad-window ${isMaximized ? 'maximized' : ''}`}
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

      <XPCommentBar currentPage={page} currentPost={currentPost} />
    </div>
  );
}
