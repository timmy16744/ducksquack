import React, { useState, useEffect, useRef, useMemo } from 'react';
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

function estimateWordCount(content) {
  if (!content) return 0;
  return content.split(/\s+/).filter(Boolean).length;
}

export default function BrutalistShell() {
  const { page, slug, navigate } = useRoute();
  const { data: postData, loading: postLoading, error: postError } = useWriting(slug);
  const { settings } = useTheme();

  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [writingsLoaded, setWritingsLoaded] = useState(false);

  const contentRef = useRef(null);

  const audioUrl = postData?.audio?.url || null;
  const { isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed } = useAudioPlayback(audioUrl);

  // Load writings index
  useEffect(() => {
    fetchWritingsIndex()
      .then((data) => {
        setWritings(data);
        setWritingsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load writings:', err);
        setWritingsLoaded(true);
      });
  }, []);

  // Subscribe to view counts
  useEffect(() => {
    const unsub = subscribeToViewCounts(setViewCounts);
    return unsub;
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [page, slug]);

  const shellClasses = [
    'brutalist-shell',
    settings.invertHeader ? 'brutalist-inverted-header' : '',
    settings.showBorders ? 'brutalist-borders' : '',
    settings.rotateNav ? 'brutalist-rotated-nav' : '',
    settings.uppercase ? 'brutalist-uppercase' : '',
    settings.glitchEffect ? 'brutalist-glitch' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClasses}>
      {/* Header */}
      <header className="brutalist-header">
        <div className="brutalist-header-inner">
          <h1
            className="brutalist-logo"
            onClick={() => navigate('home')}
          >
            DUCKSQUACK
          </h1>
          {!settings.rotateNav && (
            <nav className="brutalist-nav">
              <span
                className={`brutalist-nav-link ${page === 'home' ? 'active' : ''}`}
                onClick={() => navigate('home')}
              >
                HOME
              </span>
              <span
                className={`brutalist-nav-link ${page === 'about' ? 'active' : ''}`}
                onClick={() => navigate('about')}
              >
                ABOUT
              </span>
              <span
                className={`brutalist-nav-link ${page === 'projects' ? 'active' : ''}`}
                onClick={() => navigate('projects')}
              >
                PROJECTS
              </span>
              <span
                className={`brutalist-nav-link ${page === 'writings' || page === 'post' ? 'active' : ''}`}
                onClick={() => navigate('writings')}
              >
                WRITINGS
              </span>
            </nav>
          )}
        </div>
        <div className="brutalist-accent-bar" />
      </header>

      {/* Rotated side navigation */}
      {settings.rotateNav && (
        <nav className="brutalist-nav-side">
          <span
            className={`brutalist-nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => navigate('home')}
          >
            HOME
          </span>
          <span
            className={`brutalist-nav-link ${page === 'about' ? 'active' : ''}`}
            onClick={() => navigate('about')}
          >
            ABOUT
          </span>
          <span
            className={`brutalist-nav-link ${page === 'projects' ? 'active' : ''}`}
            onClick={() => navigate('projects')}
          >
            PROJECTS
          </span>
          <span
            className={`brutalist-nav-link ${page === 'writings' || page === 'post' ? 'active' : ''}`}
            onClick={() => navigate('writings')}
          >
            WRITINGS
          </span>
        </nav>
      )}

      {/* Content */}
      <main
        className="brutalist-content"
        ref={contentRef}
        style={settings.rotateNav ? { marginLeft: '60px' } : undefined}
      >
        {page === 'home' && (
          <HomePage navigate={navigate} writings={writings} settings={settings} />
        )}
        {page === 'about' && (
          <AboutPage navigate={navigate} settings={settings} />
        )}
        {page === 'projects' && (
          <ProjectsPage navigate={navigate} settings={settings} />
        )}
        {page === 'writings' && (
          <WritingsPage
            writings={writings}
            viewCounts={viewCounts}
            loaded={writingsLoaded}
            navigate={navigate}
            settings={settings}
          />
        )}
        {page === 'post' && (
          <PostPage
            data={postData}
            loading={postLoading}
            error={postError}
            slug={slug}
            navigate={navigate}
            settings={settings}
            audio={{ isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed }}
          />
        )}
      </main>
    </div>
  );
}

/* ─── Home Page ─── */
function HomePage({ navigate, writings, settings }) {
  return (
    <div className="brutalist-page brutalist-home">
      <h1 className="brutalist-hero-title">
        {settings.uppercase ? homeContent.title.toUpperCase() : homeContent.title}
      </h1>
      <p className="brutalist-hero-subtitle">{homeContent.subtitle}</p>

      <div className="brutalist-hero-description">
        {parseContent(homeContent.description, navigate)}
      </div>

      <div className="brutalist-home-nav">
        <button
          className="brutalist-big-button"
          onClick={() => navigate('about')}
        >
          ABOUT
        </button>
        <button
          className="brutalist-big-button"
          onClick={() => navigate('writings')}
        >
          WRITINGS
        </button>
      </div>

      {writings.length > 0 && (
        <div className="brutalist-recent">
          <h2 className="brutalist-section-heading">
            {settings.uppercase ? 'RECENT' : 'Recent'}
          </h2>
          <hr className="brutalist-rule" />
          {writings.slice(0, 5).map((w) => (
            <div
              key={w.slug}
              className="brutalist-recent-item"
              onClick={() => navigate('post', w.slug)}
            >
              <span className="brutalist-recent-title">{w.title}</span>
              <span className="brutalist-recent-date">{formatDate(w.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── About Page ─── */
function AboutPage({ navigate, settings }) {
  return (
    <div className="brutalist-page brutalist-about">
      <h1 className="brutalist-page-title">
        {settings.uppercase ? 'ABOUT' : 'About'}
      </h1>
      <hr className="brutalist-rule" />

      <div className="brutalist-bio">
        {parseContent(aboutContent.bio, navigate)}
      </div>

      <hr className="brutalist-rule" />

      <div className="brutalist-contact">
        <h2 className="brutalist-section-heading">
          {settings.uppercase ? 'CONTACT' : 'Contact'}
        </h2>
        <p className="content-paragraph">
          <a
            href={aboutContent.contact.twitter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="internal-link"
          >
            {aboutContent.contact.twitter.handle}
          </a>
        </p>
        <p className="content-paragraph">
          <a href={aboutContent.contact.rss.url} className="internal-link">
            {aboutContent.contact.rss.label}
          </a>
        </p>
      </div>
    </div>
  );
}

/* ─── Projects Page ─── */
function ProjectsPage({ navigate, settings }) {
  return (
    <div className="brutalist-page brutalist-projects">
      <h1 className="brutalist-page-title">
        {settings.uppercase ? 'PROJECTS' : 'Projects'}
      </h1>
      <hr className="brutalist-rule" />
      <p className="brutalist-count">{projectsContent.intro}</p>

      <div className="brutalist-cards">
        {projectsContent.projects.map((project) => (
          <div
            key={project.id}
            className="brutalist-card"
            style={{
              borderWidth: '4px',
              borderStyle: 'solid',
              cursor: 'default',
            }}
          >
            <h2
              className="brutalist-card-title"
              style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}
            >
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>
                  {settings.uppercase ? project.name.toUpperCase() : project.name} →
                </a>
              ) : (settings.uppercase ? project.name.toUpperCase() : project.name)}
            </h2>
            <div className="brutalist-card-meta">
              <span>{project.tagline}</span>
              <span className="brutalist-card-sep">/</span>
              <span>{project.status}</span>
            </div>
            {project.description.split('\n\n').map((para, j) => (
              <p key={j} className="brutalist-card-preview" style={{ marginBottom: '0.5em' }}>
                {para}
              </p>
            ))}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    padding: '0.2em 0.5em',
                    border: '2px solid currentColor',
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

/* ─── Writings Page ─── */
function WritingsPage({ writings, viewCounts, loaded, navigate, settings }) {
  const sortedWritings = useMemo(() => {
    return [...writings].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [writings]);

  if (!loaded) {
    return (
      <div className="brutalist-page">
        <h1 className="brutalist-page-title">LOADING...</h1>
      </div>
    );
  }

  return (
    <div className="brutalist-page brutalist-writings">
      <h1 className="brutalist-page-title">
        {settings.uppercase ? 'WRITINGS' : 'Writings'}
      </h1>
      <hr className="brutalist-rule" />
      <p className="brutalist-count">{sortedWritings.length} entries</p>

      <div className="brutalist-cards">
        {sortedWritings.map((w) => {
          const views = viewCounts[w.slug] || 0;
          const words = w.wordCount || estimateWordCount(w.preview || '');
          return (
            <div
              key={w.slug}
              className="brutalist-card"
              onClick={() => navigate('post', w.slug)}
            >
              <h2 className="brutalist-card-title">
                {settings.uppercase ? w.title.toUpperCase() : w.title}
              </h2>
              <div className="brutalist-card-meta">
                <span className="brutalist-card-date">{formatDate(w.date)}</span>
                <span className="brutalist-card-sep">/</span>
                <span className="brutalist-card-words">{words} words</span>
                {views > 0 && (
                  <>
                    <span className="brutalist-card-sep">/</span>
                    <span className="brutalist-card-views">{views} views</span>
                  </>
                )}
              </div>
              {w.preview && (
                <p className="brutalist-card-preview">{w.preview}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Post Page ─── */
function PostPage({ data, loading, error, slug, navigate, settings, audio }) {
  if (loading) {
    return (
      <div className="brutalist-page">
        <h1 className="brutalist-page-title">LOADING...</h1>
        <div className="brutalist-loading-bar" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="brutalist-page">
        <h1 className="brutalist-page-title">NOT FOUND</h1>
        <hr className="brutalist-rule" />
        <p className="content-paragraph">The requested writing does not exist.</p>
        <span
          className="brutalist-back-link"
          onClick={() => navigate('writings')}
        >
          &larr; BACK
        </span>
      </div>
    );
  }

  const progressPct = audio.duration > 0
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  return (
    <div className="brutalist-page brutalist-post">
      <span
        className="brutalist-back-link"
        onClick={() => navigate('writings')}
      >
        &larr; BACK
      </span>

      <h1 className="brutalist-post-title">
        {settings.uppercase ? data.title.toUpperCase() : data.title}
      </h1>
      <hr className="brutalist-rule brutalist-rule-thick" />

      <div className="brutalist-post-meta">
        <span>{formatDate(data.date)}</span>
        {data.wordCount && (
          <>
            <span className="brutalist-card-sep">/</span>
            <span>{data.wordCount} words</span>
          </>
        )}
      </div>

      {/* Audio player */}
      {data.audio && (
        <div className="brutalist-audio">
          <button className="brutalist-audio-btn" onClick={audio.toggle}>
            {audio.isPlaying ? '|| PAUSE' : '> PLAY'}
          </button>
          <div
            className="brutalist-audio-progress"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audio.seek(pct * audio.duration);
            }}
          >
            <div
              className="brutalist-audio-bar"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="brutalist-audio-time">
            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
          </span>
          <SpeedControl displayRate={audio.displayRate} displayRateLabel={audio.displayRateLabel} setSpeed={audio.setSpeed} className="brutalist-audio-speed" />
        </div>
      )}

      <div className="brutalist-post-content">
        {parseContent(data.content, navigate)}
      </div>

      <hr className="brutalist-rule" />
      <span
        className="brutalist-back-link"
        onClick={() => navigate('writings')}
      >
        &larr; BACK
      </span>
    </div>
  );
}
