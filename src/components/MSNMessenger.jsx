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
    <ellipse cx="10" cy="12" rx="8" ry="10" fill="url(#wingOrange)" transform="rotate(-15 10 12)"/>
    <ellipse cx="10" cy="12" rx="8" ry="10" fill="url(#wingShine)" transform="rotate(-15 10 12)"/>
    <ellipse cx="22" cy="12" rx="8" ry="10" fill="url(#wingGreen)" transform="rotate(15 22 12)"/>
    <ellipse cx="22" cy="12" rx="8" ry="10" fill="url(#wingShine)" transform="rotate(15 22 12)"/>
    <ellipse cx="16" cy="18" rx="2.5" ry="6" fill="url(#wingBlue)"/>
    <circle cx="16" cy="10" r="3" fill="url(#wingBlue)"/>
    <path d="M14.5 8Q12 4 9 5" stroke="#0078D4" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M17.5 8Q20 4 23 5" stroke="#0078D4" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <circle cx="9" cy="5" r="1" fill="#0078D4"/>
    <circle cx="23" cy="5" r="1" fill="#0078D4"/>
  </svg>
);

// Toolbar icons
const InviteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <circle cx="8" cy="7" r="3.5" fill="#4A90A4"/>
    <path d="M2 18c0-4 2.5-6 6-6s6 2 6 6" fill="#4A90A4"/>
    <circle cx="15" cy="9" r="2.5" fill="#7AB8CC"/>
    <path d="M11 18c0-3 2-4.5 4-4.5s4 1.5 4 4.5" fill="#7AB8CC"/>
    <path d="M17 4v5M14.5 6.5h5" stroke="#2E7D32" strokeWidth="1.8"/>
  </svg>
);

const SendFilesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <rect x="3" y="4" width="11" height="14" rx="1" fill="#F5D547" stroke="#B8941F" strokeWidth="0.5"/>
    <path d="M6 8h5M6 10.5h5M6 13h3" stroke="#8B7355" strokeWidth="1.2"/>
    <path d="M12 8l5-4v14l-5-4" fill="#4A90A4"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <rect x="2" y="6" width="12" height="10" rx="2" fill="#5C6BC0"/>
    <path d="M14 9l5-3v10l-5-3z" fill="#7986CB"/>
    <circle cx="8" cy="11" r="2" fill="#9FA8DA"/>
  </svg>
);

const VoiceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <ellipse cx="11" cy="8" rx="3" ry="5" fill="#666"/>
    <path d="M6 8c0 4 2.5 7 5 7s5-3 5-7" fill="none" stroke="#666" strokeWidth="1.5"/>
    <path d="M11 15v4M8 19h6" stroke="#666" strokeWidth="1.5"/>
  </svg>
);

const ActivitiesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="8" fill="none" stroke="#E65100" strokeWidth="2"/>
    <circle cx="11" cy="11" r="3" fill="#FFB74D"/>
    <path d="M11 3v2.5M11 15.5v2.5M3 11h2.5M15.5 11h2.5" stroke="#E65100" strokeWidth="1.5"/>
  </svg>
);

const GamesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22">
    <rect x="2" y="6" width="18" height="11" rx="3" fill="#5C6BC0"/>
    <circle cx="7" cy="11.5" r="2.5" fill="#303F9F"/>
    <rect x="13" y="9" width="5" height="5" rx="1" fill="#303F9F"/>
    <circle cx="7" cy="11.5" r="1.2" fill="#9FA8DA"/>
  </svg>
);

// Emoticon icons
const LetterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <text x="3" y="13" fontSize="12" fontWeight="bold" fill="#333" fontFamily="Times New Roman">A</text>
  </svg>
);

const EmoticonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6.5" fill="#FFD93D" stroke="#E6A800" strokeWidth="0.5"/>
    <circle cx="5.5" cy="6.5" r="1" fill="#333"/>
    <circle cx="10.5" cy="6.5" r="1" fill="#333"/>
    <path d="M4.5 10q3.5 2.5 7 0" fill="none" stroke="#333" strokeWidth="1"/>
  </svg>
);

const VoiceClipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <ellipse cx="8" cy="6" rx="2" ry="3.5" fill="#666"/>
    <path d="M4.5 6c0 3 1.5 4.5 3.5 4.5s3.5-1.5 3.5-4.5" fill="none" stroke="#666" strokeWidth="1"/>
    <path d="M8 10.5v2.5M6 13h4" stroke="#666" strokeWidth="1"/>
  </svg>
);

const WinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6.5" fill="#FFD93D" stroke="#E6A800" strokeWidth="0.5"/>
    <circle cx="5.5" cy="6.5" r="1" fill="#333"/>
    <path d="M9.5 5.5q1.5 1.5 0 2" fill="none" stroke="#333" strokeWidth="1"/>
    <path d="M4.5 10q3.5 2.5 7 0" fill="none" stroke="#333" strokeWidth="1"/>
  </svg>
);

const MountainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="1" y="3" width="14" height="10" fill="#87CEEB" stroke="#5B9BD5" strokeWidth="0.5"/>
    <path d="M1 13l5-6 3 3 4-5 2 2.5v5.5z" fill="#228B22"/>
    <circle cx="12" cy="5" r="1.5" fill="#FFD700"/>
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="2" y="6" width="12" height="8" fill="#FF6B6B" stroke="#CC5555" strokeWidth="0.5"/>
    <rect x="2" y="4" width="12" height="3" fill="#FFD93D"/>
    <rect x="7" y="4" width="2" height="10" fill="#FF4757"/>
    <path d="M5 4c0-2 3-2 3 0M8 4c0-2 3-2 3 0" stroke="#FF4757" strokeWidth="1" fill="none"/>
  </svg>
);

const NudgeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M3 8h10M5.5 5.5l-2.5 2.5 2.5 2.5M10.5 5.5l2.5 2.5-2.5 2.5" fill="none" stroke="#E65100" strokeWidth="1.5"/>
  </svg>
);

// Text formatting icons
const BoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <text x="4" y="12" fontSize="11" fontWeight="bold" fill="#333" fontFamily="Arial">B</text>
  </svg>
);

const ItalicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <text x="5" y="12" fontSize="11" fontStyle="italic" fill="#333" fontFamily="Times New Roman">I</text>
  </svg>
);

const UnderlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <text x="4" y="10" fontSize="10" fill="#333" fontFamily="Arial">U</text>
    <line x1="3" y1="13" x2="13" y2="13" stroke="#333" strokeWidth="1.5"/>
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

// Circular button component
const CircularButton = ({ onClick }) => (
  <button className="msn-circular-btn" onClick={onClick}>
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M4 6l4 4 4-4" fill="none" stroke="#4D5967" strokeWidth="2"/>
    </svg>
  </button>
);

export default function MSNMessenger({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textFormat, setTextFormat] = useState({ bold: false, italic: false, underline: false });
  const [isNudging, setIsNudging] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const windowRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const nudgeAudioRef = useRef(null);
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

  const handleNudge = () => {
    if (isNudging) return;
    setIsNudging(true);

    // Play nudge sound
    if (nudgeAudioRef.current) {
      nudgeAudioRef.current.currentTime = 0;
      nudgeAudioRef.current.play().catch(() => {});
    }

    // Stop nudge after animation
    setTimeout(() => setIsNudging(false), 800);
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
      className={`msn-window ${isNudging ? 'msn-nudging' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      {/* Nudge sound */}
      <audio ref={nudgeAudioRef} src="/sounds/nudge.mp3" preload="auto" />

      {/* Main Toolbar with MSN branding */}
      <div className="msn-main-toolbar" onMouseDown={handleMouseDown}>
        <div className="msn-toolbar-buttons">
          <CircularButton />
          <button className="msn-toolbar-btn">
            <InviteIcon />
            <span><u>I</u>nvite</span>
          </button>
          <button className="msn-toolbar-btn">
            <SendFilesIcon />
            <span>Send Fi<u>l</u>es</span>
          </button>
          <button className="msn-toolbar-btn">
            <VideoIcon />
            <span>Vide<u>o</u></span>
          </button>
          <button className="msn-toolbar-btn">
            <VoiceIcon />
            <span>Voi<u>c</u>e</span>
          </button>
          <button className="msn-toolbar-btn">
            <ActivitiesIcon />
            <span>Acti<u>v</u>ities</span>
          </button>
          <button className="msn-toolbar-btn">
            <GamesIcon />
            <span><u>G</u>ames</span>
          </button>
        </div>
        <div className="msn-toolbar-brand">
          <span className="msn-brand-text">msn</span>
          <MSNButterfly size={28} />
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

      {/* Remote User Area (Chat History + Avatar) */}
      <div className="msn-remote-user">
        <div className="msn-history-chat">
          <div className="msn-history-subject">
            To: <strong>Tim Hughes (tim@ducksquack.me)</strong>
          </div>
          <div className="msn-history-content">
            {/* Info Messages */}
            <div className="msn-info-line">
              <span className="msn-info-icon">ℹ️</span>
              <span>Tim may not reply immediately because he's probably writing essays or playing with his son.</span>
            </div>
            <div className="msn-warning-line">
              <span className="msn-warning-icon">⚠️</span>
              <span>Never give out your password or credit card number in an instant message conversation.</span>
            </div>

            {/* Chat Messages */}
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
        <div className="msn-avatar-container">
          <div className="msn-avatar-frame">
            <img
              src="/assets/tim-profile-small.jpg"
              alt="Tim Hughes"
              className="msn-avatar-image"
            />
          </div>
          <button className="msn-avatar-dropdown">▼</button>
          <div className="msn-avatar-expand">◀</div>
        </div>
      </div>

      {/* Local User Area (Input + Avatar) */}
      <div className="msn-local-user">
        <div className="msn-chat-input-container">
          {/* Action bar with emoticon buttons */}
          <div className="msn-action-bar">
            <button className="msn-action-btn" title="Font">
              <LetterIcon />
            </button>
            <div className="msn-emoji-container">
              <button
                className={`msn-action-btn msn-emoji-btn ${showEmojiPicker ? 'active' : ''}`}
                title="Emoticons"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <EmoticonIcon />
                <span className="msn-action-arrow">▼</span>
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
            <button className="msn-action-btn" title="Voice clip">
              <VoiceClipIcon />
              <span className="msn-action-label">Voice clip</span>
            </button>
            <button className="msn-action-btn" title="Wink" onClick={() => insertEmoji('😉')}>
              <WinkIcon />
              <span className="msn-action-arrow">▼</span>
            </button>
            <button className="msn-action-btn" title="Background">
              <MountainIcon />
              <span className="msn-action-arrow">▼</span>
            </button>
            <button className="msn-action-btn" title="Gift">
              <GiftIcon />
              <span className="msn-action-arrow">▼</span>
            </button>
            <button className="msn-action-btn" title="Nudge" onClick={handleNudge}>
              <NudgeIcon />
            </button>
          </div>

          {/* Message input area */}
          <div className="msn-message-area">
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
              <div className="msn-input-buttons">
                <button
                  type="submit"
                  className="msn-send-btn"
                  disabled={!message.trim() || status === 'sending'}
                >
                  <u>S</u>end
                </button>
                <button type="button" className="msn-search-btn">
                  Sea<u>r</u>ch
                </button>
              </div>
            </form>
          </div>

          {/* Tab bar */}
          <div className="msn-tab-bar">
            <div className="msn-format-buttons">
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
            </div>
            <div className="msn-tabs">
              <button className="msn-tab">🖌️</button>
              <button className="msn-tab msn-tab-active">✉️</button>
            </div>
          </div>
        </div>
        <div className="msn-avatar-container msn-avatar-local">
          <div className="msn-avatar-frame msn-avatar-frame-local">
            <div className="msn-local-avatar-placeholder">
              <MSNButterfly size={64} />
            </div>
          </div>
          <button className="msn-avatar-dropdown">▼</button>
          <div className="msn-avatar-expand">◀</div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="msn-status-bar">
        <MSNButterfly size={12} />
        <span className="msn-status-text">
          More content on <a href="https://ducksquack.me" target="_blank" rel="noopener noreferrer">ducksquack.me</a>
        </span>
      </div>

      {/* Decorative border frame */}
      <div className="msn-border-frame"></div>
    </div>
  );
}
