// Main Application Entry Point - DuckSquack XP Notepad

// Wait for all Babel scripts to be transpiled and executed
const waitForComponents = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (window.AppComponents &&
                window.AppComponents.XPDesktop &&
                window.AppComponents.XPNotepad &&
                window.AppComponents.XPTitleBar &&
                window.AppComponents.XPNavBar &&
                window.AppComponents.XPContent &&
                window.AppComponents.XPStatusBar &&
                window.AppComponents.XPWritingsList) {
                resolve();
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
};

// App Component
const App = () => {
    return (
        <div id="app-container" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <window.AppComponents.XPDesktop />
        </div>
    );
};

// Mount after components are ready
waitForComponents().then(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
}).catch(err => {
    console.error('Failed to load components:', err);
    document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error loading app. Check console.</div>';
});
