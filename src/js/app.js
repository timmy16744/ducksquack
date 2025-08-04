const App = () => {
    const [theme, setTheme] = React.useState('dark');
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
            <Terminal theme={themeVars} setTheme={setTheme} />
        </div>
    );
};

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

const Terminal = ({ theme, setTheme }) => {
    const [maximized, setMaximized] = React.useState(false);
    const [title, setTitle] = React.useState('Duck Quack');
    const [progressiveArticle, setProgressiveArticle] = React.useState(null);
    const [isProgressiveTyping, setIsProgressiveTyping] = React.useState(false);
    const [remainingTokens, setRemainingTokens] = React.useState(0);

    const handleClose = () => (window.location.href = 'https://github.com/timmy16744');
    const handleMinMax = () => {
        setMaximized(!maximized);
        document.querySelector('#field').focus();
    };

    return (
        <div id="terminal" style={maximized ? { height: '100vh', width: '100vw', maxWidth: '100vw' } : theme.terminal}>
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
                maximized={maximized}
                progressiveArticle={progressiveArticle}
                setProgressiveArticle={setProgressiveArticle}
                isProgressiveTyping={isProgressiveTyping}
                setIsProgressiveTyping={setIsProgressiveTyping}
                remainingTokens={remainingTokens}
                setRemainingTokens={setRemainingTokens}
            />
            
            {/* Progress overlay pinned to bottom of terminal frame */}
            {progressiveArticle && (
                <div className={`progress-overlay ${progressiveArticle.isComplete ? 'complete' : ''}`}>
                    {(() => {
                        const progress = progressiveArticle.totalTokens > 0 ? 
                            Math.round((progressiveArticle.loadedTokens / progressiveArticle.totalTokens) * 100) : 0;
                        const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
                        
                        if (isProgressiveTyping) {
                            return `[${progressBar}] ${progress}% | Loading article... ${remainingTokens} tokens remaining`;
                        } else if (progressiveArticle.isComplete) {
                            return `[✓] Article loaded - ${progressiveArticle.totalTokens} tokens`;
                        }
                        return '';
                    })()}
                </div>
            )}
        </div>
    );
};

const AnimatedDuck = () => {
    // Correctly escaped backslashes and backtick for JSX
    const duckArt = `
    __
___( o)>
\\ <_. )
 \`---'
`;
    const waterPattern = '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ';
    const [water, setWater] = React.useState('');

    React.useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            const start = i % (waterPattern.length / 2);
            setWater(waterPattern.substring(start, start + 23));
            i++;
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="duck-container">
            <div className="duck-bobbing">
                <div className="ascii-art duck">{duckArt}</div>
            </div>
            <div className="ascii-art water">{water}</div>
        </div>
    );
};

const AsciiNav = ({ handleNavClick, currentPage, writingsData, expandedMonths, setExpandedMonths }) => {
    const getNavLinkClass = (pageName) => {
        return `nav-tree-item nav-${pageName} ${currentPage === pageName ? 'active-nav-item' : ''}`;
    };

    // Function to determine color based on article content
    const getArticleColor = (article) => {
        const content = article.content.toLowerCase();
        const title = article.title.toLowerCase();
        
        // AI/Tech content - Blue
        if (content.includes('ai') || content.includes('china') || content.includes('technology') || 
            title.includes('ai') || content.includes('artificial intelligence')) {
            return '#7FDBFF'; // Sky Blue
        }
        
        // Art/Creative content - Purple
        if (content.includes('art') || content.includes('paint') || content.includes('creative') || 
            title.includes('art') || content.includes('impasto')) {
            return '#B10DC9'; // Purple
        }
        
        // Personal/Journey content - Green
        if (content.includes('journey') || content.includes('cricket') || content.includes('personal') || 
            title.includes('cricket') || content.includes('code')) {
            return '#2ECC40'; // Green
        }
        
        // Default - Yellow
        return '#FFDC00'; // Yellow
    };

    // Group articles by year and month
    const groupArticlesByDate = (articles) => {
        const grouped = {};
        
        articles.forEach((article, index) => {
            const date = new Date(article.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });
            
            if (!grouped[year]) {
                grouped[year] = {};
            }
            if (!grouped[year][month]) {
                grouped[year][month] = [];
            }
            
            grouped[year][month].push({ ...article, originalIndex: index });
        });
        
        return grouped;
    };

    const toggleMonth = (monthKey) => {
        const newExpanded = new Set(expandedMonths);
        if (newExpanded.has(monthKey)) {
            newExpanded.delete(monthKey);
        } else {
            newExpanded.add(monthKey);
        }
        setExpandedMonths(newExpanded);
    };

    if (!writingsData || writingsData.length === 0) {
        return (
            <div className="nav-tree">
                <div>/</div>
                <div>
                    <span>├── </span>
                    <span className={getNavLinkClass('about')} onClick={() => handleNavClick('about')}>about</span>
                </div>
                <div>
                    <span>├── </span>
                    <span className={getNavLinkClass('projects')} onClick={() => handleNavClick('projects')}>projects</span>
                </div>
                <div>
                    <span>├── </span>
                    <span className={getNavLinkClass('writings')} onClick={() => handleNavClick('writings')}>writings</span>
                </div>
                <div>
                    <span>└── </span>
                    <span className={getNavLinkClass('mode')} onClick={() => handleNavClick('mode cli')}>mode cli</span>
                </div>
            </div>
        );
    }

    const groupedArticles = groupArticlesByDate(writingsData);
    const years = Object.keys(groupedArticles).sort((a, b) => b - a); // Sort years descending

    return (
        <div className="nav-tree">
            <div>/</div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('about')} onClick={() => handleNavClick('about')}>about</span>
            </div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('projects')} onClick={() => handleNavClick('projects')}>projects</span>
            </div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('writings')} onClick={() => handleNavClick('writings')}>writings</span>
                {currentPage === 'writings' && (
                    <div style={{ marginLeft: '1rem' }}>
                        {years.map((year, yearIndex) => {
                            const months = Object.keys(groupedArticles[year]).sort((a, b) => {
                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                                  'July', 'August', 'September', 'October', 'November', 'December'];
                                return monthNames.indexOf(b) - monthNames.indexOf(a); // Most recent months first
                            });
                            
                            return (
                                <div key={year}>
                                    {months.map((month, monthIndex) => {
                                        const monthKey = `${year}-${month}`;
                                        const isExpanded = expandedMonths.has(monthKey);
                                        const articles = groupedArticles[year][month];
                                        const isLastMonth = yearIndex === years.length - 1 && monthIndex === months.length - 1;
                                        
                                        return (
                                            <div key={monthKey}>
                                                <div>
                                                    <span>{isLastMonth ? '└── ' : '├── '}</span>
                                                    <span 
                                                        className="nav-tree-item"
                                                        style={{ color: '#FFDC00', cursor: 'pointer' }}
                                                        onClick={() => toggleMonth(monthKey)}
                                                    >
                                                        {isExpanded ? '▼' : '▶'} {month} {year} ({articles.length})
                                                    </span>
                                                </div>
                                                {isExpanded && (
                                                    <div style={{ marginLeft: '1rem' }}>
                                                        {articles.map((article, articleIndex) => (
                                                            <div key={article.originalIndex}>
                                                                <span>{articleIndex === articles.length - 1 ? '└── ' : '├── '}</span>
                                                                <span 
                                                                    className="nav-tree-item"
                                                                    style={{ color: getArticleColor(article) }}
                                                                    onClick={() => handleNavClick(`writings article-${article.originalIndex}`)}
                                                                >
                                                                    {article.title}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div>
                <span>└── </span>
                <span className={getNavLinkClass('mode')} onClick={() => handleNavClick('mode cli')}>mode cli</span>
            </div>
        </div>
    );
};

// Initialize the app
ReactDOM.render(<App />, document.getElementById('root'));
