import React from 'react';

/**
 * A paragraph that is nothing but **bolded text** is a section heading.
 *
 * Essays use blank-line-separated blocks; there was previously no way to
 * express a section break, so headings written as `**Title**` rendered as
 * literal asterisks. Treating a wholly-bold block as a heading gives essays
 * structure without introducing a markdown dependency.
 *
 * @param {string} block - A single paragraph block
 * @returns {string|null} The heading text, or null if not a heading
 */
export function asHeading(block) {
  const m = block.trim().match(/^\*\*(.+?)\*\*$/s);
  return m && !m[1].includes('**') ? m[1] : null;
}

/**
 * Render inline `**bold**` spans within a plain-text run.
 * @param {string} text
 * @param {string} keyPrefix
 * @returns {Array} React children
 */
export function renderInline(text, keyPrefix = 'i') {
  const out = [];
  let last = 0;
  const re = /\*\*(.+?)\*\*/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<strong key={`${keyPrefix}-${m.index}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [text];
}

/**
 * Parse content text and convert internal links to clickable elements
 */
export function parseContent(content, onNavigate) {
  const paragraphs = content.split(/\n\n+/);
  const linkPattern = /(?:"([^"]+)"\s*)?\(\/writings\/([a-z0-9-]+)\/?\)/g;

  return paragraphs.map((paragraph, pIdx) => {
    const heading = asHeading(paragraph);
    if (heading) {
      return <h2 key={pIdx} className="content-heading">{heading}</h2>;
    }

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
