import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

/* ─── Fetch real word timestamps from transcription data ─── */
function useWordTimings(slug) {
  const [timings, setTimings] = useState(null);
  useEffect(() => {
    if (!slug) return;
    fetch(`/timing/${slug}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setTimings(data))
      .catch(() => setTimings(null));
  }, [slug]);
  return timings;
}

/* ─── Build word list for rendering (no timing, just structure) ─── */
function buildWordList(content) {
  const linkPattern = /(?:"([^"]+)"\s*)?\(\/writings\/([a-z0-9-]+)\/?\)/g;
  const paragraphs = content.split(/\n\n+/);
  const allWords = [];

  paragraphs.forEach((paragraph, pIdx) => {
    linkPattern.lastIndex = 0;
    const links = [];
    let lm;
    while ((lm = linkPattern.exec(paragraph)) !== null) {
      links.push({ start: lm.index, end: lm.index + lm[0].length, text: lm[1] || lm[2].replace(/-/g, ' '), slug: lm[2] });
    }
    const segments = [];
    let pos = 0;
    for (const link of links) {
      if (link.start > pos) segments.push({ type: 'text', value: paragraph.slice(pos, link.start) });
      segments.push({ type: 'link', text: link.text, slug: link.slug });
      pos = link.end;
    }
    if (pos < paragraph.length) segments.push({ type: 'text', value: paragraph.slice(pos) });

    for (const seg of segments) {
      const text = seg.type === 'link' ? seg.text : seg.value;
      text.split(/\s+/).filter(Boolean).forEach(word => {
        allWords.push({ word, paraIdx: pIdx, isLink: seg.type === 'link', slug: seg.slug });
      });
    }
  });

  return { allWords, paragraphs };
}

/* ─── Word-level content renderer for audio tracking ─── */
function WordTrackedContent({ content, onNavigate, currentWordIndex, isTracking }) {
  const { allWords, paragraphs } = useMemo(() => buildWordList(content), [content]);
  const linkPattern = /(?:"([^"]+)"\s*)?\(\/writings\/([a-z0-9-]+)\/?\)/g;

  // Group words back into paragraphs for rendering
  let globalIdx = 0;
  return paragraphs.map((paragraph, pIdx) => {
    linkPattern.lastIndex = 0;
    const links = [];
    let lm;
    while ((lm = linkPattern.exec(paragraph)) !== null) {
      links.push({ start: lm.index, end: lm.index + lm[0].length, text: lm[1] || lm[2].replace(/-/g, ' '), slug: lm[2] });
    }
    const segments = [];
    let pos = 0;
    for (const link of links) {
      if (link.start > pos) segments.push({ type: 'text', value: paragraph.slice(pos, link.start) });
      segments.push({ type: 'link', text: link.text, slug: link.slug });
      pos = link.end;
    }
    if (pos < paragraph.length) segments.push({ type: 'text', value: paragraph.slice(pos) });

    const rendered = [];
    for (const seg of segments) {
      const text = seg.type === 'link' ? seg.text : seg.value;
      const words = text.split(/\s+/).filter(Boolean);

      const wordSpans = words.map((word) => {
        const idx = globalIdx++;
        const isActive = isTracking && idx === currentWordIndex;
        const isRead = isTracking && idx < currentWordIndex;
        const isUnread = isTracking && idx > currentWordIndex;
        let cls = 'zen-word';
        if (isActive) cls += ' zen-word-active';
        else if (isRead) cls += ' zen-word-read';
        else if (isUnread) cls += ' zen-word-unread';
        return (
          <React.Fragment key={`w-${idx}`}>
            <span className={cls} data-word-idx={idx}>{word}</span>{' '}
          </React.Fragment>
        );
      });

      if (seg.type === 'link') {
        rendered.push(
          <a
            key={`link-${pIdx}-${seg.slug}`}
            className="internal-link"
            onClick={(e) => { e.preventDefault(); onNavigate('post', seg.slug); }}
            style={{ cursor: 'pointer' }}
          >
            {wordSpans}
          </a>
        );
      } else {
        rendered.push(...wordSpans);
      }
    }

    return <p key={pIdx} className="content-paragraph">{rendered}</p>;
  });
}

/* ─── Post ─── */
function PostPage({ data, loading, error, slug, navigate, settings, audio }) {
  const audioBarRef = useRef(null);
  const contentRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  // Manual scroll detection: pause auto-scroll when user scrolls
  const autoScrollEnabled = useRef(true);
  const userScrollTimeout = useRef(null);
  const lastAutoScrollTime = useRef(0);

  useEffect(() => {
    const shell = document.querySelector('.zen-shell');
    if (!shell) return;
    const handleScroll = () => {
      // If we just auto-scrolled (within 800ms), ignore this event
      if (Date.now() - lastAutoScrollTime.current < 800) return;
      // User is manually scrolling — pause auto-scroll
      autoScrollEnabled.current = false;
      clearTimeout(userScrollTimeout.current);
      // Re-enable auto-scroll after 4s of no manual scrolling
      userScrollTimeout.current = setTimeout(() => {
        autoScrollEnabled.current = true;
      }, 4000);
    };
    shell.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      shell.removeEventListener('scroll', handleScroll);
      clearTimeout(userScrollTimeout.current);
    };
  }, []);

  // Fetch real word timestamps from transcription
  const timings = useWordTimings(slug);

  // Calculate current word index from real timestamps
  const currentWordIndex = useMemo(() => {
    if (!audio.isPlaying || !timings || !timings.length) return -1;
    const t = audio.currentTime;
    // Binary search for the word being spoken at time t
    let lo = 0, hi = timings.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (timings[mid].start <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }, [audio.isPlaying, audio.currentTime, timings]);

  // Keep currentWordIndex as a ref too so auto-scroll doesn't need it as dep
  const wordIdxRef = useRef(-1);
  wordIdxRef.current = currentWordIndex;

  // Auto-scroll to keep active word visible (respects manual scroll)
  useEffect(() => {
    if (currentWordIndex < 0 || !autoScrollEnabled.current) return;

    const activeEl = document.querySelector('.zen-word-active');
    if (!activeEl) return;

    const shell = document.querySelector('.zen-shell');
    if (!shell) return;

    const rect = activeEl.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    const stickyHeight = isSticky ? 56 : 0;
    const topBound = stickyHeight + viewHeight * 0.25;
    const bottomBound = viewHeight * 0.75;

    // Only scroll when the active word is outside the comfortable zone
    if (rect.top < topBound || rect.bottom > bottomBound) {
      lastAutoScrollTime.current = Date.now();
      shell.scrollTo({
        top: shell.scrollTop + rect.top - viewHeight * 0.4 - stickyHeight,
        behavior: 'smooth',
      });
    }
  }, [currentWordIndex, isSticky]);

  // Observe audio bar for sticky behavior
  useEffect(() => {
    if (!audioBarRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(audioBarRef.current);
    return () => observer.disconnect();
  }, [data?.audio]);

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

      {/* Sentinel for intersection observer */}
      {data.audio && <div ref={audioBarRef} className="zen-audio-sentinel" />}

      {/* Sticky audio bar */}
      {data.audio && (
        <div className={`zen-audio ${isSticky ? 'zen-audio-sticky' : ''}`}>
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

      <div className="zen-post-content" ref={contentRef}>
        {timings && (audio.isPlaying || audio.currentTime > 0) ? (
          <WordTrackedContent
            content={data.content}
            onNavigate={navigate}
            currentWordIndex={currentWordIndex}
            isTracking={audio.isPlaying}
          />
        ) : (
          parseContent(data.content, navigate)
        )}
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
