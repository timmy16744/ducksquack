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

// Search icon
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <defs>
      <linearGradient id="searchLens" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8D8F8"/>
        <stop offset="100%" stopColor="#68A8E8"/>
      </linearGradient>
    </defs>
    <circle cx="7" cy="7" r="5" fill="url(#searchLens)" stroke="#4878A8" strokeWidth="1.5"/>
    <line x1="11" y1="11" x2="16" y2="16" stroke="#8B4513" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="5.5" cy="5.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)" transform="rotate(-45 5.5 5.5)"/>
  </svg>
);

// Views icon
const ViewsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <rect x="1" y="1" width="7" height="7" rx="1" fill="#6B9CD5" stroke="#3A5A8C" strokeWidth="0.75"/>
    <rect x="10" y="1" width="7" height="7" rx="1" fill="#6B9CD5" stroke="#3A5A8C" strokeWidth="0.75"/>
    <rect x="1" y="10" width="7" height="7" rx="1" fill="#6B9CD5" stroke="#3A5A8C" strokeWidth="0.75"/>
    <rect x="10" y="10" width="7" height="7" rx="1" fill="#6B9CD5" stroke="#3A5A8C" strokeWidth="0.75"/>
  </svg>
);

export default function XPWritingsList({ onSelectPost }) {
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
      {/* Explorer Secondary Toolbar - Search/Views */}
      <div className="xp-explorer-toolbar">
        <div className="toolbar-buttons">
          <button className="toolbar-btn" title="Search">
            <SearchIcon />
            <span className="toolbar-label">Search</span>
          </button>
          <button className="toolbar-btn" title="Folders">
            <FolderIcon size={18} />
            <span className="toolbar-label">Folders</span>
          </button>
          <div className="toolbar-separator"></div>
          <button className="toolbar-btn" title="Views">
            <ViewsIcon />
            <span className="toolbar-dropdown">▾</span>
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="xp-explorer-addressbar">
        <span className="address-label">Address</span>
        <div className="address-input">
          <FolderIcon size={16} />
          <span className="address-text">C:\My Documents\Writings</span>
          <span className="address-dropdown">▾</span>
        </div>
        <button className="address-go">Go</button>
      </div>

      {/* Main Content Area */}
      <div className="xp-explorer-main">
        {/* Left Panel - Folder Tasks */}
        <div className="xp-explorer-tasks">
          <div className="task-group">
            <div className="task-header">
              <span className="task-header-icon">»</span>
              <span>File and Folder Tasks</span>
            </div>
            <div className="task-body">
              <div className="task-item">
                <DocumentIcon size={16} />
                <span>Make a new folder</span>
              </div>
              <div className="task-item">
                <DocumentIcon size={16} />
                <span>Publish folder to Web</span>
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
              <div className="task-item">
                <FolderIcon size={16} />
                <span>My Network Places</span>
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
        <div className="status-section status-count">
          {writings.length} object(s)
        </div>
        <div className="status-section status-size">
          {selectedIndex !== null && sortedWritings[selectedIndex] && (
            <>{(sortedWritings[selectedIndex].wordCount || 0).toLocaleString()} words</>
          )}
        </div>
        <div className="status-section status-info">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect x='2' y='4' width='12' height='10' rx='1' fill='%23C0C0C0' stroke='%23808080'/%3E%3Crect x='4' y='2' width='8' height='3' rx='1' fill='%23C0C0C0' stroke='%23808080'/%3E%3C/svg%3E"
            alt=""
            style={{ width: 16, height: 16, marginRight: 4, verticalAlign: 'middle' }}
          />
          My Computer
        </div>
      </div>
    </div>
  );
}
