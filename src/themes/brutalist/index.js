import BrutalistShell from './BrutalistShell';
import tokens from './tokens';

export default {
  id: 'brutalist',
  name: 'Brutalist',
  description: 'Raw, high-contrast anti-design with massive typography',
  Shell: BrutalistShell,
  tokens,
  settings: {
    invertHeader: { type: 'boolean', default: true, label: 'Inverted Header' },
    showBorders: { type: 'boolean', default: true, label: 'Thick Borders' },
    rotateNav: { type: 'boolean', default: false, label: 'Rotated Navigation' },
    uppercase: { type: 'boolean', default: true, label: 'Uppercase Headings' },
    glitchEffect: { type: 'boolean', default: false, label: 'Glitch Hover Effect' },
  },
  onActivate() {
    import('./brutalist.css');
  },
};
