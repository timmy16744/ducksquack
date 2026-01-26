import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from '../hooks/useRoute';
import { useWriting } from '../hooks/useWriting';
import XPTitleBar from './XPTitleBar';
import XPToolbar from './XPToolbar';
import XPContent from './XPContent';

export default function XPNotepad() {
  const { page, slug, navigate } = useRoute();
  const { data: currentPost, loading } = useWriting(slug);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  return (
    <div className={`window xp-notepad-window ${isMaximized ? 'maximized' : ''}`}>
      <XPTitleBar
        title={getWindowTitle()}
        isMaximized={isMaximized}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />

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
