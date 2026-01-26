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
{`Sup, I'm Tim Hughes aka Duck and I'm a dad, developer, and just a dude from Adelaide, Australia. All the D's.

I have an education in Computer Science—specialising in AI and pattern recognition—Design and currently a student of Philosophy; a combination that has shaped how I think about technology: not just as systems to be built, but as forces that reshape how we live, work, and relate to each other. I love creating things, breaking things, reverse engineering things, all the things.

I live with cluster headaches, a condition the medical literature describes as among the most painful known to humanity. More than half my existence involves managing this pain. I mention this not for sympathy but because it has fundamentally shaped my perspective. It taught me that you are stronger than you think you are, in nearly every aspect of your life. It forced me to find meaning outside of work and income long before AI made that search relevant for everyone else. And it gave me a fifteen-year education in how systems fail when they encounter problems that don't fit their standard categories.

When I'm not talking to a computer, you can find me at the gym, playing footy, cricket or golf, painting, or spending time with my bestfriend and fiancee Chiara, our son Arthur, and our dog Luna. Arthur's arrival recalibrated everything. Before him, I thought I understood what it meant to care about something. I was wrong. The scale I operated on went to ten. After him, I discovered it goes to a thousand.

I write about artificial intelligence, technological transformation, and the future we're building together—whether we're paying attention or not. My essays explore the intersection of technology and humanity: the economic implications of AI, the philosophical questions raised by machine intelligence, and the structural decay of institutions that were built for a world that is rapidly ceasing to exist.

I write from Australia, which means I watch the great powers manoeuvre from a distance, with the particular clarity that comes from having no illusions about our own significance.

I believe we are living through a turning point in human history. I believe the decisions made in the coming years will echo through generations. And I believe most of us haven't noticed.

This is my echo.`}
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
