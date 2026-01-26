import React, { useState } from 'react';

// Mail icon for the input
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="mailBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFE" />
        <stop offset="100%" stopColor="#E8E4D8" />
      </linearGradient>
    </defs>
    <rect x="1" y="3" width="14" height="10" rx="1" fill="url(#mailBody)" stroke="#7A97B8" strokeWidth="0.5" />
    <path d="M1 4L8 9L15 4" fill="none" stroke="#5878A0" strokeWidth="1" />
    <path d="M1 13L6 8M15 13L10 8" fill="none" stroke="#8898A8" strokeWidth="0.5" />
  </svg>
);

// Comment icon for essays
const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="commentBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFE" />
        <stop offset="100%" stopColor="#E8E4D8" />
      </linearGradient>
    </defs>
    <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3v-3a1 1 0 01-1-1V3a1 1 0 011-1z" fill="url(#commentBody)" stroke="#7A97B8" strokeWidth="0.5" />
    <line x1="4" y1="5" x2="12" y2="5" stroke="#5878A0" strokeWidth="0.75" />
    <line x1="4" y1="7.5" x2="10" y2="7.5" stroke="#5878A0" strokeWidth="0.75" />
    <line x1="4" y1="10" x2="8" y2="10" stroke="#5878A0" strokeWidth="0.75" />
  </svg>
);

// Replace with your Formspree form ID from https://formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwpewgvn';

export default function XPCommentBar({ currentPage, currentPost }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, sent, error
  const [statusMessage, setStatusMessage] = useState('');

  const isEssayView = currentPage === 'post' && currentPost;
  const placeholder = isEssayView
    ? `Reply to "${currentPost.title}"...`
    : 'Send a quick message to Tim...';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setStatus('sending');
    setStatusMessage('Sending...');

    try {
      const formData = {
        message: message.trim(),
        _subject: isEssayView
          ? `DuckSquack Reply: ${currentPost.title}`
          : 'DuckSquack Contact Message',
      };

      if (isEssayView) {
        formData.essay_title = currentPost.title;
        formData.essay_slug = currentPost.slug;
        formData.type = 'essay_reply';
      } else {
        formData.type = 'contact';
        formData.page = currentPage;
      }

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('sent');
        setStatusMessage('Message sent!');
        setMessage('');
        setTimeout(() => {
          setStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Failed to send. Try again.');
      setTimeout(() => {
        setStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="xp-comment-bar">
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-icon">
          {isEssayView ? <CommentIcon /> : <MailIcon />}
        </div>
        <input
          type="text"
          className="comment-input"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={status === 'sending'}
          maxLength={500}
        />
        <button
          type="submit"
          className="comment-send-btn"
          disabled={status === 'sending' || !message.trim()}
        >
          {status === 'sending' ? 'Sending...' : 'Send'}
        </button>
      </form>
      {statusMessage && (
        <div className={`comment-status ${status}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}
