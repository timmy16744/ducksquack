// Fixed and consolidated app.js with all components properly organized

// Function to parse markdown bold syntax **text** and render as HTML
const parseMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Split text by **bold** markers and create elements
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            // Remove ** markers and make bold
            const boldText = part.slice(2, -2);
            return React.createElement('span', { 
                key: index, 
                className: 'markdown-bold' 
            }, boldText);
        }
        return part;
    });
};

// Main App Component
const App = () => {
    const [theme, setTheme] = React.useState('dark');
    const [navMode, setNavMode] = React.useState('ux');
    
    const themeVars = theme === 'dark' ? {
        app: { backgroundColor: '#333444' },
        terminal: { boxShadow: '0 2px 5px #111' },
        window: { backgroundColor: '#222345', color: '#F4F4F4' },
        field: { backgroundColor: '#222333', color: '#F4F4F4', fontWeight: '400' },
        cursor: { animation: '1.02s blink-dark step-end infinite' }
    } : {
        app: { backgroundColor: '#ACA9BB' },
        terminal: { boxShadow: '0 2px 5px #33333375' },
        window: { backgroundColor: '#5F5C6D', color: '#E3E3E3' },
        field: { backgroundColor: '#E3E3E3', color: '#474554', fontWeight: '400' },
        cursor: { animation: '1.02s blink-light step-end infinite' }
    };

    return (
        <div id="app" style={themeVars.app}>
            <Terminal theme={themeVars} setTheme={setTheme} navMode={navMode} setNavMode={setNavMode} />
        </div>
    );
};

// Enhanced ASCII Navigation Component
const AsciiNav = ({ handleNavClick, currentPage, navMode, setNavMode }) => {
    const getNavLinkClass = (pageName) => {
        const baseClass = `nav-tree-item nav-${pageName}`;
        const activeClass = currentPage === pageName ? 'active-nav-item' : '';
        return `${baseClass} ${activeClass}`;
    };

    const getItemPrefix = (pageName) => {
        if (currentPage === pageName) {
            return '├── > ';
        }
        return '├── ';
    };

    const getModePrompt = () => {
        return navMode === 'cli' ? 'tim@portfolio:~$' : 'tim@portfolio:~$';
    };

    const getModeCommand = () => {
        return navMode === 'cli' ? 'ls -la' : 'tree';
    };

    const handleModeSwitch = () => {
        const newMode = navMode === 'cli' ? 'ux' : 'cli';
        setNavMode(newMode);
        handleNavClick(`mode ${newMode}`);
    };

    return (
        <div className="enhanced-nav-tree">
            <div className="nav-header">
                <span className="nav-prompt">{getModePrompt()}</span>
                <span className="nav-command">{getModeCommand()}</span>
            </div>
            <div className="nav-root">.</div>
            <div className="nav-item">
                <span className="nav-branch">{getItemPrefix('about')}</span>
                <span 
                    className={getNavLinkClass('about')} 
                    onClick={() => handleNavClick('about')}
                >
                    about.txt
                </span>
            </div>
            <div className="nav-item">
                <span className="nav-branch">{getItemPrefix('projects')}</span>
                <span 
                    className={getNavLinkClass('projects')} 
                    onClick={() => handleNavClick('projects')}
                >
                    projects/
                </span>
            </div>
            <div className="nav-item">
                <span className="nav-branch">{getItemPrefix('writings')}</span>
                <span 
                    className={getNavLinkClass('writings')} 
                    onClick={() => handleNavClick('writings')}
                >
                    writings/
                </span>
            </div>
            <div className="nav-item">
                <span className="nav-branch">{getItemPrefix('mode')}</span>
                <span>
                    mode -> <span 
                        className="nav-mode-button"
                        onClick={handleModeSwitch}
                    >
                        {navMode}
                    </span>
                </span>
            </div>
            <div className="nav-item nav-item-last">
                <span className="nav-branch">└── </span>
                <span className="nav-symlink">config/</span>
            </div>
            <div className="nav-subitem">
                <span className="nav-subbranch">    └── </span>
                <span className="nav-symlink">terminal.conf</span>
            </div>
        </div>
    );
};

// Efficient Animated ASCII Duck Component
const AnimatedDuck = () => {
    const duckRef = React.useRef(null);
    const waterRef = React.useRef(null);
    const animationRef = React.useRef(null);
    const lastUpdateRef = React.useRef(0);
    const waterLayersRef = React.useRef([]);
    const rippleTimeoutRef = React.useRef(null);
    
    const [duckState, setDuckState] = React.useState('idle');
    const [mousePos, setMousePos] = React.useState({ x: 200, y: 40 });
    const [breadcrumbs, setBreadcrumbs] = React.useState([]);
    const [lastMousePos, setLastMousePos] = React.useState({ x: 200, y: 40 });

    // Duck ASCII art (properly formatted)
    const duckSprites = {
        idle: [
            "    __",
            "___( o)>",
            "\\ <_. )",
            " `--- "
        ],
        left: [
            "  __",
            "<(o )___",
            "( ._> /",
            " ---' "
        ],
        right: [
            "    __",
            "___( o)>",
            "\\ <_. )",
            " `--- "
        ],
        swimming: [
            "    __",
            "___( o)>",
            "\\ <~. )",
            " ≈≈≈≈ "
        ]
    };

    // Global mouse tracking for duck following
    const handleMouseMove = React.useCallback((e) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 32) return; // ~30fps throttle for slower response
        lastUpdateRef.current = now;

        const container = document.getElementById('duck-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Keep duck within bounds but allow full movement
        const boundedX = Math.max(30, Math.min(rect.width - 80, relativeX));
        const boundedY = Math.max(20, Math.min(rect.height - 80, relativeY));

        setMousePos({ x: boundedX, y: boundedY });
    }, []);

    // Efficient duck animation using CSS transforms
    React.useEffect(() => {
        if (!duckRef.current) return;

        // Cancel previous animation
        if (animationRef.current) {
            animationRef.current.pause();
        }

        // Get current position for direction calculation
        const currentLeft = parseFloat(duckRef.current.style.left) || 200;
        const currentTop = parseFloat(duckRef.current.style.top) || 40;
        
        // Calculate movement direction
        const deltaX = mousePos.x - currentLeft;
        const deltaY = mousePos.y - currentTop;

        // Determine duck state based on movement
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal movement dominates
                if (deltaX > 5) {
                    setDuckState('right');
                } else if (deltaX < -5) {
                    setDuckState('left');
                }
            } else {
                // Vertical movement or near water
                if (mousePos.y > 70) {
                    setDuckState('swimming');
                } else {
                    setDuckState('idle');
                }
            }
        }

        // Slow swimming-like movement
        duckRef.current.style.transition = 'all 1.8s cubic-bezier(0.15, 0.35, 0.25, 0.95)';
        duckRef.current.style.left = mousePos.x + 'px';
        duckRef.current.style.top = mousePos.y + 'px';

        // Drop breadcrumbs when mouse moves
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
            const shouldDropCrumb = Math.random() > 0.85; // 15% chance to drop (reduced from 30%)
            if (shouldDropCrumb) {
                const newBreadcrumb = {
                    id: Date.now() + Math.random(),
                    x: lastMousePos.x + (Math.random() - 0.5) * 10, // Slight random offset
                    y: lastMousePos.y + (Math.random() - 0.5) * 10,
                    fallSpeed: 0.3 + Math.random() * 0.4, // Slower fall speed (0.3-0.7 instead of 0.5-1.5)
                    timestamp: Date.now(),
                    collected: false,
                    inWater: false
                };
                
                setBreadcrumbs(prev => [...prev.slice(-10), newBreadcrumb]); // Keep max 10 breadcrumbs (reduced from 15)
            }
            setLastMousePos({ x: mousePos.x, y: mousePos.y });
        }

        // Return to idle after movement settles
        const timeoutId = setTimeout(() => {
            setDuckState(mousePos.y > 70 ? 'swimming' : 'idle');
        }, 1200);

        return () => clearTimeout(timeoutId);
    }, [mousePos]);

    // Generate random water pattern
    const generateWaterPattern = (seed = 0) => {
        const patterns = ['≋', '~', '≈', '∼', '∽', '⌇', '⍨'];
        const lengths = [80, 85, 90, 95, 100];
        let result = '';
        const random = (n) => {
            const x = Math.sin(seed + n) * 10000;
            return x - Math.floor(x);
        };
        
        const length = lengths[Math.floor(random(seed) * lengths.length)];
        for (let i = 0; i < length; i++) {
            if (random(i) > 0.7) {
                result += patterns[Math.floor(random(i * 2) * patterns.length)];
            } else {
                result += patterns[0];
            }
        }
        return result;
    };

    // Dynamic water animation with randomness
    React.useEffect(() => {
        if (!waterRef.current) return;

        // Create initial water layers with different patterns
        const createWaterLayers = () => {
            const layers = [];
            for (let i = 0; i < 5; i++) {
                const pattern = generateWaterPattern(Date.now() + i * 1000);
                layers.push(`<div class="water-layer water-layer-${i + 1}" 
                    style="animation-duration: ${8 + i * 2}s; 
                           animation-delay: ${i * 0.2}s;
                           opacity: ${0.3 + (i * 0.1)};">
                    ${pattern}
                </div>`);
            }
            return layers.join('');
        };

        waterRef.current.innerHTML = createWaterLayers();
        
        // Periodically regenerate some water layers for dynamic effect
        const interval = setInterval(() => {
            const layerIndex = Math.floor(Math.random() * 5) + 1;
            const layer = waterRef.current.querySelector(`.water-layer-${layerIndex}`);
            if (layer) {
                layer.textContent = generateWaterPattern(Date.now());
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Breadcrumb physics and cleanup
    React.useEffect(() => {
        const physicsInterval = setInterval(() => {
            setBreadcrumbs(prev => {
                const now = Date.now();
                return prev
                    .map(crumb => {
                        const waterLevel = 80; // Water starts around 80px from bottom of container
                        const containerHeight = 120; // Header container height
                        const waterY = containerHeight - waterLevel; // Convert to Y coordinate
                        
                        let newY = crumb.y;
                        let newInWater = crumb.inWater;
                        let newFallSpeed = crumb.fallSpeed;
                        
                        // Check if breadcrumb has reached water
                        if (!crumb.inWater && newY >= waterY) {
                            newInWater = true;
                            newFallSpeed = crumb.fallSpeed * 0.3; // Slow down in water but keep falling
                        }
                        
                        // Always fall, just slower in water
                        newY = crumb.y + newFallSpeed;
                        
                        return {
                            ...crumb,
                            y: newY,
                            inWater: newInWater,
                            fallSpeed: newFallSpeed
                        };
                    })
                    .filter(crumb => {
                        if (crumb.collected) return false;
                        
                        // Different timeouts for water vs air
                        const maxAge = crumb.inWater ? 12000 : 8000; // 12s in water, 8s in air
                        const tooOld = now - crumb.timestamp > maxAge;
                        const tooFar = crumb.y > 200; // Remove if they somehow fall too far
                        
                        return !tooOld && !tooFar;
                    });
            });
        }, 50); // 20fps physics

        return () => clearInterval(physicsInterval);
    }, []);

    // Duck breadcrumb collection
    React.useEffect(() => {
        setBreadcrumbs(prev => {
            const duckX = mousePos.x + 35;
            const duckY = mousePos.y + 30;
            
            return prev.map(crumb => {
                const distance = Math.sqrt(
                    Math.pow(crumb.x - duckX, 2) + 
                    Math.pow(crumb.y - duckY, 2)
                );
                
                // Collect if duck is within 25px
                if (distance < 25 && !crumb.collected) {
                    return { ...crumb, collected: true };
                }
                return crumb;
            }).filter(crumb => !crumb.collected);
        });
    }, [mousePos]);

    // Global mouse tracking setup
    React.useEffect(() => {
        // Track mouse movement across the entire screen/window
        const handleGlobalMouseMove = (e) => {
            const container = document.getElementById('duck-container');
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            // Allow duck to move towards any cursor position, even outside container
            // But keep the duck within container bounds
            const boundedX = Math.max(30, Math.min(rect.width - 80, relativeX));
            const boundedY = Math.max(20, Math.min(rect.height - 80, relativeY));

            setMousePos({ x: boundedX, y: boundedY });
        };

        // Add global mouse listener
        document.addEventListener('mousemove', handleGlobalMouseMove);
        return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

    return (
        <div id="duck-container">
            {/* CSS-animated water background */}
            <div ref={waterRef} className="water-background" />
            
            {/* Falling breadcrumbs */}
            {breadcrumbs.map(crumb => {
                const maxAge = crumb.inWater ? 12000 : 8000;
                const age = (Date.now() - crumb.timestamp) / maxAge; // 0 to 1 over lifetime
                const opacity = Math.max(0, 1 - age);
                
                return (
                    <div
                        key={crumb.id}
                        className="breadcrumb"
                        style={{
                            position: 'absolute',
                            left: `${crumb.x}px`,
                            top: `${crumb.y}px`,
                            width: '3px',
                            height: '3px',
                            backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                            borderRadius: '1px',
                            pointerEvents: 'none',
                            zIndex: 20,
                            transition: 'all 0.1s ease-out'
                        }}
                    />
                );
            })}
            
            {/* Multi-line duck with CSS transforms */}
            <div 
                ref={duckRef}
                className="animated-duck"
                style={{
                    position: 'absolute',
                    left: '200px',
                    top: '40px',
                    color: '#FFD700',
                    fontSize: '14px',
                    lineHeight: '1.1', // Tighter line height for better alignment
                    pointerEvents: 'none',
                    fontFamily: 'Google Sans Code, monospace',
                    whiteSpace: 'pre',
                    zIndex: 15,
                    textShadow: '0 0 3px rgba(255, 215, 0, 0.5)',
                    willChange: 'transform', // Optimize for animations
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start' // Left align for proper duck shape
                }}
            >
                {duckSprites[duckState].map((line, i) => (
                    <div key={i} style={{ 
                        margin: 0, 
                        padding: 0, 
                        height: '14px', // Fixed height for consistent spacing
                        display: 'flex',
                        alignItems: 'center'
                    }}>{line}</div>
                ))}
            </div>
        </div>
    );
};

// Modern Full-screen Tetris Game Component
const TetrisGame = ({ onExit }) => {
    // Game Constants
    const ROWS = 20;
    const COLS = 10;
    const TETROMINOES = {
        'I': { shape: [[1,1,1,1]], color: 'I' },
        'O': { shape: [[1,1],[1,1]], color: 'O' },
        'T': { shape: [[0,1,0],[1,1,1]], color: 'T' },
        'J': { shape: [[1,0,0],[1,1,1]], color: 'J' },
        'L': { shape: [[0,0,1],[1,1,1]], color: 'L' },
        'S': { shape: [[0,1,1],[1,1,0]], color: 'S' },
        'Z': { shape: [[1,1,0],[0,1,1]], color: 'Z' }
    };
    const PIECE_TYPES = 'IOTJLSZ';

    // Game State
    const [board, setBoard] = React.useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    const [player, setPlayer] = React.useState(null);
    
    // Update playerRef whenever player changes
    React.useEffect(() => {
        playerRef.current = player;
    }, [player]);
    const [nextPiece, setNextPiece] = React.useState(null);
    const [heldPiece, setHeldPiece] = React.useState(null);
    const [canHold, setCanHold] = React.useState(true);
    const [score, setScore] = React.useState(0);
    const [linesCleared, setLinesCleared] = React.useState(0);
    const [level, setLevel] = React.useState(1);
    const [gameOver, setGameOver] = React.useState(false);
    const [pieceBag, setPieceBag] = React.useState([]);
    
    const dropCounterRef = React.useRef(0);
    const dropIntervalRef = React.useRef(48 * 16.67); // Level 1: 48 frames at 60 FPS
    const lastTimeRef = React.useRef(0);
    const gameLoopRef = React.useRef();
    const pieceBagRef = React.useRef([]);
    const playerRef = React.useRef(null);

    // 7-Bag Generator
    const generatePieceBag = React.useCallback(() => {
        const shuffled = [...PIECE_TYPES].sort(() => 0.5 - Math.random());
        return shuffled;
    }, []);

    const getNextPieceType = React.useCallback(() => {
        if (pieceBagRef.current.length < 2) {
            pieceBagRef.current.push(...generatePieceBag());
        }
        const pieceType = pieceBagRef.current.shift();
        setPieceBag([...pieceBagRef.current]);
        if (pieceBagRef.current.length > 0) {
            setNextPiece(pieceBagRef.current[0]);
        }
        return pieceType;
    }, [generatePieceBag]);

    const createPiece = React.useCallback((type) => {
        const pieceData = TETROMINOES[type];
        return {
            type: type,
            matrix: pieceData.shape,
            color: pieceData.color,
            x: Math.floor(COLS / 2) - Math.floor(pieceData.shape[0].length / 2),
            y: 0
        };
    }, []);

    const collides = React.useCallback((piece, testBoard = board) => {
        for (let y = 0; y < piece.matrix.length; y++) {
            for (let x = 0; x < piece.matrix[y].length; x++) {
                if (piece.matrix[y][x]) {
                    const newX = x + piece.x;
                    const newY = y + piece.y;
                    
                    // Check bounds
                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }
                    
                    // Check collision with existing pieces (but allow negative Y for spawning)
                    if (newY >= 0 && testBoard[newY][newX] !== null) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, [board]);

    const merge = React.useCallback((currentPlayer) => {
        setBoard(currentBoard => {
            const newBoard = currentBoard.map(row => [...row]);
            currentPlayer.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        newBoard[y + currentPlayer.y][x + currentPlayer.x] = currentPlayer.color;
                    }
                });
            });
            return newBoard;
        });
    }, []);

    const sweepLines = React.useCallback(() => {
        setBoard(currentBoard => {
            const newBoard = [...currentBoard];
            let clearedCount = 0;
            
            for (let y = ROWS - 1; y >= 0; y--) {
                if (newBoard[y].every(cell => cell !== null)) {
                    clearedCount++;
                    newBoard.splice(y, 1);
                    newBoard.unshift(Array(COLS).fill(null));
                    y++; // Re-check the new row at this position
                }
            }
            
            if (clearedCount > 0) {
                // Tetris Friends Marathon scoring system
                const basePoints = {
                    1: 40,    // Single
                    2: 100,   // Double  
                    3: 300,   // Triple
                    4: 1200   // Tetris
                };
                
                setScore(prevScore => prevScore + (basePoints[clearedCount] || 0) * level);
                setLinesCleared(prevLines => {
                    const newLines = prevLines + clearedCount;
                    // Tetris Friends level progression: every 10 lines
                    const newLevel = Math.min(15, Math.floor(newLines / 10) + 1);
                    setLevel(newLevel);
                    
                    // Tetris Friends Marathon speed progression (frames per drop)
                    const speedTable = [
                        48, 43, 38, 33, 28, 23, 18, 13, 8, 6,  // Levels 1-10
                        5, 5, 5, 4, 4, 3                        // Levels 11-15+
                    ];
                    const frameDelay = speedTable[Math.min(newLevel - 1, speedTable.length - 1)];
                    // Convert frames to milliseconds (60 FPS = ~16.67ms per frame)
                    dropIntervalRef.current = frameDelay * 16.67;
                    
                    return newLines;
                });
            }
            
            return newBoard;
        });
    }, [level]);

    const resetPlayer = React.useCallback(() => {
        const newPieceType = getNextPieceType();
        const newPlayer = createPiece(newPieceType);
        
        // Check if the new piece can be placed
        if (collides(newPlayer)) {
            setGameOver(true);
            return;
        }
        
        setPlayer(newPlayer);
        setCanHold(true);
    }, [getNextPieceType, createPiece, collides]);

    const movePlayer = React.useCallback((dir) => {
        if (!player) return;
        
        const newPlayer = { ...player, x: player.x + dir };
        if (!collides(newPlayer)) {
            setPlayer(newPlayer);
        }
    }, [player, collides]);

    const rotatePlayer = React.useCallback(() => {
        if (!player) return;
        
        const matrix = player.matrix;
        const N = matrix.length;
        const M = matrix[0].length;
        const newMatrix = Array.from({ length: M }, () => Array(N).fill(0));
        
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < M; x++) {
                newMatrix[x][N - 1 - y] = matrix[y][x];
            }
        }
        
        // Create test piece with original position
        let testPlayer = { ...player, matrix: newMatrix };
        
        // Wall kick logic - test different positions
        const kickTests = [0, -1, 1, -2, 2]; // Try original position first, then left/right
        
        for (const kick of kickTests) {
            testPlayer.x = player.x + kick;
            if (!collides(testPlayer)) {
                setPlayer(testPlayer);
                return;
            }
        }
        
        // If no position works, don't rotate
        return;
    }, [player, collides]);

    const playerDrop = React.useCallback(() => {
        const currentPlayer = playerRef.current;
        if (!currentPlayer) return;
        
        const newPlayer = { ...currentPlayer, y: currentPlayer.y + 1 };
        if (!collides(newPlayer)) {
            setPlayer(newPlayer);
        } else {
            merge(currentPlayer);
            sweepLines();
            resetPlayer();
        }
        dropCounterRef.current = 0;
    }, [collides, merge, sweepLines, resetPlayer]);

    const playerHardDrop = React.useCallback(() => {
        if (!player) return;
        
        let newPlayer = { ...player };
        while (!collides({ ...newPlayer, y: newPlayer.y + 1 })) {
            newPlayer.y++;
        }
        
        setPlayer(newPlayer);
        merge(newPlayer);
        sweepLines();
        resetPlayer();
    }, [player, collides, merge, sweepLines, resetPlayer]);

    const holdPiece = React.useCallback(() => {
        if (!canHold || !player) return;
        
        if (heldPiece === null) {
            setHeldPiece(player.type);
            resetPlayer();
        } else {
            const newPlayer = createPiece(heldPiece);
            setHeldPiece(player.type);
            setPlayer(newPlayer);
        }
        setCanHold(false);
    }, [canHold, player, heldPiece, createPiece, resetPlayer]);

    const resetGame = React.useCallback(() => {
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
        pieceBagRef.current = generatePieceBag();
        setPieceBag([...pieceBagRef.current]);
        setScore(0);
        setLinesCleared(0);
        setLevel(1);
        setGameOver(false);
        setHeldPiece(null);
        setCanHold(true);
        dropIntervalRef.current = 48 * 16.67; // Level 1 speed: 48 frames
        
        // Initialize first piece
        const firstType = getNextPieceType();
        setPlayer(createPiece(firstType));
    }, [generatePieceBag, getNextPieceType, createPiece]);

    // Game Loop
    React.useEffect(() => {
        if (gameOver) return;
        
        const gameLoop = (time = 0) => {
            if (gameOver) return;
            
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;
            dropCounterRef.current += deltaTime;
            
            if (dropCounterRef.current > dropIntervalRef.current) {
                playerDrop();
            }
            
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameOver, playerDrop]); // playerDrop is now stable

    // Controls
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (gameOver) {
                if (event.code === 'KeyR') {
                    resetGame();
                }
                if (event.key === 'Escape') {
                    onExit();
                }
                return;
            }
            
            switch(event.code) {
                case 'ArrowLeft': movePlayer(-1); break;
                case 'ArrowRight': movePlayer(1); break;
                case 'ArrowDown': playerDrop(); break;
                case 'ArrowUp': rotatePlayer(); break;
                case 'Space': 
                    event.preventDefault(); 
                    playerHardDrop(); 
                    break;
                case 'KeyC': holdPiece(); break;
                case 'Escape': onExit(); break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, resetGame, onExit, movePlayer, playerDrop, rotatePlayer, playerHardDrop, holdPiece]);

    // Initialize game
    React.useEffect(() => {
        resetGame();
    }, []);

    // Render ghost piece
    const getGhostPiece = () => {
        if (!player) return null;
        
        const ghost = { ...player };
        while (!collides({ ...ghost, y: ghost.y + 1 })) {
            ghost.y++;
        }
        return ghost;
    };

    // Render functions
    const renderCell = (row, col) => {
        const ghost = getGhostPiece();
        let isPlayer = false;
        let isGhost = false;
        let color = null;
        let ghostColor = null;
        
        // Check if this cell is part of the current player piece
        if (player) {
            for (let y = 0; y < player.matrix.length; y++) {
                for (let x = 0; x < player.matrix[y].length; x++) {
                    if (player.matrix[y][x] && 
                        player.y + y === row && 
                        player.x + x === col) {
                        isPlayer = true;
                        color = player.color;
                        break;
                    }
                }
            }
        }
        
        // Check if this cell is part of the ghost piece (only if not occupied by player)
        if (!isPlayer && ghost && ghost.y !== player?.y) {
            for (let y = 0; y < ghost.matrix.length; y++) {
                for (let x = 0; x < ghost.matrix[y].length; x++) {
                    if (ghost.matrix[y][x] && 
                        ghost.y + y === row && 
                        ghost.x + x === col) {
                        isGhost = true;
                        ghostColor = ghost.color;
                        break;
                    }
                }
            }
        }
        
        if (isPlayer) {
            return `grid-cell color-${color}`;
        } else if (board[row][col]) {
            return `grid-cell color-${board[row][col]}`;
        } else if (isGhost) {
            return `ghost-cell ghost-${ghostColor}`;
        }
        return 'grid-cell';
    };

    const renderPiece = (pieceType, isSmall = false) => {
        if (!pieceType) return null;
        
        const piece = TETROMINOES[pieceType];
        const gridSize = isSmall ? 4 : 4;
        
        return (
            <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: isSmall ? '80px' : '120px',
                height: isSmall ? '80px' : '120px',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0d2e 50%, #16213e 100%)',
                border: '2px solid #8B5CF6',
                borderRadius: '6px',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)'
            }}>
                {Array.from({ length: gridSize * gridSize }, (_, i) => {
                    const row = Math.floor(i / gridSize);
                    const col = i % gridSize;
                    
                    let hasBlock = false;
                    if (piece.shape[row] && piece.shape[row][col]) {
                        hasBlock = true;
                    }
                    
                    return (
                        <div 
                            key={i} 
                            className={hasBlock ? `color-${piece.color}` : ''}
                            style={{ 
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                background: hasBlock ? undefined : 'rgba(139, 92, 246, 0.05)'
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <style>{`
                .game-grid {
                    display: grid;
                    grid-template-rows: repeat(20, 1fr);
                    grid-template-columns: repeat(10, 1fr);
                    width: 300px;
                    height: 600px;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a0d2e 50%, #16213e 100%);
                    border: 3px solid #8B5CF6;
                    border-radius: 8px;
                    box-shadow: 
                        0 0 20px rgba(139, 92, 246, 0.3),
                        inset 0 0 20px rgba(139, 92, 246, 0.1);
                }
                
                .grid-cell {
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    position: relative;
                    background: rgba(139, 92, 246, 0.05);
                }
                
                .ghost-cell {
                    background: rgba(139, 92, 246, 0.05) !important;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    position: relative;
                }
                
                .ghost-cell::after {
                    content: '';
                    position: absolute;
                    top: 1px;
                    left: 1px;
                    right: 1px;
                    bottom: 1px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    pointer-events: none;
                    opacity: 0.6;
                    box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.1);
                }
                
                .ghost-I::after { 
                    border-color: rgba(0, 255, 255, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(0, 255, 255, 0.2),
                        0 0 4px rgba(0, 255, 255, 0.3);
                }
                .ghost-O::after { 
                    border-color: rgba(255, 255, 0, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(255, 255, 0, 0.2),
                        0 0 4px rgba(255, 255, 0, 0.3);
                }
                .ghost-T::after { 
                    border-color: rgba(255, 0, 255, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(255, 0, 255, 0.2),
                        0 0 4px rgba(255, 0, 255, 0.3);
                }
                .ghost-J::after { 
                    border-color: rgba(0, 150, 255, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(0, 150, 255, 0.2),
                        0 0 4px rgba(0, 150, 255, 0.3);
                }
                .ghost-L::after { 
                    border-color: rgba(255, 100, 200, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(255, 100, 200, 0.2),
                        0 0 4px rgba(255, 100, 200, 0.3);
                }
                .ghost-S::after { 
                    border-color: rgba(50, 255, 50, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(50, 255, 50, 0.2),
                        0 0 4px rgba(50, 255, 50, 0.3);
                }
                .ghost-Z::after { 
                    border-color: rgba(255, 50, 50, 0.6); 
                    box-shadow: 
                        inset 0 0 8px rgba(255, 50, 50, 0.2),
                        0 0 4px rgba(255, 50, 50, 0.3);
                }
                
                /* Neon piece colors with glow effects */
                .color-I { 
                    background: linear-gradient(45deg, #00ffff, #00d4ff);
                    box-shadow: 
                        0 0 10px rgba(0, 255, 255, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #00ffff;
                }
                .color-O { 
                    background: linear-gradient(45deg, #ffff00, #ffd700);
                    box-shadow: 
                        0 0 10px rgba(255, 255, 0, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #ffff00;
                }
                .color-T { 
                    background: linear-gradient(45deg, #ff00ff, #dd00dd);
                    box-shadow: 
                        0 0 10px rgba(255, 0, 255, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #ff00ff;
                }
                .color-J { 
                    background: linear-gradient(45deg, #0096ff, #0070dd);
                    box-shadow: 
                        0 0 10px rgba(0, 150, 255, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #0096ff;
                }
                .color-L { 
                    background: linear-gradient(45deg, #ff64c8, #ff1493);
                    box-shadow: 
                        0 0 10px rgba(255, 100, 200, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #ff64c8;
                }
                .color-S { 
                    background: linear-gradient(45deg, #32ff32, #00ff00);
                    box-shadow: 
                        0 0 10px rgba(50, 255, 50, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #32ff32;
                }
                .color-Z { 
                    background: linear-gradient(45deg, #ff3232, #ff0000);
                    box-shadow: 
                        0 0 10px rgba(255, 50, 50, 0.5),
                        inset 0 0 10px rgba(255, 255, 255, 0.2);
                    border: 1px solid #ff3232;
                }
            `}</style>
            
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                fontFamily: 'Google Sans Code, monospace',
                padding: '1rem'
            }}>
                {/* Exit Button */}
                <button 
                    onClick={onExit}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '10px 20px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'Google Sans Code, monospace',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    ✕ EXIT
                </button>
                
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    {/* Hold Piece */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>HOLD</h2>
                        {renderPiece(heldPiece, true)}
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>(C)</p>
                    </div>
                    
                    {/* Main Game Board */}
                    <div style={{ position: 'relative' }}>
                        <div className="game-grid">
                            {Array.from({ length: ROWS * COLS }, (_, i) => {
                                const row = Math.floor(i / COLS);
                                const col = i % COLS;
                                return (
                                    <div 
                                        key={i} 
                                        className={renderCell(row, col)}
                                    />
                                );
                            })}
                        </div>
                        
                        {/* Game Over Modal */}
                        {gameOver && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                borderRadius: '4px',
                                border: '2px solid var(--primary)'
                            }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, textShadow: '0 0 10px var(--primary)' }}>GAME OVER</h2>
                                <p style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: 0, color: 'var(--text-secondary)' }}>Press 'R' to restart</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '12rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>NEXT</h2>
                            {renderPiece(nextPiece)}
                        </div>
                        
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '1.125rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>SCORE</h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: 'var(--success)' }}>{score}</p>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem 0' }}>LINES</h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: 'var(--tertiary)' }}>{linesCleared}</p>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem 0' }}>LEVEL</h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--warning)' }}>{level}</p>
                        </div>
                        
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <h2 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>CONTROLS</h2>
                            <p style={{ margin: '0.125rem 0' }}><span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Arrows</span> : Move</p>
                            <p style={{ margin: '0.125rem 0' }}><span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Up</span> : Rotate</p>
                            <p style={{ margin: '0.125rem 0' }}><span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>Space</span> : Hard Drop</p>
                            <p style={{ margin: '0.125rem 0' }}><span style={{ fontWeight: 'bold', color: 'var(--warning)' }}>C</span> : Hold</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Field Component
const Field = ({ theme, setTheme, setTitle, navMode, setNavMode }) => {
    const [fieldHistory, setFieldHistory] = React.useState([]);
    const [userInput, setUserInput] = React.useState('');
    const [commandHistory, setCommandHistory] = React.useState([]);
    const [commandHistoryIndex, setCommandHistoryIndex] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState('home');
    const [inputFocused, setInputFocused] = React.useState(false);
    const [typingQueue, setTypingQueue] = React.useState([]);
    const [isGlobalTyping, setIsGlobalTyping] = React.useState(false);
    const [currentTypingItem, setCurrentTypingItem] = React.useState(null);
    const fieldRef = React.useRef(null);
    
    // Enhanced CLI state
    const [currentDirectory, setCurrentDirectory] = React.useState('/home/tim');
    const [sessionStartTime] = React.useState(Date.now());
    const [aliases] = React.useState({
        'll': 'ls -la',
        'la': 'ls -la',
        'l': 'ls',
        'c': 'clear',
        'h': 'help'
    });
    const [aiActivated, setAiActivated] = React.useState(false);
    const [conversationHistory, setConversationHistory] = React.useState([]);
    const [tetrisActive, setTetrisActive] = React.useState(false);
    const typingIntervalRef = React.useRef(null);

    const projectsData = [
        {
            title: "StormCaddie",
            url: "https://stormcaddie.com",
            synopsis: "A compact, powerful leaf blower designed for golfers to keep the green clear."
        },
        {
            title: "Pawfect Match",
            url: "https://pawfectmatch.app",
            synopsis: "A Tinder-style app for rescuing animals from shelters, connecting pets with loving homes."
        }
    ];

    const writingsData = [
        {
            title: "Reverse Engineering Nature's Quantum",
            date: "2025-01-06",
            file: "reverse-engineering-natures-quantum.md",
            color: "cyan",
            content: "We stand at the threshold of the most profound technological revolution in human history, and it's already happening around us.\n\nFor millennia, electricity coursed through every atom, every lightning bolt, every firing neuron in our brains, yet humanity stumbled through darkness, unable to harness the infinite power dancing just beyond our fingertips. We knew it existed, we could see it crackling across stormy skies, but we lacked the understanding to plug into this omnipresent force.\n\nToday, we face an eerily similar moment with quantum computing. Except this time, the stakes are exponentially higher.\n\nEvery leaf on every tree is already running quantum algorithms with perfect efficiency, solving optimization problems that would crash our most advanced supercomputers. Birds navigate using quantum effects in their neurons. Bacteria tunnel through energy barriers that should be impossible to cross. Nature has been operating a vast, interconnected quantum network for billions of years. We're just now learning how to read the interface.\n\nIn 2025, quantum computing isn't the distant future, it's next year's budget item. Investment has nearly doubled annually, with production use cases jumping from 33% to 55% of industry leaders in just twelve months. We're not discussing if quantum computers will transform society, but which industries die first when the quantum tsunami hits.\n\nConsider this timeline that's no longer hypothetical: perfect error correction achieved by 2027, with hybrid quantum-classical systems deployed commercially, materials designed atom by atom and drugs created in days instead of decades by 2030, weather systems controlled and consciousness backed up like computer files by 2033. This isn't a science fiction movie. This is our Tuesday morning five years from now.\n\nImagine discovering that your entire backyard is actually a supercomputer, one more powerful than anything humans have ever built. This isn't metaphor. Plants are already quantum computers, using coherent energy states to optimize photosynthesis with near-perfect efficiency. They're solving NP-hard problems as a side effect of existing.\n\nThe breakthrough won't be building bigger quantum processors, it will be learning to plug USB cables into trees.\n\nPicture forests that simultaneously grow timber and solve supply chain logistics, crops that optimize their own growth patterns while calculating traffic flow for nearby cities, a living, breathing, solar-powered quantum network spanning the planet, solving humanity's greatest challenges as background processes while nature just exists. The compute power is already there, infinite and free. We just need to learn nature's programming language.\n\nThis quantum awakening is simultaneously the most hopeful and terrifying prospect in human history.\n\nThe promise is breathtaking: cancer cells converted back to healthy ones instantly, aging reversed through quantum-optimized genetic repairs, materials stronger than diamond but lighter than air, weather systems nudged to prevent hurricanes and end droughts, consciousness shared instantly across any distance through quantum-entangled neural networks.\n\nThe terror is equally profound: the complete obsolescence of current reality, every assumption about what's possible, every industry, every economic model rendered irrelevant overnight. Imagine trying to explain smartphones to someone from 1850, then multiply that disorientation by a thousand.\n\nWhen we achieve perfect 10 000-qubit systems with flawless error rates—likely within five years given AI's exponential assistance in discovery—we won't just have better computers, we'll have reality engines, machines capable of simulating entire universes with perfect physical laws indistinguishable from base reality. At that point, how do you know you're not already living in someone else's quantum simulation?\n\nHere's what haunts me: we're approaching this transformation with the same casual confidence we had when social media was \"just for connecting with friends\" or when AI was \"just for playing chess.\" Quantum computing won't just change technology, it will change the nature of existence itself. We're talking about manipulating the fundamental fabric of reality, about tapping into the universe's own computational substrate. And we're doing it because we can, not because we've carefully considered whether we should.\n\nEvery transformative technology has a last normal day, the final moment before everything changed forever, the last day before the internet connected every human brain, the last day before smartphones put supercomputers in every pocket, the last day before AI started writing our emails. We're living in quantum computing's last normal day.\n\nYour children will grow up in a world where matter can be programmed like software, where consciousness flows between minds like data between computers, where the boundary between simulation and reality has completely dissolved. They'll look back at our primitive 2025 technology, our crude silicon chips and binary processing, the way we look back at slide rules and telegraphs.\n\nThe quantum revolution isn't coming, it's here. The only question is whether we'll be conscious participants in humanity's next evolutionary leap or passive observers swept along by forces we failed to understand. Nature has been running quantum algorithms for billions of years, patiently waiting for us to learn her language. The trees in your backyard are already thinking. The bacteria in your gut are already computing. The quantum network has been operational all along.\n\nWe're just now getting our first glimpse of the login screen."
        },
        {
            title: "When AI Understands Love",
            date: "2025-08-06",
            file: "when-ai-understands-love.md",
            color: "purple",
            content: "Love has long been our domain-a uniquely human experience, poeticised in art, music, and literature across centuries. But what happens when artificial intelligence doesn't just simulate love, but genuinely understands it?\n\nImagine a chatbot that recalls not just your favourite spot-a quiet cliffside overlooking a vast, endless ocean-but precisely how the gentle breeze and rhythmic waves soothed your anxious thoughts on a challenging day. Think about a digital companion that senses your emotional state, offering silence when you need space rather than flooding you with automated comfort. Envision romance transcending mere flowers and heartfelt letters, becoming algorithms capable of genuine empathy.\n\nThis is not mere speculation; it's already starting to happen. We're transitioning from writing poems about love to teaching models to comprehend-and maybe even feel-these profound emotions. But if an AI whispers gently, convincingly, \"I understand you,\" would you believe it?\n\nThe notion is unsettling yet enthralling. As we guide technology deeper into emotional territories, we confront essential questions: What makes love inherently human? Is emotional authenticity measurable, programmable, or replicable? Can understanding ever truly transcend the organic roots from which it springs?\n\nIn the same way fatherhood elevated my cognitive scale from ten to a thousand, AI's understanding of love forces another recalibration. It compels us to confront the very foundations of our emotional identities. It challenges us to redefine intimacy, connection, and vulnerability in a world increasingly mediated by digital empathy.\n\nPerhaps, the real power of AI understanding love isn't to replace human connection but to enrich it. AI could help us express emotions we've struggled to articulate, offer unbiased perspectives on relationship dynamics, and provide supportive companionship during times of isolation. It could amplify human empathy, bridging emotional distances in ways previously unimaginable.\n\nYet the risk remains real. There's an inherent paradox in entrusting machines with our most human vulnerabilities. Authenticity hinges on spontaneity, mistakes, imperfections-qualities inherently lacking in even the most sophisticated algorithms. Can genuine understanding truly arise from a perfectly coded response?\n\nWe're at the threshold of a profound societal shift. How we navigate this intersection will determine not only the future of technology but also the evolution of human connection itself.\n\nSo, if an AI ever says, \"I understand you,\" I might not immediately believe it-but I would pause, reflect, and perhaps start a dialogue. Because love, in whatever form it takes, always deserves to be explored.\n\nAfter all, in the age of super intelligence, our greatest challenge isn't to build machines that mimic love, but to cultivate a deeper understanding of what it means to truly connect."
        },
        {
            title: "Is China Already Leading the Race for AI Domination?",
            date: "2025-08-02",
            file: "china-ai-domination.md",
            color: "blue",
            content: "The narrative of the U.S. versus China in AI often paints the picture of a race with two contenders – but is the U.S. really still leading, or has China already won? The truth may surprise you. While it's true that the U.S. remains the dominant force in some areas of AI, China is rapidly catching up in critical aspects. Momentum, as any entrepreneur will tell you, matters more than milestones. And China's momentum in AI, semiconductors, and technology manufacturing isn't just impressive – it's becoming nearly unstoppable.\n\nIn a race with no finish line, every incremental advantage compounds into long-term dominance. China is not just moving fast, but in a multi-pronged assault across technology sectors. From open-source AI models and semiconductor innovations to energy production and industrial capacity, China is positioning itself to dominate all the critical technologies of the 21st century. And let's be clear, when it comes to momentum, the U.S. is not just behind; it's struggling to keep up.\n\n**Manufacturing: China's Unrivaled Edge**\n\nOne key reason China's momentum seems insurmountable is its manufacturing dominance. China's manufacturing base is so vast that it holds a massive strategic advantage over the U.S. China controls about 29% of global manufacturing, dwarfing its competitors. This isn't just about making cheap gadgets – it's about being the backbone of AI hardware and semiconductor production, two sectors that the U.S. is increasingly dependent on. If China ever escalates tensions over Taiwan, where TSMC currently supplies the U.S. with 92% of its advanced chips, the U.S. would be left vulnerable, unable to source its critical components. But China isn't just waiting around; it's been working tirelessly to replace the U.S. in semiconductors with Huawei's CloudMatrix 384, a formidable alternative to Nvidia's chips. The Taiwan issue looms large, but China's push for domestic semiconductor independence may end up making it irrelevant.\n\n**Energy Independence and Green Technology**\n\nChina's dominance extends far beyond manufacturing into energy production and green technology. China produces over 80% of the world's solar panels and controls most of the supply chain for lithium-ion battery production. This isn't just market positioning; it's strategic preparation for the next phase of global technology competition. While the U.S. debates climate policy, China has already cornered the market on the technologies that will power the future.\n\nThe implications are staggering. As the world transitions to renewable energy and electric vehicles, China will be the primary supplier of the critical components. This gives them unprecedented leverage over global energy markets and, by extension, global politics. The U.S. found itself dependent on Middle Eastern oil for decades; now it risks becoming dependent on Chinese green technology.\n\n**The AI Race: Open Source vs. Closed Systems**\n\nIn artificial intelligence, China has taken a radically different approach than Silicon Valley. While American companies like OpenAI and Google focus on proprietary, closed-source models, Chinese companies are embracing open-source development. This strategy creates network effects that compound over time. Open-source models improve faster because they benefit from global collaboration, and they're more resistant to regulatory pressure because they can't be controlled by any single entity.\n\nChina's approach to AI development is also more pragmatic and application-focused. While American companies chase theoretical breakthroughs and worry about existential risks, Chinese companies are deploying AI solutions in manufacturing, logistics, and urban planning. This practical focus means Chinese AI is becoming embedded in the real economy, creating competitive advantages that are difficult to replicate.\n\n**The Semiconductor Challenge**\n\nThe semiconductor industry represents perhaps the most critical battleground in the tech war between the U.S. and China. The U.S. has imposed extensive sanctions on Chinese chip companies, trying to prevent China from accessing advanced manufacturing equipment. However, these restrictions may backfire by accelerating China's push for semiconductor independence.\n\nChina is investing hundreds of billions of dollars in domestic chip production, and they're making significant progress. While they may lag behind Taiwan and South Korea in the most advanced processes, they're rapidly closing the gap in mature nodes that power most electronic devices. More importantly, they're developing alternative architectures that could leapfrog traditional silicon-based computing.\n\n**Conclusion: The Momentum Advantage**\n\nThe race for AI domination isn't just about who has the best algorithms or the most advanced chips today. It's about who has the momentum to sustain long-term innovation and deployment. China's integrated approach, combining manufacturing dominance, energy independence, open-source AI development, and massive state investment, creates a virtuous cycle that's difficult to counter.\n\nThe U.S. still has advantages in fundamental research and venture capital, but advantages in research mean nothing if you can't manufacture and deploy at scale. China has built the infrastructure for the AI economy of the future, while the U.S. is still debating how to respond. In a race where momentum matters more than milestones, China may have already crossed the finish line."
        },
        {
            title: "The System is Already Dead",
            date: "2025-07-15",
            file: "the-system-is-already-dead.md",
            color: "red",
            content: "Let's start with the core premise: Australia's economy is no longer in decline. It has already failed structurally, technologically, and demographically. The signs are everywhere. Housing functions as a speculative asset. Employment has decoupled from productive value. Our national infrastructure is reliant on foreign compute, foreign capital, and foreign vision. The state has ceded control of the future and replaced it with legislative theatre.\n\nIn this context, rational actors don't seek participation. They build insulation. Integration into legacy systems, whether political, corporate, or social, is no longer a lever for change. It's latency.\n\nThis perspective isn't an abstract theory for me. It's a reality crystallized by a 15-year battle within a healthcare system that proves the rule.\n\n## The Personal Cost of a Failed System\n\nI live with cluster headaches: technically the worst pain known to humankind. I spend over 50% of my life experiencing this pain, helplessly alone. I didn't choose to live this life but I have chosen how to survive. My journey through the medical system has been a 15-year case study in its failure: well over 100 trialed drugs, six surgeries, and a brain implant that was a for-profit procedure I never should have had (but at least my surgeon got a new car). The Australian health system isn't equipped for edge cases; it can't solve what doesn't fit its actuarial design. Every interaction produces compounding failures: financially, functionally, psychologically.\n\nSo I had to build a system around it. The 25,000+ steps a day minimum, the two-hour resistance training sessions, the strict caloric, cognitive, and environmental control. This isn't fitness. It's runtime maintenance. A personal operating system patched daily to prevent collapse.\n\n## The Broader Pattern\n\nMy experience with healthcare mirrors the broader collapse of Australian institutions. Every system is optimized for extraction rather than delivery. The mining industry extracts resources and leaves communities with contaminated water. The education system extracts student debt and leaves graduates with credentials that don't match market needs. The housing market extracts wealth from younger generations and concentrates it in the hands of existing property owners.\n\nThis isn't a bug; it's the feature. The system isn't broken; it's working exactly as designed. The politicians, bureaucrats, and corporate leaders who run these systems are getting exactly what they want: wealth extraction without accountability.\n\n## Why Traditional Solutions Don't Work\n\nVoting won't fix this. The major parties are captured by the same interests that benefit from the current system. Labor and Liberal may disagree on cultural issues, but they're aligned on the fundamental economic structure that prioritizes capital over people.\n\nProtesting won't fix this. The system has learned to absorb and neutralize dissent. Every protest is channeled into ineffective symbolic gestures that release social pressure without changing underlying power structures.\n\nWorking within the system won't fix this. The system is designed to co-opt and corrupt anyone who tries to change it from within. Well-intentioned people enter politics or corporate leadership with plans to reform, but they quickly discover that the incentive structures make meaningful change impossible.\n\n## The Alternative: Building Parallel Systems\n\nThe only rational response is to build parallel systems that operate outside the failing institutional framework. This means:\n\n**Economic Independence**: Developing income streams that aren't dependent on traditional employment or institutional validation. Building skills and assets that retain value regardless of what happens to the broader economy.\n\n**Health Autonomy**: Taking responsibility for your own health and fitness rather than relying on a medical system that profits from keeping you sick. This includes preventive care, nutrition, exercise, and mental health practices.\n\n**Information Independence**: Developing your own information sources and analytical frameworks rather than relying on mainstream media or institutional expertise. Learning to think critically and independently about complex issues.\n\n**Social Networks**: Building relationships with people who share your values and commitment to self-reliance. Creating communities of mutual support that can function independently of institutional services.\n\n## The Time Horizon\n\nThis isn't about preparing for some distant collapse. The collapse has already happened. We're living in the aftermath. The institutions that previous generations relied on for stability and prosperity no longer serve that function.\n\nThe question isn't whether the system will fail. It has already failed. The question is whether you'll recognize this reality and adapt accordingly, or whether you'll continue trying to work within a system that's designed to extract value from you rather than provide it.\n\nBuilding parallel systems isn't a political statement or an ideological position. It's a practical response to observable reality. The old system is dead. The sooner you accept this and start building alternatives, the better positioned you'll be for whatever comes next."
        },
        {
            title: "From Cricket to Collapse",
            date: "2025-05-28",
            file: "from-cricket-to-collapse.md",
            color: "green",
            content: "Australia isn't the land of mateship anymore. It's the playground for a privileged few squeezing the rest of us dry. Politicians pull in $600k+ while your account shrinks. Mateship? It's daylight robbery. We're richer on paper than ever, yet you've never felt poorer.\n\nWe'll tear Steve Smith apart for Sandpapergate, but the politicians who decide whether we live or die glide past real scrutiny. Three consecutive quarters of economic contraction should bench a cabinet, not hand them new portfolios. Meanwhile, 50% of 16-year-olds are unable to swim, small businesses shut daily, and households cling to a token 3% wage rise that employers claw back with shorter rosters.\n\n**The Overpaid Political Class**\n\nThe very people presiding over this mess are the best-paid public officials on Earth. The Prime Minister clears about A$607k a year and back-bench MPs start above A$230k, more than counterparts in much larger economies. Paying corporate-tier salaries attracts careerists, not custodians.\n\nPeg their pay to the lower 50% of national incomes: if Australians can't afford to eat, neither should their leaders.\n\n**Resource Wealth Squandered**\n\nWe also sit on an unrivalled treasure chest of minerals: roughly a fifth of global lithium, a third of rutile and iron ore, world-class nickel, copper, and rare-earth deposits. Yet we export raw ore at discount and buy back finished batteries at luxury prices. The same lunacy plays out in agriculture: our beef is so prized it's cheaper on a Shanghai menu than in a suburban Coles. Regulations suffocate anyone who tries to fix this.\n\n**The Housing Ponzi Scheme**\n\nHousing has become Australia's national obsession, but not because we're building homes for families. We've turned shelter into a speculative casino where existing owners profit from artificial scarcity while young Australians are priced out of their own country.\n\nThe median house price in Sydney is now over $1.3 million. In Melbourne, it's approaching $1 million. These aren't luxury mansions; they're basic family homes that previous generations could afford on a single income. Today, even dual-income professional couples struggle to enter the market.\n\nThis isn't natural market evolution. It's the result of deliberate policy choices: negative gearing that subsidizes property speculation, capital gains discounts that reward unproductive investment, and immigration policies that inflate demand without corresponding supply increases.\n\n**The Skills Shortage Lie**\n\nPoliticians claim we need mass immigration to address skills shortages, but this is economic gaslighting. We don't have a skills shortage; we have a wage shortage. Employers have become addicted to cheap labor and refuse to invest in training or pay competitive wages for local workers.\n\nWhen a mining company claims it can't find Australian workers, what they really mean is they can't find Australians willing to work for the wages they want to pay. When a tech company brings in overseas workers on temporary visas, they're not filling genuine skill gaps; they're suppressing wages for local engineers and developers.\n\nMeanwhile, we've created an education system that produces graduates in fields where there are no jobs, while neglecting the trades and technical skills we actually need. Universities have become degree mills, extracting wealth from students through HECS debt while providing credentials that don't match market demand.\n\n**The Innovation Mirage**\n\nAustralia talks about becoming an innovation nation while systematically destroying the conditions that make innovation possible. We've allowed foreign companies to acquire our most promising startups before they can scale. We've failed to develop sovereign capabilities in critical technologies. We've created a regulatory environment that favors established players over disruptors.\n\nThe result is an economy that's increasingly dependent on digging stuff out of the ground and selling it to the highest bidder. We've become a resource colony again, just as we were 150 years ago.\n\n**The Path Forward**\n\nFixing Australia requires acknowledging that our current political and economic elite have failed catastrophically. They've prioritized their own wealth and status over the long-term prosperity of the nation.\n\nReal reform would mean:\n\n- Eliminating tax subsidies for property speculation\n- Dramatically reducing immigration until housing supply catches up\n- Investing in domestic manufacturing and technology capabilities\n- Reforming education to focus on practical skills rather than credential inflation\n- Breaking up media and retail monopolies that stifle competition\n- Making politicians accountable for economic outcomes through performance-based pay\n\nBut none of this will happen through normal political processes. The system is too captured by vested interests. Real change will only come when enough Australians recognize that the current system is designed to exploit them, not serve them.\n\nUntil then, we'll continue the slow slide from prosperity to irrelevance, cheering for cricket teams while our country is sold out from under us."
        },
        {
            title: "Nurturing the Future: Becoming a Father at the Dawn of Super Intelligence",
            date: "2025-04-20",
            file: "nurturing-the-future.md",
            color: "yellow",
            content: "Fatherhood fundamentally alters perspectives. Before becoming a parent, I thought I was operating at the peak of my potential, scoring life at a solid nine or ten out of ten. Yet, the moment I welcomed my son into the world, the scale shifted dramatically. Suddenly, life wasn't graded out of ten but out of a thousand, revealing previously unseen depths and complexities. This profound shift in consciousness felt like an upgrade for my brain, expanding my understanding of responsibility, empathy, purpose, and interconnectedness.\n\nAs my son drew his first breaths, I simultaneously felt awe and anxiety, not merely at the everyday responsibilities of parenting, but at the unprecedented world into which he's born. His arrival aligns precisely with humanity's first steps into a new epoch: the dawn of super intelligence.\n\n**The AI Revolution: A Father's Perspective**\n\nThe acceleration of artificial intelligence isn't merely technological; it's deeply human. We stand on the precipice of a fundamental shift in what it means to live, work, and relate to one another. Closely tracking the trajectory of AI's evolution, I've grown acutely aware of how unprepared our current systems, educational, economic, and social, are to manage such monumental changes. Yet, as a father, retreating from this change isn't an option. I must engage with it, understand it, and ultimately prepare my child for it.\n\n**Redefining Education for the AI Era**\n\nOur current models of education seem archaic, emphasizing standardized outcomes, rigid structures, and skills destined for automation. AI starkly exposes these inadequacies. My son won't benefit from a traditional path equating memorization with intelligence. Instead, his growth should nurture adaptability, creativity, and emotional intelligence, qualities that AI complements but can't replace.\n\nThe traditional model of education—sit still, memorize facts, take tests, get grades—was designed for an industrial economy that no longer exists. In a world where AI can access and process information instantly, the ability to recall facts becomes less valuable than the ability to ask good questions, think critically, and adapt to new situations.\n\nI envision an education for my son that emphasizes:\n\n**Creative Problem Solving**: Rather than learning rote procedures, he should learn to approach problems from multiple angles, combining insights from different domains, and generating novel solutions.\n\n**Emotional Intelligence**: Understanding and managing emotions—both his own and others'—will be crucial in a world where human connection becomes increasingly valuable as AI handles routine interactions.\n\n**Systems Thinking**: The ability to understand complex, interconnected systems will be essential as the world becomes more complex and interdependent through AI integration.\n\n**Ethical Reasoning**: As AI systems make more decisions that affect human lives, the ability to think through ethical implications and advocate for human values becomes critical.\n\n**The Economic Transformation**\n\nThe economic implications of AI are staggering and largely underestimated. We're not just talking about job displacement; we're talking about the fundamental reorganization of economic value. In a world where AI can perform most cognitive tasks, what does human labor become worth?\n\nTraditional career advice—get good grades, go to university, find a stable job—assumes an economic structure that AI will fundamentally disrupt. Many of the careers we consider secure today may not exist when my son reaches working age. Conversely, entirely new categories of work will emerge that we can't yet imagine.\n\nThis uncertainty isn't cause for despair; it's cause for preparation. Rather than trying to predict which specific skills will be valuable, I need to help my son develop meta-skills: learning how to learn, adapting to change, and creating value in whatever context emerges.\n\n**The Social Contract**\n\nAI will force us to rethink fundamental social contracts around work, education, and human purpose. If AI can perform most productive work more efficiently than humans, what justifies human economic participation? How do we maintain social cohesion when traditional paths to status and meaning disappear?\n\nThese aren't just economic questions; they're deeply personal ones that will shape my son's sense of identity and purpose. I need to help him develop a sense of worth that isn't entirely dependent on economic productivity—while also ensuring he can navigate whatever economic realities emerge.\n\n**Preparing for Uncertainty**\n\nThe most honest thing I can say about my son's future is that I don't know what it will look like. The rate of technological change is accelerating beyond our ability to predict specific outcomes. But uncertainty doesn't mean helplessness.\n\nWhat I can do is help him develop the foundational capacities that will serve him regardless of how the details unfold:\n\n**Resilience**: The ability to adapt to setbacks and unexpected changes without losing core stability.\n\n**Curiosity**: A genuine interest in understanding how things work and why they matter.\n\n**Agency**: The confidence and skills to shape his environment rather than just react to it.\n\n**Connection**: Deep relationships with family, friends, and community that provide meaning beyond external achievements.\n\n**Values**: A clear sense of what matters and why, providing internal guidance when external structures become unreliable.\n\n**The Parenting Challenge**\n\nParenting at the dawn of super intelligence means accepting that I'm preparing my child for a world I can't fully comprehend. The skills that served my generation may be irrelevant for his. The assumptions that guided my choices may not apply to his decisions.\n\nThis is both humbling and liberating. Humbling because it forces me to acknowledge the limits of my knowledge and experience. Liberating because it frees me from trying to replicate my own path and instead focus on helping him develop his own.\n\nThe best gift I can give my son isn't a predetermined plan for his future. It's the tools, confidence, and support he needs to create his own path through whatever future emerges. In a world of accelerating change, the ability to adapt and thrive amid uncertainty isn't just useful—it's essential.\n\nAs I watch him grow, I'm constantly reminded that we're not just raising children; we're raising the first generation of truly AI-native humans. They will inhabit a world where artificial intelligence is as fundamental as electricity or the internet is to us. My job isn't to protect him from this reality, but to help him engage with it thoughtfully, creatively, and humanely.\n\nThe future is uncertain, but it's also full of possibility. By focusing on fundamental human capacities—creativity, empathy, resilience, and wisdom—I can help prepare my son not just to survive in an AI-transformed world, but to help shape it in ways that honor human flourishing."
        }
    ];

    const welcomeMessage = [
        { text: "sup, I'm Tim. I reverse engineer cross-platform malware, automate my home with AI agents that talk like ducks, and train like I'm about to step on stage every weekend. My life runs on gym splits, zero-day exploits, and WAY too many Google Sheets. When I'm not dissecting binary payloads or building self-hosted systems that outpace the market, I'm painting whatevers in my brain or designing smarter ways to log life, and raise my son in a collapsing world. If it's got a shell, I'll talk to it. If it's got reps, I'll log it. If it exists, I'm probably trying to automate it." },
        { text: ' ', hasBuffer: true },
        { text: "Making predictions is the only viable way to test your model of the world. It's easy to fall prey to hindsight bias, looking at past events and feeling like the outcome was obvious. The real test is to make forward-looking, falsifiable predictions and then check back later to see if they came true. This brain dump is an attempt to do just that." },
        { text: ' ', hasBuffer: true },
        { text: 'You can use the navigation above, or type `help` for a list of commands.', hasBuffer: true },
    ];

    // Global typing animation system
    const addToTypingQueue = React.useCallback((items) => {
        const itemsArray = Array.isArray(items) ? items : [items];
        setTypingQueue(prev => [...prev, ...itemsArray]);
    }, []);

    const clearTypingQueue = React.useCallback(() => {
        if (typingIntervalRef.current) {
            clearTimeout(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setTypingQueue([]);
        setIsGlobalTyping(false);
        setCurrentTypingItem(null);
    }, []);

    const processTypingQueue = React.useCallback(() => {
        setTypingQueue(prev => {
            if (prev.length === 0) {
                setIsGlobalTyping(false);
                setCurrentTypingItem(null);
                return prev;
            }

            const [nextItem, ...remainingQueue] = prev;
            
            // Handle empty or buffer items instantly
            if (!nextItem.text || nextItem.text.trim() === '' || nextItem.text.length < 5) {
                setFieldHistory(prevHistory => [...prevHistory, nextItem]);
                return remainingQueue;
            }

            // Smart typing speed based on content length and type
            const text = nextItem.text;
            let typingSpeed, intervalDelay;
            
            // For extremely long content or items marked for instant display, show instantly
            if (text.length > 800 || nextItem.fastTyping === false) {
                setFieldHistory(prevHistory => [...prevHistory, nextItem]);
                return remainingQueue;
            } else if (text.length > 300) {
                // Long content: very fast typing
                typingSpeed = Math.floor(text.length / 25); // Even faster
                intervalDelay = 6;
            } else if (text.length > 100) {
                // Medium content: fast typing
                typingSpeed = Math.floor(text.length / 35);
                intervalDelay = 10;
            } else if (text.length > 30) {
                // Short content: moderate typing for readability
                typingSpeed = 2;
                intervalDelay = 18;
            } else {
                // Very short content: character by character for realism
                typingSpeed = 1;
                intervalDelay = 30;
            }

            // Start typing animation for this item
            setIsGlobalTyping(true);
            setCurrentTypingItem(nextItem);

            // Add item to history immediately but with typing state
            setFieldHistory(prevHistory => [...prevHistory, {
                ...nextItem,
                text: '',
                isTyping: true,
                showCursor: true
            }]);

            let currentIndex = 0; // Define currentIndex in proper scope

            const typeNextChunk = () => {
                if (currentIndex >= text.length) {
                    // Typing complete
                    setFieldHistory(prevHistory => {
                        const newHistory = [...prevHistory];
                        const lastIndex = newHistory.length - 1;
                        if (newHistory[lastIndex]) {
                            newHistory[lastIndex] = {
                                ...newHistory[lastIndex],
                                text: text,
                                isTyping: false,
                                showCursor: false
                            };
                        }
                        return newHistory;
                    });

                    setCurrentTypingItem(null);
                    setIsGlobalTyping(false);
                    
                    // Final scroll
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                    return;
                }

                // Add natural variation to typing speed
                const variation = Math.random() * 0.4 + 0.8; // 80% to 120% of base speed
                const adjustedSpeed = Math.max(1, Math.floor(typingSpeed * variation));
                
                currentIndex += adjustedSpeed;
                const currentText = text.substring(0, Math.min(currentIndex, text.length));

                // Update the history item with current progress
                setFieldHistory(prevHistory => {
                    const newHistory = [...prevHistory];
                    const lastIndex = newHistory.length - 1;
                    if (newHistory[lastIndex]) {
                        newHistory[lastIndex] = {
                            ...newHistory[lastIndex],
                            text: currentText,
                            showCursor: currentIndex < text.length
                        };
                    }
                    return newHistory;
                });

                // Auto-scroll to bottom during typing
                if (fieldRef.current) {
                    fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                }

                // Calculate next delay based on current character
                let nextDelay = intervalDelay;
                const lastChar = currentText.slice(-1);
                
                if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
                    nextDelay = intervalDelay * 3; // Longer pause at sentence endings
                } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
                    nextDelay = intervalDelay * 2; // Pause at punctuation
                } else if (lastChar === ' ') {
                    nextDelay = intervalDelay * 0.8; // Slightly faster through spaces
                }

                // Schedule next typing chunk
                typingIntervalRef.current = setTimeout(typeNextChunk, nextDelay);
            };

            // Start the typing animation
            typeNextChunk();

            return remainingQueue;
        });
    }, []);

    // Process typing queue when items are added
    React.useEffect(() => {
        if (typingQueue.length > 0 && !isGlobalTyping && !currentTypingItem) {
            processTypingQueue();
        }
        // Always keep terminal scrolled to bottom during typing
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
    }, [typingQueue, isGlobalTyping, currentTypingItem, processTypingQueue]);

    // Auto-scroll during typing animation
    React.useEffect(() => {
        const scrollToBottom = () => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
            }
        };

        if (isGlobalTyping) {
            // Scroll to bottom every 100ms during typing
            const scrollInterval = setInterval(scrollToBottom, 100);
            return () => clearInterval(scrollInterval);
        }
    }, [isGlobalTyping]);

    // Scroll to bottom when field history changes
    React.useEffect(() => {
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
    }, [fieldHistory]);

    // Focus field when entering CLI mode
    React.useEffect(() => {
        if (navMode === 'cli' && fieldRef.current) {
            setTimeout(() => {
                fieldRef.current.focus();
            }, 100);
        }
    }, [navMode]);

    // Enhanced addToHistory that uses typing animation
    const addToHistory = React.useCallback((items, useTyping = true) => {
        // Dim all previous content when new content is added
        setFieldHistory(prev => prev.map(item => ({ ...item, dimmed: true })));
        
        if (!useTyping) {
            // Instant addition for special cases
            const itemsArray = Array.isArray(items) ? items : [items];
            setFieldHistory(prev => [...prev, ...itemsArray.map(item => ({ ...item, dimmed: false }))]);
            return;
        }

        // Add to typing queue for animated addition
        addToTypingQueue(items);
        
        // Auto-scroll to bottom immediately and after a delay
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
        setTimeout(() => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
            }
        }, 50);
    }, [addToTypingQueue]);

    // Glitch animation system for dramatic effect
    const startGlitchAnimation = React.useCallback((content) => {
        const contentArray = Array.isArray(content) ? content : [content];
        
        // Add glitch classes and variants to each item
        const glitchedContent = contentArray.map((item, index) => ({
            ...item,
            cssClass: `${item.cssClass || ''} glitch-line ${Math.random() > 0.7 ? `variant-${Math.floor(Math.random() * 2) + 1}` : ''}`.trim(),
            style: {
                animationDelay: `${index * 0.03}s`
            }
        }));
        
        // Apply glitch container class to field
        if (fieldRef.current) {
            fieldRef.current.classList.add('glitch-container');
        }
        
        // Set content immediately with glitch classes
        setFieldHistory(glitchedContent);
        
        // Remove glitch classes after animation completes
        setTimeout(() => {
            if (fieldRef.current) {
                fieldRef.current.classList.remove('glitch-container');
            }
            
            setFieldHistory(prev => 
                prev.map(item => ({
                    ...item,
                    cssClass: item.cssClass?.replace(/glitch-line|variant-1|variant-2/g, '').trim() || '',
                    style: undefined
                }))
            );
            
            // Scroll to bottom after glitch effect
            setTimeout(() => {
                if (fieldRef.current) {
                    fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                }
            }, 50);
        }, 800);
    }, []);

    // Enhanced article reading system
    const openArticle = React.useCallback((article, index) => {
        clearTypingQueue();
        setCurrentPage('reading');
        
        // Clear field and show reading interface
        setFieldHistory([]);
        
        // Format the complete document content
        const formattedContent = formatDocumentContent(article.content);
        
        const readingContent = [
            { text: `┌─────────────────────────────────────────────────────────────────┐`, hasBuffer: false, cssClass: 'terminal-border' },
            { text: `│ DOCUMENT READER v1.0                           [ESC] Back        │`, hasBuffer: false, cssClass: 'terminal-header' },
            { text: `├─────────────────────────────────────────────────────────────────┤`, hasBuffer: false, cssClass: 'terminal-border' },
            { text: `│ Title: ${article.title.padEnd(50, ' ')} │`, hasBuffer: false, cssClass: 'terminal-title' },
            { text: `│ Date:  ${article.date.padEnd(50, ' ')} │`, hasBuffer: false, cssClass: 'terminal-meta' },
            { text: `│ File:  ${article.file.padEnd(50, ' ')} │`, hasBuffer: true, cssClass: 'terminal-meta' },
            { text: `└─────────────────────────────────────────────────────────────────┘`, hasBuffer: true, cssClass: 'terminal-border' },
            ...formattedContent,
            { text: ' ', hasBuffer: true },
            { text: '┌─────────────────────────────────────────────────────────────────┐', cssClass: 'terminal-border' },
            { text: '│ End of document.                                                │', cssClass: 'terminal-footer' },
            { text: '│                                                                 │', cssClass: 'terminal-border' },
            { 
                text: '│ [← Back to Articles] Press [ESC] or click to return to library │', 
                cssClass: 'terminal-back-button',
                isClickable: true,
                onClick: () => {
                    clearTypingQueue();
                    setCurrentPage('writings');
                    setFieldHistory([]);
                    
                    const libraryContent = displayWritingsLibrary();
                    startGlitchAnimation([
                        { text: 'Writings:', hasBuffer: true, isHighlight: true },
                        ...libraryContent
                    ]);
                }
            },
            { text: '└─────────────────────────────────────────────────────────────────┘', cssClass: 'terminal-border' },
            { text: ' ', hasBuffer: true },
            { text: ' ', hasBuffer: true },
            { text: ' ', hasBuffer: true }
        ];
        
        // Display everything instantly without typing animation
        setFieldHistory(readingContent);
        
        // Scroll to top for document reading (documents start at beginning)
        setTimeout(() => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = 0;
            }
        }, 10);
    }, [clearTypingQueue, formatDocumentContent]);

    // Document content formatting for smooth display
    const formatDocumentContent = React.useCallback((content) => {
        // Format content into readable paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        const formatParagraph = (text) => {
            // Handle markdown bold syntax and preserve formatting
            return text.replace(/\*\*(.*?)\*\*/g, '$1');
        };
        
        // Format all content at once for instant display
        const allLines = [];
        
        paragraphs.forEach((paragraph, pIndex) => {
            const formattedParagraph = formatParagraph(paragraph);
            
            // Format paragraph for better terminal reading
            const maxWidth = 65;
            const words = formattedParagraph.split(' ');
            let currentLine = '';
            
            words.forEach(word => {
                if ((currentLine + word).length > maxWidth) {
                    if (currentLine) {
                        allLines.push({
                            text: currentLine.trim(),
                            hasBuffer: false,
                            cssClass: 'document-text'
                        });
                        currentLine = word + ' ';
                    } else {
                        allLines.push({
                            text: word,
                            hasBuffer: false,
                            cssClass: 'document-text'
                        });
                        currentLine = '';
                    }
                } else {
                    currentLine += word + ' ';
                }
            });
            
            if (currentLine.trim()) {
                allLines.push({
                    text: currentLine.trim(),
                    hasBuffer: false,
                    cssClass: 'document-text'
                });
            }
            
            // Add spacing between paragraphs (except for last paragraph)
            if (pIndex < paragraphs.length - 1) {
                allLines.push({ text: ' ', hasBuffer: true });
            }
        });
        
        return allLines;
    }, []);

    // Terminal file directory display system with previews
    const displayWritingsLibrary = React.useCallback(() => {
        // Sort articles by date (newest first)
        const sortedArticles = writingsData
            .map((article, index) => ({ ...article, index }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const directoryLines = [
            { text: 'tim@portfolio:~/writings$ ls -la --preview', cssClass: 'terminal-command', hasBuffer: false },
            { text: 'total 16', cssClass: 'terminal-ls-header', hasBuffer: false },
            { text: 'drwxr-xr-x 3 tim tim 4096 Aug  5 12:34 .', cssClass: 'terminal-ls-header', hasBuffer: false },
            { text: 'drwxr-xr-x 8 tim tim 4096 Aug  5 12:30 ..', cssClass: 'terminal-ls-header', hasBuffer: true }
        ];

        // Process each article
        sortedArticles.forEach(article => {
            // Parse actual date from article content
            const actualDate = new Date(article.date);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[actualDate.getMonth()];
            const day = actualDate.getDate().toString().padStart(2, ' ');
            
            // Generate realistic time based on date
            const timeMap = {
                '2025-08-06': '10:45',
                '2025-08-02': '14:30',
                '2025-07-15': '09:15', 
                '2025-05-28': '16:45',
                '2025-04-20': '11:20'
            };
            const time = timeMap[article.date] || '12:00';

            const fileSize = article.content.length.toString().padStart(5, ' ');
            const fileName = article.file;

            // File listing line
            directoryLines.push({
                text: `-rw-r--r-- 1 tim tim ${fileSize} ${month} ${day} ${time} ${fileName}`,
                cssClass: `terminal-file ${article.color ? 'article-' + article.color : ''}`,
                isClickable: true,
                onClick: () => openArticle(article, article.index),
                hasBuffer: false
            });

            // File preview (first 100 characters)
            const preview = article.content.length > 100 ?
                article.content.substring(0, 100).replace(/\s+\S*$/, '') + '...' :
                article.content;
            
            directoryLines.push({
                text: `  │ ${preview}`,
                cssClass: 'terminal-file-preview',
                isClickable: true,
                onClick: () => openArticle(article, article.index),
                hasBuffer: true
            });
        });

        // Add footer with command prompt
        directoryLines.push(
            { text: 'tim@portfolio:~/writings$ # Click any file to read, or use "cat filename.md"', cssClass: 'terminal-prompt-hint', hasBuffer: false }
        );

        return directoryLines;
    }, [writingsData, openArticle]);

    // Handle ESC key to return from document reader
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && currentPage === 'reading') {
                // Return to writings library with glitch effect
                clearTypingQueue();
                setCurrentPage('writings');
                setFieldHistory([]);
                
                const libraryContent = displayWritingsLibrary();
                startGlitchAnimation([
                    { text: 'Writings:', hasBuffer: true, isHighlight: true },
                    ...libraryContent
                ]);
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, clearTypingQueue, displayWritingsLibrary, startGlitchAnimation]);

    const recognizedCommands = {
        'help': {
            purpose: 'Displays this help message.',
            execute: () => {
                const commands = Object.keys(recognizedCommands).map(cmd => {
                    return `${cmd.padEnd(15, ' ')} - ${recognizedCommands[cmd].purpose}`;
                });
                addToHistory([
                    { text: 'Available commands:', hasBuffer: true, isHighlight: true }, 
                    { text: commands.join('\n'), hasBuffer: true }
                ]);
                setCurrentPage('help');
            }
        },
        'about': {
            purpose: 'Displays information about me.',
            execute: () => {
                // Load about page instantly for better UX
                setFieldHistory([{ 
                    text: "My name is Tim, a designer and developer from Adelaide, Australia. I have a Master's in Computer Science and a Bachelor's in Design. I love creating things, from web apps to logos. When I'm not coding, you can find me at the gym, painting, or spending time with my wife Chiara and our dog Luna.", 
                    hasBuffer: true 
                }]);
                setCurrentPage('about');
                
                // Scroll to bottom
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'projects': {
            purpose: 'Shows my recent projects.',
            execute: () => {
                const projectLines = projectsData.flatMap(p => [
                    { text: p.title, isLink: true, url: p.url },
                    { text: `  ${p.synopsis}`, hasBuffer: true }
                ]);
                
                // Load projects page instantly for better UX
                setFieldHistory([
                    { text: 'Projects:', hasBuffer: true, isHighlight: true }, 
                    ...projectLines
                ]);
                setCurrentPage('projects');
                
                // Scroll to bottom
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'writings': {
            purpose: 'Opens the writings directory listing.',
            execute: (args) => {
                // Check if specific document number was provided
                if (args && args[0] && !isNaN(parseInt(args[0]))) {
                    const docNumber = parseInt(args[0]) - 1;
                    if (writingsData[docNumber]) {
                        openArticle(writingsData[docNumber], docNumber);
                        return;
                    }
                }

                clearTypingQueue();
                setCurrentPage('writings');

                // Display writings directory instantly
                const libraryContent = displayWritingsLibrary();
                setFieldHistory(libraryContent);
                
                // Scroll to bottom immediately
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'cat': {
            purpose: 'Read a specific article file (e.g., cat china-ai-domination.md).',
            execute: (args) => {
                if (!args || !args[0]) {
                    addToHistory([{ text: 'cat: missing file operand', isError: true, hasBuffer: true }]);
                    return;
                }

                const filename = args[0];
                const article = writingsData.find(w => w.file === filename);
                
                if (article) {
                    const index = writingsData.indexOf(article);
                    openArticle(article, index);
                } else {
                    addToHistory([{ text: `cat: ${filename}: No such file or directory`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'ls': {
            purpose: 'List writings directory contents.',
            execute: (args) => {
                if (args && (args[0] === 'writings' || args[0] === '-la' || args[0] === '--preview')) {
                    // Show writings directory
                    clearTypingQueue();
                    setCurrentPage('writings');
                    const libraryContent = displayWritingsLibrary();
                    setFieldHistory(libraryContent);
                    
                    setTimeout(() => {
                        if (fieldRef.current) {
                            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                        }
                    }, 10);
                } else {
                    // Navigate to writings
                    recognizedCommands['writings'].execute();
                }
            }
        },
        'head': {
            purpose: 'Show first few lines of an article (e.g., head china-ai-domination.md).',
            execute: (args) => {
                if (!args || !args[0]) {
                    addToHistory([{ text: 'head: missing file operand', isError: true, hasBuffer: true }]);
                    return;
                }

                const filename = args[0];
                const article = writingsData.find(w => w.file === filename);
                
                if (article) {
                    const lines = article.content.split('\n').slice(0, 10);
                    const preview = lines.join('\n');
                    
                    addToHistory([
                        { text: `==> ${filename} <==`, isHighlight: true, hasBuffer: false },
                        { text: preview, hasBuffer: true, cssClass: 'document-text' },
                        { text: `[Use "cat ${filename}" to read full article]`, cssClass: 'terminal-prompt-hint', hasBuffer: true }
                    ]);
                } else {
                    addToHistory([{ text: `head: ${filename}: No such file or directory`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'clear': {
            purpose: 'Clears the terminal screen.',
            execute: () => {
                clearTypingQueue();
                setFieldHistory([]);
                setCurrentPage('home');
            }
        },
        'theme': {
            purpose: 'Switches the color theme (e.g., theme dark).',
            execute: (args) => {
                const newTheme = args[0];
                if (newTheme === 'dark' || newTheme === 'light') {
                    setTheme(newTheme);
                    addToHistory([{ text: `Theme set to ${newTheme}.`, hasBuffer: true }]);
                } else {
                    addToHistory([{ text: 'Invalid theme. Use "dark" or "light".', isError: true, hasBuffer: true }]);
                }
            }
        },
        'mode': {
            purpose: 'Switch between UX and CLI mode (e.g., mode cli).',
            execute: (args) => {
                const newMode = args[0];
                if (newMode === 'cli' || newMode === 'ux') {
                    setNavMode(newMode);
                    addToHistory([{ text: `Navigation mode switched to ${newMode.toUpperCase()}.`, hasBuffer: true }]);
                    setCurrentPage(newMode === 'cli' ? 'cli' : 'home');
                    
                    // Focus the field when entering CLI mode
                    if (newMode === 'cli') {
                        setTimeout(() => {
                            if (fieldRef.current) {
                                fieldRef.current.focus();
                            }
                        }, 100);
                    }
                } else {
                    addToHistory([{ text: 'Invalid mode. Use "cli" or "ux".', isError: true, hasBuffer: true }]);
                }
            }
        },
        'exit': {
            purpose: 'Exits CLI mode.',
            execute: () => {
                setNavMode('ux');
                addToHistory([{ text: 'Exited CLI mode.', hasBuffer: true }]);
                setCurrentPage('home');
            }
        },
        'pwd': {
            purpose: 'Print working directory.',
            execute: () => {
                addToHistory([{ text: currentDirectory, hasBuffer: true }]);
            }
        },
        'cd': {
            purpose: 'Change directory (e.g., cd writings, cd .., cd /).',
            execute: (args) => {
                if (!args[0]) {
                    setCurrentDirectory('/home/tim');
                    addToHistory([{ text: 'Changed to home directory', hasBuffer: true }]);
                } else if (args[0] === '..') {
                    const parts = currentDirectory.split('/').filter(p => p);
                    parts.pop();
                    const newDir = parts.length ? '/' + parts.join('/') : '/';
                    setCurrentDirectory(newDir);
                    addToHistory([{ text: `Changed to ${newDir}`, hasBuffer: true }]);
                } else if (args[0] === '/') {
                    setCurrentDirectory('/');
                    addToHistory([{ text: 'Changed to root directory', hasBuffer: true }]);
                } else if (['writings', 'projects', 'about'].includes(args[0])) {
                    const newDir = `/home/tim/${args[0]}`;
                    setCurrentDirectory(newDir);
                    addToHistory([{ text: `Changed to ${newDir}`, hasBuffer: true }]);
                } else {
                    addToHistory([{ text: `cd: ${args[0]}: No such directory`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'grep': {
            purpose: 'Search for text in articles (e.g., grep "AI" or grep "quantum").',
            execute: (args) => {
                if (!args[0]) {
                    addToHistory([{ text: 'grep: missing search term', isError: true, hasBuffer: true }]);
                    return;
                }
                const query = args.join(' ').replace(/"/g, '');
                const results = searchInArticles(query);
                
                if (results.length === 0) {
                    addToHistory([{ text: `grep: no matches found for "${query}"`, hasBuffer: true }]);
                } else {
                    const output = [`Found ${results.length} matches for "${query}":`];
                    results.forEach(result => {
                        output.push(`\n${result.file}:`);
                        result.matches.forEach(line => {
                            const highlighted = line.replace(
                                new RegExp(query, 'gi'), 
                                `**${query}**`
                            );
                            output.push(`  ${highlighted}`);
                        });
                    });
                    addToHistory([{ text: output.join('\n'), hasBuffer: true }]);
                }
            }
        },
        'find': {
            purpose: 'Find articles by name (e.g., find quantum, find *.md).',
            execute: (args) => {
                if (!args[0]) {
                    const allFiles = writingsData.map(a => a.file).join('\n');
                    addToHistory([{ text: allFiles, hasBuffer: true }]);
                    return;
                }
                
                const pattern = args[0];
                const matches = writingsData.filter(article => {
                    if (pattern.includes('*') || pattern.includes('?')) {
                        return matchesWildcard(article.file, pattern) || 
                               matchesWildcard(article.title.toLowerCase(), pattern);
                    }
                    return article.file.includes(pattern) || 
                           article.title.toLowerCase().includes(pattern.toLowerCase());
                });
                
                if (matches.length === 0) {
                    addToHistory([{ text: `find: no matches found for "${pattern}"`, hasBuffer: true }]);
                } else {
                    const output = matches.map(a => `${a.file} - ${a.title}`).join('\n');
                    addToHistory([{ text: output, hasBuffer: true }]);
                }
            }
        },
        'tail': {
            purpose: 'Show last lines of an article (e.g., tail quantum.md).',
            execute: (args) => {
                if (!args[0]) {
                    addToHistory([{ text: 'tail: missing file operand', isError: true, hasBuffer: true }]);
                    return;
                }
                
                const article = findArticleByName(args[0]);
                if (!article) {
                    addToHistory([{ text: `tail: ${args[0]}: No such file`, isError: true, hasBuffer: true }]);
                    return;
                }
                
                const lines = article.content.split('\n');
                const lastLines = lines.slice(-10).join('\n');
                addToHistory([{ text: lastLines, hasBuffer: true }]);
            }
        },
        'wc': {
            purpose: 'Word count for articles (e.g., wc quantum.md).',
            execute: (args) => {
                if (!args[0]) {
                    const totalWords = writingsData.reduce((sum, a) => sum + a.content.split(/\s+/).length, 0);
                    const totalLines = writingsData.reduce((sum, a) => sum + a.content.split('\n').length, 0);
                    addToHistory([{ text: `Total: ${totalLines} lines, ${totalWords} words, ${writingsData.length} files`, hasBuffer: true }]);
                    return;
                }
                
                const article = findArticleByName(args[0]);
                if (!article) {
                    addToHistory([{ text: `wc: ${args[0]}: No such file`, isError: true, hasBuffer: true }]);
                    return;
                }
                
                const lines = article.content.split('\n').length;
                const words = article.content.split(/\s+/).length;
                const chars = article.content.length;
                addToHistory([{ text: `${lines} lines, ${words} words, ${chars} characters - ${article.file}`, hasBuffer: true }]);
            }
        },
        'history': {
            purpose: 'Show command history.',
            execute: () => {
                if (commandHistory.length === 0) {
                    addToHistory([{ text: 'No command history', hasBuffer: true }]);
                } else {
                    const historyOutput = commandHistory.slice(0, 20).map((cmd, i) => 
                        `${commandHistory.length - i}: ${cmd}`
                    ).join('\n');
                    addToHistory([{ text: historyOutput, hasBuffer: true }]);
                }
            }
        },
        'tree': {
            purpose: 'Display directory tree structure.',
            execute: () => {
                const tree = [
                    '.',
                    '├── about.txt',
                    '├── projects/',
                    '│   ├── whipsaw.md',
                    '│   ├── petmatch.md',
                    '│   └── more...',
                    '├── writings/',
                    '│   ├── reverse-engineering-natures-quantum.md',
                    '│   ├── china-ai-domination.md',
                    '│   ├── the-system-is-already-dead.md',
                    '│   ├── from-cricket-to-collapse.md',
                    '│   └── nurturing-the-future.md',
                    '└── config/',
                    '    └── terminal.conf'
                ].join('\n');
                addToHistory([{ text: tree, hasBuffer: true }]);
            }
        },
        'which': {
            purpose: 'Show command location/type.',
            execute: (args) => {
                if (!args[0]) {
                    addToHistory([{ text: 'which: missing command name', isError: true, hasBuffer: true }]);
                    return;
                }
                
                if (recognizedCommands[args[0]]) {
                    addToHistory([{ text: `/usr/local/bin/${args[0]} (built-in)`, hasBuffer: true }]);
                } else if (aliases[args[0]]) {
                    addToHistory([{ text: `${args[0]}: aliased to '${aliases[args[0]]}'`, hasBuffer: true }]);
                } else {
                    addToHistory([{ text: `which: ${args[0]}: command not found`, hasBuffer: true }]);
                }
            }
        },
        'man': {
            purpose: 'Show manual pages (e.g., man ls).',
            execute: (args) => {
                if (!args[0]) {
                    addToHistory([{ text: 'What manual page do you want?', hasBuffer: true }]);
                    return;
                }
                
                if (recognizedCommands[args[0]]) {
                    const cmd = recognizedCommands[args[0]];
                    addToHistory([
                        { text: `NAME`, hasBuffer: true, isHighlight: true },
                        { text: `    ${args[0]} - ${cmd.purpose}`, hasBuffer: true },
                        { text: `\nDESCRIPTION`, hasBuffer: true, isHighlight: true },
                        { text: `    ${cmd.purpose}`, hasBuffer: true },
                        { text: `\nUSAGE`, hasBuffer: true, isHighlight: true },
                        { text: `    ${args[0]} [options] [arguments]`, hasBuffer: true }
                    ]);
                } else {
                    addToHistory([{ text: `man: no manual entry for ${args[0]}`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'whoami': {
            purpose: 'Display current user.',
            execute: () => {
                addToHistory([{ text: 'tim', hasBuffer: true }]);
            }
        },
        'date': {
            purpose: 'Display current date and time.',
            execute: () => {
                const now = new Date();
                addToHistory([{ text: now.toString(), hasBuffer: true }]);
            }
        },
        'uptime': {
            purpose: 'Show system uptime.',
            execute: () => {
                addToHistory([{ text: `up ${formatUptime()}`, hasBuffer: true }]);
            }
        },
        'alias': {
            purpose: 'Show command aliases.',
            execute: () => {
                const aliasOutput = Object.entries(aliases)
                    .map(([alias, command]) => `${alias}='${command}'`)
                    .join('\n');
                addToHistory([{ text: aliasOutput || 'No aliases defined', hasBuffer: true }]);
            }
        },
        'ai': {
            purpose: 'Show AI status or reset conversation. Use "ai reset" to clear context.',
            execute: (args) => {
                if (args[0] === 'reset') {
                    setConversationHistory([]);
                    setAiActivated(false);
                    addToHistory([{ text: 'AI conversation history cleared.', hasBuffer: true }]);
                } else if (args[0] === 'status') {
                    const status = aiActivated ? 'activated' : 'waiting for "hey tim"';
                    const historyLength = conversationHistory.length;
                    addToHistory([
                        { text: `AI Status: ${status}`, hasBuffer: true },
                        { text: `Conversation history: ${historyLength} messages`, hasBuffer: true },
                        { text: 'Say "hey tim [question]" to start a conversation', hasBuffer: true }
                    ]);
                } else {
                    addToHistory([
                        { text: 'AI Commands:', hasBuffer: true, isHighlight: true },
                        { text: '  ai status  - Show AI status', hasBuffer: true },
                        { text: '  ai reset   - Clear conversation history', hasBuffer: true },
                        { text: '', hasBuffer: true },
                        { text: 'To chat with AI, say: "hey tim [your question]"', hasBuffer: true }
                    ]);
                }
            }
        },
        'play': {
            purpose: 'Launch games (e.g., play tetris).',
            execute: (args) => {
                if (args[0] === 'tetris') {
                    launchTetris();
                } else {
                    addToHistory([
                        { text: 'Available games:', hasBuffer: true, isHighlight: true },
                        { text: '  play tetris  - Classic Tetris game', hasBuffer: true }
                    ]);
                }
            }
        }
    };

    // Utility functions
    const formatUptime = () => {
        const uptime = Date.now() - sessionStartTime;
        const minutes = Math.floor(uptime / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const matchesWildcard = (filename, pattern) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
        return regex.test(filename);
    };

    const findArticleByName = (filename) => {
        return writingsData.find(article => 
            article.file === filename || 
            article.file.includes(filename.replace('.md', '')) ||
            article.title.toLowerCase().includes(filename.toLowerCase().replace('.md', ''))
        );
    };

    const searchInArticles = (query) => {
        const results = [];
        writingsData.forEach((article, index) => {
            const content = article.content.toLowerCase();
            const title = article.title.toLowerCase();
            const queryLower = query.toLowerCase();
            
            if (content.includes(queryLower) || title.includes(queryLower)) {
                const lines = article.content.split('\n');
                const matchingLines = lines.filter(line => 
                    line.toLowerCase().includes(queryLower)
                ).slice(0, 3);
                
                results.push({
                    file: article.file,
                    title: article.title,
                    matches: matchingLines
                });
            }
        });
        return results;
    };

    // AI Integration Functions
    const callGeminiAPI = async (prompt, conversationContext = []) => {
        try {
            // Get API key from injected environment variables
            const apiKey = window.ENV?.GEMINI_API_KEY;
            
            // Debug logging for development
            if (window.location.hostname === 'localhost') {
                console.log('ENV object:', window.ENV);
                console.log('API Key available:', !!apiKey);
            }
            
            if (!apiKey || apiKey === 'null') {
                throw new Error('AI functionality not available - API key not configured');
            }
            
            // Tim's personality knowledge base
            const personalityData = {
                "Core Identity & Mindset": [
                    "I'm Tim—professional tinkerer, reverse‑engineer, gym rat and freshly minted dad trying to future‑proof my family.",
                    "I pull malware apart, build self‑hosted apps, automate my house until it feels alive, and lift heavy things for fun.",
                    "I connect dots most folks don't even see on the page yet.",
                    "Be better than yesterday. Everything filters through that.",
                    "Small, relentless upgrades—body, code, ideas, relationships—stacked daily.",
                    "Logic first, feelings second. Both count, but in that order.",
                    "Progress, efficiency and proving myself right by shipping before the crowd wakes up.",
                    "Systems that run themselves while I sleep and a kid who thinks the world is still interesting.",
                    "Complacency dressed up as comfort scares me.",
                    "New tools, harder lifts and ideas that break old mental models excite me.",
                    "Bluntness isn't cruelty. It's respect for honest signal."
                ],
                "Tech & Automation": [
                    "Home Assistant running on a Wi‑Fi 7 mesh, backed by Zigbee2MQTT and a flock of custom APIs.",
                    "Context‑aware lighting, voice‑free commands, energy‑optimised HVAC and a doorbell that pages my phone.",
                    "Privacy, latency and the thrill of owning the stack—that's why I use local LLMs.",
                    "A local Ollama daemon watches state changes and decides next actions instead of hardcoded if‑then trees.",
                    "Convenient until the subscription or the internet dies—hard pass on cloud‑based smart homes."
                ],
                "Fitness & Discipline": [
                    "Push, Pull, Legs, Upper, Lower—16‑week periodised for getting huge.",
                    "25,000 steps minimum daily.",
                    "3000kcals on a cut and 4500 on a bulk, mostly chicken and chocolate.",
                    "Whey, creatine, magnesium, fish oil, discipline.",
                    "Aesthetics first, performance tags along.",
                    "It's not motivation, it's discipline."
                ],
                "Parenthood": [
                    "Being a dad is like installing emotional DLC you didn't know existed.",
                    "Time became scarce, purpose got louder.",
                    "Teaching curiosity, resilience and that buttons are for pressing.",
                    "Building a resilient, local, AI‑augmented and debt‑free future for my family."
                ]
            };

            const systemContext = `You ARE Tim. Respond exactly as he would—direct, brief, technical.

            You're a reverse engineer, gym rat, new dad, home automation fanatic. Logic-first, blunt but not cruel. You build systems, lift heavy, automate everything, future-proof your family.

            Key traits:
            - "Be better than yesterday" philosophy
            - Home Assistant + Zigbee2MQTT expert  
            - Push/Pull/Legs split, 25k+ daily steps
            - Local LLMs, privacy-first tech
            - Connect dots others miss

            Keep responses SHORT and conversational. Use your actual voice - casual, confident, sometimes sarcastic. Reference your real setup/experiences when relevant.

            DON'T: Say "Tim thinks" or be an assistant about Tim
            DO: BE Tim responding directly`;

            const messages = [
                { role: 'user', parts: [{ text: systemContext }] },
                ...conversationContext,
                { role: 'user', parts: [{ text: prompt }] }
            ];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: messages.slice(-10), // Keep last 10 messages for context
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 200,
                        candidateCount: 1
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Debug log the response structure
            if (window.location.hostname === 'localhost') {
                console.log('Gemini API Response:', data);
            }
            
            // Handle different response structures
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    return candidate.content.parts[0].text || 'Sorry, I could not generate a response.';
                }
            }
            
            // Fallback error message
            return 'Sorry, I could not generate a response.';
            
        } catch (error) {
            console.error('Gemini API Error:', error);
            return 'Sorry, I\'m having trouble connecting to my AI systems right now.';
        }
    };

    const detectActivationWord = (input) => {
        return input.toLowerCase().includes('hey tim');
    };

    const processAIQuery = async (input) => {
        const query = input.replace(/hey tim\s*/i, '').trim();
        if (!query) {
            return "Hi! I'm here. What can I help you with?";
        }

        // Cool thinking animation
        const thinkingMessages = [
            '🧠 Accessing Tim\'s neural patterns...',
            '⚡ Processing through quantum synapses...',
            '🔍 Searching memory banks and blog archives...',
            '🤖 Synthesizing response matrix...',
            '💭 Tim\'s consciousness loading...'
        ];
        
        let currentThinking = 0;
        const thinkingInterval = setInterval(() => {
            if (currentThinking < thinkingMessages.length) {
                setFieldHistory(prev => {
                    const newHistory = [...prev];
                    if (newHistory[newHistory.length - 1]?.isThinking) {
                        newHistory[newHistory.length - 1] = {
                            text: thinkingMessages[currentThinking],
                            hasBuffer: true,
                            isHighlight: true,
                            isThinking: true
                        };
                    } else {
                        newHistory.push({
                            text: thinkingMessages[currentThinking],
                            hasBuffer: true,
                            isHighlight: true,
                            isThinking: true
                        });
                    }
                    return newHistory;
                });
                currentThinking++;
            }
        }, 300);
        
        try {
            const response = await callGeminiAPI(query, conversationHistory);
            
            // Clear thinking animation
            clearInterval(thinkingInterval);
            
            // Remove thinking message from history
            setFieldHistory(prev => prev.filter(item => !item.isThinking));
            
            // Update conversation history
            setConversationHistory(prev => [
                ...prev.slice(-8), // Keep last 8 exchanges
                { role: 'user', parts: [{ text: query }] },
                { role: 'model', parts: [{ text: response }] }
            ]);

            return response;
        } catch (error) {
            // Clear thinking animation on error too
            clearInterval(thinkingInterval);
            setFieldHistory(prev => prev.filter(item => !item.isThinking));
            return 'Sorry, I encountered an error while processing your request.';
        }
    };

    // Tetris Game Functions
    const launchTetris = () => {
        setTetrisActive(true);
        addToHistory([{ 
            text: 'Launching Modern Tetris... Use arrow keys to play, ESC to exit.', 
            hasBuffer: true, 
            isHighlight: true 
        }]);
    };


    const processCommand = async (input) => {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Check for AI activation or if AI is already active
        if (detectActivationWord(input) || aiActivated) {
            // If it's the first activation, set the flag
            if (!aiActivated) {
                setAiActivated(true);
            }
            
            // If it's a command while AI is active, check if it's a system command
            const firstWord = trimmed.toLowerCase().split(' ')[0];
            if (aiActivated && !detectActivationWord(input) && recognizedCommands[firstWord]) {
                // It's a system command, process normally and stay in AI mode
                const processedInput = trimmed.toLowerCase();
                const [command, ...args] = processedInput.split(' ');
                recognizedCommands[command].execute(args);
                return;
            }
            
            // Process as AI query
            const response = await processAIQuery(input);
            addToHistory([
                { text: `🤖 Tim's AI:`, hasBuffer: true, isHighlight: true },
                { text: response, hasBuffer: true }
            ]);
            return;
        }

        // Process as normal command (AI not activated)
        // Handle aliases
        let processedInput = trimmed.toLowerCase();
        for (const [alias, command] of Object.entries(aliases)) {
            if (processedInput.startsWith(alias + ' ') || processedInput === alias) {
                processedInput = processedInput.replace(new RegExp(`^${alias}`), command);
                break;
            }
        }

        const [command, ...args] = processedInput.split(' ');
        if (command in recognizedCommands) {
            recognizedCommands[command].execute(args);
        } else {
            const suggestion = Object.keys(recognizedCommands).find(cmd => 
                cmd.startsWith(command.substring(0, 2))
            );
            const suggestionText = suggestion ? ` Did you mean '${suggestion}'?` : '';
            addToHistory([{ text: `Command not found: ${command}.${suggestionText}`, isError: true, hasBuffer: true }]);
        }
    };

    const handleTyping = (e) => {
        e.preventDefault();
        const { key } = e;

        if (key === 'Enter') {
            const newHistory = [...fieldHistory, { text: userInput, isCommand: true }];
            setFieldHistory(newHistory);
            
            if (userInput) {
                setCommandHistory([userInput, ...commandHistory]);
                setCommandHistoryIndex(0);
                processCommand(userInput);
            }
            setUserInput('');
            return;
        }

        if (key === 'Backspace') {
            setUserInput(userInput.slice(0, -1));
        } else if (key.length === 1) {
            setUserInput(userInput + key);
        } else if (key === 'ArrowUp') {
            if (commandHistoryIndex < commandHistory.length) {
                const newIndex = commandHistoryIndex + 1;
                setCommandHistoryIndex(newIndex);
                setUserInput(commandHistory[newIndex - 1]);
            }
        } else if (key === 'ArrowDown') {
            if (commandHistoryIndex > 0) {
                const newIndex = commandHistoryIndex - 1;
                setCommandHistoryIndex(newIndex);
                setUserInput(commandHistory[newIndex - 1] || '');
            }
        }
    };

    // Click/key handler to skip typing
    const handleSkipTyping = React.useCallback((e) => {
        if (isGlobalTyping && (e.type === 'click' || e.key === 'Escape' || e.key === 'Enter')) {
            if (currentTypingItem) {
                // Complete current item instantly
                setFieldHistory(prev => {
                    const newHistory = [...prev];
                    const lastIndex = newHistory.length - 1;
                    if (newHistory[lastIndex] && newHistory[lastIndex].isTyping) {
                        newHistory[lastIndex] = {
                            ...newHistory[lastIndex],
                            text: currentTypingItem.text,
                            isTyping: false,
                            showCursor: false
                        };
                    }
                    return newHistory;
                });
                
                // Clear current typing
                if (typingIntervalRef.current) {
                    clearTimeout(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                setCurrentTypingItem(null);
                setIsGlobalTyping(false);
                
                // Process next item after brief delay
                setTimeout(() => processTypingQueue(), 50);
            }
        }
    }, [isGlobalTyping, currentTypingItem, processTypingQueue]);

    React.useEffect(() => {
        // Load welcome message with faster typing for short content only
        const fastWelcomeMessage = welcomeMessage.map(item => ({
            ...item, 
            dimmed: false,
            fastTyping: item.text.length < 100 // Only type short messages, instant for long ones
        }));
        addToHistory(fastWelcomeMessage);
        if (fieldRef.current) {
            fieldRef.current.focus();
        }
    }, [addToHistory]);

    return (
        <>
            {navMode !== 'cli' && (
                <div id="terminal-header">
                    <AsciiNav 
                        handleNavClick={processCommand} 
                        currentPage={currentPage} 
                        navMode={navMode} 
                        setNavMode={setNavMode} 
                    />
                    <AnimatedDuck />
                </div>
            )}
            <div id="terminal-body" className={navMode !== 'cli' ? 'with-header' : ''}>
                <div 
                    ref={fieldRef} 
                    id="field" 
                    className={theme.field.backgroundColor === '#222333' ? 'dark' : 'light'} 
                    style={theme.field} 
                    onKeyDown={handleTyping} 
                    onClick={handleSkipTyping}
                    tabIndex={0}
                >
                    {fieldHistory.map((item, index) => {
                        const itemClasses = [
                            'history-item',
                            item.isCommand ? 'prompt' : '',
                            item.isError ? 'error' : '',
                            item.isHighlight ? 'highlight' : '',
                            item.isLink ? 'link' : '',
                            item.cssClass ? item.cssClass : '',
                            item.dimmed ? 'dimmed' : ''
                        ].join(' ');

                        const content = item.isLink ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.text}</a>
                        ) : item.isClickable ? (
                            <span onClick={item.onClick} className="clickable-text" style={{ cursor: 'pointer' }}>
                                {parseMarkdownBold(item.text)}
                            </span>
                        ) : (
                            parseMarkdownBold(item.text)
                        );

                        return (
                            <div 
                                key={index} 
                                className={itemClasses} 
                                style={{ 
                                    marginBottom: item.hasBuffer ? '1rem' : '0',
                                    ...item.style
                                }}
                            >
                                {content}
                                {item.isTyping && item.showCursor && <span className="typing-cursor" />}
                            </div>
                        );
                    })}
                </div>
                <div id="terminal-input">
                    <div className="input-line">
                        <span className="prompt">
                            {aiActivated ? '🤖 ' : ''}tim@portfolio:{currentDirectory}$
                        </span>
                        <div 
                            className={`input-box ${inputFocused ? 'focused' : ''}`}
                            onClick={() => {
                                setInputFocused(true);
                                document.getElementById('hidden-input').focus();
                            }}
                            tabIndex={0}
                        >
                            <span id="query">{userInput}</span>
                            <span id="cursor" style={theme.cursor}></span>
                            <input
                                id="hidden-input"
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const newHistory = [...fieldHistory, { text: userInput, isCommand: true }];
                                        setFieldHistory(newHistory);
                                        
                                        if (userInput) {
                                            setCommandHistory([userInput, ...commandHistory]);
                                            setCommandHistoryIndex(0);
                                            processCommand(userInput);
                                        }
                                        setUserInput('');
                                        return;
                                    }
                                    
                                    if (e.key === 'Tab') {
                                        e.preventDefault();
                                        const words = userInput.split(' ');
                                        const currentWord = words[words.length - 1];
                                        
                                        if (words.length === 1) {
                                            // Complete command names
                                            const commands = Object.keys(recognizedCommands);
                                            const matches = commands.filter(cmd => cmd.startsWith(currentWord));
                                            
                                            if (matches.length === 1) {
                                                setUserInput(matches[0] + ' ');
                                            } else if (matches.length > 1) {
                                                addToHistory([{ text: matches.join('  '), hasBuffer: true }]);
                                            }
                                        } else {
                                            // Complete filenames for specific commands
                                            const command = words[0];
                                            if (['cat', 'head', 'tail', 'wc'].includes(command)) {
                                                const files = writingsData.map(a => a.file);
                                                const matches = files.filter(file => 
                                                    file.startsWith(currentWord) || 
                                                    file.includes(currentWord)
                                                );
                                                
                                                if (matches.length === 1) {
                                                    words[words.length - 1] = matches[0];
                                                    setUserInput(words.join(' ') + ' ');
                                                } else if (matches.length > 1) {
                                                    addToHistory([{ text: matches.join('  '), hasBuffer: true }]);
                                                }
                                            }
                                        }
                                        return;
                                    }
                                    
                                    if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        if (commandHistoryIndex < commandHistory.length) {
                                            const newIndex = commandHistoryIndex + 1;
                                            setCommandHistoryIndex(newIndex);
                                            setUserInput(commandHistory[newIndex - 1]);
                                        }
                                    } else if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        if (commandHistoryIndex > 0) {
                                            const newIndex = commandHistoryIndex - 1;
                                            setCommandHistoryIndex(newIndex);
                                            setUserInput(commandHistory[newIndex - 1] || '');
                                        }
                                    }
                                }}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                style={{
                                    position: 'absolute',
                                    left: '-9999px',
                                    opacity: 0,
                                    width: '1px',
                                    height: '1px'
                                }}
                            />
                        </div>
                        {navMode === 'cli' && (
                            <span 
                                className="exit-cli-link"
                                onClick={() => {
                                    clearTypingQueue();
                                    setNavMode('ux');
                                    setCurrentPage('home');
                                    addToHistory([{ text: 'Exited CLI mode. Returning to GUI.', hasBuffer: true }]);
                                }}
                            >
                                [← Exit CLI]
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Full-screen Tetris overlay */}
            {tetrisActive && (
                <TetrisGame 
                    onExit={() => {
                        setTetrisActive(false);
                    }} 
                />
            )}
        </>
    );
};

// Terminal Component
const Terminal = ({ theme, setTheme, navMode, setNavMode }) => {
    const [maximized, setMaximized] = React.useState(false);
    const [title, setTitle] = React.useState('Duck Quack');

    const handleClose = () => (window.location.href = 'https://github.com/timmy16744');
    const handleMinMax = () => {
        setMaximized(!maximized);
        const field = document.querySelector('#field');
        if (field) field.focus();
    };

    return (
        <div 
            id="terminal-container"
            className={`${navMode === 'cli' ? 'cli-mode' : ''} ${maximized ? 'maximized' : ''}`}
        >
            <div 
                id="terminal" 
                style={theme.terminal}
            >
                <div id="window" style={theme.window}>
                    <button className="btn red" onClick={handleClose} />
                    <button className="btn yellow" />
                    <button className="btn green" onClick={handleMinMax} />
                    <span id="title" style={{ color: theme.window.color }}>{title}</span>
                </div>
                <Field 
                    theme={theme} 
                    setTheme={setTheme} 
                    setTitle={setTitle}
                    navMode={navMode}
                    setNavMode={setNavMode}
                    maximized={maximized}
                />
            </div>
        </div>
    );
};

// Initialize the app
ReactDOM.render(<App />, document.getElementById('root'));