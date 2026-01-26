import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/date';
import { fetchWritingsIndex } from '../utils/content';

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
      {/* XP Explorer Menu Bar */}
      <div className="xp-explorer-menubar">
        <span className="menu-item">File</span>
        <span className="menu-item">Edit</span>
        <span className="menu-item">View</span>
        <span className="menu-item">Favorites</span>
        <span className="menu-item">Tools</span>
        <span className="menu-item">Help</span>
      </div>

      {/* XP Explorer Toolbar */}
      <div className="xp-explorer-toolbar">
        <div className="toolbar-buttons">
          <button className="toolbar-btn" title="Back" disabled>
            <span className="toolbar-icon">◀</span>
            <span className="toolbar-label">Back</span>
          </button>
          <button className="toolbar-btn" title="Forward" disabled>
            <span className="toolbar-icon">▶</span>
          </button>
          <div className="toolbar-separator"></div>
          <button className="toolbar-btn" title="Up">
            <span className="toolbar-icon">📁</span>
          </button>
          <div className="toolbar-separator"></div>
          <button className="toolbar-btn" title="Search">
            <span className="toolbar-icon">🔍</span>
            <span className="toolbar-label">Search</span>
          </button>
          <button className="toolbar-btn" title="Folders">
            <span className="toolbar-icon">📂</span>
            <span className="toolbar-label">Folders</span>
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="xp-explorer-addressbar">
        <span className="address-label">Address</span>
        <div className="address-input">
          <span className="folder-icon">📁</span>
          <span className="address-text">C:\My Documents\Writings</span>
        </div>
        <button className="address-go">Go</button>
      </div>

      {/* Main Content Area */}
      <div className="xp-explorer-main">
        {/* File List with Column Headers */}
        <div className="xp-explorer-content">
          {/* Column Headers */}
          <div className="xp-explorer-headers">
            <div
              className={`header-cell name-col ${sortBy === 'title' ? 'sorted' : ''}`}
              onClick={() => handleSort('title')}
            >
              Name {sortBy === 'title' && (sortAsc ? '▲' : '▼')}
            </div>
            <div
              className={`header-cell date-col ${sortBy === 'date' ? 'sorted' : ''}`}
              onClick={() => handleSort('date')}
            >
              Date Modified {sortBy === 'date' && (sortAsc ? '▲' : '▼')}
            </div>
            <div
              className={`header-cell words-col ${sortBy === 'words' ? 'sorted' : ''}`}
              onClick={() => handleSort('words')}
            >
              Size {sortBy === 'words' && (sortAsc ? '▲' : '▼')}
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
                  <span className="file-icon">📄</span>
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
            <span className="details-title">Details</span>
          </div>
          {selectedIndex !== null && sortedWritings[selectedIndex] ? (
            <div className="details-content">
              <div className="details-icon-large">📄</div>
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
              <div className="details-icon-large">📁</div>
              <div className="details-instruction">
                Select a file to view its details.
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
          My Computer
        </div>
      </div>
    </div>
  );
}
