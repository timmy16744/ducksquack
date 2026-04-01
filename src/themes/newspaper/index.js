import NewspaperShell from './NewspaperShell';
import tokens from './tokens';

export default {
  id: 'newspaper',
  name: 'Newspaper',
  description: 'Classic broadsheet print layout with masthead and columns',
  Shell: NewspaperShell,
  tokens,
  settings: {
    columnCount: { type: 'select', default: '2', label: 'Article Columns', options: ['1', '2', '3'] },
    showDividers: { type: 'boolean', default: true, label: 'Column Dividers' },
    showDate: { type: 'boolean', default: true, label: 'Publication Date' },
    paperTexture: { type: 'boolean', default: true, label: 'Paper Texture' },
    mastStyle: { type: 'select', default: 'blackletter', label: 'Masthead Style', options: ['blackletter', 'serif', 'modern'] },
  },
  onActivate() {
    import('./newspaper.css');
  },
};
