# Mobile Optimization Plan

## Current State Summary

The site has basic mobile responsiveness with three breakpoints (1024px, 768px, 480px). On mobile:
- Toolbar labels are **hidden** (icons only)
- Writings list **hides date, views columns** (768px) and **size column** (480px)
- Sidebars and detail panels are hidden
- Window goes full-screen

---

## Proposed Changes

### Phase 1: Toolbar with Labels on Mobile

**Goal:** Show text labels with icons in a mobile-optimized layout

**Current (768px):**
```
[🏠] [👤] [📝] [◀] [▶]  (icons only, labels hidden)
```

**Proposed (768px):**
```
[🏠 Home] [👤 About] [📝 Writings]    [◀] [▶]
```

**Implementation:**
| File | Changes |
|------|---------|
| `src/styles/xp-notepad.css` | Update `@media (max-width: 768px)` to show labels with smaller font, adjust button padding |

**CSS Changes:**
- Remove `display: none` from `.toolbar-label` at 768px
- Add smaller font-size (10px) for labels on mobile
- Use flex column layout for icon + label stacking
- Reduce button horizontal padding to fit all items

---

### Phase 2: Mobile Writings List - Card/Detail View

**Goal:** Show all metadata (date, size, views) in a mobile-friendly card layout

**Current (480px):**
```
┌────────────────────────────┐
│ 📄 The Last Normal Tuesday │  ← Name only, no metadata
├────────────────────────────┤
│ 📄 The Widening Gyre       │
└────────────────────────────┘
```

**Proposed (480px):**
```
┌────────────────────────────┐
│ 📄 The Last Normal Tuesday │
│    Jan 15, 2026 · 843 words│  ← Subtitle with metadata
├────────────────────────────┤
│ 📄 The Widening Gyre       │
│    Jan 12, 2026 · 1.1k words│
└────────────────────────────┘
```

**Proposed (768px) - Two-line with views:**
```
┌─────────────────────────────────────┐
│ 📄 The Last Normal Tuesday          │
│    Jan 15, 2026 · 843 words · 42 👁 │
├─────────────────────────────────────┤
│ 📄 The Widening Gyre                │
│    Jan 12, 2026 · 1.1k words · 28 👁│
└─────────────────────────────────────┘
```

**Implementation:**
| File | Changes |
|------|---------|
| `src/components/XPWritingsList.jsx` | Add mobile-specific row rendering with metadata subtitle |
| `src/styles/xp-notepad.css` | Add `.xp-explorer-row-mobile` styles for card layout |

**Component Changes:**
- Detect viewport width or use CSS-only approach
- Render two-line layout: title on first line, metadata on second
- Format word count with "k" suffix for 1000+ (e.g., "1.1k words")
- Compact date format (e.g., "Jan 15" instead of "January 15, 2026")

---

### Phase 3: Responsive Typography & Spacing

**Goal:** Better readability on small screens

| Element | Desktop | Mobile (768px) | Mobile (480px) |
|---------|---------|----------------|----------------|
| Content font | 13px | 15px | 16px |
| Line height | 1.6 | 1.7 | 1.8 |
| Content padding | 16px 20px | 16px | 14px 12px |
| Title font | 22px | 20px | 18px |

**Implementation:**
| File | Changes |
|------|---------|
| `src/styles/xp-notepad.css` | Add typography overrides in media queries |

---

### Phase 4: Touch-Optimized Interactions

**Goal:** Better tap targets and feedback

**Changes:**
- Minimum tap target: 44px height for all interactive elements
- Add `:active` states with visual feedback for touch
- Increase row height in writings list for easier tapping
- Add subtle background highlight on tap

**Implementation:**
| File | Changes |
|------|---------|
| `src/styles/xp-notepad.css` | Add touch-specific styles and active states |

---

## File Changes Summary

| File | Phase | Description |
|------|-------|-------------|
| `src/styles/xp-notepad.css` | 1,3,4 | Toolbar labels, typography, touch styles |
| `src/components/XPWritingsList.jsx` | 2 | Mobile card layout with metadata subtitle |

---

## Implementation Order

1. **Phase 1** - Toolbar labels (CSS only, quick win)
2. **Phase 2** - Writings list mobile layout (component + CSS)
3. **Phase 3** - Typography improvements (CSS only)
4. **Phase 4** - Touch optimizations (CSS only)

---

## Visual Mockup - Mobile Writings (480px)

```
┌──────────────────────────────────────┐
│ [📄] DuckSquack - Writings      [—][×]│ ← Title bar
├──────────────────────────────────────┤
│ [🏠 Home] [👤 About] [📝 Writings] ◀▶│ ← Toolbar with labels
├──────────────────────────────────────┤
│ 📄 The Rustle in the Grass           │
│    Jan 26 · 2.5k words               │
├──────────────────────────────────────┤
│ 📄 The Loneliness Dividend           │
│    Jan 24 · 2.2k words               │
├──────────────────────────────────────┤
│ 📄 Escape Velocity                   │
│    Jan 22 · 1.7k words               │
├──────────────────────────────────────┤
│ 📄 Teaching Arthur                   │
│    Jan 20 · 1.5k words               │
└──────────────────────────────────────┘
│💬 Leave a comment...         [Send] │ ← Comment bar
├──────────────────────────────────────┤
│[🪟 start]              [DuckSquack] 🕐│ ← Taskbar
└──────────────────────────────────────┘
```
