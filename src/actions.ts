import { HandAction } from './types';
import {
    handsState, currentEditMode, setCurrentEditMode,
    setCurrentMode, setCurrentTrainingMode, setCurrentNavTab,
    setTrainingRange, setTrainingRangeName, setTrainingRangeDescription,
    setCurrentLoadedPresetKey, setSpotDrillState, setPotOddsDrillState,
    setIsDragging, setDragAction, setIsTouching, setLastTouchedHand
} from './state';
import { showToast } from './ui';

/**
 * Set action state of a hand
 */
export function setHandAction(hand: string, action: HandAction): void {
    const handState = handsState.get(hand);
    if (!handState) return;
    
    // Only update if state is changing
    if (handState.action === action) return;
    
    handState.action = action;
    
    // Update UI
    const cell = document.querySelector(`[data-hand="${hand}"]`);
    if (cell) {
        // Remove all action classes
        cell.classList.remove('action-fold', 'action-raise', 'action-call', 'action-mix-rc', 'action-mix-rf');
        
        // Add appropriate class
        cell.classList.add(`action-${action}`);
    }
    
    // Update stats
    updateStats();
}

/**
 * Set the current edit mode
 */
export function setEditMode(action: HandAction): void {
    setCurrentEditMode(action);
    
    // Update button states
    const buttons = document.querySelectorAll('.edit-mode-btn');
    buttons.forEach((btn) => {
        const button = btn as HTMLButtonElement;
        if (button.dataset.action === action) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Update the selection statistics display
 */
export function updateStats(): void {
    const raiseCount = Array.from(handsState.values()).filter(h => h.action === 'raise').length;
    const callCount = Array.from(handsState.values()).filter(h => h.action === 'call').length;
    const mixRcCount = Array.from(handsState.values()).filter(h => h.action === 'mix-rc').length;
    const mixRfCount = Array.from(handsState.values()).filter(h => h.action === 'mix-rf').length;
    const totalSelected = raiseCount + callCount + mixRcCount + mixRfCount;
    const totalHands = 169;
    const percentage = ((totalSelected / totalHands) * 100).toFixed(1);
    const raisePercentage = ((raiseCount / totalHands) * 100).toFixed(1);
    const callPercentage = ((callCount / totalHands) * 100).toFixed(1);
    const mixRcPercentage = ((mixRcCount / totalHands) * 100).toFixed(1);
    const mixRfPercentage = ((mixRfCount / totalHands) * 100).toFixed(1);
    
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = `${percentage}% (Raise: ${raisePercentage}%, Call: ${callPercentage}%, Mix RC: ${mixRcPercentage}%, Mix RF: ${mixRfPercentage}%) - ${totalSelected} / ${totalHands}`;
    }
}

/**
 * Reset all hands to fold state
 */
export function resetAll(): void {
    handsState.forEach((handState) => {
        if (handState.action !== 'fold') {
            setHandAction(handState.hand, 'fold');
        }
        
        // Clear any training feedback classes
        const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
        if (cell) {
            cell.classList.remove('train-correct', 'train-incorrect', 'train-missed');
        }
    });
}

/**
 * Select all hands as raise
 */
export function selectAll(): void {
    handsState.forEach((handState) => {
        if (handState.action !== 'raise') {
            setHandAction(handState.hand, 'raise');
        }
    });
}

/**
 * Get currently selected hands with their actions
 */
export function getCurrentSelection(): { [hand: string]: HandAction } {
    const selected: { [hand: string]: HandAction } = {};
    handsState.forEach((handState) => {
        if (handState.action !== 'fold') {
            selected[handState.hand] = handState.action;
        }
    });
    return selected;
}

/**
 * Reset the entire application to its initial starting conditions.
 * Restores all in-memory state, UI panels, and navigation to how they
 * were when the app first loaded — without requiring a page refresh.
 *
 * Does NOT clear localStorage (saved ranges, theme preferences).
 * Repeated calls are safe and idempotent.
 */
export function resetAppToInitialState(): void {
    // 1. Reset all in-memory state to defaults
    setCurrentMode('edit');
    setCurrentTrainingMode('range-recall');
    setCurrentNavTab('editor');
    setCurrentEditMode('raise');

    setTrainingRange(null);
    setTrainingRangeName('');
    setTrainingRangeDescription('');
    setCurrentLoadedPresetKey('');

    // 2. Clear drill states
    setSpotDrillState(null);
    setPotOddsDrillState(null);

    // 3. Clear interaction state
    setIsDragging(false);
    setDragAction(null);
    setIsTouching(false);
    setLastTouchedHand(null);

    // 4. Reset all hands to fold
    resetAll();

    // 5. Move grid back to editor view
    const editorView = document.getElementById('editor-view');
    const grid = document.getElementById('range-grid');
    const stats = editorView?.querySelector('.stats');
    if (editorView && grid) {
        const gridParent = grid.parentElement;
        if (gridParent !== editorView) {
            if (stats) {
                editorView.insertBefore(grid, stats);
            } else {
                editorView.appendChild(grid);
            }
        }
    }

    // 6. Reset edit mode button active state to 'raise'
    document.querySelectorAll('.edit-mode-btn').forEach((btn) => {
        (btn as HTMLButtonElement).classList.toggle('active', btn.getAttribute('data-action') === 'raise');
    });

    // 7. Hide all result/feedback displays
    const resultIds = ['train-result', 'spot-drill-result', 'pot-odds-result'];
    resultIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 8. Hide training-only nav controls
    document.querySelectorAll('.train-only-nav').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
    });

    // 9. Show editor view, hide all others
    document.querySelectorAll('.view-panel').forEach((panel) => {
        (panel as HTMLElement).style.display = 'none';
        panel.classList.remove('active');
    });
    if (editorView) {
        editorView.style.display = 'block';
        editorView.classList.add('active');
    }

    // 10. Reset practice help text
    const helpText = document.getElementById('practice-help-text');
    if (helpText) {
        helpText.textContent = 'Load a range from the Library tab, then choose a training mode below.';
        helpText.style.fontStyle = 'italic';
        helpText.style.color = '';
    }

    // 11. Reset nav tab active state to 'editor'
    document.querySelectorAll('.nav-tab').forEach((t) => {
        (t as HTMLElement).classList.toggle('active', t.getAttribute('data-tab') === 'editor');
    });
    document.querySelectorAll('.nav-tab-content').forEach((c) => {
        (c as HTMLElement).classList.toggle('active', c.getAttribute('data-tab-content') === 'editor');
    });

    // 12. Close mobile navigation
    const navBar = document.getElementById('nav-bar');
    const navBackdrop = document.getElementById('nav-backdrop');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    if (navBar) navBar.classList.remove('mobile-open');
    if (navBackdrop) navBackdrop.classList.remove('show');
    document.body.style.overflow = '';
    if (mobileNavToggle) {
        const hamburgerIcon = mobileNavToggle.querySelector('.hamburger-icon') as HTMLElement;
        const closeIcon = mobileNavToggle.querySelector('.close-icon') as HTMLElement;
        if (hamburgerIcon) hamburgerIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
    }

    // 13. Clear range name input
    const rangeNameInput = document.getElementById('range-name-input') as HTMLInputElement;
    if (rangeNameInput) {
        rangeNameInput.value = '';
    }

    // 14. Ensure grid is visible
    if (grid) grid.style.display = 'grid';

    // 15. Refresh stats display to the default (0 selected)
    updateStats();

    // 16. Confirm reset to user
    showToast('App reset to default state', 'success');
}
