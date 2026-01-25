// XPNotepad.js - Main notepad window with state management

window.AppComponents = window.AppComponents || {};

window.AppComponents.XPNotepad = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [currentPost, setCurrentPost] = React.useState(null);
    const [isMaximized, setIsMaximized] = React.useState(false);
    const [isMinimized, setIsMinimized] = React.useState(false);

    // URL routing
    React.useEffect(() => {
        const handleRoute = () => {
            const path = window.location.pathname;

            if (path === '/' || path === '') {
                setCurrentPage('home');
                setCurrentPost(null);
            } else if (path === '/about' || path === '/about/') {
                setCurrentPage('about');
                setCurrentPost(null);
            } else if (path === '/writings' || path === '/writings/') {
                setCurrentPage('writings');
                setCurrentPost(null);
            } else if (path.startsWith('/writings/')) {
                // Individual post
                const slug = path.replace('/writings/', '').replace(/\/$/, '');
                const post = findPostBySlug(slug);
                if (post) {
                    setCurrentPage('post');
                    setCurrentPost(post);
                } else {
                    // Post not found, go to writings
                    setCurrentPage('writings');
                    setCurrentPost(null);
                }
            } else {
                setCurrentPage('home');
                setCurrentPost(null);
            }
        };

        // Handle initial route
        handleRoute();

        // Listen for popstate (back/forward)
        window.addEventListener('popstate', handleRoute);
        return () => window.removeEventListener('popstate', handleRoute);
    }, []);

    const createSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const findPostBySlug = (slug) => {
        if (!window.writingsData) return null;
        return window.writingsData.find(post => createSlug(post.title) === slug);
    };

    const navigate = (page, post = null) => {
        let url = '/';

        if (page === 'about') {
            url = '/about/';
        } else if (page === 'writings') {
            url = '/writings/';
        } else if (page === 'post' && post) {
            url = `/writings/${createSlug(post.title)}/`;
        }

        window.history.pushState({}, '', url);
        setCurrentPage(page);
        setCurrentPost(post);

        // Scroll content to top
        const contentArea = document.querySelector('.xp-content-area');
        if (contentArea) {
            contentArea.scrollTop = 0;
        }
    };

    const handleSelectPost = (post) => {
        navigate('post', post);
    };

    const getWindowTitle = () => {
        switch (currentPage) {
            case 'home':
                return 'DuckSquack - Home';
            case 'about':
                return 'DuckSquack - About';
            case 'writings':
                return 'DuckSquack - Writings';
            case 'post':
                return currentPost ? `DuckSquack - ${currentPost.title}` : 'DuckSquack';
            default:
                return 'DuckSquack';
        }
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        // In a full implementation, this would show in taskbar
    };

    const handleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const handleClose = () => {
        // Easter egg: show a "close" dialog or redirect
        if (window.confirm('Thanks for visiting DuckSquack! Close this window?')) {
            window.location.href = 'about:blank';
        }
    };

    if (isMinimized) {
        // Could show a taskbar button here
        return null;
    }

    return (
        <div className={`window xp-notepad-window ${isMaximized ? 'maximized' : ''}`}>
            <window.AppComponents.XPTitleBar
                title={getWindowTitle()}
                isMaximized={isMaximized}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                onClose={handleClose}
            />

            <window.AppComponents.XPNavBar
                currentPage={currentPage}
                onNavigate={navigate}
            />

            <div className="xp-content-area">
                <window.AppComponents.XPContent
                    currentPage={currentPage}
                    currentPost={currentPost}
                    onNavigate={navigate}
                    onSelectPost={handleSelectPost}
                />
            </div>

            <window.AppComponents.XPStatusBar
                currentPage={currentPage}
                currentPost={currentPost}
            />
        </div>
    );
};
