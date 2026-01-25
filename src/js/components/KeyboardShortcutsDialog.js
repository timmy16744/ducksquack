// KeyboardShortcutsDialog Component - Shows available keyboard shortcuts
window.AppComponents = window.AppComponents || {};

window.AppComponents.KeyboardShortcutsDialog = ({
    isOpen,
    onClose
}) => {
    // Handle escape key
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const shortcuts = [
        { category: 'File', items: [
            { key: 'Ctrl + O', action: 'Open file browser' },
            { key: 'Ctrl + S', action: 'Copy shareable link' },
        ]},
        { category: 'Edit', items: [
            { key: 'Ctrl + F', action: 'Find in document' },
            { key: 'F3', action: 'Find next' },
            { key: 'Ctrl + A', action: 'Select all' },
            { key: 'Ctrl + C', action: 'Copy selection' },
        ]},
        { category: 'Navigation', items: [
            { key: 'Ctrl + Tab', action: 'Next tab' },
            { key: 'Ctrl + Shift + Tab', action: 'Previous tab' },
            { key: 'Ctrl + W', action: 'Close current tab' },
            { key: 'Ctrl + 1-9', action: 'Switch to tab #' },
        ]},
        { category: 'View', items: [
            { key: 'F11', action: 'Toggle fullscreen' },
        ]},
    ];

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog"
                style={{ width: '400px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div className="dialog-title-bar">
                    <span>Keyboard Shortcuts</span>
                    <button onClick={onClose}>×</button>
                </div>

                {/* Content */}
                <div className="dialog-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {shortcuts.map((section, sectionIndex) => (
                        <div key={sectionIndex} style={{ marginBottom: '16px' }}>
                            <div style={{
                                fontWeight: 'bold',
                                marginBottom: '8px',
                                borderBottom: '1px solid var(--win98-dark)',
                                paddingBottom: '4px'
                            }}>
                                {section.category}
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {section.items.map((shortcut, index) => (
                                        <tr key={index}>
                                            <td style={{
                                                padding: '4px 8px',
                                                fontFamily: 'monospace',
                                                background: 'rgba(0,0,0,0.05)',
                                                borderRadius: '2px',
                                                width: '140px'
                                            }}>
                                                {shortcut.key}
                                            </td>
                                            <td style={{ padding: '4px 8px' }}>
                                                {shortcut.action}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
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
