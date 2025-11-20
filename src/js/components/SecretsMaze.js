// Secrets Maze Component (The "Needle in the Haystack" Protocol)
window.AppComponents = window.AppComponents || {};

window.AppComponents.SecretsMaze = ({ onClose, isActive, onFocus, id }) => {
    const [currentDepth, setCurrentDepth] = React.useState(0);
    const [history, setHistory] = React.useState(['C:', 'SYSTEM', 'ROOT']);
    const [status, setStatus] = React.useState('SYSTEM_READY');
    const [unlocked, setUnlocked] = React.useState(false);
    const [folders, setFolders] = React.useState([]);

    // The Code: 1 - 6 - 7 - 4 - 4
    const LEVELS = [
        {
            targetValue: 1,
            targetName: "UNO",
            decoys: ["DUO", "TRE", "QUAT", "PENT", "HEX", "SEPT", "OCT", "NON", "DEC", "NULL", "VOID", "NIL", "NAN", "UNDEFINED"]
        },
        {
            targetValue: 6,
            targetName: "CARBON",
            decoys: ["BORON", "HELIUM", "LITHIUM", "NEON", "OXYGEN", "NITROGEN", "ZINC", "GOLD", "IRON", "LEAD", "SILVER", "COPPER"]
        },
        {
            targetValue: 7,
            targetName: "SINS",
            decoys: ["VIRTUES", "COMMANDS", "GOSPELS", "TRIBES", "SEALS", "PLAGUES", "WONDERS", "PILLARS", "GATES", "RINGS", "KEYS"]
        },
        {
            targetValue: 4,
            targetName: "HORSEMEN",
            decoys: ["KNIGHTS", "PAWNS", "ROOKS", "BISHOPS", "KINGS", "QUEENS", "JOKERS", "ACES", "SUITS", "CARDS"]
        },
        {
            targetValue: 4,
            targetName: "NOT_FOUND",
            decoys: ["ACCEPTED", "CREATED", "BAD_REQ", "GATEWAY", "SERVICE", "TIMEOUT", "CONFLICT", "GONE", "MOVED", "FOUND"]
        }
    ];

    // Generate the noise
    React.useEffect(() => {
        if (unlocked) return;

        const currentLvl = LEVELS[currentDepth];
        const folderList = [];

        folderList.push({ name: currentLvl.targetName, value: currentLvl.targetValue, type: 'key' });

        currentLvl.decoys.forEach(d => {
            folderList.push({ name: d, value: -1, type: 'decoy' });
        });

        const totalFolders = 120;
        const remaining = totalFolders - folderList.length;
        const hexChars = "0123456789ABCDEF";
        const prefixes = ["sys", "bin", "dat", "tmp", "log", "usr", "lib", "opt", "var", "etc"];
        
        for (let i = 0; i < remaining; i++) {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = Array(4).fill(0).map(() => hexChars[Math.floor(Math.random() * 16)]).join('');
            folderList.push({ name: `${prefix}_${suffix}`.toUpperCase(), value: 0, type: 'noise' });
        }

        setFolders(folderList.sort(() => Math.random() - 0.5));

    }, [currentDepth, unlocked]);

    const handleFolderClick = (folder) => {
        const CODE = [1, 6, 7, 4, 4];
        
        if (folder.value === CODE[currentDepth]) {
            const nextDepth = currentDepth + 1;
            if (nextDepth === CODE.length) {
                setUnlocked(true);
                setStatus("DECRYPTION COMPLETE.");
            } else {
                setCurrentDepth(nextDepth);
                setHistory(prev => [...prev, folder.name]);
                setStatus(`LAYER ${nextDepth} ACCESSED.`);
            }
        } else {
            setStatus("SYSTEM BREACH DETECTED. RESETTING...");
            setTimeout(() => {
                setCurrentDepth(0);
                setHistory(['C:', 'SYSTEM', 'ROOT']);
                setStatus("SYSTEM_READY");
            }, 500);
        }
    };

    const renderContent = () => {
        if (unlocked) {
            return (
                <div className="win-screen" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#FFD700', // Gold color
                    textAlign: 'center',
                    backgroundColor: '#000',
                    fontFamily: "'Press Start 2P', 'Courier New', monospace", // Fallback to Courier
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Confetti / Stars Background Effect (CSS) */}
                    <div className="stars-bg"></div>

                    <div className="trophy-ascii" style={{ 
                        whiteSpace: 'pre', 
                        fontSize: '12px', 
                        lineHeight: '12px',
                        marginBottom: '20px',
                        color: '#FFD700',
                        textShadow: '0 0 10px #FFD700'
                    }}>
{`
  ___________ 
 '._==_==_=_.'
 .-\:      /-.
| (|:.     |) |
 '-|:.     |-'
   \::.    /
    '::. .'
      ) (
    _.' '._
   \`""""""
`}
                    </div>

                    <h1 style={{ 
                        fontSize: '3rem', 
                        margin: '10px 0', 
                        color: '#fff',
                        textShadow: '4px 4px 0px #ff0000', // Retro shadow
                        animation: 'bounce 1s infinite alternate'
                    }}>
                        YOU WIN!
                    </h1>

                    <div style={{ 
                        border: '4px dashed #fff', 
                        padding: '15px 30px', 
                        margin: '20px 0',
                        backgroundColor: '#222'
                    }}>
                        <div style={{ color: '#00ff00', fontSize: '1.2rem', marginBottom: '5px' }}>SECRET CODE</div>
                        <div style={{ fontSize: '2.5rem', color: '#fff', letterSpacing: '5px' }}>16744</div>
                    </div>

                    <div style={{ fontSize: '1rem', color: '#00ffff', marginTop: '10px' }}>
                        PLAYER: TIMMY16744
                    </div>

                    <div style={{ 
                        marginTop: '30px', 
                        fontSize: '0.8rem', 
                        animation: 'blink 1s infinite',
                        color: '#aaa'
                    }}>
                        PRESS [ESC] TO EXIT
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Address Bar */}
                <div style={{ 
                    backgroundColor: '#002200', 
                    color: '#00ff00', 
                    padding: '5px 10px', 
                    fontFamily: 'monospace', 
                    borderBottom: '1px solid #004400',
                    fontSize: '0.9rem',
                    flexShrink: 0
                }}>
                    {history.join('\\')}\
                </div>

                {/* Folder Grid */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '10px', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    alignContent: 'flex-start', 
                    gap: '2px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                }}>
                    {folders.map((folder, i) => (
                        <div 
                            key={i}
                            onClick={() => handleFolderClick(folder)}
                            className="folder-item"
                            title={folder.name}
                            style={{
                                width: '80px',
                                height: '60px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#00aa00',
                                marginBottom: '10px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#003300';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#00aa00';
                            }}
                        >
                            <div style={{ fontSize: '2rem', lineHeight: '1' }}>📁</div>
                            <div style={{ 
                                width: '100%', 
                                textAlign: 'center', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                marginTop: '4px'
                            }}>
                                {folder.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Bar */}
                <div style={{ 
                    borderTop: '1px solid #004400', 
                    padding: '5px 10px', 
                    color: status.includes('BREACH') ? 'red' : '#004400',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    flexShrink: 0
                }}>
                    {status}
                </div>
            </div>
        );
    };

    return (
        <window.AppComponents.DraggableWindow
            id={id}
            title="SYSTEM_ROOT"
            onClose={onClose}
            isActive={isActive}
            onFocus={onFocus}
            initialSize={{ width: 800, height: 600 }}
            initialPosition={{ x: 50, y: 50 }}
        >
            <div style={{ 
                backgroundColor: '#000', 
                height: '100%', 
                color: '#0f0',
                fontFamily: 'Courier New, monospace'
            }}>
                {renderContent()}
            </div>
            <style>{`
                @keyframes bounce {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .folder-item:hover {
                    z-index: 10;
                }
            `}</style>
        </window.AppComponents.DraggableWindow>
    );
};