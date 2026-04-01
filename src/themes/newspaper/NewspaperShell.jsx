import React, { useState, useEffect, useMemo } from 'react';
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

/* ------------------------------------------------------------------ */
/*  Masthead                                                          */
/* ------------------------------------------------------------------ */
function Masthead({ mastStyle, showDate }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mastheadClass =
    mastStyle === 'modern'
      ? 'newspaper-masthead-text modern'
      : mastStyle === 'serif'
        ? 'newspaper-masthead-text serif-style'
        : 'newspaper-masthead-text blackletter';

  return (
    <header className="newspaper-masthead">
      <div className="newspaper-rule-double" />
      <div className={mastheadClass}>The Duck Squack</div>
      <div className="newspaper-tagline">Essays on AI, Technology &amp; Society</div>
      {showDate && (
        <div className="newspaper-dateline">{today} &middot; Adelaide, Australia</div>
      )}
      <div className="newspaper-rule-double" />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                        */
/* ------------------------------------------------------------------ */
function NavBar({ page, navigate }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'writings', label: 'Writings' },
  ];

  return (
    <nav className="newspaper-nav">
      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 && <span className="newspaper-nav-sep">|</span>}
          <button
            className={`newspaper-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                         */
/* ------------------------------------------------------------------ */
function HomePage({ navigate, columnCount }) {
  return (
    <div className="newspaper-page">
      <div className="newspaper-section-header">
        <span>Front Page</span>
      </div>
      <h1 className="newspaper-headline newspaper-lead-headline">{homeContent.title}</h1>
      <p className="newspaper-byline">By Tim Hughes</p>
      <div
        className="newspaper-columns"
        style={{ columnCount: parseInt(columnCount) || 2 }}
      >
        <p className="newspaper-lead-text">{homeContent.subtitle}</p>
        {parseContent(homeContent.description, (page, slug) => navigate(page, slug))}
      </div>
      <div className="newspaper-divider" />
      <div className="newspaper-nav-links">
        <a
          className="newspaper-continue-link"
          onClick={(e) => { e.preventDefault(); navigate('writings'); }}
        >
          Read the latest essays &rarr;
        </a>
        <a
          className="newspaper-continue-link"
          onClick={(e) => { e.preventDefault(); navigate('about'); }}
        >
          About the author &rarr;
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  About Page                                                        */
/* ------------------------------------------------------------------ */
function AboutPage({ navigate, columnCount }) {
  const paragraphs = aboutContent.bio.split('\n\n');

  return (
    <div className="newspaper-page">
      <div className="newspaper-section-header">
        <span>About the Author</span>
      </div>
      <h1 className="newspaper-headline">{aboutContent.title}</h1>
      <div
        className="newspaper-columns"
        style={{ columnCount: parseInt(columnCount) || 2 }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className="content-paragraph">{p}</p>
        ))}
      </div>

      <div className="newspaper-divider" />

      <div className="newspaper-subhead">Contact &amp; Follow</div>
      <div className="newspaper-contact">
        {aboutContent.contact.twitter && (
          <a
            href={aboutContent.contact.twitter.url}
            className="internal-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {aboutContent.contact.twitter.handle} on Twitter
          </a>
        )}
        {aboutContent.contact.rss && (
          <a href={aboutContent.contact.rss.url} className="internal-link">
            {aboutContent.contact.rss.label}
          </a>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Projects Page                                                     */
/* ------------------------------------------------------------------ */
function ProjectsPage({ navigate, columnCount }) {
  return (
    <div className="newspaper-page">
      <div className="newspaper-section-header">
        <span>Projects</span>
      </div>
      <p className="newspaper-byline" style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
        {projectsContent.intro}
      </p>

      {projectsContent.projects.map((project, i) => (
        <React.Fragment key={project.id}>
          <article className="newspaper-story">
            <h2 className="newspaper-headline newspaper-lead-headline">{project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8b0000', textDecoration: 'none' }}>
                {project.name} →
              </a>
            ) : project.name}</h2>
            <p className="newspaper-byline">{project.tagline}</p>
            <div className="newspaper-story-meta">
              <span style={{ fontVariant: 'small-caps', letterSpacing: '0.05em' }}>
                {project.status}
              </span>
            </div>
            <div
              className="newspaper-columns"
              style={{ columnCount: parseInt(columnCount) || 2 }}
            >
              {project.description.split('\n\n').map((para, j) => (
                <p key={j} className="content-paragraph">{para}</p>
              ))}
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              {project.tech.map((t) => (
                <span
                  key={t}
                  style={{
                    display: 'inline-block',
                    fontVariant: 'small-caps',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    marginRight: '0.75rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
          {i < projectsContent.projects.length - 1 && <div className="newspaper-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Writings Page                                                     */
/* ------------------------------------------------------------------ */
function WritingsPage({ navigate }) {
  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWritingsIndex()
      .then(setWritings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub = subscribeToViewCounts(setViewCounts);
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    return [...writings]
      .map((w) => ({ ...w, views: viewCounts[w.slug] || 0 }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [writings, viewCounts]);

  if (loading) {
    return <div className="newspaper-loading">Loading the press...</div>;
  }

  return (
    <div className="newspaper-page">
      <div className="newspaper-section-header">
        <span>Writings</span>
      </div>

      {sorted.map((writing, i) => {
        const isLead = i === 0;
        return (
          <React.Fragment key={writing.slug}>
            <article
              className={`newspaper-story ${isLead ? 'newspaper-lead' : ''}`}
              onClick={() => navigate('post', writing.slug)}
            >
              {isLead && <div className="newspaper-lead-label">Lead Story</div>}
              <h2 className={`newspaper-headline ${isLead ? 'newspaper-lead-headline' : ''}`}>
                {writing.title}
              </h2>
              <div className="newspaper-story-meta">
                <span className="newspaper-story-date">{formatDate(writing.date)}</span>
                <span className="newspaper-meta-sep">&middot;</span>
                <span className="newspaper-story-byline">By Tim Hughes</span>
                <span className="newspaper-meta-sep">&middot;</span>
                <span className="newspaper-story-words">
                  {(writing.wordCount || 0).toLocaleString()} words
                </span>
                {writing.views > 0 && (
                  <>
                    <span className="newspaper-meta-sep">&middot;</span>
                    <span className="newspaper-story-views">
                      {writing.views.toLocaleString()} reads
                    </span>
                  </>
                )}
              </div>
              {(writing.synopsis || writing.preview) && (
                <p className="newspaper-story-preview">
                  {writing.synopsis || writing.preview}
                </p>
              )}
            </article>
            {i < sorted.length - 1 && <div className="newspaper-divider" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post Page                                                         */
/* ------------------------------------------------------------------ */
function PostPage({ slug, navigate, columnCount }) {
  const { data, loading, error } = useWriting(slug);
  const audioUrl = data?.audio?.url || null;
  const { isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed } = useAudioPlayback(audioUrl);

  if (loading) return <div className="newspaper-loading">Typesetting...</div>;
  if (error) return <div className="newspaper-error">Article not found.</div>;
  if (!data) return null;

  const paragraphs = (data.content || '').split('\n\n').filter(Boolean);

  return (
    <div className="newspaper-page">
      <a
        className="newspaper-back-link"
        onClick={(e) => { e.preventDefault(); navigate('writings'); }}
      >
        &larr; Return to Front Page
      </a>

      <div className="newspaper-section-header">
        <span>Essay</span>
      </div>

      <h1 className="newspaper-headline newspaper-lead-headline">{data.title}</h1>

      <div className="newspaper-story-meta">
        <span className="newspaper-story-date">{formatDate(data.date)}</span>
        <span className="newspaper-meta-sep">&middot;</span>
        <span className="newspaper-story-byline">By Tim Hughes</span>
        <span className="newspaper-meta-sep">&middot;</span>
        <span className="newspaper-story-words">
          {(data.wordCount || 0).toLocaleString()} words
        </span>
      </div>

      {audioUrl && (
        <div className="newspaper-audio">
          <button className="newspaper-audio-btn" onClick={toggle}>
            {isPlaying ? '⏸ Pause' : '▶ Listen to this article'}
          </button>
          {(isPlaying || currentTime > 0) && (
            <>
              <div className="newspaper-audio-progress" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (duration > 0) seek(pct * duration);
              }}>
                <div className="newspaper-audio-bar" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
              </div>
              <span className="newspaper-audio-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <SpeedControl displayRate={displayRate} displayRateLabel={displayRateLabel} setSpeed={setSpeed} className="newspaper-audio-speed" />
            </>
          )}
        </div>
      )}

      <div className="newspaper-divider" />

      <div
        className="newspaper-article newspaper-columns"
        style={{ columnCount: parseInt(columnCount) || 2 }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className={`content-paragraph ${i === 0 ? 'newspaper-drop-cap' : ''}`}>
            {p}
          </p>
        ))}
      </div>

      <div className="newspaper-divider" />

      <a
        className="newspaper-back-link"
        onClick={(e) => { e.preventDefault(); navigate('writings'); }}
      >
        &larr; Return to Front Page
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                             */
/* ------------------------------------------------------------------ */
export default function NewspaperShell() {
  const { page, slug, navigate } = useRoute();
  const { settings } = useTheme();

  const columnCount = settings.columnCount || '2';
  const showDate = settings.showDate !== false;
  const paperTexture = settings.paperTexture !== false;
  const mastStyle = settings.mastStyle || 'blackletter';

  return (
    <div className={`newspaper-shell ${paperTexture ? 'newspaper-textured' : ''}`}>
      <Masthead mastStyle={mastStyle} showDate={showDate} />
      <NavBar page={page} navigate={navigate} />

      <main className="newspaper-content">
        {page === 'home' && (
          <HomePage navigate={navigate} columnCount={columnCount} />
        )}
        {page === 'about' && (
          <AboutPage navigate={navigate} columnCount={columnCount} />
        )}
        {page === 'projects' && (
          <ProjectsPage navigate={navigate} columnCount={columnCount} />
        )}
        {page === 'writings' && (
          <WritingsPage navigate={navigate} />
        )}
        {page === 'post' && (
          <PostPage
            slug={slug}
            navigate={navigate}
            columnCount={columnCount}
          />
        )}
      </main>

      <footer className="newspaper-footer">
        <div className="newspaper-rule-double" />
        <div className="newspaper-footer-text">
          &copy; {new Date().getFullYear()} Tim Hughes &mdash; The Duck Squack &mdash; Adelaide, Australia
        </div>
      </footer>
    </div>
  );
}
