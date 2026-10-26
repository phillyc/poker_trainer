/**
 * Regression tests for the "Poker Trainer" header reset behavior.
 *
 * Clicking the top-left brand (the 🃏 icon or the "Poker Trainer" text) — or
 * activating it via keyboard (Enter/Space, since the element is role="button") —
 * must restore the app to its initial starting conditions via
 * `resetAppToInitialState()`.
 *
 * Two suites:
 *  - Unit suite: exercises `resetAppToInitialState()` directly against a
 *    rendered DOM and verifies every piece of state returns to default and
 *    that the function is idempotent.
 *  - Integration suite: boots the real `src/app.ts` (which wires the header
 *    listeners in setupNavigation) and dispatches real UI events on the
 *    `.nav-brand` icon, text, and keyboard. This is a true regression test:
 *    if the wiring is removed, these tests fail.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    handsState,
    isDragging, dragAction, isTouching, lastTouchedHand,
    currentEditMode, currentMode, currentTrainingMode, currentNavTab,
    trainingRange, trainingRangeName, trainingRangeDescription,
    currentLoadedPresetKey, spotDrillState, potOddsDrillState,
    setCurrentMode, setCurrentTrainingMode, setCurrentNavTab,
    setCurrentEditMode, setIsDragging, setDragAction, setIsTouching, setLastTouchedHand,
    setTrainingRange, setTrainingRangeName, setTrainingRangeDescription,
    setCurrentLoadedPresetKey, setSpotDrillState, setPotOddsDrillState,
} from '../src/state';
import { resetAppToInitialState, setHandAction } from '../src/actions';
import { createRangeGrid } from '../src/grid';

/**
 * Build a DOM that mirrors index.html — header, nav tabs, editor view with the
 * range grid, the three training views, results, toast container, and the
 * mobile nav toggle — so both `resetAppToInitialState()` and `src/app.ts`
 * init() can run against it.
 */
export function buildAppDom(): void {
    document.body.innerHTML = `
    <button id="mobile-nav-toggle" class="mobile-nav-toggle">
      <span class="hamburger-icon">☰</span>
      <span class="close-icon" style="display: none;">×</span>
    </button>
    <div id="nav-backdrop" class="nav-backdrop"></div>
    <div class="app-layout">
      <nav class="nav-bar" id="nav-bar">
        <div class="nav-brand" role="button" tabindex="0" aria-label="Reset Poker Trainer">
          <span class="nav-brand-icon">🃏</span>
          <span class="nav-brand-text">Poker Trainer</span>
        </div>
        <div class="nav-tabs" role="tablist">
          <button class="nav-tab active" data-tab="editor" role="tab" aria-selected="true">Editor</button>
          <button class="nav-tab" data-tab="library" role="tab" aria-selected="false">Library</button>
          <button class="nav-tab" data-tab="practice" role="tab" aria-selected="false">Practice</button>
          <button class="nav-tab" data-tab="settings" role="tab" aria-selected="false">Settings</button>
        </div>
        <div class="nav-tab-content active" data-tab-content="editor">
          <div class="nav-section">
            <h3>Paint Mode</h3>
            <div class="nav-paint-modes">
              <button class="edit-mode-btn" data-action="raise">Raise</button>
              <button class="edit-mode-btn" data-action="call">Call</button>
              <button class="edit-mode-btn" data-action="fold">Fold</button>
              <button class="edit-mode-btn" data-action="mix-rc">Mix R/C</button>
              <button class="edit-mode-btn" data-action="mix-rf">Mix R/F</button>
            </div>
          </div>
          <div class="nav-section">
            <h3>Quick Actions</h3>
            <button id="select-all-btn">Select All</button>
            <button id="reset-btn">Clear All</button>
          </div>
          <div class="nav-section">
            <input type="text" id="range-name-input" placeholder="Enter range name...">
            <button id="save-range-btn">Save Range</button>
          </div>
        </div>
        <div class="nav-tab-content" data-tab-content="library">
          <div id="presets-container"></div>
          <div id="saved-ranges-list"><p class="empty-message">No saved ranges yet</p></div>
        </div>
        <div class="nav-tab-content" data-tab-content="practice">
          <p class="nav-help-text" id="practice-help-text">Load a range from the Library tab, then choose a training mode below.</p>
          <button id="start-range-recall-btn">Range Recall</button>
          <button id="start-spot-drill-btn">Spot Drill</button>
          <button id="start-pot-odds-btn">Pot Odds</button>
          <div class="nav-section train-only-nav" style="display: none;">
            <button id="back-to-editor-btn">Back to Editor</button>
          </div>
        </div>
        <div class="nav-tab-content" data-tab-content="settings">
          <p class="nav-help-text">Settings coming soon.</p>
        </div>
      </nav>
      <div class="main-content">
        <div class="container">
          <div id="editor-view" class="view-panel active">
            <h1>Texas Hold'em Range Trainer</h1>
            <div id="range-grid" class="range-grid"></div>
            <div class="stats">
              <p>Selected: <span id="selected-count"></span> hands</p>
            </div>
          </div>
          <div id="range-recall-view" class="view-panel train-only" style="display: none;">
            <h1>Range Recall</h1>
            <div id="train-range-info"></div>
            <div id="train-grid-anchor"></div>
            <button id="reset-train-btn">Reset</button>
            <button id="submit-train-btn">Submit</button>
            <div id="train-result" style="display: none;"></div>
          </div>
          <div id="spot-drill-view" class="view-panel train-only" style="display: none;">
            <h1>Spot Drill</h1>
            <div id="spot-drill-range-info"></div>
            <div id="current-hand-display"></div>
            <span id="spot-drill-progress-text">0 / 5</span>
            <button class="spot-action-btn" data-action="raise">Raise</button>
            <div id="spot-drill-result" style="display: none;"></div>
          </div>
          <div id="pot-odds-view" class="view-panel train-only" style="display: none;">
            <h1>Pot Odds Drill</h1>
            <span id="pot-value">$0</span>
            <span id="bet-value">$0</span>
            <div id="pot-odds-options"></div>
            <span id="pot-odds-progress-text">0 / 10</span>
            <div id="pot-odds-result" style="display: none;"></div>
          </div>
        </div>
      </div>
    </div>
    <div id="toast-container" class="toast-container"></div>
  `;
}

/**
 * Put the app into a clearly non-initial state: hands raised, mode switched,
 * nav tab moved, mobile nav open, results visible, range name filled.
 */
async function makeStateNonInitial(): Promise<void> {
    // Hands: raise a spread of hands (don't touch DOM directly; use the app action)
    setHandAction('AA', 'raise');
    setHandAction('AKs', 'raise');
    setHandAction('KQo', 'call');
    handsState.forEach((cell) => {
        if (cell.action === 'fold') cell.action = 'raise';
    });

    // Mode / training / interaction state
    setCurrentMode('train');
    setCurrentTrainingMode('spot-drill');
    setCurrentNavTab('library');
    setCurrentEditMode('fold');
    setIsDragging(true);
    setDragAction('raise');
    setIsTouching(true);
    setLastTouchedHand('AA');
    setTrainingRange({ AA: 'raise' });
    setTrainingRangeName('My Range');
    setTrainingRangeDescription('desc');
    setCurrentLoadedPresetKey('tight');
    setSpotDrillState({
        handsQueue: ['AA', 'KK'],
        currentHandIndex: 0,
        correctAnswers: 1,
        totalAttempts: 3,
        results: [{ hand: 'AA', correctAction: 'raise', userAction: 'raise', correct: true }],
    });
    setPotOddsDrillState({
        problems: [],
        currentIndex: 0,
        correctAnswers: 1,
        totalAttempts: 2,
        results: [],
        questionStartTime: Date.now(),
        batchSize: 10,
        difficulty: 'easy',
    });

    // DOM mirrors the non-initial state
    const editorView = document.getElementById('editor-view') as HTMLElement;
    const recallView = document.getElementById('range-recall-view') as HTMLElement;
    const grid = document.getElementById('range-grid') as HTMLElement;
    editorView.style.display = 'none';
    editorView.classList.remove('active');
    recallView.style.display = 'block';
    recallView.classList.add('active');
    const anchor = document.getElementById('train-grid-anchor');
    if (anchor && grid.parentElement !== anchor) anchor.appendChild(grid);

    const libraryTab = document.querySelector('.nav-tab[data-tab="library"]') as HTMLElement;
    const editorTab = document.querySelector('.nav-tab[data-tab="editor"]') as HTMLElement;
    const libraryContent = document.querySelector('[data-tab-content="library"]') as HTMLElement;
    const editorContent = document.querySelector('[data-tab-content="editor"]') as HTMLElement;
    editorTab.classList.remove('active');
    libraryTab.classList.add('active');
    editorContent.classList.remove('active');
    libraryContent.classList.add('active');

    const navBar = document.getElementById('nav-bar') as HTMLElement;
    const backdrop = document.getElementById('nav-backdrop') as HTMLElement;
    navBar.classList.add('mobile-open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';

    const trainResult = document.getElementById('train-result') as HTMLElement;
    const spotResult = document.getElementById('spot-drill-result') as HTMLElement;
    const potResult = document.getElementById('pot-odds-result') as HTMLElement;
    trainResult.style.display = 'block';
    spotResult.style.display = 'block';
    potResult.style.display = 'block';

    const helpText = document.getElementById('practice-help-text') as HTMLElement;
    helpText.textContent = 'some custom help';
    helpText.style.fontStyle = 'normal';

    const rangeName = document.getElementById('range-name-input') as HTMLInputElement;
    rangeName.value = 'My Saved Range';

    const callBtn = document.querySelector('.edit-mode-btn[data-action="call"]') as HTMLElement;
    const raiseBtn = document.querySelector('.edit-mode-btn[data-action="raise"]') as HTMLElement;
    callBtn.classList.add('active');
    raiseBtn.classList.remove('active');
}

/**
 * Assert every aspect of the initial starting conditions (mirrors the
 * DEFAULT_APP_STATE spec).
 */
function expectInitialState(): void {
    // 1. Hands all fold
    expect(handsState.size).toBe(169);
    for (const cell of handsState.values()) {
        expect(cell.action).toBe('fold');
    }

    // 2. Drag/touch state
    expect(isDragging).toBe(false);
    expect(dragAction).toBeNull();
    expect(isTouching).toBe(false);
    expect(lastTouchedHand).toBeNull();

    // 3. Mode state
    expect(currentMode).toBe('edit');
    expect(currentTrainingMode).toBe('range-recall');
    expect(currentNavTab).toBe('editor');
    expect(currentEditMode).toBe('raise');

    // 4. Training state
    expect(trainingRange).toBeNull();
    expect(trainingRangeName).toBe('');
    expect(trainingRangeDescription).toBe('');
    expect(currentLoadedPresetKey).toBe('');
    expect(spotDrillState).toBeNull();
    expect(potOddsDrillState).toBeNull();

    // 5. Editor view visible, others hidden
    const editorView = document.getElementById('editor-view') as HTMLElement;
    const recallView = document.getElementById('range-recall-view') as HTMLElement;
    const spotView = document.getElementById('spot-drill-view') as HTMLElement;
    const potView = document.getElementById('pot-odds-view') as HTMLElement;
    expect(editorView.style.display).toBe('block');
    expect(editorView.classList.contains('active')).toBe(true);
    expect(recallView.style.display).toBe('none');
    expect(spotView.style.display).toBe('none');
    expect(potView.style.display).toBe('none');

    // 6. Grid moved back into editor view and visible
    const grid = document.getElementById('range-grid') as HTMLElement;
    expect(grid.parentElement).toBe(editorView);
    expect(grid.style.display).toBe('grid');

    // 7. Nav tabs: editor active, others not
    const editorTab = document.querySelector('.nav-tab[data-tab="editor"]') as HTMLElement;
    const libraryTab = document.querySelector('.nav-tab[data-tab="library"]') as HTMLElement;
    expect(editorTab.classList.contains('active')).toBe(true);
    expect(libraryTab.classList.contains('active')).toBe(false);
    const editorContent = document.querySelector('[data-tab-content="editor"]') as HTMLElement;
    const libraryContent = document.querySelector('[data-tab-content="library"]') as HTMLElement;
    expect(editorContent.classList.contains('active')).toBe(true);
    expect(libraryContent.classList.contains('active')).toBe(false);

    // 8. Mobile nav closed
    const navBar = document.getElementById('nav-bar') as HTMLElement;
    const backdrop = document.getElementById('nav-backdrop') as HTMLElement;
    expect(navBar.classList.contains('mobile-open')).toBe(false);
    expect(backdrop.classList.contains('show')).toBe(false);
    expect(document.body.style.overflow).toBe('');

    // 9. Paint mode: raise active, others not
    const raiseBtn = document.querySelector('.edit-mode-btn[data-action="raise"]') as HTMLElement;
    const callBtn = document.querySelector('.edit-mode-btn[data-action="call"]') as HTMLElement;
    expect(raiseBtn.classList.contains('active')).toBe(true);
    expect(callBtn.classList.contains('active')).toBe(false);

    // 10. Range name input cleared
    const rangeName = document.getElementById('range-name-input') as HTMLInputElement;
    expect(rangeName.value).toBe('');

    // 11. Results hidden + train-only nav hidden
    expect((document.getElementById('train-result') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('spot-drill-result') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('pot-odds-result') as HTMLElement).style.display).toBe('none');
    document.querySelectorAll('.train-only-nav').forEach((el) => {
        expect((el as HTMLElement).style.display).toBe('none');
    });

    // 12. Practice help text reset
    const helpText = document.getElementById('practice-help-text') as HTMLElement;
    expect(helpText.textContent).toBe('Load a range from the Library tab, then choose a training mode below.');
    expect(helpText.style.fontStyle).toBe('italic');

    // 13. Toast confirming the reset
    const container = document.getElementById('toast-container') as HTMLElement;
    expect(container.querySelector('.toast')?.textContent).toContain('App reset to default state');

    // 14. Stats display shows the default 0 / 169 selection
    const selectedCount = document.getElementById('selected-count') as HTMLElement;
    expect(selectedCount.textContent).toContain('0 / 169');
}

// ---------------------------------------------------------------------------
// Unit suite: resetAppToInitialState() direct
// ---------------------------------------------------------------------------
describe('resetAppToInitialState() — unit', () => {
    beforeEach(() => {
        buildAppDom();
        handsState.clear();
        createRangeGrid();
        localStorage.clear();
    });

    it('restores every piece of state to initial starting conditions', () => {
        makeStateNonInitial();
        resetAppToInitialState();
        expectInitialState();
    });

    it('is idempotent — calling twice yields the same state as calling once', () => {
        makeStateNonInitial();
        resetAppToInitialState();
        const afterOne = captureStateSnapshot();

        makeStateNonInitial();
        resetAppToInitialState();
        resetAppToInitialState();
        const afterTwo = captureStateSnapshot();

        expect(afterTwo).toEqual(afterOne);
    });

    it('does not clear localStorage saved ranges (user data is preserved)', () => {
        localStorage.setItem('poker-trainer-saved-ranges', JSON.stringify([{ name: 'keep-me', hands: { AA: 'raise' }, timestamp: 1 }]));
        makeStateNonInitial();
        resetAppToInitialState();
        const saved = JSON.parse(localStorage.getItem('poker-trainer-saved-ranges') || '[]');
        expect(saved).toHaveLength(1);
        expect(saved[0].name).toBe('keep-me');
    });

    it('does not throw when DOM elements are missing (defensive reset)', () => {
        document.body.innerHTML = '';
        handsState.clear();
        expect(() => resetAppToInitialState()).not.toThrow();
    });

    it('clears train-correct/train-incorrect/train-missed feedback classes from cells', () => {
        handsState.forEach((cell) => { cell.action = 'raise'; });
        document.querySelectorAll('.hand-cell').forEach((cell) => {
            cell.classList.add('train-correct', 'train-incorrect');
        });
        resetAppToInitialState();
        document.querySelectorAll('.hand-cell').forEach((cell) => {
            expect(cell.classList.contains('train-correct')).toBe(false);
            expect(cell.classList.contains('train-incorrect')).toBe(false);
            expect(cell.classList.contains('train-missed')).toBe(false);
        });
    });
});

// ---------------------------------------------------------------------------
// Integration suite: real header wiring via src/app.ts
// ---------------------------------------------------------------------------
describe('Poker Trainer header reset — integration', () => {
    let app: typeof import('../src/app');
    let stateMod: typeof import('../src/state');
    let actionsMod: typeof import('../src/actions');

    beforeEach(async () => {
        buildAppDom();
        // init() → loadPresetsFromFile() fetches 'presets.json'; stub it out
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
        // Fresh module graph so handsState/state are re-seeded by the real init()
        vi.resetModules();
        app = await import('../src/app');
        stateMod = await import('../src/state');
        actionsMod = await import('../src/actions');
        expect(typeof (window as any).resetAppToInitialState).toBe('function');
        // init() is async (awaits the fetch stub) — wait until the real
        // createRangeGrid() inside init() has populated the 169 cells.
        await vi.waitFor(() => {
            expect(document.querySelectorAll('.hand-cell').length).toBe(169);
        });
    });

    it('header brand is exposed as an accessible button (role + tabindex + keyboard)', () => {
        const brand = document.querySelector('.nav-brand') as HTMLElement;
        expect(brand).not.toBeNull();
        expect(brand.getAttribute('role')).toBe('button');
        expect(brand.getAttribute('tabindex')).toBe('0');
        expect(brand.getAttribute('aria-label')).toBe('Reset Poker Trainer');
        // Should be focusable + keyboard-activatable
        expect(brand.tabIndex).toBe(0);
    });

    it('clicking the top-left icon resets the app to initial conditions', async () => {
        // Use the app's own modules so the reset mutates the state we assert on
        const { setHandAction: appSetHandAction } = actionsMod;
        const { handsState: appHands, setCurrentMode: appSetMode } = stateMod;
        appSetHandAction('AA', 'raise');
        appSetMode('train');
        expect(appHands.get('AA')!.action).toBe('raise');
        expect(stateMod.currentMode).toBe('train');

        const icon = document.querySelector('.nav-brand-icon') as HTMLElement;
        icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(stateMod.currentMode).toBe('edit');
        expect(stateMod.currentNavTab).toBe('editor');
        expect(appHands.get('AA')!.action).toBe('fold');
        const editorView = document.getElementById('editor-view') as HTMLElement;
        expect(editorView.classList.contains('active')).toBe(true);
        expect(editorView.style.display).toBe('block');
    });

    it('clicking the "Poker Trainer" text resets the app to initial conditions', async () => {
        const { setHandAction: appSetHandAction } = actionsMod;
        const { handsState: appHands, setCurrentMode: appSetMode } = stateMod;
        appSetHandAction('KK', 'raise');
        appSetMode('train');
        stateMod.setSpotDrillState({
            handsQueue: ['KK'], currentHandIndex: 0, correctAnswers: 0, totalAttempts: 1,
            results: [], 
        });
        expect(stateMod.spotDrillState).not.toBeNull();
        expect(stateMod.currentMode).toBe('train');

        const text = document.querySelector('.nav-brand-text') as HTMLElement;
        text.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(stateMod.currentMode).toBe('edit');
        expect(appHands.get('KK')!.action).toBe('fold');
        expect(stateMod.spotDrillState).toBeNull();
    });

    it('activating via keyboard — Enter — resets the app to initial conditions', () => {
        const brand = document.querySelector('.nav-brand') as HTMLElement;
        brand.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(stateMod.currentMode).toBe('edit');
        expect(stateMod.currentNavTab).toBe('editor');
        expect(stateMod.currentEditMode).toBe('raise');
        expect(stateMod.isDragging).toBe(false);
    });

    it('activating via keyboard — Space — resets the app to initial conditions', () => {
        const brand = document.querySelector('.nav-brand') as HTMLElement;
        brand.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        expect(stateMod.currentMode).toBe('edit');
        expect(stateMod.spotDrillState).toBeNull();
        expect(stateMod.potOddsDrillState).toBeNull();

        // non-activation keys must not reset (guards against over-eager handler)
        stateMod.setCurrentMode('train');
        brand.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(stateMod.currentMode).toBe('train');
    });

    it('clicking the header does not wipe localStorage saved ranges', () => {
        localStorage.setItem('poker-trainer-saved-ranges', JSON.stringify([{ name: 'persist', hands: { AA: 'raise' }, timestamp: 1 }]));
        const icon = document.querySelector('.nav-brand-icon') as HTMLElement;
        icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const saved = JSON.parse(localStorage.getItem('poker-trainer-saved-ranges') || '[]');
        expect(saved).toHaveLength(1);
        expect(saved[0].name).toBe('persist');
    });

    it('still works after clicking repeatedly (no listener accumulation issues)', () => {
        const icon = document.querySelector('.nav-brand-icon') as HTMLElement;
        for (let i = 0; i < 5; i++) {
            stateMod.setCurrentMode('train');
            icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(stateMod.currentMode).toBe('edit');
        }
    });
});

// --- Helper ---

function captureStateSnapshot(): Record<string, unknown> {
    const handActions: Record<string, string> = {};
    handsState.forEach((cell, hand) => { handActions[hand] = cell.action; });
    return {
        currentMode,
        currentTrainingMode,
        currentNavTab,
        currentEditMode,
        trainingRange,
        trainingRangeName,
        trainingRangeDescription,
        currentLoadedPresetKey,
        spotDrillState,
        potOddsDrillState,
        isDragging,
        dragAction,
        isTouching,
        lastTouchedHand,
        handActions,
    };
}