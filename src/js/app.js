// Main Application Entry Point

// App Component
const App = () => {
    const [theme, setTheme] = React.useState('dark');

    // Theme Management
    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#0F172A');
            root.style.setProperty('--bg-secondary', '#1E293B');
            root.style.setProperty('--text-primary', '#F8FAFC');
            root.style.setProperty('--text-secondary', '#CBD5E1');
            root.style.setProperty('--border', '#334155');
            document.body.style.backgroundColor = '#0F172A';
            document.body.style.color = '#F8FAFC';
        } else {
            root.style.setProperty('--bg-primary', '#F8FAFC');
            root.style.setProperty('--bg-secondary', '#E2E8F0');
            root.style.setProperty('--text-primary', '#0F172A');
            root.style.setProperty('--text-secondary', '#334155');
            root.style.setProperty('--border', '#CBD5E1');
            document.body.style.backgroundColor = '#F8FAFC';
            document.body.style.color = '#0F172A';
        }
    }, [theme]);

    return (
        <div id="app-container" className={`theme-${theme}`} style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <window.AppComponents.Desktop theme={theme} setTheme={setTheme} />
        </div>
    );
};

// Mount
ReactDOM.render(<App />, document.getElementById('root'));