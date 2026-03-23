# Poker Trainer Design System

**Based on Google Stitch export "Grandmaster Studio" - Premium dark theme for professional poker training.**

## Color Palette

### Primary Colors
```css
--primary: #ddc39c;           /* Sophisticated gold - primary actions */
--on-primary: #3e2e12;        /* Dark text on primary surfaces */
--primary-container: #534124; /* Darker gold for containers */
--on-primary-container: #c7ae89; /* Text on primary containers */
```

### Surface Colors
```css
--surface: #121416;                    /* Main background */
--surface-container: #1a1c1e;          /* Card/panel backgrounds */
--surface-container-low: #16181b;      /* Slightly darker containers */
--surface-container-high: #23262a;     /* Elevated surfaces */
--surface-container-highest: #333537;  /* Highest elevation */
--surface-bright: #37393b;             /* Bright surface variant */
```

### Text Colors
```css
--on-surface: #e2e2e5;               /* Primary text color */
--on-surface-variant: #a0a3a8;       /* Secondary text, labels */
--outline: #46484b;                   /* Borders, dividers */
--outline-variant: #323539;          /* Subtle borders */
```

### Action Colors
```css
--action-raise: #7c3a3a;    /* Burgundy for raise actions */
--action-call: #5a7a6c;     /* Sage green for call actions */
--action-mix: linear-gradient(135deg, #7c3a3a 50%, #5a7a6c 50%); /* Split gradient */
--action-fold: #1a1c1e;     /* Neutral/inactive */
```

### Semantic Colors
```css
--success: #2d4a3e;         /* Forest green for positive states */
--warning: #ddc39c;         /* Gold for attention */
--error: #8b5e5e;           /* Muted red for errors */
```

## Typography

### Font Families
```css
--font-headline: 'Noto Serif', serif;     /* Headlines, titles, card values */
--font-body: 'Manrope', sans-serif;       /* Body text, descriptions */
--font-label: 'Manrope', sans-serif;      /* UI labels, buttons, small text */
```

### Font Sizes
```css
--text-xs: 0.625rem;      /* 10px - Small labels, micro text */
--text-sm: 0.75rem;       /* 12px - Secondary text */
--text-base: 0.875rem;    /* 14px - Body text */
--text-lg: 1.125rem;      /* 18px - Large text */
--text-xl: 1.25rem;       /* 20px - Card labels */
--text-2xl: 1.5rem;       /* 24px - Section headers */
--text-3xl: 1.875rem;     /* 30px - Page titles */
--text-4xl: 2.25rem;      /* 36px - Large headlines */
--text-5xl: 3rem;         /* 48px - Display text */
```

### Typography Usage
- **Headlines**: Noto Serif, bold weights, tracking-tight
- **Labels**: Manrope, uppercase, letter-spacing: 0.05-0.3em, font-weight: 600-700
- **Body text**: Manrope, regular weight, good line-height
- **Buttons**: Manrope, uppercase, bold, tracked

## Spacing System

### Base Scale (rem units)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Component Spacing
- **Card padding**: --space-6 to --space-8
- **Button padding**: --space-3 vertical, --space-6 horizontal
- **Grid gaps**: --space-1 for tight grids, --space-2 for comfortable
- **Section margins**: --space-12 to --space-16

## Border Radius

```css
--radius-sm: 0.125rem;    /* 2px - Small elements */
--radius: 0.25rem;        /* 4px - Default radius */
--radius-md: 0.375rem;    /* 6px - Cards, panels */
--radius-lg: 0.75rem;     /* 12px - Large cards */
--radius-full: 9999px;    /* Fully rounded */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Component Patterns

### Card/Panel Pattern
```css
.card {
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
}
```

### Button Hierarchy

#### Primary Button
```css
.btn-primary {
  background: var(--primary);
  color: var(--on-primary);
  font-family: var(--font-label);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-6);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--on-surface-variant);
  border: 1px solid var(--outline);
  font-family: var(--font-label);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Grid Cell Pattern
```css
.grid-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-container-low);
  border: 0.5px solid var(--outline-variant);
  font-family: var(--font-label);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.grid-cell:hover {
  filter: brightness(1.2);
  box-shadow: 0 0 15px rgba(221, 195, 156, 0.1);
}
```

## Layout System

### Sidebar Navigation
- **Width**: 256px (16rem)
- **Background**: var(--surface-container)
- **Content offset**: margin-left: 256px on main content

### Main Content
- **Max width**: 1200px for readability
- **Padding**: --space-10 on desktop
- **Grid**: CSS Grid with proper gaps

## Interaction States

### Button States
```css
.button {
  transition: all 0.2s ease;
}

.button:hover {
  filter: brightness(1.1);
}

.button:active {
  transform: scale(0.98);
}

.button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Grid Cell States
```css
.cell-raise { background: var(--action-raise); color: var(--on-surface); }
.cell-call { background: var(--action-call); color: var(--on-surface); }
.cell-mix { background: var(--action-mix); color: var(--on-surface); }
.cell-fold { background: var(--action-fold); color: var(--on-surface-variant); }
```

## Implementation Notes

1. **CSS Custom Properties**: Define all design tokens as CSS custom properties in `:root`
2. **Component Classes**: Use consistent class naming (BEM methodology)
3. **Responsive**: Desktop-first approach, mobile adaptations later
4. **Accessibility**: Maintain proper contrast ratios (4.5:1 minimum)
5. **Performance**: Use `transform` and `opacity` for animations

## Usage Examples

### Page Header
```html
<header class="header">
  <h1 class="headline-primary">Range Editor</h1>
  <p class="label-secondary">6-Max • 100BB Deep</p>
</header>
```

### Action Button Group
```html
<div class="action-group">
  <button class="btn-action btn-action-raise">Raise</button>
  <button class="btn-action btn-action-call">Call</button>
  <button class="btn-action btn-action-mix">Mix</button>
  <button class="btn-action btn-action-fold">Fold</button>
</div>
```

### Range Grid
```html
<div class="range-grid">
  <div class="grid-cell cell-raise" data-hand="AA">AA</div>
  <div class="grid-cell cell-call" data-hand="AKs">AKs</div>
  <!-- ... more cells -->
</div>
```

---

This design system provides the foundation for a sophisticated, professional poker training application that matches the quality of premium financial or trading software.