// XPStatusBar.js - Simple status bar

window.AppComponents = window.AppComponents || {};

window.AppComponents.XPStatusBar = ({ currentPage, currentPost }) => {
    const getStatusText = () => {
        switch (currentPage) {
            case 'home':
                return 'Welcome to DuckSquack';
            case 'about':
                return 'About Tim Hughes';
            case 'writings':
                return `${window.writingsData ? window.writingsData.length : 0} writings`;
            case 'post':
                return currentPost ? currentPost.title : 'Reading...';
            default:
                return 'Ready';
        }
    };

    const getLineCol = () => {
        // Could track actual cursor position in future
        return 'Ln 1, Col 1';
    };

    return (
        <div className="xp-status-bar">
            <div className="status-left">
                {getStatusText()}
            </div>
            <div className="status-right">
                <span>{getLineCol()}</span>
            </div>
        </div>
    );
};
