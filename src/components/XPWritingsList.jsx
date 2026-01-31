import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { formatDate, formatDateShort } from '../utils/date';
import { fetchWritingsIndex } from '../utils/content';
import { subscribeToViewCounts } from '../utils/firebase';

// Podcast/headphones icon
const PodcastIcon = ({ isPlaying = false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <linearGradient id="podcastBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={isPlaying ? "#6090D0" : "#808080"}/>
        <stop offset="100%" stopColor={isPlaying ? "#3060A0" : "#505050"}/>
      </linearGradient>
    </defs>
    {/* Headphone band */}
    <path d="M4 10C4 6 6.5 3 10 3C13.5 3 16 6 16 10" fill="none" stroke={isPlaying ? "#4080C0" : "#606060"} strokeWidth="2" strokeLinecap="round"/>
    {/* Left earpiece */}
    <rect x="2" y="10" width="4" height="6" rx="1" fill="url(#podcastBody)" stroke={isPlaying ? "#204080" : "#404040"} strokeWidth="0.5"/>
    {/* Right earpiece */}
    <rect x="14" y="10" width="4" height="6" rx="1" fill="url(#podcastBody)" stroke={isPlaying ? "#204080" : "#404040"} strokeWidth="0.5"/>
    {/* Sound waves when playing */}
    {isPlaying && (
      <>
        <circle cx="10" cy="13" r="2" fill="none" stroke="#4080C0" strokeWidth="1"/>
        <circle cx="10" cy="13" r="4" fill="none" stroke="#4080C0" strokeWidth="0.5" opacity="0.6"/>
      </>
    )}
  </svg>
);

// Format time as mm:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Link/share icon
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16">
    <path d="M6.5 10.5L9.5 7.5M7 9L4.5 11.5C3.5 12.5 3.5 14 4.5 15C5.5 16 7 16 8 15L10.5 12.5"
          fill="none" stroke="#4070A0" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 7L11.5 4.5C12.5 3.5 12.5 2 11.5 1C10.5 0 9 0 8 1L5.5 3.5"
          fill="none" stroke="#4070A0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// XP-style document icon as inline SVG
const DocumentIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="docBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#C4D4E8"/>
      </linearGradient>
      <linearGradient id="docFold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A8C0DC"/>
        <stop offset="100%" stopColor="#7BA0C8"/>
      </linearGradient>
    </defs>
    <path d="M2 1h8l4 4v10H2V1z" fill="url(#docBody)" stroke="#7A97B8" strokeWidth="0.5"/>
    <path d="M10 1v4h4" fill="url(#docFold)" stroke="#7A97B8" strokeWidth="0.5"/>
    <line x1="4" y1="7" x2="12" y2="7" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="9" x2="12" y2="9" stroke="#4A6A8A" strokeWidth="0.75"/>
    <line x1="4" y1="11" x2="10" y2="11" stroke="#4A6A8A" strokeWidth="0.75"/>
  </svg>
);

// XP-style folder icon
const FolderIcon = ({ size = 16, className = '', open = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="folderFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE88C"/>
        <stop offset="50%" stopColor="#FDDF6C"/>
        <stop offset="100%" stopColor="#E8C84C"/>
      </linearGradient>
      <linearGradient id="folderTab" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF4B8"/>
        <stop offset="100%" stopColor="#E8C84C"/>
      </linearGradient>
    </defs>
    <path d="M1 4h5l1-2h7v2h-7l-1 2H1V4z" fill="url(#folderTab)" stroke="#B89848" strokeWidth="0.5"/>
    <rect x="1" y="5" width="14" height="9" rx="1" fill="url(#folderFront)" stroke="#B89848" strokeWidth="0.5"/>
    {open && <rect x="2" y="3" width="12" height="1" fill="#FFF4B8"/>}
  </svg>
);

// Home icon for sidebar
const HomeIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="homeRoofSmallW" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C85040"/>
        <stop offset="100%" stopColor="#983028"/>
      </linearGradient>
      <linearGradient id="homeWallSmallW" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F0E8C0"/>
        <stop offset="100%" stopColor="#D8C888"/>
      </linearGradient>
    </defs>
    <path d="M8 1L1 7H3V14H13V7H15L8 1Z" fill="url(#homeWallSmallW)" stroke="#705830" strokeWidth="0.5"/>
    <path d="M8 1L1 7H3L8 3L13 7H15L8 1Z" fill="url(#homeRoofSmallW)" stroke="#602820" strokeWidth="0.5"/>
    <rect x="6" y="9" width="4" height="5" fill="#6080A0" stroke="#404040" strokeWidth="0.4"/>
  </svg>
);

// Person icon for sidebar
const PersonIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="personHeadSmallW" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F8D8B8"/>
        <stop offset="100%" stopColor="#D8B088"/>
      </linearGradient>
      <linearGradient id="personBodySmallW" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4888C8"/>
        <stop offset="100%" stopColor="#185898"/>
      </linearGradient>
    </defs>
    <circle cx="8" cy="5" r="3" fill="url(#personHeadSmallW)" stroke="#A08060" strokeWidth="0.5"/>
    <path d="M2 15C2 11 5 9 8 9C11 9 14 11 14 15" fill="url(#personBodySmallW)" stroke="#184878" strokeWidth="0.5"/>
  </svg>
);

// Document icon for sidebar (small)
const DocumentIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="docBodySmallW" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#C4D4E8"/>
      </linearGradient>
    </defs>
    <path d="M2 1h8l4 4v10H2V1z" fill="url(#docBodySmallW)" stroke="#7A97B8" strokeWidth="0.5"/>
    <path d="M10 1v4h4" fill="#B8C8D8" stroke="#7A97B8" strokeWidth="0.5"/>
    <line x1="4" y1="7" x2="12" y2="7" stroke="#4A6A8A" strokeWidth="0.5"/>
    <line x1="4" y1="9" x2="12" y2="9" stroke="#4A6A8A" strokeWidth="0.5"/>
    <line x1="4" y1="11" x2="10" y2="11" stroke="#4A6A8A" strokeWidth="0.5"/>
  </svg>
);

export default function XPWritingsList({ onSelectPost, onNavigate }) {
  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Podcast audio state
  const podcastRef = useRef(null);
  const progressRef = useRef(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [podcastTime, setPodcastTime] = useState(0);
  const [podcastDuration, setPodcastDuration] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  // Podcast audio event handlers
  useEffect(() => {
    const audio = podcastRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPodcastPlaying(false);
      setPodcastTime(0);
      // Remove podcast param from URL when done
      const url = new URL(window.location);
      url.searchParams.delete('podcast');
      window.history.replaceState({}, '', url);
    };
    const handleTimeUpdate = () => setPodcastTime(audio.currentTime);
    const handleLoadedMetadata = () => setPodcastDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Auto-play podcast if ?podcast is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('podcast') && podcastRef.current && !isPodcastPlaying) {
      // Small delay to ensure audio is ready
      const timer = setTimeout(() => {
        podcastRef.current.play().catch(() => {});
        setIsPodcastPlaying(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTogglePodcast = useCallback(() => {
    if (!podcastRef.current) return;
    const url = new URL(window.location);
    if (isPodcastPlaying) {
      podcastRef.current.pause();
      setIsPodcastPlaying(false);
      url.searchParams.delete('podcast');
      window.history.replaceState({}, '', url);
    } else {
      podcastRef.current.play().catch(() => {});
      setIsPodcastPlaying(true);
      url.searchParams.set('podcast', '1');
      window.history.replaceState({}, '', url);
    }
  }, [isPodcastPlaying]);

  const handleCopyPodcastLink = useCallback(() => {
    const url = new URL(window.location.origin + '/writings/');
    url.searchParams.set('podcast', '1');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {});
  }, []);

  const handlePodcastSeek = useCallback((e) => {
    if (!progressRef.current || !podcastDuration || !podcastRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percent * podcastDuration;
    podcastRef.current.currentTime = newTime;
    setPodcastTime(newTime);
  }, [podcastDuration]);

  const handlePodcastDrag = useCallback((e) => {
    if (e.buttons !== 1) return;
    handlePodcastSeek(e);
  }, [handlePodcastSeek]);

  const podcastProgress = podcastDuration > 0 ? (podcastTime / podcastDuration) * 100 : 0;

  useEffect(() => {
    fetchWritingsIndex()
      .then(setWritings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Subscribe to real-time view counts from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToViewCounts(setViewCounts);
    return () => unsubscribe();
  }, []);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(column === 'title');
    }
  };

  // Merge view counts from Firebase with writings
  const writingsWithViews = writings.map(w => ({
    ...w,
    views: viewCounts[w.slug] || 0
  }));

  const overallStats = useMemo(() => {
    if (!writingsWithViews.length) return null;
    const totalWords = writingsWithViews.reduce((sum, w) => sum + (w.wordCount || 0), 0);
    const totalViews = writingsWithViews.reduce((sum, w) => sum + (w.views || 0), 0);
    const dates = writingsWithViews.map(w => new Date(w.date)).sort((a, b) => a - b);
    return {
      count: writingsWithViews.length,
      totalWords,
      totalViews,
      avgWords: Math.round(totalWords / writingsWithViews.length),
      oldest: dates[0],
      newest: dates[dates.length - 1],
    };
  }, [writingsWithViews]);

  const sortedWritings = [...writingsWithViews].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else if (sortBy === 'date') {
      cmp = new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'words') {
      cmp = (b.wordCount || 0) - (a.wordCount || 0);
    } else if (sortBy === 'views') {
      cmp = (b.views || 0) - (a.views || 0);
    }
    return sortAsc ? -cmp : cmp;
  });

  const formatViews = (views) => {
    if (views === undefined || views === null || views === 0) return '-';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
  };

  // Format word count for mobile display (e.g., "1.1k words")
  const formatWordCount = (count) => {
    if (!count) return '0 words';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k words`;
    return `${count} words`;
  };

  const handleRowClick = (index, writing) => {
    setSelectedIndex(index);
  };

  const handleRowDoubleClick = (writing) => {
    onSelectPost(writing);
  };

  if (loading) {
    return <div className="xp-loading">Loading writings...</div>;
  }

  return (
    <div className="xp-explorer">
      {/* Podcast Toolbar */}
      <div className="xp-explorer-toolbar">
        <div className="toolbar-buttons">
          <button
            className={`toolbar-btn podcast-btn ${isPodcastPlaying ? 'active' : ''}`}
            title={isPodcastPlaying ? "Pause NLM Podcast" : "NLM Podcast - Listen to all essays (35 min)"}
            onClick={handleTogglePodcast}
          >
            <PodcastIcon isPlaying={isPodcastPlaying} />
            <span className="toolbar-label">NLM Podcast of All Essays</span>
            <span className="podcast-duration">{podcastDuration ? formatTime(podcastDuration) : '35:00'}</span>
          </button>
          <button
            className={`toolbar-btn toolbar-btn-small podcast-share-btn ${linkCopied ? 'copied' : ''}`}
            title="Copy podcast link"
            onClick={handleCopyPodcastLink}
          >
            {linkCopied ? <span className="copied-text">Copied!</span> : <LinkIcon />}
          </button>
          {(isPodcastPlaying || podcastTime > 0) && (
            <>
              <div className="toolbar-separator"></div>
              <div className="podcast-timeline">
                <span className="audio-time">{formatTime(podcastTime)}</span>
                <div
                  ref={progressRef}
                  className="audio-progress-bar podcast-progress"
                  onClick={handlePodcastSeek}
                  onMouseMove={handlePodcastDrag}
                >
                  <div className="audio-progress-fill" style={{ width: `${podcastProgress}%` }} />
                  <div className="audio-progress-thumb" style={{ left: `${podcastProgress}%` }} />
                </div>
                <span className="audio-time">{formatTime(podcastDuration)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hidden podcast audio element */}
      <audio ref={podcastRef} src="/audio/podcast.mp3" preload="metadata" />

      {/* Main Content Area */}
      <div className="xp-explorer-main">
        {/* Left Panel - Navigation Sidebar */}
        <div className="xp-explorer-tasks">
          <div className="task-group">
            <div className="task-header">
              <span className="task-header-icon">»</span>
              <span>Navigation</span>
            </div>
            <div className="task-body">
              <div className="task-item" onClick={() => onNavigate('home')}>
                <HomeIconSmall />
                <span>Home</span>
              </div>
              <div className="task-item" onClick={() => onNavigate('about')}>
                <PersonIconSmall />
                <span>About Me</span>
              </div>
              <div className="task-item active">
                <DocumentIconSmall />
                <span>Writings</span>
              </div>
            </div>
          </div>
          <div className="task-group">
            <div className="task-header">
              <span className="task-header-icon">»</span>
              <span>Other Places</span>
            </div>
            <div className="task-body">
              <div className="task-item">
                <FolderIcon size={16} />
                <span>My Documents</span>
              </div>
              <div className="task-item">
                <FolderIcon size={16} />
                <span>My Computer</span>
              </div>
            </div>
          </div>
          <div className="task-group">
            <div className="task-header">
              <span className="task-header-icon">»</span>
              <span>Details</span>
            </div>
            <div className="task-body task-details">
              {selectedIndex !== null && sortedWritings[selectedIndex] ? (
                <>
                  <div className="task-detail-icon">
                    <DocumentIcon size={48} />
                  </div>
                  <div className="task-detail-name">{sortedWritings[selectedIndex].title}</div>
                  <div className="task-detail-type">Text Document</div>
                  <div className="task-detail-info">
                    Date Modified: {formatDate(sortedWritings[selectedIndex].date)}
                  </div>
                  <div className="task-detail-info">
                    Size: {(sortedWritings[selectedIndex].wordCount || 0).toLocaleString()} words
                  </div>
                  <div className="task-detail-info">
                    Views: {formatViews(sortedWritings[selectedIndex].views)}
                  </div>
                </>
              ) : (
                <>
                  <div className="task-detail-icon">
                    <FolderIcon size={48} />
                  </div>
                  <div className="task-detail-name">Writings</div>
                  <div className="task-detail-type">File Folder</div>
                  {overallStats && (
                    <>
                      <div className="task-detail-info">Essays: {overallStats.count}</div>
                      <div className="task-detail-info">Total Words: {overallStats.totalWords.toLocaleString()}</div>
                      <div className="task-detail-info">Avg. Length: {overallStats.avgWords.toLocaleString()} words</div>
                      <div className="task-detail-info">Total Views: {formatViews(overallStats.totalViews)}</div>
                      <div className="task-detail-info">
                        Published: {formatDate(overallStats.oldest)} – {formatDate(overallStats.newest)}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* File List with Column Headers */}
        <div className="xp-explorer-content">
          {/* Column Headers */}
          <div className="xp-explorer-headers">
            <div
              className={`header-cell name-col ${sortBy === 'title' ? 'sorted' : ''}`}
              onClick={() => handleSort('title')}
            >
              Name {sortBy === 'title' && <span className="sort-arrow">{sortAsc ? '▲' : '▼'}</span>}
            </div>
            <div
              className={`header-cell date-col ${sortBy === 'date' ? 'sorted' : ''}`}
              onClick={() => handleSort('date')}
            >
              Date Modified {sortBy === 'date' && <span className="sort-arrow">{sortAsc ? '▲' : '▼'}</span>}
            </div>
            <div
              className={`header-cell words-col ${sortBy === 'words' ? 'sorted' : ''}`}
              onClick={() => handleSort('words')}
            >
              Size {sortBy === 'words' && <span className="sort-arrow">{sortAsc ? '▲' : '▼'}</span>}
            </div>
            <div
              className={`header-cell views-col ${sortBy === 'views' ? 'sorted' : ''}`}
              onClick={() => handleSort('views')}
            >
              Views {sortBy === 'views' && <span className="sort-arrow">{sortAsc ? '▲' : '▼'}</span>}
            </div>
          </div>

          {/* File Rows */}
          <div className="xp-explorer-files">
            {sortedWritings.map((writing, index) => (
              <div
                key={writing.slug}
                className={`xp-explorer-row ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => handleRowClick(index, writing)}
                onDoubleClick={() => handleRowDoubleClick(writing)}
              >
                <div className="file-cell name-col">
                  <DocumentIcon size={16} />
                  <span className="file-name">{writing.title}.txt</span>
                </div>
                <div className="file-cell date-col">
                  {formatDate(writing.date)}
                </div>
                <div className="file-cell words-col">
                  {(writing.wordCount || 0).toLocaleString()} words
                </div>
                <div className="file-cell views-col">
                  {formatViews(writing.views)}
                </div>
                {/* Mobile metadata subtitle - visible only on mobile via CSS */}
                <div className="mobile-metadata">
                  <span>{formatDateShort(writing.date)}</span>
                  <span>·</span>
                  <span>{formatWordCount(writing.wordCount)}</span>
                  {writing.views > 0 && (
                    <>
                      <span>·</span>
                      <span>{formatViews(writing.views)} views</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Pane (right side panel) */}
        <div className="xp-explorer-details">
          <div className="details-header">
            <DocumentIcon size={16} />
            <span className="details-title">Preview</span>
          </div>
          {selectedIndex !== null && sortedWritings[selectedIndex] ? (
            <div className="details-content">
              <div className="details-icon-large">
                <DocumentIcon size={48} />
              </div>
              <div className="details-filename">
                {sortedWritings[selectedIndex].title}
              </div>
              <div className="details-type">Text Document</div>

              <div className="details-section">
                <div className="details-row">
                  <span className="details-label">Date Modified:</span>
                  <span className="details-value">{formatDate(sortedWritings[selectedIndex].date)}</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Size:</span>
                  <span className="details-value">{(sortedWritings[selectedIndex].wordCount || 0).toLocaleString()} words</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Views:</span>
                  <span className="details-value">{formatViews(sortedWritings[selectedIndex].views)}</span>
                </div>
              </div>

              <div className="details-synopsis">
                <div className="synopsis-label">Synopsis:</div>
                <div className="synopsis-text">
                  {sortedWritings[selectedIndex].synopsis || sortedWritings[selectedIndex].preview || 'No synopsis available.'}
                </div>
              </div>

              <button
                className="details-open-btn"
                onClick={() => handleRowDoubleClick(sortedWritings[selectedIndex])}
              >
                Open
              </button>
            </div>
          ) : (
            <div className="details-empty">
              <div className="details-icon-large">
                <FolderIcon size={48} />
              </div>
              <div className="details-instruction">
                Select a file to preview.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="xp-explorer-status">
        <div className="status-section">
          {writings.length} object(s)
        </div>
      </div>
    </div>
  );
}
