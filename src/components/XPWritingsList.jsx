import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/date';
import { fetchWritingsIndex } from '../utils/content';

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
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchWritingsIndex()
      .then(setWritings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(column === 'title');
    }
  };

  const sortedWritings = [...writings].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else if (sortBy === 'date') {
      cmp = new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'words') {
      cmp = (b.wordCount || 0) - (a.wordCount || 0);
    }
    return sortAsc ? -cmp : cmp;
  });

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
                </>
              ) : (
                <>
                  <div className="task-detail-icon">
                    <FolderIcon size={48} />
                  </div>
                  <div className="task-detail-name">Writings</div>
                  <div className="task-detail-type">File Folder</div>
                  <div className="task-detail-info">{writings.length} items</div>
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
