// Notepad Component - Main container with state management
window.AppComponents = window.AppComponents || {};

// Generate unique tab IDs
let tabIdCounter = 0;
const generateTabId = () => `tab-${++tabIdCounter}`;

// Welcome tab content
const WELCOME_TAB = {
    id: 'welcome',
    title: 'Welcome',
    isWelcome: true,
    content: '',
    meta: {}
};

window.AppComponents.Notepad = ({ theme, setTheme }) => {
    // Tab state
    const [tabs, setTabs] = React.useState([WELCOME_TAB]);
    const [activeTabId, setActiveTabId] = React.useState('welcome');

    // Window state
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Settings
    const [wordWrap, setWordWrap] = React.useState(true);
    const [showStatusBar, setShowStatusBar] = React.useState(true);

    // Dialog state
    const [showFileDialog, setShowFileDialog] = React.useState(false);
    const [showAboutDialog, setShowAboutDialog] = React.useState(false);
    const [showFindDialog, setShowFindDialog] = React.useState(false);
    const [showSecretsDialog, setShowSecretsDialog] = React.useState(false);
    const [showShortcutsDialog, setShowShortcutsDialog] = React.useState(false);

    // Search state
    const [lastSearch, setLastSearch] = React.useState(null);

    // Get files from writingsData
    const files = React.useMemo(() => {
        if (window.writingsData) {
            return window.writingsData.map(post => ({
                title: post.title,
                date: post.date,
                color: post.color,
                file: post.file,
                content: post.content
            }));
        }
        return [];
    }, []);

    // Get current tab
    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    // Word count for current document
    const wordCount = React.useMemo(() => {
        if (!activeTab || activeTab.isWelcome) return 0;
        const text = (activeTab.content || '').replace(/^---[\s\S]*?---\s*/m, '');
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, [activeTab]);

    // URL routing - handle deep links
    React.useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;
            const match = path.match(/\/writings\/([^/]+)\/?$/);

            if (match) {
                const slug = match[1];
                const file = files.find(f => {
                    const fileSlug = f.file.replace('.md', '');
                    return fileSlug === slug;
                });

                if (file) {
                    openFile(file);
                }
            }
        };

        handleRoute();
        window.addEventListener('popstate', handleRoute);
        return () => window.removeEventListener('popstate', handleRoute);
    }, [files]);

    // Update URL when tab changes
    React.useEffect(() => {
        if (activeTab && !activeTab.isWelcome && activeTab.meta?.file) {
            const slug = activeTab.meta.file.replace('.md', '');
            const newUrl = `/writings/${slug}/`;
            if (window.location.pathname !== newUrl) {
                window.history.pushState({}, '', newUrl);
            }
        } else if (activeTab?.isWelcome) {
            if (window.location.pathname !== '/') {
                window.history.pushState({}, '', '/');
            }
        }
    }, [activeTabId, activeTab]);

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't capture if in input field (except our dialogs)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            // Ctrl+O - Open file dialog
            if (modKey && e.key === 'o') {
                e.preventDefault();
                setShowFileDialog(true);
            }
            // Ctrl+W - Close tab
            else if (modKey && e.key === 'w') {
                e.preventDefault();
                closeTab(activeTabId);
            }
            // Ctrl+Tab - Next tab
            else if (modKey && e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                switchToNextTab();
            }
            // Ctrl+Shift+Tab - Previous tab
            else if (modKey && e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                switchToPrevTab();
            }
            // Ctrl+F - Find
            else if (modKey && e.key === 'f') {
                e.preventDefault();
                setShowFindDialog(true);
            }
            // F3 - Find next
            else if (e.key === 'F3') {
                e.preventDefault();
                if (lastSearch) {
                    performSearch(lastSearch);
                } else {
                    setShowFindDialog(true);
                }
            }
            // Ctrl+S - Save (copy link)
            else if (modKey && e.key === 's') {
                e.preventDefault();
                copyShareableLink();
            }
            // F11 - Toggle fullscreen
            else if (e.key === 'F11') {
                e.preventDefault();
                setIsMaximized(!isMaximized);
            }
            // Ctrl+1-9 - Switch to tab by number
            else if (modKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                if (tabs[tabIndex]) {
                    setActiveTabId(tabs[tabIndex].id);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [activeTabId, tabs, lastSearch, isMaximized]);

    // Open a file in a new tab or switch to existing tab
    const openFile = (file) => {
        // Check if already open
        const existingTab = tabs.find(t => t.meta?.file === file.file);
        if (existingTab) {
            setActiveTabId(existingTab.id);
            return;
        }

        // Create new tab
        const newTab = {
            id: generateTabId(),
            title: file.title,
            content: file.content,
            meta: {
                file: file.file,
                date: file.date,
                color: file.color
            },
            scrollPosition: 0
        };

        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
    };

    // Close a tab
    const closeTab = (tabId) => {
        if (tabs.length <= 1) return; // Don't close last tab

        const tabIndex = tabs.findIndex(t => t.id === tabId);
        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        // If closing active tab, switch to adjacent tab
        if (activeTabId === tabId) {
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            setActiveTabId(newTabs[newIndex].id);
        }
    };

    // Switch to next/prev tab
    const switchToNextTab = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTabId(tabs[nextIndex].id);
    };

    const switchToPrevTab = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTabId(tabs[prevIndex].id);
    };

    // Copy shareable link
    const copyShareableLink = () => {
        if (activeTab && !activeTab.isWelcome && activeTab.meta?.file) {
            const slug = activeTab.meta.file.replace('.md', '');
            const url = `${window.location.origin}/writings/${slug}/`;
            navigator.clipboard.writeText(url).then(() => {
                // Could show a toast notification here
                console.log('Link copied:', url);
            });
        }
    };

    // Perform search in document
    const performSearch = (searchParams) => {
        setLastSearch(searchParams);

        const documentContent = document.querySelector('.document-content');
        if (!documentContent) return;

        const text = searchParams.text;
        const content = documentContent.innerText;

        let searchText = text;
        let contentText = content;

        if (!searchParams.matchCase) {
            searchText = searchText.toLowerCase();
            contentText = contentText.toLowerCase();
        }

        // Simple highlight approach using window.find
        if (window.find) {
            window.find(text, searchParams.matchCase, searchParams.direction === 'up');
        }
    };

    // Update scroll position for tab
    const handleScroll = (scrollPos) => {
        setTabs(tabs.map(t =>
            t.id === activeTabId ? { ...t, scrollPosition: scrollPos } : t
        ));
    };

    // Toggle theme
    const handleToggleTheme = (newTheme) => {
        setTheme(newTheme);
    };

    // Generate window title
    const windowTitle = activeTab
        ? `${activeTab.title} - DuckSquack`
        : 'DuckSquack';

    return (
        <div className={`notepad-app ${isMaximized ? 'maximized' : ''}`}>
            <window.AppComponents.NotepadWindow
                title={windowTitle}
                isMaximized={isMaximized}
                onMaximizeToggle={() => setIsMaximized(!isMaximized)}
                onMinimize={() => {}}
                theme={theme}
            >
                {/* Mobile menu toggle (shown only on mobile) */}
                <div
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ position: 'absolute', top: '2px', left: '24px', zIndex: 100 }}
                >
                    ☰
                </div>

                {/* Menu Bar */}
                <window.AppComponents.MenuBar
                    onFileOpen={() => setShowFileDialog(true)}
                    onFileSave={copyShareableLink}
                    onFileSaveAs={() => {
                        // Download as .txt
                        if (activeTab && activeTab.content) {
                            const blob = new Blob([activeTab.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = activeTab.meta?.file || 'document.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    }}
                    onFind={() => setShowFindDialog(true)}
                    onFindNext={() => lastSearch && performSearch(lastSearch)}
                    onToggleWordWrap={() => setWordWrap(!wordWrap)}
                    onToggleStatusBar={() => setShowStatusBar(!showStatusBar)}
                    onToggleTheme={handleToggleTheme}
                    onShowAbout={() => setShowAboutDialog(true)}
                    onShowSecrets={() => setShowSecretsDialog(true)}
                    onShowKeyboardShortcuts={() => setShowShortcutsDialog(true)}
                    onOpenRecent={openFile}
                    wordWrap={wordWrap}
                    showStatusBar={showStatusBar}
                    theme={theme}
                    recentFiles={files}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                {/* Tab Bar */}
                <window.AppComponents.TabBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabClick={setActiveTabId}
                    onTabClose={closeTab}
                    onNewTab={() => setShowFileDialog(true)}
                />

                {/* Document Area */}
                <window.AppComponents.DocumentArea
                    content={activeTab?.content || ''}
                    title={activeTab?.isWelcome ? '' : activeTab?.title}
                    meta={activeTab?.meta || {}}
                    wordWrap={wordWrap}
                    onScroll={handleScroll}
                    scrollPosition={activeTab?.scrollPosition || 0}
                    isWelcome={activeTab?.isWelcome}
                />

                {/* Status Bar */}
                <window.AppComponents.StatusBar
                    visible={showStatusBar}
                    wordCount={wordCount}
                    documentName={activeTab?.title || ''}
                />
            </window.AppComponents.NotepadWindow>

            {/* Dialogs */}
            <window.AppComponents.FileDialog
                isOpen={showFileDialog}
                onClose={() => setShowFileDialog(false)}
                onFileSelect={openFile}
                files={files}
            />

            <window.AppComponents.AboutDialog
                isOpen={showAboutDialog}
                onClose={() => setShowAboutDialog(false)}
            />

            <window.AppComponents.FindDialog
                isOpen={showFindDialog}
                onClose={() => setShowFindDialog(false)}
                onFind={performSearch}
            />

            <window.AppComponents.KeyboardShortcutsDialog
                isOpen={showShortcutsDialog}
                onClose={() => setShowShortcutsDialog(false)}
            />

            {/* Secrets Maze */}
            {showSecretsDialog && (
                <window.AppComponents.SecretsMaze
                    id="secrets-window"
                    onClose={() => setShowSecretsDialog(false)}
                    isActive={true}
                    onFocus={() => {}}
                />
            )}
        </div>
    );
};
