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

const ASCII_DUCK = `
    __
   / o)
  /  /
 / ,_|
 |   \\\\
 |    \\\\
  \\    \\\\___
   \\        \`\\
    \`--._____|
   D U C K S Q U A C K
`;

function getPrompt(style, path) {
  switch (style) {
    case 'minimal':
      return `$ `;
    case 'full':
      return `duck@squack:~${path}$ `;
    case 'duck':
    default:
      return `duck@squack:~${path}$ `;
  }
}

function getPathForPage(page, slug) {
  switch (page) {
    case 'home': return '/';
    case 'about': return '/about';
    case 'projects': return '/projects';
    case 'writings': return '/writings';
    case 'post': return `/writings/${slug || ''}`;
    default: return '/';
  }
}

function getCommandForPage(page, slug) {
  switch (page) {
    case 'home': return '';
    case 'about': return 'cat about.txt';
    case 'projects': return 'ls projects/';
    case 'writings': return 'ls -la writings/';
    case 'post': return `cat writings/${slug || 'unknown'}.txt`;
    default: return '';
  }
}

function formatLsDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, ' ');
  const year = d.getFullYear();
  return `${month} ${day} ${year}`;
}

function estimateWordCount(content) {
  if (!content) return 0;
  return content.split(/\s+/).filter(Boolean).length;
}

export default function TerminalShell() {
  const { page, slug, navigate } = useRoute();
  const { data: postData, loading: postLoading, error: postError } = useWriting(slug);
  const { settings } = useTheme();

  const [writings, setWritings] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [writingsLoaded, setWritingsLoaded] = useState(false);

  const contentRef = useRef(null);

  // Audio for post
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

  const promptStyle = settings.promptStyle || 'duck';
  const currentPath = getPathForPage(page, slug);
  const currentCommand = getCommandForPage(page, slug);
  const prompt = getPrompt(promptStyle, currentPath);

  const shellClasses = [
    'terminal-shell',
    settings.scanlines ? 'terminal-scanlines' : '',
    settings.crtGlow ? 'terminal-glow' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClasses}>
      {/* Top prompt bar */}
      <div className="terminal-header">
        <div className="terminal-prompt">
          <span className="terminal-prompt-text">{prompt}</span>
          <span className="terminal-prompt-command">{currentCommand}</span>
          {settings.cursorBlink && <span className="terminal-cursor">_</span>}
        </div>
        <nav className="terminal-nav">
          <span
            className="terminal-nav-item"
            onClick={() => navigate('home')}
          >
            cd ~
          </span>
          <span className="terminal-nav-sep">|</span>
          <span
            className="terminal-nav-item"
            onClick={() => navigate('about')}
          >
            cat about.txt
          </span>
          <span className="terminal-nav-sep">|</span>
          <span
            className="terminal-nav-item"
            onClick={() => navigate('projects')}
          >
            ls projects/
          </span>
          <span className="terminal-nav-sep">|</span>
          <span
            className="terminal-nav-item"
            onClick={() => navigate('writings')}
          >
            ls writings/
          </span>
        </nav>
      </div>

      {/* Content area */}
      <div className="terminal-output" ref={contentRef}>
        {page === 'home' && <HomePage navigate={navigate} writings={writings} settings={settings} />}
        {page === 'about' && <AboutPage navigate={navigate} settings={settings} />}
        {page === 'projects' && <ProjectsPage navigate={navigate} settings={settings} />}
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
      </div>
    </div>
  );
}

/* ─── Home Page ─── */
function HomePage({ navigate, writings, settings }) {
  return (
    <div className="terminal-page terminal-home">
      <pre className="terminal-ascii">{ASCII_DUCK}</pre>
      <div className="terminal-section">
        <p className="terminal-line terminal-accent">{homeContent.title}</p>
        <p className="terminal-line">{homeContent.subtitle}</p>
        <br />
        {parseContent(homeContent.description, navigate)}
      </div>
      <div className="terminal-section">
        <p className="terminal-line terminal-muted">// Recent writings:</p>
        {writings.slice(0, 5).map((w) => (
          <p key={w.slug} className="terminal-line">
            <span className="terminal-muted">$ cat </span>
            <span
              className="terminal-file-link"
              onClick={() => navigate('post', w.slug)}
            >
              writings/{w.slug}.txt
            </span>
            <span className="terminal-muted"> # {w.title}</span>
          </p>
        ))}
        {writings.length > 5 && (
          <p className="terminal-line">
            <span
              className="terminal-file-link"
              onClick={() => navigate('writings')}
            >
              $ ls writings/ # view all {writings.length} entries
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── About Page ─── */
function AboutPage({ navigate, settings }) {
  return (
    <div className="terminal-page terminal-about">
      <p className="terminal-line terminal-muted">$ cat about.txt</p>
      <br />
      <p className="terminal-line terminal-accent">{aboutContent.title}</p>
      <br />
      <div className="terminal-bio">
        {parseContent(aboutContent.bio, navigate)}
      </div>
      <br />
      <p className="terminal-line terminal-muted">// Contact:</p>
      <p className="terminal-line">
        <span className="terminal-muted">twitter: </span>
        <a
          href={aboutContent.contact.twitter.url}
          target="_blank"
          rel="noopener noreferrer"
          className="terminal-file-link"
        >
          {aboutContent.contact.twitter.handle}
        </a>
      </p>
      <p className="terminal-line">
        <span className="terminal-muted">rss:     </span>
        <a
          href={aboutContent.contact.rss.url}
          className="terminal-file-link"
        >
          {aboutContent.contact.rss.label}
        </a>
      </p>
    </div>
  );
}

/* ─── Projects Page ─── */
function ProjectsPage({ navigate, settings }) {
  return (
    <div className="terminal-page terminal-projects">
      <p className="terminal-line terminal-muted">$ ls projects/</p>
      <br />
      <p className="terminal-line terminal-accent">{projectsContent.title}</p>
      <p className="terminal-line terminal-muted">// {projectsContent.intro}</p>
      <br />
      {projectsContent.projects.map((project, i) => {
        const separator = '='.repeat(project.name.length);
        return (
          <div key={project.id} style={{ marginBottom: '1.5em' }}>
            <p className="terminal-line terminal-accent">{project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                <span style={{ borderBottom: '1px dashed currentColor' }}>{project.name} →</span>
              </a>
            ) : project.name}</p>
            <p className="terminal-line terminal-accent">{separator}</p>
            <p className="terminal-line terminal-muted">// {project.tagline} [{project.status}]</p>
            <br />
            {project.description.split('\n\n').map((para, j) => (
              <p key={j} className="terminal-line" style={{ marginBottom: '0.5em' }}>{para}</p>
            ))}
            <br />
            <p className="terminal-line">
              <span className="terminal-muted">tech: </span>
              {project.tech.join(', ')}
            </p>
            {i < projectsContent.projects.length - 1 && (
              <>
                <br />
                <p className="terminal-line terminal-muted">{'─'.repeat(40)}</p>
                <br />
              </>
            )}
          </div>
        );
      })}
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
      <div className="terminal-page">
        <p className="terminal-line terminal-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="terminal-page terminal-writings">
      <p className="terminal-line terminal-muted">$ ls -la writings/</p>
      <p className="terminal-line terminal-muted">total {sortedWritings.length}</p>
      <br />
      <div className="terminal-ls">
        <div className="terminal-ls-header">
          <span className="terminal-ls-perms">permissions</span>
          <span className="terminal-ls-views">views</span>
          <span className="terminal-ls-date">date</span>
          <span className="terminal-ls-size">words</span>
          <span className="terminal-ls-name">filename</span>
        </div>
        {sortedWritings.map((w) => {
          const views = viewCounts[w.slug] || 0;
          const words = w.wordCount || estimateWordCount(w.preview || '');
          return (
            <div
              key={w.slug}
              className="terminal-ls-row"
              onClick={() => navigate('post', w.slug)}
            >
              <span className="terminal-ls-perms">-rw-r--r--</span>
              <span className="terminal-ls-views">{String(views).padStart(4, ' ')}</span>
              <span className="terminal-ls-date">{formatLsDate(w.date)}</span>
              <span className="terminal-ls-size">{String(words).padStart(6, ' ')}</span>
              <span className="terminal-ls-name">{w.slug}.txt</span>
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
      <div className="terminal-page">
        <p className="terminal-line terminal-muted">$ cat writings/{slug}.txt</p>
        <p className="terminal-line">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="terminal-page">
        <p className="terminal-line terminal-muted">$ cat writings/{slug}.txt</p>
        <p className="terminal-line terminal-error">cat: writings/{slug}.txt: No such file or directory</p>
        <br />
        <p className="terminal-line">
          <span
            className="terminal-file-link"
            onClick={() => navigate('writings')}
          >
            $ cd ..
          </span>
        </p>
      </div>
    );
  }

  const progressPct = audio.duration > 0
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  return (
    <div className="terminal-page terminal-post">
      <p className="terminal-line terminal-muted">$ cat writings/{slug}.txt</p>
      <br />
      <p className="terminal-line terminal-accent">{data.title}</p>
      <p className="terminal-line terminal-muted">
        {formatDate(data.date)}
        {data.wordCount ? ` | ${data.wordCount} words` : ''}
      </p>
      <br />

      {/* Audio controls */}
      {data.audio && (
        <div className="terminal-audio">
          <span className="terminal-muted">audio: </span>
          <button className="terminal-audio-btn" onClick={audio.toggle}>
            [{audio.isPlaying ? 'PAUSE' : 'PLAY'}]
          </button>
          <div className="terminal-audio-progress" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.seek(pct * audio.duration);
          }}>
            <div className="terminal-audio-bar" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="terminal-audio-time">
            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
          </span>
          <SpeedControl displayRate={audio.displayRate} displayRateLabel={audio.displayRateLabel} setSpeed={audio.setSpeed} className="terminal-audio-speed" />
        </div>
      )}

      <div className="terminal-content">
        {parseContent(data.content, navigate)}
      </div>

      <br />
      <p className="terminal-line">
        <span
          className="terminal-file-link"
          onClick={() => navigate('writings')}
        >
          $ cd ..
        </span>
      </p>
    </div>
  );
}
