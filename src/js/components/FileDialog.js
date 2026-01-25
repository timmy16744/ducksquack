// FileDialog Component - Windows 98 style file browser modal
window.AppComponents = window.AppComponents || {};

window.AppComponents.FileDialog = ({
    isOpen,
    onClose,
    onFileSelect,
    files = [],
    title = 'Open'
}) => {
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [currentPath, setCurrentPath] = React.useState('/writings');
    const listRef = React.useRef(null);

    // Reset selection when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter' && selectedFile) {
                onFileSelect(selectedFile);
                onClose();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = files.findIndex(f => f.file === selectedFile?.file);
                let newIndex;

                if (e.key === 'ArrowDown') {
                    newIndex = currentIndex < files.length - 1 ? currentIndex + 1 : 0;
                } else {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : files.length - 1;
                }

                setSelectedFile(files[newIndex]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedFile, files, onClose, onFileSelect]);

    if (!isOpen) return null;

    const handleDoubleClick = (file) => {
        onFileSelect(file);
        onClose();
    };

    const handleOpen = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
            onClose();
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Get color indicator style
    const getColorStyle = (color) => {
        const colors = {
            red: '#FF4136',
            blue: '#0074D9',
            green: '#2ECC40',
            pink: '#FF85A1',
            purple: '#B10DC9',
            cyan: '#7FDBFF',
            yellow: '#FFDC00',
            orange: '#FF851B'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog file-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div className="dialog-title-bar">
                    <span>{title}</span>
                    <button onClick={onClose}>×</button>
                </div>

                {/* Address bar */}
                <div className="file-dialog-address">
                    <label>Look in:</label>
                    <div className="file-dialog-address-bar">
                        <span>📁</span> {currentPath}
                    </div>
                </div>

                {/* File list */}
                <div className="file-dialog-list" ref={listRef}>
                    {files.map((file, index) => (
                        <div
                            key={file.file || index}
                            className={`file-dialog-item ${selectedFile?.file === file.file ? 'selected' : ''}`}
                            onClick={() => setSelectedFile(file)}
                            onDoubleClick={() => handleDoubleClick(file)}
                        >
                            <span className="file-dialog-item-icon">
                                {file.color && (
                                    <span style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: getColorStyle(file.color),
                                        marginRight: '4px'
                                    }}></span>
                                )}
                                📄
                            </span>
                            <span className="file-dialog-item-name">{file.title}</span>
                            <span className="file-dialog-item-date">
                                {formatDate(file.date)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* File name input (display only) */}
                <div className="file-dialog-address" style={{ borderBottom: 'none', borderTop: '1px solid var(--win98-dark)' }}>
                    <label>File name:</label>
                    <div className="file-dialog-address-bar" style={{ cursor: 'default' }}>
                        {selectedFile?.title || ''}
                    </div>
                </div>

                {/* Buttons */}
                <div className="dialog-buttons">
                    <button
                        className="btn-98 primary"
                        onClick={handleOpen}
                        disabled={!selectedFile}
                    >
                        Open
                    </button>
                    <button className="btn-98" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
