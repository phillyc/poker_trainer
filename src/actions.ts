import { HandAction } from './types';
import { handsState, currentEditMode, setCurrentEditMode } from './state';

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
