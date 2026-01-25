// DocumentArea Component - Main content display area with markdown rendering
window.AppComponents = window.AppComponents || {};

window.AppComponents.DocumentArea = ({
    content = '',
    title = '',
    meta = {},
    wordWrap = true,
    onScroll,
    scrollPosition = 0,
    isWelcome = false
}) => {
    const contentRef = React.useRef(null);
    const [lineCount, setLineCount] = React.useState(0);
    const [wordCount, setWordCount] = React.useState(0);

    // Parse markdown-style content into formatted HTML
    const parseContent = (text) => {
        if (!text) return '';

        // Remove frontmatter (YAML header)
        let processed = text.replace(/^---[\s\S]*?---\s*/m, '');

        // Escape HTML entities
        processed = processed
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold and italic
        processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks
        processed = processed.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');

        // Blockquotes
        processed = processed.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');

        // Lists
        processed = processed.replace(/^\s*[-*] (.*$)/gm, '<li>$1</li>');
        processed = processed.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Numbered lists
        processed = processed.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');

        // Links
        processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Horizontal rules
        processed = processed.replace(/^---$/gm, '<hr />');

        // Paragraphs (double newlines)
        processed = processed.replace(/\n\n+/g, '</p><p>');
        processed = '<p>' + processed + '</p>';

        // Clean up empty paragraphs
        processed = processed.replace(/<p><\/p>/g, '');
        processed = processed.replace(/<p>\s*<(h[1-6]|ul|ol|blockquote|pre|hr)/g, '<$1');
        processed = processed.replace(/<\/(h[1-6]|ul|ol|blockquote|pre)>\s*<\/p>/g, '</$1>');

        return processed;
    };

    // Calculate line and word counts
    React.useEffect(() => {
        if (content) {
            const text = content.replace(/^---[\s\S]*?---\s*/m, ''); // Remove frontmatter
            const lines = text.split('\n').length;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            setLineCount(lines);
            setWordCount(words);
        }
    }, [content]);

    // Handle scroll position restoration
    React.useEffect(() => {
        if (contentRef.current && scrollPosition) {
            contentRef.current.scrollTop = scrollPosition;
        }
    }, []);

    // Track scroll position
    const handleScroll = () => {
        if (contentRef.current && onScroll) {
            onScroll(contentRef.current.scrollTop);
        }
    };

    // Welcome page content
    const renderWelcome = () => (
        <div className="welcome-content">
            <div className="welcome-header">
                <pre className="welcome-duck-art">{`
    __
  >(o )___
   ( ._> /
    \`---'
                `}</pre>
                <h1 style={{ margin: '0.5em 0' }}>Welcome to DuckSquack</h1>
                <p className="welcome-tagline">Essays on AI, Technology & Society</p>
            </div>

            <p>
                This is a collection of writings by Tim Hughes, exploring artificial intelligence,
                technological transformation, and societal change.
            </p>

            <h2>Getting Started</h2>
            <ul>
                <li>Use <strong>File &gt; Open Recent</strong> to browse all essays</li>
                <li>Press <code>Ctrl+O</code> to open the file browser</li>
                <li>Use tabs to keep multiple documents open</li>
                <li>Try <strong>Help &gt; The Secrets</strong> for a hidden surprise</li>
            </ul>

            <h2>Keyboard Shortcuts</h2>
            <ul>
                <li><code>Ctrl+O</code> - Open file browser</li>
                <li><code>Ctrl+Tab</code> - Next tab</li>
                <li><code>Ctrl+Shift+Tab</code> - Previous tab</li>
                <li><code>Ctrl+W</code> - Close current tab</li>
                <li><code>Ctrl+F</code> - Find in document</li>
            </ul>

            <h2>About</h2>
            <p>
                DuckSquack is a nostalgic tribute to the simpler times of computing,
                wrapped around essays that explore the most complex questions of our era.
                The Windows 98 aesthetic isn't just nostalgia—it's a reminder that
                even as technology accelerates exponentially, our humanity remains constant.
            </p>

            <p style={{ fontStyle: 'italic', marginTop: '2em', opacity: 0.7 }}>
                "The map is already rendered. The route selection remains a human prerogative."
            </p>
        </div>
    );

    // Document content with header
    const renderDocument = () => (
        <div>
            {/* Document header */}
            {title && (
                <div style={{ marginBottom: '1.5em' }}>
                    <h1 style={{ marginBottom: '0.3em' }}>{title}</h1>
                    {meta.date && (
                        <div style={{
                            color: 'var(--win98-dark)',
                            fontSize: '0.9em',
                            fontStyle: 'italic'
                        }}>
                            {meta.date}
                        </div>
                    )}
                    {meta.color && (
                        <div style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: meta.color,
                            marginTop: '8px',
                            border: '1px solid rgba(0,0,0,0.2)'
                        }}></div>
                    )}
                </div>
            )}

            {/* Rendered content */}
            <div
                dangerouslySetInnerHTML={{ __html: parseContent(content) }}
            />
        </div>
    );

    return (
        <div className="document-area">
            <div
                ref={contentRef}
                className={`document-content ${wordWrap ? '' : 'word-wrap-off'}`}
                onScroll={handleScroll}
            >
                {isWelcome ? renderWelcome() : renderDocument()}
            </div>
        </div>
    );
};
