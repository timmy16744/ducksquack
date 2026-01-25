import React from 'react';
import { formatDate } from '../utils/date';
import XPWritingsList from './XPWritingsList';

// Parse content and convert internal links to clickable elements
function parseContent(content, onNavigate) {
  // Match patterns like (/writings/slug/) or "text" (/writings/slug/)
  const linkPattern = /(?:"([^"]+)"\s*)?\(\/writings\/([a-z0-9-]+)\/?\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const linkText = match[1] || match[2].replace(/-/g, ' ');
    const slug = match[2];

    parts.push(
      <a
        key={match.index}
        className="internal-link"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('post', slug);
        }}
      >
        {linkText}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export default function XPContent({ currentPage, currentPost, loading, onNavigate, onSelectPost }) {
  const renderHome = () => (
    <div className="xp-home-content xp-content">
      <h1 className="welcome-title">Welcome to DuckSquack</h1>
      <div className="subtitle">Essays on AI, Technology & Society by Tim Hughes.</div>

      <p className="description">
        I write about artificial intelligence, technological transformation,
        and the future we're building together. These essays explore pattern
        recognition, systems thinking, and what it means to be human in an
        age of machine intelligence.
      </p>

      <div className="nav-links">
        <a onClick={() => onNavigate('writings')}>&#8594; Read my writings</a>
        <a onClick={() => onNavigate('about')}>&#8594; About me</a>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="xp-about-content xp-content">
      <h1>About Me</h1>

      <div className="bio">
{`My name is Tim Hughes. I'm a designer and developer from Adelaide, Australia.

I have a Master's in Computer Science and a Bachelor's in Design. I love creating things, from web apps to logos.

When I'm not coding, you can find me at the gym, painting, or spending time with my wife Chiara, our son Arthur, and our dog Luna.

I write about artificial intelligence, technological transformation, and the future we're building together. My essays explore the intersection of technology and humanity, from the economic implications of AI to the philosophical questions raised by machine intelligence.`}
      </div>

      <div className="contact-section">
        <h2>Contact</h2>
        <p>
          Twitter: <a href="https://twitter.com/timmy16744" target="_blank" rel="noopener noreferrer">@timmy16744</a>
        </p>
      </div>
    </div>
  );

  const renderWritings = () => (
    <XPWritingsList onSelectPost={onSelectPost} />
  );

  const renderPost = () => {
    if (loading) {
      return <div className="xp-loading">Loading...</div>;
    }

    if (!currentPost) {
      return <div className="xp-loading">Post not found</div>;
    }

    return (
      <div className="xp-post-view xp-content">
        <a className="back-link" onClick={() => onNavigate('writings')}>
          &#8592; Back to Writings
        </a>

        <h1 className="post-title">{currentPost.title}</h1>
        <div className="post-date">{formatDate(currentPost.date)}</div>
        <hr className="post-divider" />

        <div className="post-content">
          {parseContent(currentPost.content, onNavigate)}
        </div>
      </div>
    );
  };

  switch (currentPage) {
    case 'home':
      return renderHome();
    case 'about':
      return renderAbout();
    case 'writings':
      return renderWritings();
    case 'post':
      return renderPost();
    default:
      return renderHome();
  }
}
