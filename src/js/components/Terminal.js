// Main Terminal Component
window.AppComponents = window.AppComponents || {};

// Simple Typing Effect Component
const TypingEffect = ({ text, speed = 30, onComplete }) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            onComplete && onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    return <div style={{ whiteSpace: 'pre-wrap' }}>{displayedText}{currentIndex < text.length && <span className="typing-cursor">█</span>}</div>;
};

window.AppComponents.Terminal = ({ theme, setTheme, externalWindowState, onWindowStateChange }) => {
    const [history, setHistory] = React.useState([]);
    const [input, setInput] = React.useState('');
    // Replaced "windows" with "activeFile" for embedded mode
    const [activeFile, setActiveFile] = React.useState(null); 
    const [cwd, setCwd] = React.useState([]); // [] = root
    const [inputHistory, setInputHistory] = React.useState([]);
    const [historyIndex, setHistoryIndex] = React.useState(-1);
    const [mode, setMode] = React.useState('gui'); // 'cli' or 'gui'
    const [showTree, setShowTree] = React.useState(true); 
    
    const inputRef = React.useRef(null);
    const endRef = React.useRef(null);

    // Initialize
    React.useEffect(() => {
        window.FileSystem.init();
        addToHistory('Welcome to the interactive portfolio.', 'info');
        addToHistory('Type "help" for commands.', 'info');
        
        setTimeout(() => {
            const aboutNode = window.FileSystem.readFile('about.md');
            if (aboutNode) {
                addToHistory(<TypingEffect text={aboutNode.content} />, 'component');
            }
        }, 1000);

        const postSlug = window.Utils.getQueryParam('post');
        if (postSlug) {
            openFile(`writings/${postSlug}.md`);
        }
    }, []);

    // Scroll to bottom
    React.useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const addToHistory = (text, type = 'output') => {
        setHistory(prev => [...prev, { text, type, timestamp: Date.now() }]);
    };

    const getPrompt = () => {
        const path = cwd.length === 0 ? '~' : '~/' + cwd.join('/');
        return `guest@quack:${path}$`;
    };

    const resolvePath = (pathStr) => {
        if (pathStr === '/') return [];
        if (pathStr === '..') return cwd.slice(0, -1);
        if (pathStr === '.') return cwd;
        if (pathStr.startsWith('/')) return pathStr.split('/').filter(Boolean);
        return [...cwd, pathStr];
    };

    const openFile = (pathStr) => {
        const node = window.FileSystem.readFile(pathStr);
        if (node) {
            if (node.type === 'file') {
                // Set active file for embedded reading instead of creating a window
                setActiveFile(node.meta);
            } else if (node.type === 'link') {
                window.open(node.url, '_blank');
                addToHistory(`Opening ${node.url}...`, 'info');
            }
        } else {
            addToHistory(`File not found: ${pathStr}`, 'error');
        }
    };

    const handleCommand = (cmdStr) => {
        if (!cmdStr.trim()) return;
        
        const [cmd, ...args] = cmdStr.trim().split(' ');
        addToHistory(`${getPrompt()} ${cmdStr}`, 'input');
        setInputHistory(prev => [cmdStr, ...prev]);
        setHistoryIndex(-1);

        switch (cmd.toLowerCase()) {
            case 'help':
                addToHistory('Available commands:');
                addToHistory('  ls [dir]      List directory contents');
                addToHistory('  cd <dir>      Change directory');
                addToHistory('  open <file>   Open a file (in terminal)');
                addToHistory('  cat <file>    Print file content');
                addToHistory('  clear         Clear history');
                addToHistory('  theme [name]  Change theme (dark/light)');
                addToHistory('  mode [cli|gui] Switch mode');
                addToHistory('  exit          Close reader');
                break;
            case 'ls':
                const targetPath = args[0] || '.';
                const list = window.FileSystem.ls(targetPath);
                if (list) {
                    const output = list.map(item => {
                        let color = 'var(--text-primary)';
                        if (item.type === 'dir') {
                            color = 'var(--tertiary)';
                        } else if (item.type === 'link') {
                            color = 'var(--success)';
                        } else if (item.meta && item.meta.color) {
                            const colorMap = {
                                blue: '#60A5FA',
                                green: 'var(--success)',
                                pink: 'var(--primary)',
                                cyan: 'var(--tertiary)',
                                red: '#F87171',
                                purple: '#C084FC',
                                yellow: 'var(--warning)'
                            };
                            color = colorMap[item.meta.color] || item.meta.color;
                        }
                        
                        const isBlogPost = item.type === 'file' && item.meta && item.meta.date;

                        return (
                            <div key={item.name} style={{ marginBottom: isBlogPost ? '10px' : '0' }}>
                                {isBlogPost && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '2px' }}>
                                        {item.meta.date}
                                    </div>
                                )}
                                <span style={{ color, marginRight: '15px' }}>{item.name}</span>
                            </div>
                        );
                    });
                    addToHistory(<div>{output}</div>, 'component');
                } else {
                    addToHistory(`Directory not found: ${targetPath}`, 'error');
                }
                break;
            case 'cd':
                if (!args[0]) {
                    setCwd([]);
                } else {
                    const newPath = resolvePath(args[0]);
                    const node = window.FileSystem.resolve(newPath.join('/'));
                    if (node && node.type === 'dir') {
                        setCwd(newPath);
                        window.FileSystem.currentPath = newPath;
                    } else {
                        addToHistory(`No such directory: ${args[0]}`, 'error');
                    }
                }
                break;
            case 'cat':
                if (!args[0]) {
                    addToHistory('Usage: cat <filename>', 'error');
                } else {
                    const node = window.FileSystem.readFile(args[0]);
                    if (node) {
                        addToHistory(node.content, 'output');
                    } else {
                        addToHistory(`File not found: ${args[0]}`, 'error');
                    }
                }
                break;
            case 'open':
                if (!args[0]) {
                    addToHistory('Usage: open <filename>', 'error');
                } else {
                    openFile(args[0]);
                }
                break;
            case 'clear':
                setHistory([]);
                break;
            case 'theme':
                if (args[0] === 'dark' || args[0] === 'light') {
                    setTheme(args[0]);
                } else {
                    addToHistory('Usage: theme <dark|light>', 'error');
                }
                break;
            case 'mode':
                if (args[0] === 'cli' || args[0] === 'gui') {
                    setMode(args[0]);
                    addToHistory(`Switched to ${args[0].toUpperCase()} mode.`, 'info');
                } else {
                    addToHistory('Usage: mode <cli|gui>', 'error');
                }
                break;
            case 'exit':
                if (activeFile) {
                    setActiveFile(null);
                } else {
                    addToHistory('No active file to close.', 'info');
                }
                break;
            default:
                addToHistory(`Command not found: ${cmd}`, 'error');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < inputHistory.length - 1) {
                const newIdx = historyIndex + 1;
                setHistoryIndex(newIdx);
                setInput(inputHistory[newIdx]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIdx = historyIndex - 1;
                setHistoryIndex(newIdx);
                setInput(inputHistory[newIdx]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    // Window Management (Controlled via Props)
    const windowState = externalWindowState || 'normal'; // Use prop or default

    const handleTrafficLight = (action) => {
        if (action === 'close') {
            setHistory([]);
            addToHistory('Session reset.', 'info');
            setTimeout(() => window.location.reload(), 500);
        } else if (action === 'minimize') {
            onWindowStateChange('minimized');
        } else if (action === 'maximize') {
            onWindowStateChange(windowState === 'maximized' ? 'normal' : 'maximized');
        }
    };

    // ... refs and resize observer ...
    const terminalContentRef = React.useRef(null);
    const [terminalContentDimensions, setTerminalContentDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setTerminalContentDimensions({ width, height });
            }
        });

        if (terminalContentRef.current) {
            observer.observe(terminalContentRef.current);
        }

        return () => {
            if (terminalContentRef.current) {
                observer.unobserve(terminalContentRef.current);
            }
        };
    }, [windowState]);

    const outerContainerStyle = {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: windowState === 'maximized' ? 'var(--bg-primary)' : '#000000cc',
        transition: 'background-color 0.3s ease',
        padding: windowState === 'maximized' ? '0' : '20px'
    };

    const windowFrameStyle = {
        width: windowState === 'maximized' ? '100%' : (windowState === 'minimized' ? '200px' : '90%'),
        height: windowState === 'maximized' ? '100%' : (windowState === 'minimized' ? '40px' : '85%'),
        maxWidth: windowState === 'maximized' ? 'none' : '1200px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: windowState === 'maximized' ? '0' : '10px',
        boxShadow: windowState === 'maximized' ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        border: windowState === 'maximized' ? 'none' : '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
    };

    const titleBarStyle = {
        height: '32px',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        userSelect: 'none'
    };

    const trafficLightStyle = (color) => ({
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '8px',
        cursor: 'pointer',
        position: 'relative'
    });

    return (
        <div style={outerContainerStyle}>
            <div style={windowFrameStyle} className={windowState}>
                {/* Title Bar */}
                <div style={titleBarStyle} onDoubleClick={() => handleTrafficLight('maximize')}>
                    <div style={{ display: 'flex' }}>
                        <div style={trafficLightStyle('#FF5F56')} onClick={() => handleTrafficLight('close')} title="Reset Session" />
                        <div style={trafficLightStyle('#FFBD2E')} onClick={() => handleTrafficLight('minimize')} title="Minimize" />
                        <div style={trafficLightStyle('#27C93F')} onClick={() => handleTrafficLight('maximize')} title="Maximize" />
                    </div>
                    <div style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.8rem', 
                        fontFamily: 'sans-serif',
                        fontWeight: 500,
                        opacity: 0.7,
                        marginRight: '52px' // Balance spacing
                    }}>
                        guest — -zsh — 80×24
                    </div>
                </div>

                {/* Terminal Content (Hidden if minimized) */}
                <div 
                    ref={terminalContentRef} // Apply ref here
                    style={{ 
                        flex: 1, 
                        display: windowState === 'minimized' ? 'none' : 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative'
                    }} 
                    onClick={() => inputRef.current?.focus()}
                >
                    
                    {/* Background Duck */}
                    <window.AppComponents.AnimatedDuck 
                        containerWidth={activeFile ? 250 : terminalContentDimensions.width}
                        containerHeight={terminalContentDimensions.height}
                    />
        
                    {/* GUI Mode Top Bar */}
                    {mode === 'gui' && (
                        <window.AppComponents.NavComponents.MenuBar 
                            mode={mode} 
                            setMode={setMode} 
                            onToggleTree={() => setShowTree(!showTree)}
                            isTreeVisible={showTree}
                        />
                    )}
        
                    {/* Main Layout Area */}
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 5
                    }}>
                        
                        {/* Sidebar Tree */}
                        {mode === 'gui' && showTree && (
                            <window.AppComponents.NavComponents.FileSystemTree 
                                onOpen={(path) => openFile(path)}
                            />
                        )}
        
                        {/* Right Column: Terminal OR Reader */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            
                            {activeFile ? (
                                // Embedded Reader Mode
                                <window.AppComponents.ArticleReader 
                                    article={activeFile} 
                                    onClose={() => setActiveFile(null)} 
                                    isEmbedded={true}
                                />
                            ) : (
                                // Standard Terminal Mode
                                <>
                                    {mode === 'cli' && (
                                        <div 
                                            style={{
                                                position: 'absolute', top: '10px', right: '10px', zIndex: 100,
                                                cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5
                                            }}
                                            onClick={() => setMode('gui')}
                                            title="Switch to GUI Mode"
                                        >
                                            [GUI]
                                        </div>
                                    )}
        
                                    <div className="terminal-output" style={{
                                        flex: 1,
                                        padding: '20px',
                                        overflowY: 'auto'
                                    }}>
                                        {history.map((item, i) => (
                                            <div key={i} className={`history-item ${item.type}`} style={{ marginBottom: '8px' }}>
                                                {item.type === 'component' ? item.text : (
                                                    <div style={{ whiteSpace: 'pre-wrap', color: item.type === 'error' ? 'var(--warning)' : 'inherit' }}>
                                                        {item.text}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={endRef} />
                                    </div>
        
                                    <div className="terminal-input-line" style={{
                                        padding: '10px 20px',
                                        background: 'rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderTop: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <span className="prompt" style={{ color: 'var(--success)', marginRight: '10px', fontWeight: 'bold' }}>
                                            {getPrompt()}
                                        </span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'inherit',
                                                fontFamily: 'inherit',
                                                fontSize: 'inherit',
                                                outline: 'none'
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};