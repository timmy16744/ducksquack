import React from 'react';

/**
 * Parse content text and convert internal links to clickable elements
 */
export function parseContent(content, onNavigate) {
  const paragraphs = content.split(/\n\n+/);
  const linkPattern = /(?:"([^"]+)"\s*)?\(\/writings\/([a-z0-9-]+)\/?\)/g;

  return paragraphs.map((paragraph, pIdx) => {
    const parts = [];
    let lastIndex = 0;
    let match;
    linkPattern.lastIndex = 0;

    while ((match = linkPattern.exec(paragraph)) !== null) {
      if (match.index > lastIndex) {
        parts.push(paragraph.slice(lastIndex, match.index));
      }
      const linkText = match[1] || match[2].replace(/-/g, ' ');
      const slug = match[2];
      parts.push(
        <a
          key={`${pIdx}-${match.index}`}
          className="internal-link"
          onClick={(e) => { e.preventDefault(); onNavigate('post', slug); }}
          style={{ cursor: 'pointer' }}
        >
          {linkText}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < paragraph.length) {
      parts.push(paragraph.slice(lastIndex));
    }

    return (
      <p key={pIdx} className="content-paragraph">
        {parts.length > 0 ? parts : paragraph}
      </p>
    );
  });
}

/**
 * Format seconds to mm:ss
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
