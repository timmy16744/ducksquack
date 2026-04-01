// Base token schema - defines what settings every theme must provide
export const baseTokenSchema = {
  // Colors
  '--theme-bg-primary': { type: 'color', label: 'Background', category: 'Colors' },
  '--theme-bg-secondary': { type: 'color', label: 'Surface', category: 'Colors' },
  '--theme-bg-tertiary': { type: 'color', label: 'Surface Alt', category: 'Colors' },
  '--theme-text-primary': { type: 'color', label: 'Text', category: 'Colors' },
  '--theme-text-secondary': { type: 'color', label: 'Text Secondary', category: 'Colors' },
  '--theme-text-muted': { type: 'color', label: 'Text Muted', category: 'Colors' },
  '--theme-accent': { type: 'color', label: 'Accent', category: 'Colors' },
  '--theme-accent-hover': { type: 'color', label: 'Accent Hover', category: 'Colors' },
  '--theme-border': { type: 'color', label: 'Border', category: 'Colors' },
  '--theme-link': { type: 'color', label: 'Link', category: 'Colors' },

  // Typography
  '--theme-font-family': {
    type: 'select', label: 'Font Family', category: 'Typography',
    options: [
      'system-ui, -apple-system, sans-serif',
      '"Georgia", "Times New Roman", serif',
      '"Courier New", "Consolas", monospace',
      '"Tahoma", "Segoe UI", sans-serif',
      '"Helvetica Neue", "Arial", sans-serif',
      '"Inter", system-ui, sans-serif',
    ]
  },
  '--theme-font-family-heading': {
    type: 'select', label: 'Heading Font', category: 'Typography',
    options: [
      'inherit',
      'system-ui, -apple-system, sans-serif',
      '"Georgia", "Times New Roman", serif',
      '"Courier New", "Consolas", monospace',
      '"Helvetica Neue", "Arial", sans-serif',
    ]
  },
  '--theme-font-size-base': {
    type: 'range', label: 'Base Font Size', category: 'Typography',
    min: 11, max: 22, step: 1, unit: 'px'
  },
  '--theme-font-size-h1': {
    type: 'range', label: 'H1 Size', category: 'Typography',
    min: 20, max: 64, step: 1, unit: 'px'
  },
  '--theme-font-size-h2': {
    type: 'range', label: 'H2 Size', category: 'Typography',
    min: 16, max: 48, step: 1, unit: 'px'
  },
  '--theme-line-height': {
    type: 'range', label: 'Line Height', category: 'Typography',
    min: 1.0, max: 2.4, step: 0.05
  },
  '--theme-letter-spacing': {
    type: 'range', label: 'Letter Spacing', category: 'Typography',
    min: -1, max: 4, step: 0.25, unit: 'px'
  },
  '--theme-font-weight-body': {
    type: 'range', label: 'Body Weight', category: 'Typography',
    min: 300, max: 700, step: 100
  },
  '--theme-font-weight-heading': {
    type: 'range', label: 'Heading Weight', category: 'Typography',
    min: 300, max: 900, step: 100
  },

  // Spacing
  '--theme-spacing-xs': {
    type: 'range', label: 'Spacing XS', category: 'Spacing',
    min: 2, max: 12, step: 1, unit: 'px'
  },
  '--theme-spacing-sm': {
    type: 'range', label: 'Spacing SM', category: 'Spacing',
    min: 4, max: 20, step: 1, unit: 'px'
  },
  '--theme-spacing-md': {
    type: 'range', label: 'Spacing MD', category: 'Spacing',
    min: 8, max: 40, step: 2, unit: 'px'
  },
  '--theme-spacing-lg': {
    type: 'range', label: 'Spacing LG', category: 'Spacing',
    min: 16, max: 64, step: 2, unit: 'px'
  },
  '--theme-spacing-xl': {
    type: 'range', label: 'Spacing XL', category: 'Spacing',
    min: 24, max: 96, step: 4, unit: 'px'
  },

  // Layout
  '--theme-content-max-width': {
    type: 'range', label: 'Content Max Width', category: 'Layout',
    min: 480, max: 1600, step: 20, unit: 'px'
  },
  '--theme-sidebar-width': {
    type: 'range', label: 'Sidebar Width', category: 'Layout',
    min: 0, max: 400, step: 10, unit: 'px'
  },
  '--theme-border-radius': {
    type: 'range', label: 'Border Radius', category: 'Layout',
    min: 0, max: 24, step: 1, unit: 'px'
  },
  '--theme-border-width': {
    type: 'range', label: 'Border Width', category: 'Layout',
    min: 0, max: 6, step: 1, unit: 'px'
  },
  '--theme-nav-height': {
    type: 'range', label: 'Nav Height', category: 'Layout',
    min: 32, max: 80, step: 2, unit: 'px'
  },
  '--theme-content-padding': {
    type: 'range', label: 'Content Padding', category: 'Layout',
    min: 8, max: 64, step: 4, unit: 'px'
  },

  // Effects
  '--theme-shadow': {
    type: 'select', label: 'Shadow Style', category: 'Effects',
    options: ['none', '0 1px 3px rgba(0,0,0,0.1)', '0 2px 8px rgba(0,0,0,0.15)', '0 4px 16px rgba(0,0,0,0.2)', '0 8px 32px rgba(0,0,0,0.25)']
  },
  '--theme-transition-speed': {
    type: 'range', label: 'Transition Speed', category: 'Effects',
    min: 0, max: 500, step: 25, unit: 'ms'
  },
};
