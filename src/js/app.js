// Main Application Entry Point - DuckSquack XP Notepad

// App Component
const App = () => {
    return (
        <div id="app-container" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <window.AppComponents.XPDesktop />
        </div>
    );
};

// Mount
ReactDOM.render(<App />, document.getElementById('root'));
