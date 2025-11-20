// Navigation Components (Menu & Tree)
window.AppComponents = window.AppComponents || {};

window.AppComponents.NavComponents = {};

// Recursive Tree Node
const TreeNode = ({ name, node, path, onOpen, level = 0 }) => {
    const [expanded, setExpanded] = React.useState(false);
    const isDir = node.type === 'dir';
    const padding = '  '.repeat(level);
    const prefix = isDir ? (expanded ? '[-] ' : '[+] ') : '    ';
    const icon = isDir ? '/' : '';

    const handleClick = (e) => {
        e.stopPropagation();
        if (isDir) {
            setExpanded(!expanded);
        } else {
            onOpen(path);
        }
    };

    let nodeColor = 'var(--text-primary)';
    if (isDir) {
        nodeColor = 'var(--tertiary)';
    } else if (node.meta && node.meta.color) {
        const colorMap = {
            blue: '#60A5FA',
            green: 'var(--success)',
            pink: 'var(--primary)',
            cyan: 'var(--tertiary)',
            red: '#F87171',
            purple: '#C084FC',
            yellow: 'var(--warning)'
        };
        nodeColor = colorMap[node.meta.color] || node.meta.color;
    }

    const isBlogPost = !isDir && node.meta && node.meta.date;

    return (
        <div className="tree-node" style={{ marginBottom: isBlogPost ? '10px' : '0' }}>
            {isBlogPost && (
                <div style={{ 
                    paddingLeft: `${level * 15 + 20}px`, // Indent date too
                    color: 'var(--text-muted)', 
                    fontSize: '0.75rem', 
                    marginBottom: '2px',
                    fontFamily: 'monospace'
                }}>
                    {node.meta.date}
                </div>
            )}
            <div 
                className={`tree-item ${isDir ? 'dir' : 'file'}`} 
                onClick={handleClick}
                style={{ 
                    paddingLeft: `${level * 15}px`,
                    cursor: 'pointer',
                    color: nodeColor,
                    fontFamily: 'monospace',
                    padding: '2px 0',
                    userSelect: 'none'
                }}
            >
                <span style={{ color: 'var(--text-muted)' }}>{isDir ? (expanded ? 'v ' : '> ') : '  '}</span>
                {name}{icon}
            </div>
            {isDir && expanded && (
                <div className="tree-children">
                    {Object.entries(node.children).map(([childName, childNode]) => (
                        <TreeNode 
                            key={childName}
                            name={childName}
                            node={childNode}
                            path={`${path}/${childName}`}
                            onOpen={onOpen}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// File System Tree View
window.AppComponents.NavComponents.FileSystemTree = ({ onOpen }) => {
    const root = window.FileSystem.structure.root;

    return (
        <div className="fs-tree-container" style={{
            width: '250px',
            height: '100%',
            backgroundColor: 'transparent', // Transparent to blend in
            borderRight: '1px solid var(--border)',
            padding: '10px',
            overflowY: 'auto',
            fontFamily: 'Google Sans Code, monospace',
            fontSize: '0.85rem',
            flexShrink: 0 // Prevent shrinking
        }}>
            <div style={{ 
                borderBottom: '1px dashed var(--border)', 
                marginBottom: '10px', 
                paddingBottom: '5px',
                color: 'var(--warning)',
                fontWeight: 'bold'
            }}>
                [ FILES ]
            </div>
            {Object.entries(root.children).map(([name, node]) => (
                <TreeNode 
                    key={name}
                    name={name}
                    node={node}
                    path={`/${name}`}
                    onOpen={onOpen}
                />
            ))}
        </div>
    );
};

// Top Menu Bar
window.AppComponents.NavComponents.MenuBar = ({ mode, setMode, onToggleTree, isTreeVisible }) => {
    return (
        <div className="menu-bar" style={{
            height: '30px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            justifyContent: 'space-between',
            fontFamily: 'Google Sans Code, monospace',
            fontSize: '0.85rem',
            zIndex: 50,
            position: 'relative',
            userSelect: 'none'
        }}>
            <div className="menu-left" style={{ display: 'flex', gap: '15px' }}>
                {mode === 'gui' && (
                    <div 
                        className="menu-item" 
                        onClick={onToggleTree}
                        style={{ 
                            cursor: 'pointer', 
                            color: isTreeVisible ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: isTreeVisible ? 'bold' : 'normal'
                        }}
                    >
                        [ FILES ]
                    </div>
                )}
            </div>

            <div className="menu-right">
                <div 
                    className="mode-switch" 
                    onClick={() => setMode(mode === 'cli' ? 'gui' : 'cli')}
                    style={{ 
                        cursor: 'pointer', 
                        color: mode === 'gui' ? 'var(--success)' : 'var(--text-muted)',
                        border: `1px solid ${mode === 'gui' ? 'var(--success)' : 'var(--border)'}`,
                        padding: '1px 6px',
                        borderRadius: '2px'
                    }}
                >
                    MODE: {mode.toUpperCase()}
                </div>
            </div>
        </div>
    );
};