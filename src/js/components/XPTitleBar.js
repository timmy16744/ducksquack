// XPTitleBar.js - XP Luna style title bar

window.AppComponents = window.AppComponents || {};

window.AppComponents.XPTitleBar = ({ title, isMaximized, onMinimize, onMaximize, onClose }) => {
    return (
        <div className="title-bar">
            <div className="title-bar-text">
                {title}
            </div>
            <div className="title-bar-controls">
                <button aria-label="Minimize" onClick={onMinimize}>
                    <span style={{
                        display: 'block',
                        width: '8px',
                        height: '2px',
                        background: 'white',
                        marginTop: '6px'
                    }}></span>
                </button>
                <button aria-label={isMaximized ? "Restore" : "Maximize"} onClick={onMaximize}>
                    {isMaximized ? (
                        <span style={{
                            display: 'block',
                            width: '8px',
                            height: '8px',
                            border: '1px solid white',
                            position: 'relative'
                        }}>
                            <span style={{
                                position: 'absolute',
                                top: '-3px',
                                left: '3px',
                                width: '8px',
                                height: '8px',
                                border: '1px solid white',
                                borderBottom: 'none',
                                borderLeft: 'none',
                                background: 'transparent'
                            }}></span>
                        </span>
                    ) : (
                        <span style={{
                            display: 'block',
                            width: '9px',
                            height: '9px',
                            border: '1px solid white',
                            borderTop: '2px solid white'
                        }}></span>
                    )}
                </button>
                <button aria-label="Close" onClick={onClose}>
                    <span style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        lineHeight: '1'
                    }}>×</span>
                </button>
            </div>
        </div>
    );
};
