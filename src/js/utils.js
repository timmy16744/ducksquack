// Utility functions attached to window.Utils
window.Utils = {
    // Parse Markdown to React Elements
    parseMarkdown: (text) => {
        if (!text) return null;

        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('# ')) return React.createElement('h1', { key: i, className: "terminal-h1" }, line.substring(2));
            if (line.startsWith('## ')) return React.createElement('h2', { key: i, className: "terminal-h2" }, line.substring(3));
            if (line.startsWith('### ')) return React.createElement('h3', { key: i, className: "terminal-h3" }, line.substring(4));

            // Lists
            if (line.trim().startsWith('- ')) return React.createElement('li', { key: i, className: "terminal-li" }, line.trim().substring(2));

            // Blockquotes
            if (line.startsWith('> ')) return React.createElement('blockquote', { key: i, className: "terminal-quote" }, line.substring(2));

            // Code blocks (simple)
            if (line.startsWith('```')) return React.createElement('div', { key: i, className: "terminal-code-block-marker" }, line);

            // Empty lines
            if (line.trim() === '') return React.createElement('br', { key: i });

            // Paragraphs with bold/italic/link parsing
            const parts = [];
            let lastIndex = 0;
            // Match **bold** or *italic* or [link](url)
            const regex = /(\*\*.*?\*\*)|(\*[^*]+\*)|(\[.*?\]\(.*?\))/g;
            let match;

            while ((match = regex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(line.substring(lastIndex, match.index));
                }

                const matchText = match[0];
                if (matchText.startsWith('**')) {
                    parts.push(React.createElement('strong', { key: `${i}-${match.index}`, className: "terminal-bold" }, matchText.slice(2, -2)));
                } else if (matchText.startsWith('*') && !matchText.startsWith('**')) {
                    parts.push(React.createElement('em', { key: `${i}-${match.index}`, className: "terminal-italic" }, matchText.slice(1, -1)));
                } else if (matchText.startsWith('[')) {
                    const linkMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        const text = linkMatch[1];
                        const url = linkMatch[2];
                        parts.push(React.createElement('a', {
                            key: `${i}-${match.index}`,
                            href: url,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "terminal-link"
                        }, text));
                    }
                }

                lastIndex = match.index + matchText.length;
            }
            if (lastIndex < line.length) {
                parts.push(line.substring(lastIndex));
            }

            return React.createElement('p', { key: i, className: "terminal-p" }, parts.length > 0 ? parts : line);
        });
    },

    // Get writing slug from current URL
    // Supports both /writings/slug/ and ?post=slug formats
    getWritingSlug: () => {
        const path = window.location.pathname;

        // Check for clean URL format: /writings/slug/ or /writings/slug
        const writingsMatch = path.match(/^\/writings\/([^\/]+)\/?$/);
        if (writingsMatch) {
            return writingsMatch[1];
        }

        // Fallback to query param format: ?post=slug
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('post');
    },

    // Generate clean URL for a writing
    getWritingUrl: (slug) => {
        // Remove .md extension if present
        const cleanSlug = slug.replace(/\.md$/, '');
        return `/writings/${cleanSlug}/`;
    },

    // Navigate to a writing using clean URLs
    navigateToWriting: (slug) => {
        const cleanSlug = slug.replace(/\.md$/, '');
        const url = `/writings/${cleanSlug}/`;
        window.history.pushState({ writing: cleanSlug }, '', url);
    },

    // Clear writing from URL (go back to home)
    clearWritingUrl: () => {
        window.history.pushState({}, '', '/');
    },

    // Get URL Query Parameters (legacy support)
    getQueryParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Set URL Query Parameter without reload (legacy support)
    setQueryParam: (param, value) => {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(param, value);
        } else {
            url.searchParams.delete(param);
        }
        window.history.pushState({}, '', url);
    },

    // Copy to clipboard
    copyToClipboard: (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    },

    // Generate slug from title (for internal use)
    slugify: (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
};
