import React, { useState, useEffect } from 'react';
import { useRoute } from '../hooks/useRoute';
import { useWriting } from '../hooks/useWriting';
import { fetchWritingsIndex } from '../utils/content';
import XPTitleBar from './XPTitleBar';
import XPNavBar from './XPNavBar';
import XPContent from './XPContent';
import XPStatusBar from './XPStatusBar';

export default function XPNotepad() {
  const { page, slug, navigate } = useRoute();
  const { data: currentPost, loading } = useWriting(slug);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [writingsCount, setWritingsCount] = useState(0);

  useEffect(() => {
    fetchWritingsIndex()
      .then(writings => setWritingsCount(writings.length))
      .catch(console.error);
  }, []);

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

      <XPNavBar
        currentPage={page}
        onNavigate={navigate}
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

      <XPStatusBar
        currentPage={page}
        currentPost={currentPost}
        writingsCount={writingsCount}
      />
    </div>
  );
}
