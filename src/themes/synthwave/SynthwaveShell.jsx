import React, { useState, useEffect } from 'react';
import { useRoute } from '../../hooks/useRoute';
import { useWriting } from '../../hooks/useWriting';
import { fetchWritingsIndex } from '../../utils/content';
import { subscribeToViewCounts } from '../../utils/firebase';
import { useTheme } from '../ThemeContext';
import { homeContent, aboutContent, projectsContent } from '../../shared/content-data';
import { parseContent, formatTime } from '../../shared/ContentParser';
import { useAudioPlayback } from '../../shared/useAudioPlayback';
import SpeedControl from '../../shared/SpeedControl';
import { formatDate } from '../../utils/date';

const GRID_COLORS = {
  cyan: '#00fff5',
  magenta: '#ff2975',
  purple: '#b026ff',
  green: '#39ff14',
};

export default function SynthwaveShell() {
  const { page, slug, navigate } = useRoute();
  const { settings } = useTheme();
  const { data: postData, loading: postLoading } = useWriting(slug);

  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});

  const audioUrl = postData?.audio?.url || null;
  const { isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed } = useAudioPlayback(audioUrl);

  // Fetch writings index
  useEffect(() => {
    fetchWritingsIndex()
      .then(setWritings)
      .catch(() => setWritings([]));
  }, []);

  // Subscribe to view counts
  useEffect(() => {
    return subscribeToViewCounts(setViewCounts);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    const el = document.querySelector('.synthwave-content-scroll');
    if (el) el.scrollTop = 0;
  }, [page, slug]);

  const gridColor = GRID_COLORS[settings?.gridColor] || GRID_COLORS.cyan;
  const enableGrid = settings?.enableGrid !== false;
  const enableGlow = settings?.enableGlow !== false;
  const enablePulse = settings?.enablePulse !== false;
  const sunEnabled = settings?.sunEnabled !== false;

  const navItems = [
    { key: 'home', label: 'HOME' },
    { key: 'about', label: 'ABOUT' },
    { key: 'projects', label: 'PROJECTS' },
    { key: 'writings', label: 'WRITINGS' },
  ];

  return (
    <div className="synthwave-shell">
      {/* Perspective grid background */}
      {enableGrid && (
        <div
          className="synthwave-grid"
          style={{ '--grid-color': gridColor }}
        />
      )}

      {/* Retro sun */}
      {sunEnabled && <div className="synthwave-sun" />}

      {/* Navigation */}
      <nav className={`synthwave-nav ${enableGlow ? 'glow-enabled' : ''}`}>
        <div className="synthwave-nav-inner">
          <span
            className="synthwave-nav-logo"
            onClick={() => navigate('home')}
          >
            DS
          </span>
          <div className="synthwave-nav-items">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`synthwave-nav-btn ${page === item.key ? 'active' : ''} ${enablePulse && page === item.key ? 'pulse' : ''}`}
                onClick={() => navigate(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content area */}
      <main className="synthwave-content-scroll">
        <div className="synthwave-content-area">
          {page === 'home' && (
            <HomePage navigate={navigate} enableGlow={enableGlow} enablePulse={enablePulse} />
          )}
          {page === 'about' && (
            <AboutPage navigate={navigate} enableGlow={enableGlow} />
          )}
          {page === 'projects' && (
            <ProjectsPage navigate={navigate} enableGlow={enableGlow} />
          )}
          {page === 'writings' && (
            <WritingsPage
              writings={writings}
              viewCounts={viewCounts}
              navigate={navigate}
              enableGlow={enableGlow}
            />
          )}
          {page === 'post' && (
            <PostPage
              postData={postData}
              loading={postLoading}
              navigate={navigate}
              enableGlow={enableGlow}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              toggle={toggle}
              seek={seek}
              displayRate={displayRate}
              displayRateLabel={displayRateLabel}
              setSpeed={setSpeed}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---- Home Page ---- */
function HomePage({ navigate, enableGlow, enablePulse }) {
  return (
    <div className="synthwave-home">
      <h1 className={`synthwave-title ${enableGlow ? 'glow-cyan' : ''} ${enablePulse ? 'pulse' : ''}`}>
        DUCKSQUACK
      </h1>
      <p className="synthwave-subtitle">{homeContent.subtitle}</p>
      <p className="synthwave-description">{homeContent.description}</p>
      <div className="synthwave-cta-row">
        <button
          className={`synthwave-cta ${enableGlow ? 'glow-cyan' : ''}`}
          onClick={() => navigate('writings')}
        >
          READ ESSAYS
        </button>
        <button
          className={`synthwave-cta cta-magenta ${enableGlow ? 'glow-magenta' : ''}`}
          onClick={() => navigate('about')}
        >
          ABOUT ME
        </button>
      </div>
    </div>
  );
}

/* ---- About Page ---- */
function AboutPage({ navigate, enableGlow }) {
  return (
    <div className={`synthwave-card ${enableGlow ? 'glow-cyan' : ''}`}>
      <h1 className="synthwave-card-title">{aboutContent.title}</h1>
      <div className="synthwave-card-body">
        {parseContent(aboutContent.bio, navigate)}
      </div>
      <div className="synthwave-contact">
        <a
          href={aboutContent.contact.twitter.url}
          target="_blank"
          rel="noopener noreferrer"
          className="internal-link"
        >
          {aboutContent.contact.twitter.handle}
        </a>
        <span className="synthwave-contact-sep">/</span>
        <a
          href={aboutContent.contact.rss.url}
          className="internal-link"
        >
          {aboutContent.contact.rss.label}
        </a>
      </div>
    </div>
  );
}

/* ---- Projects Page ---- */
function ProjectsPage({ navigate, enableGlow }) {
  return (
    <div className="synthwave-writings-page">
      <h1 className={`synthwave-page-heading ${enableGlow ? 'glow-cyan' : ''}`}>PROJECTS</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        {projectsContent.intro}
      </p>
      <div className="synthwave-writings-grid">
        {projectsContent.projects.map((project) => (
          <div
            key={project.id}
            className={`synthwave-writing-card ${enableGlow ? 'glow-cyan' : ''}`}
            style={{ cursor: 'default' }}
          >
            <h2
              className="synthwave-writing-title"
              style={enableGlow ? { textShadow: '0 0 10px #00fff5, 0 0 20px #00fff5' } : undefined}
            >
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: '#00fff5', textDecoration: 'none', textShadow: enableGlow ? '0 0 10px #00fff5, 0 0 20px #00fff5' : undefined }}>
                  {project.name} →
                </a>
              ) : project.name}
            </h2>
            <div className="synthwave-writing-meta">
              <span>{project.tagline}</span>
              <span>{project.status}</span>
            </div>
            {project.description.split('\n\n').map((para, j) => (
              <p key={j} className="synthwave-writing-excerpt" style={{ marginBottom: '0.5em' }}>
                {para}
              </p>
            ))}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-block',
                    padding: '0.15em 0.6em',
                    fontSize: '0.7rem',
                    borderRadius: '999px',
                    border: '1px solid #ff2975',
                    color: '#ff2975',
                    textShadow: enableGlow ? '0 0 6px #ff2975' : 'none',
                    boxShadow: enableGlow ? '0 0 6px rgba(255,41,117,0.3), inset 0 0 6px rgba(255,41,117,0.1)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Writings Page ---- */
function WritingsPage({ writings, viewCounts, navigate, enableGlow }) {
  return (
    <div className="synthwave-writings-page">
      <h1 className={`synthwave-page-heading ${enableGlow ? 'glow-cyan' : ''}`}>WRITINGS</h1>
      <div className="synthwave-writings-grid">
        {writings.map((w) => (
          <div
            key={w.slug}
            className={`synthwave-writing-card ${enableGlow ? 'glow-cyan' : ''}`}
            onClick={() => navigate('post', w.slug)}
          >
            <h2 className="synthwave-writing-title">{w.title}</h2>
            <div className="synthwave-writing-meta">
              <span>{formatDate(w.date)}</span>
              {w.wordCount && <span>{Math.ceil(w.wordCount / 200)} min read</span>}
              {viewCounts[w.slug] != null && (
                <span>{viewCounts[w.slug]} views</span>
              )}
            </div>
            {w.description && (
              <p className="synthwave-writing-excerpt">{w.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Post Page ---- */
function PostPage({ postData, loading, navigate, enableGlow, isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed }) {
  if (loading) {
    return (
      <div className={`synthwave-card ${enableGlow ? 'glow-cyan' : ''}`}>
        <p className="synthwave-loading">Loading...</p>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className={`synthwave-card ${enableGlow ? 'glow-cyan' : ''}`}>
        <p>Post not found.</p>
        <button className="synthwave-back-link" onClick={() => navigate('writings')}>
          &larr; Back to Writings
        </button>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`synthwave-card ${enableGlow ? 'glow-cyan' : ''}`}>
      <button className="synthwave-back-link" onClick={() => navigate('writings')}>
        &larr; Back
      </button>

      <h1 className="synthwave-card-title">{postData.title}</h1>

      <div className="synthwave-post-meta">
        <span>{formatDate(postData.date)}</span>
        {postData.wordCount && <span>{Math.ceil(postData.wordCount / 200)} min read</span>}
      </div>

      {/* Audio player */}
      {postData?.audio && (
        <div className="synthwave-audio">
          <button
            className={`synthwave-audio-btn ${enableGlow ? 'glow-magenta' : ''}`}
            onClick={toggle}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <div className="synthwave-audio-track" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}>
            <div className="synthwave-audio-progress" style={{ width: `${progress}%` }} />
          </div>
          <span className="synthwave-audio-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <SpeedControl displayRate={displayRate} displayRateLabel={displayRateLabel} setSpeed={setSpeed} className="synthwave-audio-speed" />
        </div>
      )}

      <div className="synthwave-card-body">
        {parseContent(postData.content, navigate)}
      </div>
    </div>
  );
}
