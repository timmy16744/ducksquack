import React, { useState, useEffect, useRef } from 'react';

export default function XPDialog({
  title,
  icon,
  width = 400,
  height = 300,
  onClose,
  children,
  footer
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef(null);
  const initialized = useRef(false);

  // Center dialog on mount
  useEffect(() => {
    if (!initialized.current) {
      const x = Math.max(0, (window.innerWidth - width) / 2);
      const y = Math.max(0, (window.innerHeight - height) / 2 - 50);
      setPosition({ x, y });
      initialized.current = true;
    }
  }, [width, height]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - height - 30, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, width, height]);

  const handleTitleBarMouseDown = (e) => {
    if (e.target.closest('.dialog-close-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="xp-dialog-overlay" onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className={`xp-dialog ${isDragging ? 'dragging' : ''}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        <div
          className="xp-dialog-titlebar"
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className="xp-dialog-title">
            {icon && <span className="xp-dialog-icon">{icon}</span>}
            <span>{title}</span>
          </div>
          <button
            className="dialog-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <span>×</span>
          </button>
        </div>
        <div className="xp-dialog-content">
          {children}
        </div>
        {footer && (
          <div className="xp-dialog-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
