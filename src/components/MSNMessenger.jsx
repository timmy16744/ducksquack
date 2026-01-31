import React, { useState, useRef, useEffect } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreqlkwv';

// MSN Messenger butterfly logo
const MSNLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="msnOrange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFB347"/>
        <stop offset="100%" stopColor="#FF6B00"/>
      </linearGradient>
      <linearGradient id="msnBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5BC8F7"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
      <linearGradient id="msnGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7ED957"/>
        <stop offset="100%" stopColor="#38A800"/>
      </linearGradient>
    </defs>
    {/* Left wing */}
    <ellipse cx="8" cy="10" rx="6" ry="8" fill="url(#msnOrange)" transform="rotate(-20 8 10)"/>
    {/* Right wing */}
    <ellipse cx="16" cy="10" rx="6" ry="8" fill="url(#msnGreen)" transform="rotate(20 16 10)"/>
    {/* Body */}
    <ellipse cx="12" cy="14" rx="2" ry="4" fill="url(#msnBlue)"/>
    {/* Head */}
    <circle cx="12" cy="8" r="2.5" fill="url(#msnBlue)"/>
    {/* Antennae */}
    <path d="M11 6Q9 3 7 4" stroke="#0078D4" strokeWidth="1" fill="none"/>
    <path d="M13 6Q15 3 17 4" stroke="#0078D4" strokeWidth="1" fill="none"/>
  </svg>
);

// Small tray icon version
export const MSNTrayIcon = ({ hasUnread = false, onClick }) => (
  <div
    className="msn-tray-icon"
    onClick={onClick}
    title="MSN Messenger - Send Tim a message"
  >
    <MSNLogo size={18} />
    {hasUnread && <span className="msn-unread-dot" />}
  </div>
);

// Online status indicator
const OnlineIndicator = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" fill="#7ED957" stroke="#38A800" strokeWidth="1"/>
  </svg>
);

export default function MSNMessenger({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [chatHistory, setChatHistory] = useState([
    { type: 'system', text: 'You are now chatting with Tim Hughes' },
    { type: 'info', text: 'Tim may not reply immediately but will read your message!' }
  ]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const windowRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.msn-title-bar-controls')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 300)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { type: 'sent', text: userMessage }]);
    setStatus('sending');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          _subject: 'MSN Message from DuckSquack',
          type: 'msn_message'
        })
      });

      if (response.ok) {
        setStatus('idle');
        setChatHistory(prev => [...prev, {
          type: 'system',
          text: 'Message delivered!'
        }]);
      } else {
        throw new Error('Failed');
      }
    } catch {
      setStatus('error');
      setChatHistory(prev => [...prev, {
        type: 'error',
        text: 'Failed to send. Try again.'
      }]);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="msn-window"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'move' : 'default'
      }}
    >
      {/* Title Bar */}
      <div
        className="msn-title-bar"
        onMouseDown={handleMouseDown}
      >
        <div className="msn-title-bar-left">
          <MSNLogo size={16} />
          <span>Tim Hughes - Conversation</span>
        </div>
        <div className="msn-title-bar-controls">
          <button className="msn-btn-minimize" onClick={onClose}>
            <span>_</span>
          </button>
          <button className="msn-btn-maximize" disabled>
            <span>[]</span>
          </button>
          <button className="msn-btn-close" onClick={onClose}>
            <span>X</span>
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="msn-menu-bar">
        <span>File</span>
        <span>Edit</span>
        <span>Actions</span>
        <span>Tools</span>
        <span>Help</span>
      </div>

      {/* Contact Header */}
      <div className="msn-contact-header">
        <div className="msn-contact-avatar">
          <div className="msn-avatar-placeholder">TH</div>
        </div>
        <div className="msn-contact-info">
          <div className="msn-contact-name">
            <OnlineIndicator />
            <span>Tim Hughes</span>
            <span className="msn-contact-status">(Online)</span>
          </div>
          <div className="msn-contact-email">tim@ducksquack.me</div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="msn-chat-area">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`msn-message msn-message-${msg.type}`}>
            {msg.type === 'sent' && <span className="msn-msg-sender">You say:</span>}
            <span className="msn-msg-text">{msg.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="msn-input-area">
        <div className="msn-input-toolbar">
          <button title="Font">A</button>
          <button title="Emoticons">:)</button>
          <button title="Nudge">~</button>
        </div>
        <form onSubmit={handleSubmit} className="msn-input-form">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            disabled={status === 'sending'}
            rows={3}
          />
          <button
            type="submit"
            className="msn-send-btn"
            disabled={!message.trim() || status === 'sending'}
          >
            Send
          </button>
        </form>
      </div>

      {/* Status Bar */}
      <div className="msn-status-bar">
        <MSNLogo size={12} />
        <span>MSN Messenger</span>
      </div>
    </div>
  );
}
