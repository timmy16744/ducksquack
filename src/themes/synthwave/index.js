import SynthwaveShell from './SynthwaveShell';
import tokens from './tokens';

export default {
  id: 'synthwave',
  name: 'Synthwave',
  description: 'Neon 80s retrowave with perspective grid and glow effects',
  Shell: SynthwaveShell,
  tokens,
  settings: {
    enableGrid: { type: 'boolean', default: true, label: 'Perspective Grid' },
    enableGlow: { type: 'boolean', default: true, label: 'Neon Glow' },
    enablePulse: { type: 'boolean', default: true, label: 'Pulsing Animations' },
    gridColor: { type: 'select', default: 'cyan', label: 'Grid Color', options: ['cyan', 'magenta', 'purple', 'green'] },
    sunEnabled: { type: 'boolean', default: true, label: 'Retro Sun' },
  },
  onActivate() {
    import('./synthwave.css');
  },
};
