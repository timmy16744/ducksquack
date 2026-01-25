import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/date';
import { fetchWritingsIndex } from '../utils/content';

export default function XPWritingsList({ onSelectPost }) {
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWritingsIndex()
      .then(setWritings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="xp-loading">Loading writings...</div>;
  }

  return (
    <div className="xp-writings-list xp-content">
      <div className="list-header">My Writings</div>
      <hr className="header-rule" />

      {writings.map((writing) => (
        <div
          key={writing.slug}
          className="xp-writing-item"
          onClick={() => onSelectPost(writing)}
        >
          <div className="title-row">
            <span className="file-icon">&#128196;</span>
            <span className="title">{writing.title}</span>
          </div>
          <div className="date">{formatDate(writing.date)}</div>
          <div className="preview">"{writing.preview}"</div>
        </div>
      ))}
    </div>
  );
}
