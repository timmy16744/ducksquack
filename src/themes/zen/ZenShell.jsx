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

export default function ZenShell() {
  const { page, slug, navigate } = useRoute();
  const { data: postData, loading: postLoading, error: postError } = useWriting(slug);
  const { settings, setThemeId } = useTheme();

  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [writingsLoaded, setWritingsLoaded] = useState(false);

  const shellRef = useRef(null);

  const audioUrl = postData?.audio?.url || null;
  const { isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed } = useAudioPlayback(audioUrl);

  useEffect(() => {
    fetchWritingsIndex()
      .then((data) => {
        setWritings(data);
        setWritingsLoaded(true);
      })
      .catch(() => setWritingsLoaded(true));
  }, []);

  useEffect(() => {
    const unsub = subscribeToViewCounts(setViewCounts);
    return unsub;
  }, []);

  useEffect(() => {
    if (shellRef.current) {
      shellRef.current.scrollTop = 0;
    }
  }, [page, slug]);

  const pageContent = (() => {
    switch (page) {
      case 'home':
        return <HomePage navigate={navigate} writings={writings} settings={settings} />;
      case 'about':
        return <AboutPage navigate={navigate} settings={settings} />;
      case 'projects':
        return <ProjectsPage settings={settings} />;
      case 'writings':
        return (
          <WritingsPage
            writings={writings}
            viewCounts={viewCounts}
            loaded={writingsLoaded}
            navigate={navigate}
            settings={settings}
          />
        );
      case 'post':
        return (
          <PostPage
            data={postData}
            loading={postLoading}
            error={postError}
            slug={slug}
            navigate={navigate}
            settings={settings}
            audio={{ isPlaying, currentTime, duration, toggle, seek, displayRate, displayRateLabel, setSpeed }}
          />
        );
      default:
        return <HomePage navigate={navigate} writings={writings} settings={settings} />;
    }
  })();

  return (
    <div className="zen-shell" ref={shellRef}>
      {settings.ensoMark && <div className="zen-enso" aria-hidden="true" />}

      <nav className="zen-nav">
        <div className="zen-nav-inner">
          <span className="zen-nav-brand" onClick={() => navigate('home')}>DuckSquack</span>
          <div className="zen-nav-links">
            <span
              className={`zen-nav-link ${page === 'home' ? 'active' : ''}`}
              onClick={() => navigate('home')}
            >
              home
            </span>
            <span
              className={`zen-nav-link ${page === 'about' ? 'active' : ''}`}
              onClick={() => navigate('about')}
            >
              about
            </span>
            <span
              className={`zen-nav-link ${page === 'projects' ? 'active' : ''}`}
              onClick={() => navigate('projects')}
            >
              projects
            </span>
            <span
              className={`zen-nav-link ${page === 'writings' || page === 'post' ? 'active' : ''}`}
              onClick={() => navigate('writings')}
            >
              writings
            </span>
          </div>
        </div>
      </nav>

      <button
        className="zen-theme-toggle"
        onClick={() => setThemeId('windows-xp')}
        title="Switch to Windows XP theme"
        aria-label="Switch to Windows XP theme"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <rect x="1" y="1" width="6" height="6" rx="0.5" fill="#ef4444"/>
          <rect x="9" y="1" width="6" height="6" rx="0.5" fill="#22c55e"/>
          <rect x="1" y="9" width="6" height="6" rx="0.5" fill="#3b82f6"/>
          <rect x="9" y="9" width="6" height="6" rx="0.5" fill="#eab308"/>
        </svg>
        <span>XP Mode</span>
      </button>

      <main className="zen-content">
        {settings.animateTransitions ? (
          <div className="zen-fade-in" key={`${page}-${slug || ''}`}>
            {pageContent}
          </div>
        ) : (
          pageContent
        )}
      </main>
    </div>
  );
}

/* ─── Home ─── */
function HomePage({ navigate, writings, settings }) {
  return (
    <div className="zen-page zen-home">
      <h1 className={`zen-title zen-home-title ${settings.verticalTitle ? 'zen-vertical' : ''}`}>
        DuckSquack
      </h1>

      <div className="zen-home-intro">
        <p>Essays on AI, Technology</p>
        <p>& Society</p>
        <p>by Tim Hughes</p>
      </div>

      <div className="zen-home-links">
        <span className="zen-text-link" onClick={() => navigate('writings')}>
          read the writings
        </span>
        <span className="zen-text-link" onClick={() => navigate('projects')}>
          see the projects
        </span>
        <span className="zen-text-link" onClick={() => navigate('about')}>
          about the author
        </span>
      </div>
    </div>
  );
}

/* ─── About ─── */
function AboutPage({ navigate, settings }) {
  return (
    <div className="zen-page zen-about">
      <h1 className="zen-title">About</h1>

      <div className="zen-bio">
        {parseContent(aboutContent.bio, navigate)}
      </div>

      <div className="zen-contact">
        <a
          href={aboutContent.contact.twitter.url}
          target="_blank"
          rel="noopener noreferrer"
          className="zen-text-link"
        >
          {aboutContent.contact.twitter.handle}
        </a>
        <a
          href={aboutContent.contact.rss.url}
          className="zen-text-link"
        >
          {aboutContent.contact.rss.label}
        </a>
      </div>
    </div>
  );
}

/* ─── Writings ─── */
function WritingsPage({ writings, viewCounts, loaded, navigate, settings }) {
  const sorted = useMemo(() => {
    return [...writings].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [writings]);

  if (!loaded) {
    return (
      <div className="zen-page">
        <p className="zen-loading">...</p>
      </div>
    );
  }

  return (
    <div className="zen-page zen-writings">
      <h1 className="zen-title">Writings</h1>

      <ul className="zen-writings-list">
        {sorted.map((w) => (
          <li key={w.slug} className="zen-writings-item" onClick={() => navigate('post', w.slug)}>
            <span className="zen-writings-item-title">{w.title}</span>
            {settings.showDates && (
              <span className="zen-writings-item-date">{formatDate(w.date)}</span>
            )}
            {settings.showWordCount && w.wordCount && (
              <span className="zen-writings-item-words">({w.wordCount} words)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Post ─── */
function PostPage({ data, loading, error, slug, navigate, settings, audio }) {
  if (loading) {
    return (
      <div className="zen-page">
        <p className="zen-loading">...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="zen-page">
        <p>Writing not found.</p>
        <span className="zen-back" onClick={() => navigate('writings')}>&larr;</span>
      </div>
    );
  }

  return (
    <div className="zen-page zen-post">
      <span className="zen-back" onClick={() => navigate('writings')}>&larr;</span>

      <h1 className="zen-post-title">{data.title}</h1>

      {settings.showDates && (
        <p className="zen-post-date">{formatDate(data.date)}</p>
      )}

      <hr className="zen-hairline" />

      {data.audio && (
        <div className="zen-audio">
          <span className="zen-audio-toggle" onClick={audio.toggle}>
            {audio.isPlaying ? 'Pause' : 'Listen'}
          </span>
          <div className="zen-audio-progress" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.seek(pct * audio.duration);
          }}>
            <div className="zen-audio-bar" style={{ width: `${audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0}%` }} />
          </div>
          <span className="zen-audio-time">
            {formatTime(audio.currentTime)}{audio.duration > 0 ? ` / ${formatTime(audio.duration)}` : ''}
          </span>
          <SpeedControl
            displayRate={audio.displayRate}
            displayRateLabel={audio.displayRateLabel}
            setSpeed={audio.setSpeed}
            className="zen-audio-speed"
          />
        </div>
      )}

      <div className="zen-post-content">
        {parseContent(data.content, navigate)}
      </div>

      <hr className="zen-hairline" />

      <span className="zen-back" onClick={() => navigate('writings')}>&larr;</span>
    </div>
  );
}

/* ─── Projects ─── */
function ProjectsPage({ settings }) {
  return (
    <div className="zen-page zen-projects">
      <h1 className="zen-title">{projectsContent.title}</h1>
      <p className="zen-projects-intro">{projectsContent.intro}</p>

      <div className="zen-projects-list">
        {projectsContent.projects.map((project) => (
          <article key={project.id} className="zen-project">
            <div className="zen-project-header">
              <h2 className="zen-project-name">
                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="zen-project-link">
                    {project.name} <span className="zen-project-arrow">&rarr;</span>
                  </a>
                ) : (
                  project.name
                )}
              </h2>
              <span className="zen-project-status">{project.status}</span>
            </div>
            <p className="zen-project-tagline">{project.tagline}</p>

            <div className="zen-project-body">
              {project.description.split('\n\n').map((para, i) => (
                <p key={i} className="content-paragraph">{para}</p>
              ))}
            </div>

            <div className="zen-project-tech">
              {project.tech.map((t) => (
                <span key={t} className="zen-tech-tag">{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
