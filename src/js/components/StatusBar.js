// StatusBar Component - Line count, word count, and duck personality messages
window.AppComponents = window.AppComponents || {};

// Duck personality messages
const DUCK_MESSAGES = [
    "quack!",
    "floating along...",
    "bread would be nice",
    "*splashes contentedly*",
    "duck thoughts...",
    "pondering existence",
    "waterfowl wisdom loading...",
    "preening feathers",
    "looking for crumbs",
    "happy duck noises",
    "exploring the pond",
    "just vibing",
    "*contented quack*",
    "duck.exe running",
    "feathers: optimal",
    "waddle mode: engaged"
];

window.AppComponents.StatusBar = ({
    visible = true,
    lineCount = 0,
    wordCount = 0,
    charCount = 0,
    currentLine = 1,
    currentColumn = 1,
    documentName = ''
}) => {
    const [duckMessage, setDuckMessage] = React.useState('');

    // Rotate duck messages periodically
    React.useEffect(() => {
        const updateMessage = () => {
            const randomMessage = DUCK_MESSAGES[Math.floor(Math.random() * DUCK_MESSAGES.length)];
            setDuckMessage(randomMessage);
        };

        updateMessage();
        const interval = setInterval(updateMessage, 15000); // Change every 15 seconds

        return () => clearInterval(interval);
    }, []);

    if (!visible) return null;

    return (
        <div className="status-bar">
            {/* Left section - Duck message */}
            <div className="status-bar-section status-message">
                <span className="status-duck-message">
                    &#x1F986; {duckMessage}
                </span>
            </div>

            {/* Middle section - Document info */}
            <div className="status-bar-section sunken">
                {wordCount > 0 && (
                    <span>{wordCount.toLocaleString()} words</span>
                )}
            </div>

            {/* Right section - Position */}
            <div className="status-bar-section sunken">
                <span>Ln {currentLine}, Col {currentColumn}</span>
            </div>
        </div>
    );
};
