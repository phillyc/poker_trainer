# Header Reset Spec — Poker Trainer

Task: clicking the top-left header (the 🃏 icon and "Poker Trainer" text) resets the
app to its exact default page-load state at https://philc.io/poker_trainer/.

Source of truth for this spec: the repository `phillyc/poker_trainer` (GitHub Pages
deploy; `npm run build` bundles `src/app.ts` → `app.js` via esbuild). Live-site
inspection was not needed — the repo fully describes app state.

## 1. Trigger element(s)

The whole header brand area in `index.html` (inside the left sidebar `<nav class="nav-bar">`):

```html
<div class="nav-brand">
  <span class="nav-brand-icon">🃏</span>
  <span class="nav-brand-text">Poker Trainer</span>
</div>
```

- Any click landing on `.nav-brand` — including its child `<span>`s (icon or text) — resets the app.
  A single `click` listener on `.nav-brand` covers the children via bubbling; no per-span listeners needed.
- Make it accessible: add `role="button"`, `tabindex="0"`, `aria-label="Reset Poker Trainer"` to
  `.nav-brand`, plus a `keydown` handler for `Enter`/`Space` (preventDefault on Space).
- Add `cursor: pointer` to `.nav-brand` in `styles.css`.
- There are currently NO click/keyboard handlers on `.nav-brand` — nothing to remove, nothing to conflict with.
- Do NOT attach to `#mobile-nav-toggle` (hamburger) or `#nav-backdrop` — those have their own behavior.

## 2. Implementation approach: in-place state reset (recommended)

Implement `resetAppToInitialState()` in `src/actions.ts` and wire it to `.nav-brand` in
`src/app.ts`'s `setupNavigation()`. Do **not** use `window.location.reload()`.

Rationale:
- A reload would re-fetch `presets.json`, flash the page, and make the reset untestable with the
  existing unit-test pattern (the repo is esbuild-bundled TypeScript, vitest-testable).
- The app already has the exact pattern to follow: `backToEditor()` in `src/training.ts` restores
  in-memory state + DOM. `resetAppToInitialState()` is the same idea but complete.
- In-place reset is idempotent, preserves loaded presets in memory, and lets us keep user data
  in `localStorage` (saved ranges) untouched while wiping session state.

A full page reload is an acceptable fallback only if in-place proves fragile — but it is not.

## 3. Exact "default page load state" — reset checklist

### 3.1 In-memory module state (`src/state.ts`)

Restore every exported `let` to its declaration-time default:

| Variable | Default on fresh load |
|---|---|
| `handsState` (Map) | 169 entries, every `action === 'fold'` |
| `isDragging` | `false` |
| `dragAction` | `null` |
| `isTouching` | `false` |
| `lastTouchedHand` | `null` |
| `currentEditMode` | `'raise'` |
| `currentMode` | `'edit'` |
| `currentTrainingMode` | `'range-recall'` |
| `currentNavTab` | `'editor'` |
| `trainingRange` | `null` |
| `trainingRangeName` | `''` |
| `trainingRangeDescription` | `''` |
| `currentLoadedPresetKey` | `''` |
| `spotDrillState` | `null` |
| `potOddsDrillState` | `null` |

Do **not** reset `loadedPresets` — it is immutable app data populated once from `presets.json`
at init, not user session state.

### 3.2 DOM state (matches a fresh `index.html` + `init()`)

1. **Hands grid**: every `.hand-cell` loses all `action-*` classes (fold) and the training
   feedback classes `train-correct` / `train-incorrect` / `train-missed`. Reuse `resetAll()`
   from `src/actions.ts` for the action classes, then strip feedback classes.
2. **Grid placement**: `#range-grid` must be a child of `#editor-view` (before `.stats`).
   During range-recall training the grid is moved into `#train-grid-anchor` — move it back.
   Ensure `#range-grid` has `display: grid`.
3. **View panels**: `#editor-view` visible (`display: block` + `.active`); all other
   `.view-panel`s (`#range-recall-view`, `#spot-drill-view`, `#pot-odds-view`) hidden
   (`display: none`, remove `.active`).
4. **Nav tabs**: `.nav-tab[data-tab="editor"]` has `.active`; others don't.
   `.nav-tab-content[data-tab-content="editor"]` has `.active`; others don't.
5. **Paint mode buttons**: `.edit-mode-btn[data-action="raise"]` has `.active`; all others don't.
6. **Training-only nav**: every `.train-only-nav` element is hidden (`display: none`).
7. **Practice help text**: `#practice-help-text` text = `Load a range from the Library tab, then choose a training mode below.`
   and `font-style: italic` (matches `index.html` static markup).
8. **Result panels**: `#train-result`, `#spot-drill-result`, `#pot-odds-result` hidden (`display: none`).
9. **Range name input**: `#range-name-input` value = `''`.
10. **Mobile nav closed**: `#nav-bar` without `.mobile-open`; `#nav-backdrop` without `.show`;
    `document.body.style.overflow` = `''`; hamburger visible, close icon hidden.
11. **Stats display**: run `updateStats()` so `#selected-count` shows `0.0% ... 0 / 169`.

### 3.3 URL / hash state

None. The app uses no `location.hash`, no query params, no `history` API. Nothing to clear.

### 3.4 Client-side storage

- `localStorage` key `poker-trainer-saved-ranges` (`STORAGE_KEY` in `src/constants.ts`): **preserve it**.
  These are the user's saved ranges; a reset must not delete them (the Library tab re-renders them).
- No other storage is used (no sessionStorage, no cookies by the app itself).

### 3.5 Extra behaviors

- Show a toast (`showToast('App reset to default state', 'success')`) for user feedback.
- The function must be defensive: no `throw` if a DOM element is missing.
- Expose `resetAppToInitialState` on `window` (e.g. `(window as any).resetAppToInitialState = ...`)
  for console/testing use.

## 4. Reference implementation (prior attempt, not merged)

A previous run of this exact feature already implemented and tested all of the above on branch
`poker-trainer/t_c188aa0b-clicking-on-the-top-left-header-section` (commits `ca2cb95` + `ad5d0f8`):
- `resetAppToInitialState()` in `src/actions.ts`
- `.nav-brand` click + keyboard wiring in `src/app.ts`
- `role="button" tabindex="0" aria-label="Reset Poker Trainer"` on `.nav-brand` in `index.html`
- `cursor: pointer` in `styles.css`
- vitest harness (`package.json` test scripts, `vitest.config.mts`, `tests/header-reset.test.ts`
  with 12 unit + integration tests covering the full checklist)

Main has no test harness today; carry the vitest setup forward (devDeps: `vitest`, `jsdom`,
`vite`, `@vitest/coverage-v8`; scripts `test`, `test:watch`, `test:coverage`). The verify task
(t_5340a0b1) can reuse the same test file as the automated check.

## 5. Files to touch

- `src/actions.ts` — add `resetAppToInitialState()`
- `src/app.ts` — wire `.nav-brand` click + keydown in `setupNavigation()`; expose on `window`
- `index.html` — accessibility attributes on `.nav-brand`
- `styles.css` — `cursor: pointer` on `.nav-brand`
- `package.json` / `package-lock.json` / `vitest.config.mts` / `tests/` — test harness + regression tests
- `app.js` — only via `npm run build` (committed build artifact; deploy runs the build)

Acceptance: from any app state (mid-hand, in a drill, on a non-editor tab, mobile nav open),
clicking `.nav-brand` returns the app to exactly the state in §3, with no console errors.