import { HandAction } from './types';
import { RANKS } from './constants';
import {
    handsState,
    isDragging, dragAction, isTouching, lastTouchedHand,
    currentEditMode,
    setIsDragging, setDragAction, setIsTouching, setLastTouchedHand
} from './state';
import { setHandAction } from './actions';

/**
 * Determine the hand label and type based on grid position
 */
export function getHandInfo(row: number, col: number): { hand: string; type: 'pair' | 'suited' | 'offsuit' } {
    const rank1 = RANKS[row];
    const rank2 = RANKS[col];
    
    if (row === col) {
        // Diagonal: Pocket pairs
        return { hand: `${rank1}${rank2}`, type: 'pair' };
    } else if (row < col) {
        // Above diagonal: Suited hands
        return { hand: `${rank1}${rank2}s`, type: 'suited' };
    } else {
        // Below diagonal: Offsuit hands
        return { hand: `${rank2}${rank1}o`, type: 'offsuit' };
    }
}

/**
 * Handle mouse down on a cell - start drag operation
 */
function handleMouseDown(hand: string, event: MouseEvent): void {
    event.preventDefault();
    const handState = handsState.get(hand);
    if (!handState) return;
    
    setIsDragging(true);
    
    // Use the currently selected edit mode
    setDragAction(currentEditMode);
    
    // Apply action to the clicked cell
    setHandAction(hand, currentEditMode);
}

/**
 * Handle mouse enter on a cell during drag
 */
function handleMouseEnter(hand: string): void {
    if (!isDragging || dragAction === null) return;
    
    // Apply the drag action to this cell
    setHandAction(hand, dragAction);
}

/**
 * Handle touch start on a cell
 */
function handleTouchStart(hand: string, event: TouchEvent): void {
    event.preventDefault();
    setIsTouching(true);
    setLastTouchedHand(hand);
    
    const handState = handsState.get(hand);
    if (!handState) return;
    
    setIsDragging(true);
    setDragAction(currentEditMode);
    
    // Apply action to the touched cell
    setHandAction(hand, currentEditMode);
}

/**
 * Handle touch move on a cell
 */
function handleTouchMove(hand: string, event: TouchEvent): void {
    if (!isTouching || !isDragging || dragAction === null) return;
    
    event.preventDefault();
    
    // Get the element under the touch point
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('hand-cell')) {
        const touchedHand = element.getAttribute('data-hand');
        if (touchedHand && touchedHand !== lastTouchedHand) {
            setLastTouchedHand(touchedHand);
            setHandAction(touchedHand, dragAction);
        }
    }
}

/**
 * Handle touch end
 */
export function handleTouchEnd(): void {
    setIsTouching(false);
    setIsDragging(false);
    setDragAction(null);
    setLastTouchedHand(null);
}

/**
 * Create and render the range grid
 */
export function createRangeGrid(): void {
    const gridContainer = document.getElementById('range-grid');
    if (!gridContainer) return;
    
    // Create 13x13 grid
    for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
            const { hand, type } = getHandInfo(row, col);
            
            // Create cell element
            const cell = document.createElement('div');
            cell.className = 'hand-cell';
            cell.textContent = hand;
            cell.dataset.hand = hand;
            
            // Add mouse event listeners for click and drag
            cell.addEventListener('mousedown', (e) => handleMouseDown(hand, e));
            cell.addEventListener('mouseenter', () => handleMouseEnter(hand));
            
            // Add touch event listeners for mobile
            cell.addEventListener('touchstart', (e) => handleTouchStart(hand, e), { passive: false });
            cell.addEventListener('touchmove', (e) => handleTouchMove(hand, e), { passive: false });
            cell.addEventListener('touchend', () => handleTouchEnd());
            
            // Prevent default drag behavior
            cell.addEventListener('dragstart', (e) => e.preventDefault());
            
            gridContainer.appendChild(cell);
            
            // Initialize hand state
            handsState.set(hand, { hand, type, action: 'fold' });
        }
    }
}
