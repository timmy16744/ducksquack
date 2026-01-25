// FindDialog Component - Search within document
window.AppComponents = window.AppComponents || {};

window.AppComponents.FindDialog = ({
    isOpen,
    onClose,
    onFind,
    onFindNext
}) => {
    const [searchText, setSearchText] = React.useState('');
    const [matchCase, setMatchCase] = React.useState(false);
    const [wholeWord, setWholeWord] = React.useState(false);
    const [searchDirection, setSearchDirection] = React.useState('down');
    const inputRef = React.useRef(null);

    // Focus input when dialog opens
    React.useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter') {
                handleFindNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, searchText, matchCase, wholeWord, searchDirection]);

    const handleFindNext = () => {
        if (searchText && onFind) {
            onFind({
                text: searchText,
                matchCase,
                wholeWord,
                direction: searchDirection
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog find-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div className="dialog-title-bar">
                    <span>Find</span>
                    <button onClick={onClose}>×</button>
                </div>

                {/* Content */}
                <div className="find-dialog-content">
                    {/* Search input */}
                    <div className="find-dialog-row">
                        <label htmlFor="find-input">Find what:</label>
                        <input
                            ref={inputRef}
                            id="find-input"
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Enter search text..."
                        />
                    </div>

                    {/* Options */}
                    <div className="find-dialog-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={matchCase}
                                onChange={(e) => setMatchCase(e.target.checked)}
                            />
                            Match case
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={wholeWord}
                                onChange={(e) => setWholeWord(e.target.checked)}
                            />
                            Whole word
                        </label>
                    </div>

                    {/* Direction */}
                    <fieldset style={{
                        border: '1px solid var(--win98-dark)',
                        padding: '8px',
                        margin: '8px 0'
                    }}>
                        <legend>Direction</legend>
                        <label style={{ marginRight: '16px' }}>
                            <input
                                type="radio"
                                name="direction"
                                checked={searchDirection === 'up'}
                                onChange={() => setSearchDirection('up')}
                            />
                            Up
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="direction"
                                checked={searchDirection === 'down'}
                                onChange={() => setSearchDirection('down')}
                            />
                            Down
                        </label>
                    </fieldset>
                </div>

                {/* Buttons */}
                <div className="dialog-buttons">
                    <button
                        className="btn-98 primary"
                        onClick={handleFindNext}
                        disabled={!searchText}
                    >
                        Find Next
                    </button>
                    <button className="btn-98" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
