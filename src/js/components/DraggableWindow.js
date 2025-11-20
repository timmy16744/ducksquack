// Draggable Window Component
window.AppComponents = window.AppComponents || {};

window.AppComponents.DraggableWindow = ({ 
    id, 
    title, 
    children, 
    onClose, 
    initialPosition = { x: 50, y: 50 }, 
    initialSize = { width: 600, height: 400 },
    isActive,
    onFocus,
    isMaximized = false
}) => {
    const [position, setPosition] = React.useState(initialPosition);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [maximized, setMaximized] = React.useState(isMaximized);

    const handleMouseDown = (e) => {
        if (maximized) return;
        if (e.target.closest('.window-controls')) return; // Don't drag if clicking controls
        
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        onFocus && onFocus();
    };

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                // Simple bounds check (optional)
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const toggleMaximize = () => {
        setMaximized(!maximized);
        onFocus && onFocus();
    };

    const style = maximized ? {
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isActive ? 100 : 10
    } : {
        top: `${position.x}px`, // CSS top/left swap? No, usually top=y, left=x.
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${initialSize.width}px`,
        height: `${initialSize.height}px`,
        zIndex: isActive ? 100 : 10
    };

    // Ensure window is visible on mount
    React.useEffect(() => {
        // Center if no position
        if (!initialPosition) {
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            setPosition({
                x: (winWidth - initialSize.width) / 2,
                y: (winHeight - initialSize.height) / 2
            });
        }
    }, []);

    return (
        <div 
            className={`draggable-window ${isActive ? 'active' : ''} ${maximized ? 'maximized' : ''}`}
            style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-secondary, #1E293B)',
                border: '1px solid var(--border, #334155)',
                boxShadow: isActive ? '0 10px 30px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                transition: isDragging ? 'none' : 'all 0.1s ease-out',
                ...style
            }}
            onMouseDown={() => onFocus && onFocus()}
        >
            {/* Header Bar */}
            <div 
                className="window-header"
                onMouseDown={handleMouseDown}
                style={{
                    padding: '8px 12px',
                    backgroundColor: isActive ? 'var(--primary, #F25D94)' : 'var(--border, #334155)',
                    color: isActive ? '#fff' : '#ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: maximized ? 'default' : 'grab',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}
            >
                <div className="window-title">{title}</div>
                <div className="window-controls" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={toggleMaximize}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'inherit', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {maximized ? '[-]' : '[+]'}
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'inherit', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        [X]
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div 
                className="window-content"
                style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '0',
                    position: 'relative',
                    backgroundColor: 'var(--bg-primary, #0F172A)'
                }}
            >
                {children}
            </div>
        </div>
    );
};