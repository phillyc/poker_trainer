# Mobile Layout Plan for Poker Trainer

## Overview
This document outlines the plan for making the Poker Trainer app fully functional and optimized for both desktop and mobile (iPhone) devices.

## Current State
- Basic mobile media query exists at `@media (max-width: 768px)`
- App uses flexbox layout with fixed 250px sidebar
- Grid is 13x13 with fixed sizing
- Touch interactions not optimized
- Navigation bar takes full width on mobile (not collapsible)

## Mobile Design Goals

### 1. Navigation Bar
**Current Issues:**
- Takes up too much vertical space on mobile
- All sections visible at once
- No way to hide/show navigation

**Solution:**
- **Collapsible Navigation with Hamburger Menu**
  - Add hamburger menu button (☰) in top-left corner
  - Navigation bar hidden by default on mobile
  - Slide-in/overlay navigation when opened
  - Close button (×) in nav header
  - Backdrop overlay when nav is open
  - Smooth animations for open/close

**Implementation:**
- Add `.mobile-nav-toggle` button
- Add `.nav-bar.mobile-open` state
- Use CSS transforms for slide-in animation
- Add backdrop overlay `.nav-backdrop`
- JavaScript to toggle nav visibility

### 2. Range Grid (13x13 Hand Grid)
**Current Issues:**
- Grid cells too small on mobile (0.7em font)
- Hard to tap accurately
- Grid may overflow on small screens
- Gap between cells too small

**Solution:**
- **Optimize Grid for Touch**
  - Increase cell size for better touch targets (min 44x44px for iOS)
  - Reduce font size but keep readable
  - Adjust grid gap for better spacing
  - Consider horizontal scroll if needed (but prefer fit-to-screen)
  - Add touch-friendly drag interactions
  - Support pinch-to-zoom if needed

**Implementation:**
- Calculate cell size based on viewport width
- Use `min()` CSS function to ensure minimum touch target size
- Adjust `gap` property for better spacing
- Test on iPhone SE (smallest common iPhone) - 375px width

### 3. Action Buttons
**Current Issues:**
- Buttons may be too small for touch
- Button groups may wrap awkwardly
  - Edit mode buttons (Fold, Raise, Call, Mix RC, Mix RF)
  - Training mode buttons (Reset, Submit)
  - Spot drill action buttons

**Solution:**
- **Touch-Optimized Button Sizing**
  - Minimum 44x44px touch targets (Apple HIG recommendation)
  - Better spacing between buttons
  - Stack buttons vertically on very small screens if needed
  - Larger padding for easier tapping

**Implementation:**
- Increase button padding: `padding: 12px 20px` → `padding: 14px 24px`
- Ensure min-height of 44px
- Better gap spacing in flex containers
- Consider full-width buttons on mobile for primary actions

### 4. Poker Table Visualization (Spot Drill Mode)
**Current Issues:**
- Table height fixed at 300px on mobile
- Seats may be too small
- Cards in center may be hard to see

**Solution:**
- **Responsive Table Sizing**
  - Scale table based on viewport
  - Ensure seats are tappable (if needed)
  - Larger card display in center
  - Consider simplified view on very small screens

**Implementation:**
- Use `vw` units for table sizing
- Scale seat sizes proportionally
- Increase card square size in table center
- Test readability on iPhone SE

### 5. Text and Typography
**Current Issues:**
- Some text may be too small
- Headings may need adjustment
- Stats text may overflow

**Solution:**
- **Readable Typography**
  - Minimum 16px font size for body text (prevents iOS zoom)
  - Responsive heading sizes
  - Better line-height for readability
  - Truncate long text with ellipsis where appropriate

**Implementation:**
- Set base font-size to 16px minimum
- Use `clamp()` for responsive typography
- Adjust heading sizes: `h1: 1.5em` → `clamp(1.5em, 4vw, 2em)`

### 6. Touch Interactions
**Current Issues:**
- Drag interactions designed for mouse
- No touch event handlers
- May conflict with scroll gestures

**Solution:**
- **Touch Event Support**
  - Add `touchstart`, `touchmove`, `touchend` handlers
  - Prevent default scroll during drag operations
  - Visual feedback for touch interactions
  - Support both mouse and touch seamlessly

**Implementation:**
- Add touch event listeners in `app.ts`
- Use `touch-action: none` CSS for draggable elements
- Prevent scroll during drag: `e.preventDefault()` on touchmove
- Add active state styles for touch feedback

### 7. Viewport and Meta Tags
**Current State:**
- Viewport meta tag exists: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

**Enhancement:**
- Add `user-scalable=no` or `maximum-scale=1.0` if needed (but allow zoom for accessibility)
- Consider `viewport-fit=cover` for iPhone X+ notch support

### 8. Layout Structure
**Current Issues:**
- Sidebar takes full width on mobile (good)
- But may push content down too much
- No sticky positioning for important elements

**Solution:**
- **Optimized Mobile Layout**
  - Sticky header with mode toggle
  - Collapsible navigation (as mentioned above)
  - Better use of vertical space
  - Consider bottom sheet for saved ranges

**Implementation:**
- Make mode toggle button sticky at top
- Use `position: sticky` for important controls
- Consider bottom navigation for quick actions

### 9. Training Mode Specific
**Current Issues:**
- Training controls may be hard to reach
  - Reset/Submit buttons
  - Spot drill action buttons
  - Progress indicators

**Solution:**
- **Mobile-Friendly Training UI**
  - Larger, more prominent action buttons
  - Better spacing for spot drill buttons
  - Sticky training controls at bottom
  - Full-width buttons for primary actions

**Implementation:**
- Increase button sizes in training modes
- Consider fixed bottom bar for training controls
- Better visual hierarchy

### 10. Saved Ranges List
**Current Issues:**
- List may be long and hard to navigate
- Copy/delete buttons may be too small

**Solution:**
- **Touch-Friendly Range Management**
  - Larger touch targets for actions
  - Better spacing between items
  - Swipe-to-delete (optional enhancement)
  - Search/filter for many ranges (future)

**Implementation:**
- Increase button sizes in saved ranges
- Better padding for range items
- Consider full-width items on mobile

## Implementation Priority

### Phase 1: Critical Mobile Fixes (Must Have)
1. ✅ Collapsible navigation with hamburger menu
2. ✅ Touch-optimized grid cells (min 44px)
3. ✅ Touch event handlers for drag operations
4. ✅ Larger button sizes (min 44px touch targets)
5. ✅ Responsive typography (min 16px)

### Phase 2: Enhanced Mobile Experience (Should Have)
6. ✅ Better spacing and layout optimization
7. ✅ Sticky header/controls
8. ✅ Improved poker table scaling
9. ✅ Better mobile-specific button layouts
10. ✅ Touch feedback animations

### Phase 3: Polish (Nice to Have)
11. Swipe gestures for saved ranges
12. Bottom sheet for navigation
13. Haptic feedback (if supported)
14. PWA features (installable, offline)

## Breakpoints

### Current
- Mobile: `@media (max-width: 768px)`

### Recommended
- Small mobile: `@media (max-width: 480px)` - iPhone SE, small Android
- Mobile: `@media (max-width: 768px)` - Standard phones
- Tablet: `@media (min-width: 769px) and (max-width: 1024px)` - iPads
- Desktop: `@media (min-width: 1025px)` - Desktop

## Testing Checklist

### iPhone Testing
- [ ] iPhone SE (375px width) - smallest common iPhone
- [ ] iPhone 12/13/14 (390px width) - standard iPhone
- [ ] iPhone 14 Pro Max (428px width) - largest iPhone
- [ ] Landscape orientation
- [ ] Portrait orientation

### Functionality Testing
- [ ] Navigation open/close
- [ ] Grid cell tapping
- [ ] Drag to paint hands
- [ ] Button interactions
- [ ] Training mode functionality
- [ ] Spot drill mode
- [ ] Saved ranges management
- [ ] Preset loading
- [ ] Toast notifications
- [ ] Modal dialogs

### Performance Testing
- [ ] Smooth animations
- [ ] No layout shifts
- [ ] Fast touch response
- [ ] No janky scrolling

## Technical Considerations

### CSS
- Use CSS Grid and Flexbox (already in use)
- Use `clamp()` for responsive sizing
- Use `min()` and `max()` for constraints
- Use CSS custom properties for theming
- Consider `aspect-ratio` for grid cells

### JavaScript
- Add touch event listeners alongside mouse events
- Use passive event listeners where possible
- Debounce/throttle scroll events
- Test touch event compatibility

### Accessibility
- Maintain keyboard navigation
- Ensure touch targets are accessible
- Test with screen readers
- Maintain color contrast ratios
- Don't disable zoom (accessibility requirement)

## Files to Modify

1. **index.html**
   - Add hamburger menu button
   - Add nav backdrop overlay
   - Add mobile nav structure

2. **styles.css**
   - Enhance mobile media queries
   - Add mobile navigation styles
   - Optimize grid for mobile
   - Add touch-friendly button sizes
   - Add responsive typography

3. **app.ts**
   - Add touch event handlers
   - Add mobile nav toggle functionality
   - Enhance drag interactions for touch
   - Add touch feedback

## Estimated Implementation Time

- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Phase 3: 2-3 hours (optional)

**Total: 3-5 hours for core mobile support**

