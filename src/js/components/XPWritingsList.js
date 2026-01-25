// XPWritingsList.js - List view of all blog posts

window.AppComponents = window.AppComponents || {};

window.AppComponents.XPWritingsList = ({ onSelectPost }) => {
    const writings = window.writingsData || [];

    // Sort by date, newest first
    const sortedWritings = [...writings].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPreview = (content) => {
        // Remove frontmatter-like content at the start
        let text = content;

        // Remove lines starting with common frontmatter patterns
        const lines = text.split('\n');
        const contentLines = lines.filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('title:') &&
                   !trimmed.startsWith('date:') &&
                   !trimmed.startsWith('color:') &&
                   !trimmed.startsWith('tags:') &&
                   !trimmed.startsWith('---') &&
                   trimmed.length > 0;
        });

        // Get first meaningful paragraph
        const preview = contentLines.slice(0, 3).join(' ').trim();

        // Truncate to ~150 chars
        if (preview.length > 150) {
            return preview.substring(0, 147) + '...';
        }
        return preview;
    };

    const createSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    return (
        <div className="xp-writings-list xp-content">
            <div className="list-header">My Writings</div>
            <hr className="header-rule" />

            {sortedWritings.map((writing, index) => (
                <div
                    key={index}
                    className="xp-writing-item"
                    onClick={() => onSelectPost(writing)}
                >
                    <div className="title-row">
                        <span className="file-icon">&#128196;</span>
                        <span className="title">{writing.title}</span>
                    </div>
                    <div className="date">{formatDate(writing.date)}</div>
                    <div className="preview">"{getPreview(writing.content)}"</div>
                </div>
            ))}
        </div>
    );
};
