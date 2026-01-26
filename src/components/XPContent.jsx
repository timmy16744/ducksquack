import React from 'react';
import { formatDate } from '../utils/date';
import XPWritingsList from './XPWritingsList';

// XP-style folder icon
const FolderIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="folderFrontSidebar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFE88C"/>
        <stop offset="50%" stopColor="#FDDF6C"/>
        <stop offset="100%" stopColor="#E8C84C"/>
      </linearGradient>
      <linearGradient id="folderTabSidebar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF4B8"/>
        <stop offset="100%" stopColor="#E8C84C"/>
      </linearGradient>
    </defs>
    <path d="M1 4h5l1-2h7v2h-7l-1 2H1V4z" fill="url(#folderTabSidebar)" stroke="#B89848" strokeWidth="0.5"/>
    <rect x="1" y="5" width="14" height="9" rx="1" fill="url(#folderFrontSidebar)" stroke="#B89848" strokeWidth="0.5"/>
  </svg>
);

// Home icon for sidebar
const HomeIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="homeRoofSmall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C85040"/>
        <stop offset="100%" stopColor="#983028"/>
      </linearGradient>
      <linearGradient id="homeWallSmall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F0E8C0"/>
        <stop offset="100%" stopColor="#D8C888"/>
      </linearGradient>
    </defs>
    <path d="M8 1L1 7H3V14H13V7H15L8 1Z" fill="url(#homeWallSmall)" stroke="#705830" strokeWidth="0.5"/>
    <path d="M8 1L1 7H3L8 3L13 7H15L8 1Z" fill="url(#homeRoofSmall)" stroke="#602820" strokeWidth="0.5"/>
    <rect x="6" y="9" width="4" height="5" fill="#6080A0" stroke="#404040" strokeWidth="0.4"/>
  </svg>
);

// Person icon for sidebar
const PersonIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="personHeadSmall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F8D8B8"/>
        <stop offset="100%" stopColor="#D8B088"/>
      </linearGradient>
      <linearGradient id="personBodySmall" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4888C8"/>
        <stop offset="100%" stopColor="#185898"/>
      </linearGradient>
    </defs>
    <circle cx="8" cy="5" r="3" fill="url(#personHeadSmall)" stroke="#A08060" strokeWidth="0.5"/>
    <path d="M2 15C2 11 5 9 8 9C11 9 14 11 14 15" fill="url(#personBodySmall)" stroke="#184878" strokeWidth="0.5"/>
  </svg>
);

// Document icon for sidebar
const DocumentIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="docBodySmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#C4D4E8"/>
      </linearGradient>
    </defs>
    <path d="M2 1h8l4 4v10H2V1z" fill="url(#docBodySmall)" stroke="#7A97B8" strokeWidth="0.5"/>
    <path d="M10 1v4h4" fill="#B8C8D8" stroke="#7A97B8" strokeWidth="0.5"/>
    <line x1="4" y1="7" x2="12" y2="7" stroke="#4A6A8A" strokeWidth="0.5"/>
    <line x1="4" y1="9" x2="12" y2="9" stroke="#4A6A8A" strokeWidth="0.5"/>
    <line x1="4" y1="11" x2="10" y2="11" stroke="#4A6A8A" strokeWidth="0.5"/>
  </svg>
);

// Reusable sidebar component
const XPSidebar = ({ currentPage, onNavigate }) => (
  <div className="xp-sidebar">
    <div className="task-group">
      <div className="task-header">
        <span className="task-header-icon">»</span>
        <span>Navigation</span>
      </div>
      <div className="task-body">
        <div
          className={`task-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          <HomeIconSmall />
          <span>Home</span>
        </div>
        <div
          className={`task-item ${currentPage === 'about' ? 'active' : ''}`}
          onClick={() => onNavigate('about')}
        >
          <PersonIconSmall />
          <span>About Me</span>
        </div>
        <div
          className={`task-item ${currentPage === 'writings' || currentPage === 'post' ? 'active' : ''}`}
          onClick={() => onNavigate('writings')}
        >
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
  </div>
);

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
    <div className="xp-page-layout">
      <XPSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="xp-page-main">
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
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="xp-page-layout">
      <XPSidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="xp-page-main">
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
      </div>
    </div>
  );

  const renderWritings = () => (
    <XPWritingsList onSelectPost={onSelectPost} onNavigate={onNavigate} />
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
