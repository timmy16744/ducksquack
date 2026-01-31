/**
  MSN Messenger Web Components
  Based on: https://github.com/ManzDev/twitch-msn-messenger
  Modified for DuckSquack with message sending functionality
**/

const ASSET_BASE = '/msn-assets';
const nudgeSound = new Audio(`${ASSET_BASE}/sounds/nudge.mp3`);

class ImageButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return `
      .container {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .text {
        font-family: Verdana;
        font-size: 10.5px;
        letter-spacing: -0.25px;
        color: #434C4B;
      }
      .text span {
        text-decoration: underline;
      }
    `;
  }

  connectedCallback() {
    this.image = `${ASSET_BASE}/toolbar/` + this.getAttribute("image") + ".png";
    this.text = this.getAttribute("text") ?? "Sin texto";
    this.bind = this.getAttribute("bind");
    this.label = this.text.replace(this.bind, `<span>${this.bind}</span>`);
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${ImageButton.styles}</style>
    <div class="container">
      <img src="${this.image}" alt="${this.text}">
      <div class="text">${this.label}</div>
    </div>`;
  }
}

customElements.define("image-button", ImageButton);

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

class SimpleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return `
      .container {
        display: flex;
        align-items: center;
        padding: 0 6px;
        height: 100%;
        cursor: pointer;
      }
      .container:hover {
        background: rgba(255,255,255,0.3);
      }
      .container img {
        height: 16px;
      }
      .container span:not(:empty) {
        font-family: Verdana;
        font-size: 10px;
        color: #444;
        display: inline-block;
        width: 50px;
        padding-left: 3px;
      }
      .container button {
        border: 0;
        background: transparent;
        transform: scale(0.6);
        padding: 0;
      }
    `;
  }

  onClick() {
    // Dispatch custom events for different button types
    this.dispatchEvent(new CustomEvent("msn-button-click", {
      bubbles: true,
      composed: true,
      detail: { type: this.text }
    }));

    if (this.text === "nudge") {
      this.dispatchEvent(new CustomEvent("nudge", { bubbles: true, composed: true }));
    }
  }

  connectedCallback() {
    this.image = `${ASSET_BASE}/simple/` + this.getAttribute("image") + ".png";
    this.text = this.getAttribute("image");
    this.label = this.getAttribute("label") ?? "";
    this.arrowButton = this.hasAttribute("arrow") ? "<button>⯆</button>" : "";
    this.render();
    this.shadowRoot.querySelector(".container").addEventListener("click", () => this.onClick());
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${SimpleButton.styles}</style>
    <div class="container">
      <img src="${this.image}" alt="${this.text}">
      <span>${this.label}</span>
      ${this.arrowButton}
    </div>`;
  }
}

customElements.define("simple-button", SimpleButton);

class TabButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return /* css */`
      .container {
        min-width: 25px;
        height: 18px;
        border: 1px solid #ABB0C6;
        border-top: 0;
        border-radius: 0 0 6px 6px;
        display: flex;
        justify-content: center;
        background: #EDF2F8;
      }
      :host([focus]) .container {
        background: #fff;
        border-bottom: 3px solid #E2C47B;
        border-top: 0;
        transform: translateY(-1px);
      }
      img {
        width: 16px;
        height: 16px;
      }
    `;
  }

  connectedCallback() {
    this.image = `${ASSET_BASE}/tabs/` + this.getAttribute("image") + ".png";
    this.text = this.getAttribute("image");
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${TabButton.styles}</style>
    <div class="container">
      <img src="${this.image}" alt="${this.text}">
    </div>`;
  }
}

customElements.define("tab-button", TabButton);

class MSNMessengerAvatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return /* css */`
      .container {
        width: 114px;
        height: 114px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border: 1px solid #586170;
        border-radius: 8px;
        position: relative;
        background: #E8EEF4;
      }
      .picture {
        width: 96px;
        height: 96px;
        border: 1px solid #586170;
        border-radius: 8px;
        transform: translateY(4px);
        object-fit: cover;
      }
      .down {
        border: 0;
        background: transparent;
        color: #4D5967;
        transform: scaleY(0.5);
        align-self: flex-end;
        cursor: pointer;
      }
      .expand {
        position: absolute;
        top: 4px;
        right: -9px;
      }
    `;
  }

  connectedCallback() {
    this.image = this.getAttribute("image") ?? "msn";
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${MSNMessengerAvatar.styles}</style>
    <div class="container">
      <img class="picture" src="${ASSET_BASE}/avatars/${this.image}.png" alt="Avatar">
      <button class="down">⯆</button>
      <img class="expand" src="${ASSET_BASE}/ui/expand-left.png" alt="expand arrow">
    </div>
    `;
  }
}

customElements.define("msn-messenger-avatar", MSNMessengerAvatar);

class MSNMessengerChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.textFormat = { bold: false, italic: false, underline: false };
    this.showEmojiPicker = false;
  }

  static get styles() {
    return /* css */`
      .container {
        display: grid;
        grid-template-rows: 24px 1fr 24px;
        min-height: 122px;
        background: #fff;
        width: 97%;
        border: 1px solid #586170;
        border-radius: 6px;
        position: relative;
      }
      .actionbar,
      .tabs {
        background: linear-gradient(#D8E8F7, #F5F2F9, #D8E8F7);
      }
      .actionbar {
        border-bottom: 1px solid #586170;
        border-radius: 6px 6px 0 0;
        display: flex;
        position: relative;
      }
      .tabs {
        border-top: 1px solid #565F70;
        border-radius: 0 0 6px 6px;
        display: flex;
        justify-content: space-between;
        padding: 0 8px;
        align-items: center;
      }
      .format-buttons {
        display: flex;
        gap: 2px;
      }
      .format-btn {
        width: 20px;
        height: 18px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        font-family: Times New Roman, serif;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
      }
      .format-btn:hover {
        background: rgba(255,255,255,0.6);
        border-color: #ABB0C6;
      }
      .format-btn.active {
        background: rgba(200,210,230,0.6);
        border-color: #8098B8;
      }
      .format-btn.bold { font-weight: bold; }
      .format-btn.italic { font-style: italic; }
      .format-btn.underline { text-decoration: underline; }
      .tab-buttons {
        display: flex;
        gap: 2px;
      }
      .chat {
        display: flex;
        justify-content: flex-end;
        margin: 3px;
      }
      .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .chat-input {
        flex: 1;
        border: none;
        resize: none;
        font-family: Verdana, Tahoma, sans-serif;
        font-size: 11px;
        padding: 4px;
        outline: none;
      }
      .chat .buttons {
        display: flex;
        flex-direction: column;
        gap: 3px 0;
      }
      .normal {
        border: 1px solid #93989C;
        background: #FBFBFB;
        box-shadow: -4px -4px 4px #C0C9E0 inset;
        width: 58px;
        height: 37px;
        border-radius: 5px;
        font-family: Tahoma;
        font-weight: bold;
        font-size: 11px;
        color: #969C9A;
        cursor: pointer;
      }
      .normal:hover {
        background: #F0F8FF;
        border-color: #7090B0;
      }
      .normal:active {
        box-shadow: 2px 2px 4px #C0C9E0 inset;
      }
      .normal:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .normal span {
        text-decoration: underline;
      }
      .normal.small {
        height: 25px;
      }
      /* Emoji Picker */
      .emoji-picker {
        position: absolute;
        top: 100%;
        left: 30px;
        background: #FFF;
        border: 1px solid #586170;
        box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
        padding: 6px;
        z-index: 100;
        border-radius: 4px;
        display: none;
      }
      .emoji-picker.show {
        display: block;
      }
      .emoji-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 2px;
        width: 180px;
      }
      .emoji-item {
        width: 28px;
        height: 28px;
        background: #FFF;
        border: 1px solid transparent;
        border-radius: 3px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .emoji-item:hover {
        background: #E8F4FF;
        border-color: #7FB8E8;
      }
    `;
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  setupEvents() {
    const sendBtn = this.shadowRoot.querySelector('.send-btn');
    const textarea = this.shadowRoot.querySelector('.chat-input');
    const emojiPicker = this.shadowRoot.querySelector('.emoji-picker');

    sendBtn.addEventListener('click', () => this.sendMessage());
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      // Keyboard shortcuts for formatting
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') { e.preventDefault(); this.toggleFormat('bold'); }
        if (e.key === 'i') { e.preventDefault(); this.toggleFormat('italic'); }
        if (e.key === 'u') { e.preventDefault(); this.toggleFormat('underline'); }
      }
    });

    // Format buttons
    this.shadowRoot.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        this.toggleFormat(format);
      });
    });

    // Listen for button clicks from action bar
    this.addEventListener('msn-button-click', (e) => {
      if (e.detail.type === 'happy') {
        this.toggleEmojiPicker();
      } else if (e.detail.type === 'wink') {
        this.insertEmoji('😉');
      }
    });

    // Emoji items
    this.shadowRoot.querySelectorAll('.emoji-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.insertEmoji(btn.textContent);
        this.hideEmojiPicker();
      });
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.hideEmojiPicker();
      }
    });
  }

  toggleFormat(format) {
    this.textFormat[format] = !this.textFormat[format];
    this.updateTextareaStyle();
    this.updateFormatButtons();
  }

  updateTextareaStyle() {
    const textarea = this.shadowRoot.querySelector('.chat-input');
    textarea.style.fontWeight = this.textFormat.bold ? 'bold' : 'normal';
    textarea.style.fontStyle = this.textFormat.italic ? 'italic' : 'normal';
    textarea.style.textDecoration = this.textFormat.underline ? 'underline' : 'none';
  }

  updateFormatButtons() {
    const boldBtn = this.shadowRoot.querySelector('.format-btn.bold');
    const italicBtn = this.shadowRoot.querySelector('.format-btn.italic');
    const underlineBtn = this.shadowRoot.querySelector('.format-btn.underline');

    boldBtn.classList.toggle('active', this.textFormat.bold);
    italicBtn.classList.toggle('active', this.textFormat.italic);
    underlineBtn.classList.toggle('active', this.textFormat.underline);
  }

  toggleEmojiPicker() {
    const picker = this.shadowRoot.querySelector('.emoji-picker');
    this.showEmojiPicker = !this.showEmojiPicker;
    picker.classList.toggle('show', this.showEmojiPicker);
  }

  hideEmojiPicker() {
    const picker = this.shadowRoot.querySelector('.emoji-picker');
    this.showEmojiPicker = false;
    picker.classList.remove('show');
  }

  insertEmoji(emoji) {
    const textarea = this.shadowRoot.querySelector('.chat-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + emoji + text.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    textarea.focus();
  }

  async sendMessage() {
    const textarea = this.shadowRoot.querySelector('.chat-input');
    const sendBtn = this.shadowRoot.querySelector('.send-btn');
    const message = textarea.value.trim();

    if (!message) return;

    sendBtn.disabled = true;

    try {
      const response = await fetch('https://formspree.io/f/mreqlkwv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message: message,
          _subject: 'MSN Message from DuckSquack',
          type: 'msn_message'
        })
      });

      if (response.ok) {
        // Dispatch event to show message in history
        this.dispatchEvent(new CustomEvent('message-sent', {
          bubbles: true,
          composed: true,
          detail: {
            message,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            format: { ...this.textFormat }
          }
        }));
        textarea.value = '';
      } else {
        alert('Message failed to send. Please try again.');
      }
    } catch (error) {
      alert('Message failed to send. Please try again.');
    }

    sendBtn.disabled = false;
  }

  render() {
    const emojiGridHtml = MSN_EMOTICONS.map(e =>
      `<button class="emoji-item" title="${e.code}">${e.emoji}</button>`
    ).join('');

    this.shadowRoot.innerHTML = /* html */`
    <style>${MSNMessengerChat.styles}</style>
    <div class="container">
      <div class="actionbar">
        <simple-button image="letter"></simple-button>
        <simple-button image="happy" arrow></simple-button>
        <simple-button image="voice-clip" label="Voice clip"></simple-button>
        <simple-button image="wink" arrow></simple-button>
        <simple-button image="mountain" arrow></simple-button>
        <simple-button image="gift" arrow></simple-button>
        <simple-button image="nudge"></simple-button>
        <div class="emoji-picker">
          <div class="emoji-grid">
            ${emojiGridHtml}
          </div>
        </div>
      </div>
      <div class="chat">
        <div class="chat-area">
          <textarea class="chat-input"></textarea>
        </div>
        <div class="buttons">
          <button class="normal send-btn"><span>S</span>end</button>
          <button class="small normal">Sea<span>r</span>ch</button>
        </div>
      </div>
      <div class="tabs">
        <div class="format-buttons">
          <button class="format-btn bold" data-format="bold" title="Bold (Ctrl+B)">B</button>
          <button class="format-btn italic" data-format="italic" title="Italic (Ctrl+I)">I</button>
          <button class="format-btn underline" data-format="underline" title="Underline (Ctrl+U)">U</button>
        </div>
        <div class="tab-buttons">
          <tab-button image="paint"></tab-button>
          <tab-button image="letter" focus></tab-button>
        </div>
      </div>
    </div>`;
  }
}

customElements.define("msn-messenger-chat", MSNMessengerChat);

class MSNMessengerHistoryChat extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.messages = [];
  }

  static get styles() {
    return /* css */`
      .container {
        display: grid;
        justify-content: center;
        grid-template-columns: 1fr;
        grid-template-rows: 28px 1fr;
        font-family: Verdana;
        font-size: 10px;
        width: 97%;
        height: 100%;
        border: 1px solid #586170;
        border-radius: 8px 8px 0 0;
        margin: 2px 1px;
      }
      .subject {
        border-radius: 8px 8px 0 0;
        background: #EEF0FD;
        display: flex;
        align-items: center;
        padding-left: 6px;
        border-bottom: 1px solid #586170;
      }
      .subject strong {
        padding-left: 3px;
      }
      .history {
        background: #fff;
        padding: 8px;
        overflow-y: auto;
        font-size: 11px;
      }
      .info-line {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 10px;
        line-height: 1.4;
        color: #1A4A6E;
      }
      .warning-line {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 10px;
        line-height: 1.4;
        color: #5D5020;
      }
      .msg {
        margin-bottom: 4px;
        line-height: 1.4;
      }
      .msg-sender {
        color: #0066CC;
        font-weight: bold;
      }
      .msg-text {
        margin-left: 4px;
      }
      .msg-time {
        color: #888;
        font-size: 9px;
        margin-left: 6px;
      }
    `;
  }

  connectedCallback() {
    this.render();
  }

  addMessage(message, time, format = {}) {
    this.messages.push({ message, time, format });
    this.updateHistory();
  }

  updateHistory() {
    const history = this.shadowRoot.querySelector('.history');
    const messagesHtml = this.messages.map(msg => {
      const style = [];
      if (msg.format?.bold) style.push('font-weight: bold');
      if (msg.format?.italic) style.push('font-style: italic');
      if (msg.format?.underline) style.push('text-decoration: underline');
      const styleAttr = style.length ? `style="${style.join(';')}"` : '';
      return `
        <div class="msg">
          <span class="msg-sender">You say:</span>
          <span class="msg-text" ${styleAttr}>${msg.message}</span>
          <span class="msg-time">(${msg.time})</span>
        </div>
      `;
    }).join('');

    history.innerHTML = `
      <div class="info-line">
        <span>ℹ️</span>
        <span>Tim may not reply immediately because he's probably writing essays or playing with his son.</span>
      </div>
      <div class="warning-line">
        <span>⚠️</span>
        <span>Never give out your password or credit card number in an instant message conversation.</span>
      </div>
      ${messagesHtml}
    `;

    history.scrollTop = history.scrollHeight;
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${MSNMessengerHistoryChat.styles}</style>
    <div class="container">
      <div class="subject">To: <strong>Tim Hughes (tim@ducksquack.me)</strong></div>
      <div class="history">
        <div class="info-line">
          <span>ℹ️</span>
          <span>Tim may not reply immediately because he's probably writing essays or playing with his son.</span>
        </div>
        <div class="warning-line">
          <span>⚠️</span>
          <span>Never give out your password or credit card number in an instant message conversation.</span>
        </div>
      </div>
    </div>`;
  }
}

customElements.define("msn-messenger-history-chat", MSNMessengerHistoryChat);

class MSNMessengerLocalUser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return /* css */`
    .container {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 1fr 140px;
      margin: 4px 8px;
    }
    `;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${MSNMessengerLocalUser.styles}</style>
    <div class="container">
      <msn-messenger-chat></msn-messenger-chat>
      <msn-messenger-avatar image="duck"></msn-messenger-avatar>
    </div>`;
  }
}

customElements.define("msn-messenger-local-user", MSNMessengerLocalUser);

class MSNMessengerRemoteUser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return /* css */`
    .container {
      width: 100%;
      height: 92%;
      display: grid;
      grid-template-columns: 1fr 140px;
      margin: 4px 8px;
    }
    `;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${MSNMessengerRemoteUser.styles}</style>
    <div class="container">
      <msn-messenger-history-chat></msn-messenger-history-chat>
      <msn-messenger-avatar image="tim"></msn-messenger-avatar>
    </div>`;
  }
}

customElements.define("msn-messenger-remote-user", MSNMessengerRemoteUser);

class MSNMessengerStatusbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return `
      .container {
        width: 100%;
        height: 14px;
        border-radius: 0 0 var(--border-radius) var(--border-radius);
        border-top: 1px solid #505E67;
        background: #FDFDFF;
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 8px;
      }

      .text {
        font-family: Verdana;
        font-size: 10px;
        font-weight: bold;
        color: navy;
      }

      .text a {
        color: black;
      }

      .text a:hover {
        color: darkred;
      }
    `;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${MSNMessengerStatusbar.styles}</style>
    <div class="container">
      <div class="text">More content on <a href="https://ducksquack.me/">ducksquack.me</a></div>
    </div>`;
  }
}

customElements.define("msn-messenger-statusbar", MSNMessengerStatusbar);

class MSNMessengerToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return `
      .container {
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius) var(--border-radius) 0 0;
        display: grid;
        grid-template-columns: 310px 1fr;
        position: relative;
      }
      .toolbar-container {
        display: grid;
        grid-template-columns: 40px 56px 44px 40px 54px 44px;
        justify-content: flex-end;
        align-items: center;
        background: url(${ASSET_BASE}/ui/toolbar-background.png) repeat;
        background-size: contain;
      }
      .toolbar-small-container {
        display: grid;
        grid-template-columns: 50px 50px 37px 28px;
        height: 100%;
      }
      .toolbar-small-container .left {
        background: url(${ASSET_BASE}/ui/small-toolbar-left-background.png) no-repeat;
      }
      .toolbar-small-container .center {
        background:
          url(${ASSET_BASE}/ui/msn-logo.png) top left 4px,
          url(${ASSET_BASE}/ui/small-toolbar-center-background.png);
        background-repeat: no-repeat, repeat-x;
      }
      .toolbar-small-container .right {
        background: url(${ASSET_BASE}/ui/small-toolbar-right-background.png) no-repeat;
      }
      .toolbar-small-container .end {
        background: url(${ASSET_BASE}/ui/small-toolbar-end-background.png) repeat;
      }
      .center .buttons {
        display: flex;
        gap: 0 4px;
        transform: translate(2px, 23px);
      }
      .center image-circular-button {
        --size: 19px;
        --image-size: 13px;
      }
      .up-down {
        --image-size: 15px;
        position: absolute;
        top: 2px;
        left: 2px;
      }
      .window-controls {
        position: absolute;
        top: 4px;
        right: 4px;
        display: flex;
        gap: 2px;
      }
      .window-btn {
        width: 21px;
        height: 21px;
        border-radius: 3px;
        border: 1px solid rgba(0,0,0,0.2);
        background: linear-gradient(180deg, #5A8AC8 0%, #4070A8 50%, #305890 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
      .window-btn:hover {
        background: linear-gradient(180deg, #6A9AD8 0%, #5080B8 50%, #4068A0 100%);
      }
      .window-btn.close {
        background: linear-gradient(180deg, #C75050 0%, #B33030 50%, #9A1C1C 100%);
      }
      .window-btn.close:hover {
        background: linear-gradient(180deg, #E06060 0%, #C94040 50%, #B02828 100%);
      }
      .minimize-icon {
        width: 8px;
        height: 2px;
        background: white;
        margin-top: 6px;
      }
      .maximize-icon {
        width: 9px;
        height: 9px;
        border: 1px solid white;
        border-top: 2px solid white;
      }
    `;
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  setupEvents() {
    this.shadowRoot.querySelector('.close').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close-window', { bubbles: true, composed: true }));
    });
    this.shadowRoot.querySelector('.minimize').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close-window', { bubbles: true, composed: true }));
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${MSNMessengerToolbar.styles}</style>
    <div class="container">
      <div class="toolbar-container">
        <image-circular-button class="up-down" image="up-down"></image-circular-button>
        <image-button image="invite" text="Invite" bind="I"></image-button>
        <image-button image="send" text="Send Files" bind="l"></image-button>
        <image-button image="video" text="Video" bind="o"></image-button>
        <image-button image="voice" text="Voice" bind="c"></image-button>
        <image-button image="activities" text="Activities" bind="v"></image-button>
        <image-button image="games" text="Games" bind="G"></image-button>
      </div>
      <div class="toolbar-small-container">
        <div class="left"></div>
        <div class="center">
          <div class="buttons">
            <image-circular-button image="block"></image-circular-button>
            <image-circular-button image="paint"></image-circular-button>
          </div>
        </div>
        <div class="right"></div>
        <div class="end"></div>
      </div>
      <div class="window-controls">
        <button class="window-btn minimize"><div class="minimize-icon"></div></button>
        <button class="window-btn"><div class="maximize-icon"></div></button>
        <button class="window-btn close">×</button>
      </div>
    </div>`;
  }
}

customElements.define("msn-messenger-toolbar", MSNMessengerToolbar);

class ImageCircularButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return `
      .container {
        width: var(--size, 16px);
        height: var(--size, 16px);
        display: flex;
        justify-content: center;
        align-items: center;
        background: url(${ASSET_BASE}/ui/small-circle-button.png) no-repeat;
        background-size: cover;
        cursor: pointer;
      }
      .container img {
        width: var(--image-size, 11px);
        height: var(--image-size, 11px);
      }
    `;
  }

  connectedCallback() {
    this.text = this.getAttribute("image") ?? "notext";
    this.image = `${ASSET_BASE}/toolbar/small-` + this.text + ".png";
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${ImageCircularButton.styles}</style>
    <div class="container">
      <img src="${this.image}" alt="${this.text}">
    </div>`;
  }
}

customElements.define("image-circular-button", ImageCircularButton);

class MSNMessengerWindow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get styles() {
    return /* css */`
      :host {
        --width: 475px;
        --height: 400px;
        --border-radius: 6px;
      }
      .container {
        width: var(--width);
        height: var(--height);
        background: #D7E4F5 url(${ASSET_BASE}/ui/main-background.png) bottom 20px right no-repeat;
        display: grid;
        grid-template-rows: 60px 1fr 140px 24px;
        border-radius: var(--border-radius);
        overflow: hidden;
        box-shadow:
          2px 2px 5px #0009,
          5px 5px 10px #000c;
        position: relative;
        transform: translate(var(--x, 0), var(--y, 0));
      }
      .border-window {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            url(${ASSET_BASE}/ui/main-corner-left.png),
            url(${ASSET_BASE}/ui/main-corner-right.png),
            url(${ASSET_BASE}/ui/main-left.png),
            url(${ASSET_BASE}/ui/main-right.png),
            url(${ASSET_BASE}/ui/main-bottom.png);
          background-repeat: no-repeat, no-repeat, repeat-y, repeat-y, repeat-x;
          background-position: bottom left, bottom -1px right, bottom left, bottom right, bottom;
          clip-path: polygon(0 14.5%, 100% 5%, 100% 100%, 0 100%);
          pointer-events: none;
      }
    `;
  }

  move() {
    const x = -4 + ~~(Math.random() * 8);
    const y = -4 + ~~(Math.random() * 8);
    this.style.setProperty("--x", `${x}px`);
    this.style.setProperty("--y", `${y}px`);
  }

  nudge() {
    const times = [50, 100, 150, 200, 250, 350, 400, 450, 500, 550, 600, 650, 700, 750];

    const nudge = (delay = 0) => {
      setTimeout(() => {
        nudgeSound.currentTime = 0;
        nudgeSound.play().catch(() => {});
        times.forEach(time => setTimeout(() => this.move(), time));
      }, delay);
    };

    nudge();
    nudge(1000);
  }

  connectedCallback() {
    this.render();
    this.addEventListener("nudge", () => this.nudge());
    this.addEventListener("message-sent", (e) => {
      const historyChat = this.shadowRoot.querySelector('msn-messenger-remote-user')
        .shadowRoot.querySelector('msn-messenger-history-chat');
      historyChat.addMessage(e.detail.message, e.detail.time, e.detail.format);
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>${MSNMessengerWindow.styles}</style>
    <div class="container">
      <msn-messenger-toolbar></msn-messenger-toolbar>
      <msn-messenger-remote-user></msn-messenger-remote-user>
      <msn-messenger-local-user></msn-messenger-local-user>
      <msn-messenger-statusbar></msn-messenger-statusbar>
      <div class="border-window"></div>
    </div>`;
  }
}

customElements.define("msn-messenger-window", MSNMessengerWindow);

// Export for use in React
window.MSNMessengerComponents = {
  loaded: true
};
