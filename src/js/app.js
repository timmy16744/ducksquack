// Main Application Entry Point - DuckSquack Notepad

// Initialize FileSystem with writings data
if (window.FileSystem && window.FileSystem.init) {
    window.FileSystem.init();
}

// App Component
const App = () => {
    const [theme, setTheme] = React.useState('dark');

    // Theme Management
    React.useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        if (theme === 'dark') {
            body.classList.add('theme-dark');
            body.classList.remove('theme-light');
            root.style.setProperty('--win98-bg', '#2d2d2d');
            root.style.setProperty('--win98-dark', '#1a1a1a');
            root.style.setProperty('--win98-light', '#4a4a4a');
            root.style.setProperty('--doc-bg', '#1e1e1e');
            root.style.setProperty('--doc-text', '#d4d4d4');
        } else {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
            root.style.setProperty('--win98-bg', '#c0c0c0');
            root.style.setProperty('--win98-dark', '#808080');
            root.style.setProperty('--win98-light', '#ffffff');
            root.style.setProperty('--doc-bg', '#ffffff');
            root.style.setProperty('--doc-text', '#000000');
        }
    }, [theme]);

    return (
        <div id="app-container" className={`theme-${theme}`} style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <window.AppComponents.Notepad theme={theme} setTheme={setTheme} />
        </div>
    );
};

// Mount
ReactDOM.render(<App />, document.getElementById('root'));
