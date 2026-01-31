import React, { useState, useRef, useEffect } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mreqlkwv';

// MSN Butterfly Logo
const MSNButterfly = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <defs>
      <linearGradient id="wingOrange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD93D"/>
        <stop offset="50%" stopColor="#FF9500"/>
        <stop offset="100%" stopColor="#FF6B00"/>
      </linearGradient>
      <linearGradient id="wingGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A8E063"/>
        <stop offset="50%" stopColor="#56AB2F"/>
        <stop offset="100%" stopColor="#2D7A0F"/>
      </linearGradient>
      <linearGradient id="wingBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#74D0F1"/>
        <stop offset="100%" stopColor="#0078D4"/>
      </linearGradient>
      <radialGradient id="wingShine" cx="30%" cy="30%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    {/* Left wing - orange */}
    <ellipse cx="10" cy="12" rx="8" ry="10" fill="url(#wingOrange)" transform="rotate(-15 10 12)"/>
    <ellipse cx="10" cy="12" rx="8" ry="10" fill="url(#wingShine)" transform="rotate(-15 10 12)"/>
    {/* Right wing - green */}
    <ellipse cx="22" cy="12" rx="8" ry="10" fill="url(#wingGreen)" transform="rotate(15 22 12)"/>
    <ellipse cx="22" cy="12" rx="8" ry="10" fill="url(#wingShine)" transform="rotate(15 22 12)"/>
    {/* Body */}
    <ellipse cx="16" cy="18" rx="2.5" ry="6" fill="url(#wingBlue)"/>
    {/* Head */}
    <circle cx="16" cy="10" r="3" fill="url(#wingBlue)"/>
    {/* Antennae */}
    <path d="M14.5 8Q12 4 9 5" stroke="#0078D4" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M17.5 8Q20 4 23 5" stroke="#0078D4" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <circle cx="9" cy="5" r="1" fill="#0078D4"/>
    <circle cx="23" cy="5" r="1" fill="#0078D4"/>
  </svg>
);

// Toolbar icons
const InviteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="8" cy="6" r="3" fill="#4A90A4"/>
    <path d="M3 16c0-3 2-5 5-5s5 2 5 5" fill="#4A90A4"/>
    <circle cx="14" cy="8" r="2" fill="#7AB8CC"/>
    <path d="M11 16c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" fill="#7AB8CC"/>
    <path d="M16 4v4M14 6h4" stroke="#2E7D32" strokeWidth="1.5"/>
  </svg>
);

const SendFilesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="3" y="4" width="10" height="12" rx="1" fill="#F5D547" stroke="#B8941F" strokeWidth="0.5"/>
    <path d="M6 8h4M6 10h4M6 12h2" stroke="#8B7355" strokeWidth="1"/>
    <path d="M11 7l4-3v12l-4-3" fill="#4A90A4"/>
  </svg>
);

const VoiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <ellipse cx="10" cy="8" rx="3" ry="5" fill="#666"/>
    <path d="M5 8c0 4 2.5 6 5 6s5-2 5-6" fill="none" stroke="#666" strokeWidth="1.5"/>
    <path d="M10 14v3M7 17h6" stroke="#666" strokeWidth="1.5"/>
  </svg>
);

const ActivitiesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="none" stroke="#E65100" strokeWidth="2"/>
    <circle cx="10" cy="10" r="3" fill="#FFB74D"/>
    <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="#E65100" strokeWidth="1.5"/>
  </svg>
);

const GamesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="2" y="6" width="16" height="10" rx="3" fill="#5C6BC0"/>
    <circle cx="6" cy="11" r="2" fill="#303F9F"/>
    <rect x="12" y="9" width="4" height="4" rx="1" fill="#303F9F"/>
    <circle cx="6" cy="11" r="1" fill="#9FA8DA"/>
  </svg>
);

// Info icon
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14">
    <circle cx="7" cy="7" r="6" fill="#3B7BBE" stroke="#2557A3" strokeWidth="0.5"/>
    <text x="7" y="11" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">i</text>
  </svg>
);

// Warning icon
const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14">
    <path d="M7 1L13 12H1L7 1Z" fill="#FFD93D" stroke="#C9A400" strokeWidth="0.5"/>
    <text x="7" y="10" textAnchor="middle" fill="#5D4E00" fontSize="8" fontWeight="bold">!</text>
  </svg>
);

// Format toolbar icons
const FontIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="4" y="14" fontSize="14" fontWeight="bold" fill="#333" fontFamily="Times New Roman">A</text>
  </svg>
);

const EmoticonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="7" fill="#FFD93D" stroke="#E6A800" strokeWidth="0.5"/>
    <circle cx="6" cy="7" r="1" fill="#333"/>
    <circle cx="12" cy="7" r="1" fill="#333"/>
    <path d="M5 11q4 3 8 0" fill="none" stroke="#333" strokeWidth="1"/>
  </svg>
);

const WinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="7" fill="#FFD93D" stroke="#E6A800" strokeWidth="0.5"/>
    <circle cx="6" cy="7" r="1" fill="#333"/>
    <path d="M11 6q2 2 0 2" fill="none" stroke="#333" strokeWidth="1"/>
    <path d="M5 11q4 3 8 0" fill="none" stroke="#333" strokeWidth="1"/>
  </svg>
);

const NudgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M4 9h10M7 6l-3 3 3 3M11 6l3 3-3 3" fill="none" stroke="#E65100" strokeWidth="1.5"/>
  </svg>
);

// Text formatting icons
const BoldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="5" y="14" fontSize="13" fontWeight="bold" fill="#333" fontFamily="Arial">B</text>
  </svg>
);

const ItalicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="6" y="14" fontSize="13" fontStyle="italic" fill="#333" fontFamily="Times New Roman">I</text>
  </svg>
);

const UnderlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <text x="5" y="12" fontSize="12" fill="#333" fontFamily="Arial">U</text>
    <line x1="4" y1="15" x2="14" y2="15" stroke="#333" strokeWidth="1.5"/>
  </svg>
);

// MSN-style emoticons
const MSN_EMOTICONS = [
  { emoji: '😊', code: ':)' },
  { emoji: '😃', code: ':D' },
  { emoji: '😉', code: ';)' },
  { emoji: '😛', code: ':P' },
  { emoji: '😢', code: ':(' },
  { emoji: '😮', code: ':O' },
  { emoji: '😎', code: '8)' },
  { emoji: '😇', code: '(A)' },
  { emoji: '😈', code: '(6)' },
  { emoji: '🤔', code: ':/' },
  { emoji: '😐', code: ':|' },
  { emoji: '😍', code: '(L)' },
  { emoji: '💔', code: '(U)' },
  { emoji: '🌹', code: '(F)' },
  { emoji: '🌟', code: '(*)' },
  { emoji: '☀️', code: '(#)' },
  { emoji: '🎵', code: '(8)' },
  { emoji: '📧', code: '(E)' },
  { emoji: '☕', code: '(C)' },
  { emoji: '🎂', code: '(^)' },
  { emoji: '🍺', code: '(B)' },
  { emoji: '📞', code: '(T)' },
  { emoji: '💤', code: '(I)' },
  { emoji: '👍', code: '(Y)' },
];

export default function MSNMessenger({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textFormat, setTextFormat] = useState({ bold: false, italic: false, underline: false });
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const windowRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [position, setPosition] = useState({ x: 80, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleMouseUp = () => setIsDragging(false);

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) &&
          !e.target.closest('.msn-emoji-btn')) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const toggleFormat = (format) => {
    setTextFormat(prev => ({ ...prev, [format]: !prev[format] }));
  };

  const getTextareaStyle = () => {
    return {
      fontWeight: textFormat.bold ? 'bold' : 'normal',
      fontStyle: textFormat.italic ? 'italic' : 'normal',
      textDecoration: textFormat.underline ? 'underline' : 'none',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;

    const userMessage = message.trim();
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const messageFormat = { ...textFormat };
    setMessage('');
    setChatHistory(prev => [...prev, { type: 'sent', text: userMessage, time: timestamp, format: messageFormat }]);
    setStatus('sending');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          _subject: 'MSN Message from DuckSquack',
          type: 'msn_message'
        })
      });

      if (response.ok) {
        setStatus('idle');
      } else {
        throw new Error('Failed');
      }
    } catch {
      setStatus('error');
      setChatHistory(prev => [...prev, { type: 'error', text: 'Message failed to send. Please try again.' }]);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="msn-window"
      style={{ left: position.x, top: position.y }}
    >
      {/* Title Bar - Dark Blue Gradient */}
      <div className="msn-title-bar" onMouseDown={handleMouseDown}>
        <div className="msn-title-bar-left">
          <MSNButterfly size={18} />
          <span className="msn-title-text">Tim Hughes - Conversation</span>
        </div>
        <div className="msn-title-bar-right">
          <span className="msn-brand">msn</span>
          <MSNButterfly size={24} />
        </div>
        <div className="msn-title-bar-controls">
          <button aria-label="Minimize" onClick={onClose}>
            <span className="msn-ctrl-minimize"></span>
          </button>
          <button aria-label="Maximize" disabled>
            <span className="msn-ctrl-maximize"></span>
          </button>
          <button aria-label="Close" onClick={onClose}>
            <span className="msn-ctrl-close">×</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="msn-toolbar">
        <button className="msn-toolbar-btn">
          <InviteIcon />
          <span>Invite</span>
        </button>
        <button className="msn-toolbar-btn">
          <SendFilesIcon />
          <span>Send Files</span>
        </button>
        <button className="msn-toolbar-btn">
          <VoiceIcon />
          <span>Voice</span>
        </button>
        <button className="msn-toolbar-btn">
          <ActivitiesIcon />
          <span>Activities</span>
        </button>
        <button className="msn-toolbar-btn">
          <GamesIcon />
          <span>Games</span>
        </button>
      </div>

      {/* To: Line */}
      <div className="msn-to-line">
        <span className="msn-to-label">To:</span>
        <span className="msn-to-recipient">Tim Hughes &lt;tim@ducksquack.me&gt;</span>
      </div>

      {/* Main Content Area */}
      <div className="msn-content-area">
        {/* Chat Panel */}
        <div className="msn-chat-panel">
          {/* Info Messages */}
          <div className="msn-info-box msn-info-status">
            <InfoIcon />
            <span>Tim may not reply immediately because he's probably writing essays or playing with his son.</span>
          </div>
          <div className="msn-info-box msn-info-warning">
            <WarningIcon />
            <span>Never give out your password or credit card number in an instant message conversation.</span>
          </div>

          {/* Chat Messages */}
          <div className="msn-messages">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`msn-msg msn-msg-${msg.type}`}>
                {msg.type === 'sent' && (
                  <>
                    <span className="msn-msg-sender">You say:</span>
                    <span
                      className="msn-msg-text"
                      style={{
                        fontWeight: msg.format?.bold ? 'bold' : 'normal',
                        fontStyle: msg.format?.italic ? 'italic' : 'normal',
                        textDecoration: msg.format?.underline ? 'underline' : 'none',
                      }}
                    >
                      {msg.text}
                    </span>
                    <span className="msn-msg-time">({msg.time})</span>
                  </>
                )}
                {msg.type === 'error' && (
                  <span className="msn-msg-error">{msg.text}</span>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Buddy Display Picture */}
        <div className="msn-buddy-panel">
          <div className="msn-buddy-dp">
            <div className="msn-dp-frame">
              <img
                src="/assets/tim-profile-small.jpg"
                alt="Tim Hughes"
                className="msn-dp-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="msn-input-area">
        {/* Format Toolbar */}
        <div className="msn-format-toolbar">
          <button
            className={`msn-format-btn ${textFormat.bold ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
            onClick={() => toggleFormat('bold')}
          >
            <BoldIcon />
          </button>
          <button
            className={`msn-format-btn ${textFormat.italic ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
            onClick={() => toggleFormat('italic')}
          >
            <ItalicIcon />
          </button>
          <button
            className={`msn-format-btn ${textFormat.underline ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
            onClick={() => toggleFormat('underline')}
          >
            <UnderlineIcon />
          </button>
          <div className="msn-format-separator" />
          <div className="msn-emoji-container">
            <button
              className={`msn-format-btn msn-emoji-btn ${showEmojiPicker ? 'active' : ''}`}
              title="Emoticons"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <EmoticonIcon />
              <span className="msn-format-dropdown">▼</span>
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="msn-emoji-picker">
                <div className="msn-emoji-grid">
                  {MSN_EMOTICONS.map((item, i) => (
                    <button
                      key={i}
                      className="msn-emoji-item"
                      onClick={() => insertEmoji(item.emoji)}
                      title={item.code}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="msn-format-separator" />
          <button className="msn-format-btn" title="Send a wink ;)" onClick={() => insertEmoji('😉')}>
            <WinkIcon />
          </button>
          <button className="msn-format-btn" title="Send a nudge" onClick={() => insertEmoji('👋')}>
            <NudgeIcon />
          </button>
        </div>

        {/* Message Input */}
        <div className="msn-message-input">
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
                // Keyboard shortcuts for formatting
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') { e.preventDefault(); toggleFormat('bold'); }
                  if (e.key === 'i') { e.preventDefault(); toggleFormat('italic'); }
                  if (e.key === 'u') { e.preventDefault(); toggleFormat('underline'); }
                }
              }}
              placeholder=""
              disabled={status === 'sending'}
              rows={3}
              style={getTextareaStyle()}
            />
            <div className="msn-input-side">
              <button
                type="submit"
                className="msn-send-btn"
                disabled={!message.trim() || status === 'sending'}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Status Bar */}
      <div className="msn-status-bar">
        <div className="msn-status-left">
          <MSNButterfly size={14} />
        </div>
        <div className="msn-status-right">
          <span className="msn-font-indicator">A</span>
        </div>
      </div>
    </div>
  );
}
