import XPShell from './XPShell';
import tokens from './tokens';

export default {
  id: 'windows-xp',
  name: 'Windows XP',
  description: 'The original DuckSquack experience — authentic Windows XP Luna theme',
  Shell: XPShell,
  tokens,
  settings: {
    enableBubbles: { type: 'boolean', default: true, label: 'Desktop Bubbles' },
    enableMSN: { type: 'boolean', default: true, label: 'MSN Messenger' },
    enableStartMenu: { type: 'boolean', default: true, label: 'Start Menu' },
    enableDragResize: { type: 'boolean', default: true, label: 'Window Drag/Resize' },
  },
  onActivate() {
    // Load XP.css CDN
    if (!document.getElementById('xp-css-cdn')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/xp.css@0.2.3/dist/XP.css';
      link.id = 'xp-css-cdn';
      document.head.appendChild(link);
    }
    // Load XP theme CSS
    import('../../styles/xp-notepad.css');
    import('../../styles/xp-dialogs.css');
    import('../../styles/xp-start-menu.css');
  },
  onDeactivate() {
    document.getElementById('xp-css-cdn')?.remove();
  }
};
