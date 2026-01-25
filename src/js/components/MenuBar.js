// MenuBar Component - Windows 98 style menu bar with dropdowns
window.AppComponents = window.AppComponents || {};

window.AppComponents.MenuBar = ({
    onFileOpen,
    onFileSave,
    onFileSaveAs,
    onFind,
    onFindNext,
    onToggleWordWrap,
    onToggleStatusBar,
    onToggleTheme,
    onShowAbout,
    onShowSecrets,
    onShowKeyboardShortcuts,
    onOpenRecent,
    wordWrap = true,
    showStatusBar = true,
    theme = 'light',
    recentFiles = [],
    isMobileMenuOpen = false,
    onToggleMobileMenu
}) => {
    const [activeMenu, setActiveMenu] = React.useState(null);
    const menuRef = React.useRef(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleItemClick = (action) => {
        setActiveMenu(null);
        if (action) action();
    };

    const MenuItem = ({ label, shortcut, onClick, disabled, children, hasSubmenu }) => (
        <div
            className={`menu-dropdown-item ${disabled ? 'disabled' : ''} ${hasSubmenu ? 'menu-submenu' : ''}`}
            onClick={() => !disabled && !hasSubmenu && onClick && handleItemClick(onClick)}
        >
            <span>{label}</span>
            {shortcut && <span className="menu-shortcut">{shortcut}</span>}
            {children}
        </div>
    );

    const Separator = () => <div className="menu-separator"></div>;

    return (
        <div ref={menuRef} className={`menu-bar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* File Menu */}
            <div
                className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
                onClick={() => handleMenuClick('file')}
            >
                File
                {activeMenu === 'file' && (
                    <div className="menu-dropdown">
                        <MenuItem
                            label="Open..."
                            shortcut="Ctrl+O"
                            onClick={onFileOpen}
                        />
                        <div className="menu-dropdown-item menu-submenu">
                            <span>Open Recent</span>
                            <span style={{ marginLeft: 'auto' }}>&#9656;</span>
                            <div className="menu-submenu-content">
                                {recentFiles.length > 0 ? (
                                    recentFiles.map((file, index) => (
                                        <MenuItem
                                            key={index}
                                            label={file.title}
                                            onClick={() => onOpenRecent(file)}
                                        />
                                    ))
                                ) : (
                                    <MenuItem label="(No recent files)" disabled />
                                )}
                            </div>
                        </div>
                        <Separator />
                        <MenuItem
                            label="Save"
                            shortcut="Ctrl+S"
                            onClick={onFileSave}
                        />
                        <MenuItem
                            label="Save As..."
                            onClick={onFileSaveAs}
                        />
                        <Separator />
                        <MenuItem
                            label="Exit"
                            onClick={() => window.close()}
                            disabled
                        />
                    </div>
                )}
            </div>

            {/* Edit Menu */}
            <div
                className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
                onClick={() => handleMenuClick('edit')}
            >
                Edit
                {activeMenu === 'edit' && (
                    <div className="menu-dropdown">
                        <MenuItem
                            label="Copy"
                            shortcut="Ctrl+C"
                            onClick={() => document.execCommand('copy')}
                        />
                        <Separator />
                        <MenuItem
                            label="Find..."
                            shortcut="Ctrl+F"
                            onClick={onFind}
                        />
                        <MenuItem
                            label="Find Next"
                            shortcut="F3"
                            onClick={onFindNext}
                        />
                        <Separator />
                        <MenuItem
                            label="Select All"
                            shortcut="Ctrl+A"
                            onClick={() => {
                                const content = document.querySelector('.document-content');
                                if (content) {
                                    const range = document.createRange();
                                    range.selectNodeContents(content);
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Format Menu */}
            <div
                className={`menu-item ${activeMenu === 'format' ? 'active' : ''}`}
                onClick={() => handleMenuClick('format')}
            >
                Format
                {activeMenu === 'format' && (
                    <div className="menu-dropdown">
                        <MenuItem
                            label={`${wordWrap ? '✓ ' : '   '}Word Wrap`}
                            onClick={onToggleWordWrap}
                        />
                    </div>
                )}
            </div>

            {/* View Menu */}
            <div
                className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
                onClick={() => handleMenuClick('view')}
            >
                View
                {activeMenu === 'view' && (
                    <div className="menu-dropdown">
                        <MenuItem
                            label={`${showStatusBar ? '✓ ' : '   '}Status Bar`}
                            onClick={onToggleStatusBar}
                        />
                        <Separator />
                        <div className="menu-dropdown-item menu-submenu">
                            <span>Theme</span>
                            <span style={{ marginLeft: 'auto' }}>&#9656;</span>
                            <div className="menu-submenu-content">
                                <MenuItem
                                    label={`${theme === 'light' ? '● ' : '   '}Light`}
                                    onClick={() => onToggleTheme('light')}
                                />
                                <MenuItem
                                    label={`${theme === 'dark' ? '● ' : '   '}Dark`}
                                    onClick={() => onToggleTheme('dark')}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Help Menu */}
            <div
                className={`menu-item ${activeMenu === 'help' ? 'active' : ''}`}
                onClick={() => handleMenuClick('help')}
            >
                Help
                {activeMenu === 'help' && (
                    <div className="menu-dropdown">
                        <MenuItem
                            label="Keyboard Shortcuts"
                            onClick={onShowKeyboardShortcuts}
                        />
                        <Separator />
                        <MenuItem
                            label="The Secrets..."
                            onClick={onShowSecrets}
                        />
                        <Separator />
                        <MenuItem
                            label="About DuckSquack"
                            onClick={onShowAbout}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
