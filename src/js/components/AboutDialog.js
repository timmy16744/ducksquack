// AboutDialog Component - DuckSquack branding with animated duck
window.AppComponents = window.AppComponents || {};

const DUCK_ASCII = `
    __
  >(o )___
   ( ._> /
    \`---'
`;

const DUCK_QUACK_ASCII = `
    __    QUACK!
  >(O )___
   ( ._> /
    \`---'
`;

window.AppComponents.AboutDialog = ({
    isOpen,
    onClose
}) => {
    const [isQuacking, setIsQuacking] = React.useState(false);
    const [duckArt, setDuckArt] = React.useState(DUCK_ASCII);
    const [quackBuffer, setQuackBuffer] = React.useState('');

    // Easter egg: typing "quack" triggers animation
    React.useEffect(() => {
        if (!isOpen) {
            setQuackBuffer('');
            return;
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            // Check for "quack" easter egg
            const newBuffer = (quackBuffer + e.key.toLowerCase()).slice(-5);
            setQuackBuffer(newBuffer);

            if (newBuffer === 'quack') {
                triggerQuack();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, quackBuffer, onClose]);

    const triggerQuack = () => {
        if (isQuacking) return;

        setIsQuacking(true);
        setDuckArt(DUCK_QUACK_ASCII);

        // Play quack animation sequence
        setTimeout(() => {
            setDuckArt(DUCK_ASCII);
            setTimeout(() => {
                setDuckArt(DUCK_QUACK_ASCII);
                setTimeout(() => {
                    setDuckArt(DUCK_ASCII);
                    setTimeout(() => {
                        setDuckArt(DUCK_QUACK_ASCII);
                        setTimeout(() => {
                            setDuckArt(DUCK_ASCII);
                            setIsQuacking(false);
                            setQuackBuffer('');
                        }, 200);
                    }, 200);
                }, 200);
            }, 200);
        }, 200);
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog about-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div className="dialog-title-bar">
                    <span>About DuckSquack</span>
                    <button onClick={onClose}>×</button>
                </div>

                {/* Content */}
                <div className="about-dialog-content">
                    {/* Duck ASCII art */}
                    <pre
                        className={`about-duck ${isQuacking ? 'quacking' : ''}`}
                        onClick={triggerQuack}
                        style={{ cursor: 'pointer' }}
                        title="Click me!"
                    >
                        {duckArt}
                    </pre>

                    {/* Logo text */}
                    <div className="about-title">DuckSquack</div>
                    <div className="about-version">Version 2.0</div>

                    {/* Description */}
                    <p style={{ margin: '15px 0', fontSize: '11px', lineHeight: '1.5' }}>
                        Essays on AI, Technology & Society<br />
                        A nostalgic notepad for the future.
                    </p>

                    {/* Links */}
                    <div className="about-links">
                        <a
                            href="https://twitter.com/timmy16744"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Twitter: @timmy16744
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="about-copyright">
                        Copyright 2025 Tim Hughes<br />
                        Adelaide, Australia
                        <br /><br />
                        <span style={{ color: '#999', fontSize: '9px' }}>
                            Psst... try typing "quack"
                        </span>
                    </div>
                </div>

                {/* OK button */}
                <div className="dialog-buttons">
                    <button className="btn-98 primary" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
