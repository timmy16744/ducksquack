// TabBar Component - Document tabs with close buttons
window.AppComponents = window.AppComponents || {};

window.AppComponents.TabBar = ({
    tabs = [],
    activeTabId,
    onTabClick,
    onTabClose,
    onNewTab
}) => {
    const tabBarRef = React.useRef(null);

    // Scroll active tab into view
    React.useEffect(() => {
        if (tabBarRef.current && activeTabId) {
            const activeTab = tabBarRef.current.querySelector('.tab.active');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
        }
    }, [activeTabId]);

    const handleMiddleClick = (e, tabId) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            onTabClose && onTabClose(tabId);
        }
    };

    return (
        <div className="tab-bar" ref={tabBarRef}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                    onClick={() => onTabClick && onTabClick(tab.id)}
                    onMouseDown={(e) => handleMiddleClick(e, tab.id)}
                    title={tab.title}
                >
                    {/* File type icon */}
                    <span style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        flexShrink: 0
                    }}>
                        {tab.isWelcome ? (
                            <span style={{ color: '#FFD700' }}>&#x1F986;</span>
                        ) : (
                            '📄'
                        )}
                    </span>

                    {/* Tab title */}
                    <span className="tab-title">
                        {tab.title}
                        {tab.isModified && <span style={{ color: 'red' }}>*</span>}
                    </span>

                    {/* Close button */}
                    {!tab.isWelcome && tabs.length > 1 && (
                        <span
                            className="tab-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabClose && onTabClose(tab.id);
                            }}
                            title="Close tab"
                        >
                            ×
                        </span>
                    )}
                </div>
            ))}

            {/* New tab button */}
            <div
                className="tab-add"
                onClick={onNewTab}
                title="Open file (Ctrl+O)"
            >
                +
            </div>
        </div>
    );
};
