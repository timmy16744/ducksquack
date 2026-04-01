import ZenShell from './ZenShell';
import tokens from './tokens';

export default {
  id: 'zen',
  name: 'Zen',
  description: 'Japanese minimalism — maximum whitespace, contemplative reading',
  Shell: ZenShell,
  tokens,
  settings: {
    showDates: { type: 'boolean', default: true, label: 'Show Dates' },
    animateTransitions: { type: 'boolean', default: true, label: 'Fade Transitions' },
    verticalTitle: { type: 'boolean', default: false, label: 'Vertical Title' },
    showWordCount: { type: 'boolean', default: false, label: 'Show Word Count' },
    ensoMark: { type: 'boolean', default: true, label: 'Enso Circle Mark' },
  },
  onActivate() {
    import('./zen.css');
  },
};
