// Desktop Environment Component
window.AppComponents = window.AppComponents || {};

window.AppComponents.Desktop = ({ theme, setTheme }) => {
    // 'maximized', 'normal', 'minimized'
    const [terminalState, setTerminalState] = React.useState('normal'); 
    const [secretsOpen, setSecretsOpen] = React.useState(false);
    const [activeZ, setActiveZ] = React.useState('terminal'); // 'terminal' or 'secrets'

    const handleMinimize = () => {
        setTerminalState('minimized');
    };

    const handleRestore = () => {
        setTerminalState('normal');
        setActiveZ('terminal');
    };

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            position: 'relative', 
            backgroundColor: '#111', // Dark background behind the terminal
            overflow: 'hidden'
        }}>
            {/* Desktop Icons */}
            <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                zIndex: 1
            }}>
                <div 
                    onClick={() => {
                        setSecretsOpen(true);
                        setActiveZ('secrets');
                    }}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        width: '80px',
                        color: '#ccc'
                    }}
                >
                    <div style={{ fontSize: '3rem' }}>📁</div>
                    <div style={{ textShadow: '0 1px 2px #000', marginTop: '5px', fontSize: '0.9rem' }}>Secrets</div>
                </div>
            </div>

            {/* The Secrets Maze Window */}
            {secretsOpen && (
                <window.AppComponents.SecretsMaze 
                    id="secrets-window"
                    onClose={() => setSecretsOpen(false)}
                    isActive={activeZ === 'secrets'}
                    onFocus={() => setActiveZ('secrets')}
                />
            )}

            {/* The Main Terminal Window */}
            {terminalState !== 'minimized' && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    zIndex: activeZ === 'terminal' ? 10 : 2,
                    pointerEvents: 'none' // Let clicks pass through to desktop if not hitting window
                }}>
                    {/* Wrapper to capture pointer events for the window itself */}
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }} onMouseDown={() => setActiveZ('terminal')}>
                        <window.AppComponents.Terminal 
                            theme={theme} 
                            setTheme={setTheme} 
                            externalWindowState={terminalState}
                            onWindowStateChange={setTerminalState}
                        />
                    </div>
                </div>
            )}

            {/* Minimized Tab (Taskbar) */}
            {terminalState === 'minimized' && (
                <div 
                    onClick={handleRestore}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '10px 30px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                        fontFamily: 'Google Sans Code, monospace',
                        border: '1px solid var(--border)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                    }}
                    className="minimized-tab"
                >
                    <span style={{ color: 'var(--success)' }}>●</span> ducks site
                </div>
            )}
        </div>
    );
};