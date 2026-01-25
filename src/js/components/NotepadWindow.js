// NotepadWindow Component - Main window container with 98-style chrome
window.AppComponents = window.AppComponents || {};

window.AppComponents.NotepadWindow = ({
    children,
    title = 'DuckSquack',
    isMaximized = false,
    onMaximizeToggle,
    onMinimize,
    theme = 'light'
}) => {
    const windowRef = React.useRef(null);
    const [isActive, setIsActive] = React.useState(true);

    // Handle window focus
    React.useEffect(() => {
        const handleFocus = () => setIsActive(true);
        const handleBlur = () => setIsActive(false);

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // Handle title bar double-click to maximize
    const handleTitleDoubleClick = () => {
        onMaximizeToggle && onMaximizeToggle();
    };

    return (
        <div
            ref={windowRef}
            className={`notepad-window ${isMaximized ? 'maximized' : ''}`}
        >
            <window.AppComponents.TitleBar
                title={title}
                isActive={isActive}
                isMaximized={isMaximized}
                onMinimize={onMinimize}
                onMaximize={onMaximizeToggle}
                onClose={() => {/* Can't really close a webpage */}}
                onDoubleClick={handleTitleDoubleClick}
            />
            {children}
        </div>
    );
};
