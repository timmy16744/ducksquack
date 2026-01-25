// TitleBar Component - Windows 98 style title bar with window controls
window.AppComponents = window.AppComponents || {};

window.AppComponents.TitleBar = ({
    title = 'DuckSquack',
    isActive = true,
    isMaximized = false,
    onMinimize,
    onMaximize,
    onClose,
    onDoubleClick
}) => {
    return (
        <div
            className={`title-bar ${isActive ? '' : 'inactive'}`}
            onDoubleClick={onDoubleClick}
        >
            <div className="title-bar-text">
                <span className="icon" style={{
                    fontSize: '14px',
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                }}>
                    {/* Duck icon */}
                    <span style={{ color: '#FFD700' }}>&#x1F986;</span>
                </span>
                <span>{title}</span>
            </div>
            <div className="title-bar-controls">
                <button
                    aria-label="Minimize"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMinimize && onMinimize();
                    }}
                    title="Minimize"
                >
                    <span style={{
                        display: 'block',
                        width: '8px',
                        height: '2px',
                        background: '#000',
                        marginTop: '4px'
                    }}></span>
                </button>
                <button
                    aria-label={isMaximized ? "Restore" : "Maximize"}
                    onClick={(e) => {
                        e.stopPropagation();
                        onMaximize && onMaximize();
                    }}
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        // Restore icon (overlapping squares)
                        <span style={{
                            display: 'block',
                            position: 'relative',
                            width: '8px',
                            height: '8px'
                        }}>
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                left: '0',
                                width: '6px',
                                height: '6px',
                                border: '1px solid #000',
                                borderTop: '2px solid #000',
                                background: 'var(--win98-bg)'
                            }}></span>
                            <span style={{
                                position: 'absolute',
                                top: '0',
                                left: '2px',
                                width: '6px',
                                height: '6px',
                                border: '1px solid #000',
                                borderTop: '2px solid #000',
                                background: 'var(--win98-bg)'
                            }}></span>
                        </span>
                    ) : (
                        // Maximize icon (single square)
                        <span style={{
                            display: 'block',
                            width: '8px',
                            height: '8px',
                            border: '1px solid #000',
                            borderTop: '2px solid #000'
                        }}></span>
                    )}
                </button>
                <button
                    aria-label="Close"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose && onClose();
                    }}
                    title="Close"
                    style={{ marginLeft: '2px' }}
                >
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: 1
                    }}>×</span>
                </button>
            </div>
        </div>
    );
};
