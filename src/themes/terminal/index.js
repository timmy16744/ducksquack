import TerminalShell from './TerminalShell';
import tokens from './tokens';

export default {
  id: 'terminal',
  name: 'Terminal',
  description: 'Green-on-black CLI emulator with CRT scanlines',
  Shell: TerminalShell,
  tokens,
  settings: {
    scanlines: { type: 'boolean', default: true, label: 'CRT Scanlines' },
    typingEffect: { type: 'boolean', default: true, label: 'Typing Animation' },
    cursorBlink: { type: 'boolean', default: true, label: 'Blinking Cursor' },
    crtGlow: { type: 'boolean', default: true, label: 'Text Glow' },
    promptStyle: { type: 'select', default: 'duck', label: 'Prompt Style', options: ['duck', 'minimal', 'full'] },
  },
  onActivate() {
    import('./terminal.css');
  },
};
