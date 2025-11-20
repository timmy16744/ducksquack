// Article Reader Component
window.AppComponents = window.AppComponents || {};

window.AppComponents.ArticleReader = ({ article, onClose, isActive, onFocus, id, isEmbedded = false }) => {
    const [copyFeedback, setCopyFeedback] = React.useState('');

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?post=${article?.file?.replace('.md', '')}`;
        window.Utils.copyToClipboard(url);
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(''), 2000);
    };

    const InnerContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
            {/* Toolbar */}
            <div style={{
                padding: '8px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                gap: '10px',
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-secondary)',
                alignItems: 'center'
            }}>
                {isEmbedded && (
                    <button 
                        onClick={onClose}
                        className="terminal-btn"
                        style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: '#fff',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            marginRight: '10px'
                        }}
                    >
                        &lt; BACK
                    </button>
                )}
                <button 
                    onClick={handleCopyLink}
                    className="terminal-btn"
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--tertiary)',
                        color: 'var(--tertiary)',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                    }}
                >
                    {copyFeedback || '[Copy Link]'}
                </button>
                <span style={{ color: 'var(--text-muted)' }}>{article?.date}</span>
                
                {/* Title in Toolbar for Embedded Mode */}
                {isEmbedded && (
                     <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginLeft: '10px' }}>
                        {article?.title}
                     </span>
                )}

                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{article?.file}</span>
            </div>

            {/* Content */}
            <div style={{ 
                padding: '40px', 
                flex: 1, 
                overflowY: 'auto', 
                fontFamily: 'Google Sans Code, monospace',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%'
            }}>
                {window.Utils.parseMarkdown(article?.content || 'No content available.')}
                
                <div style={{ marginTop: '4rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    End of file.
                </div>
            </div>
        </div>
    );

    if (isEmbedded) {
        return InnerContent;
    }

    return (
        <window.AppComponents.DraggableWindow
            id={id}
            title={`Viewing: ${article?.title || 'Untitled'}`}
            onClose={onClose}
            isActive={isActive}
            onFocus={onFocus}
            initialSize={{ width: 800, height: 600 }}
        >
            {InnerContent}
        </window.AppComponents.DraggableWindow>
    );
};