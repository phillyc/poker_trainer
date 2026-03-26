import { HandAction, SpotDrillState } from './types';
import { INITIAL_HANDS_COUNT } from './constants';
import {
    handsState, loadedPresets,
    currentMode, currentTrainingMode, currentEditMode,
    trainingRange, trainingRangeName, trainingRangeDescription,
    currentLoadedPresetKey, spotDrillState,
    setCurrentMode, setCurrentTrainingMode,
    setTrainingRange, setTrainingRangeName, setTrainingRangeDescription,
    setSpotDrillState, setPotOddsDrillState
} from './state';
import { startPotOddsDrill } from './pot-odds';
import { setHandAction, resetAll, getCurrentSelection, setEditMode } from './actions';
import { loadHandsWithActions } from './presets';
import { showToast } from './ui';

/**
 * Switch between edit and train modes
 */
export function switchMode(mode: 'edit' | 'train'): void {
    setCurrentMode(mode);
    
    const navBar = document.querySelector('.nav-bar') as HTMLElement;
    const editElements = document.querySelectorAll('.edit-only');
    const trainElements = document.querySelectorAll('.train-only');
    const modeToggle = document.getElementById('mode-toggle');
    
    if (mode === 'train') {
        // Keep nav bar visible for mode toggle button, but hide other nav sections
        if (navBar) navBar.style.display = 'block';
        const navSections = navBar.querySelectorAll('.nav-section');
        navSections.forEach((section, index) => {
            // Keep first section (mode toggle) visible, hide others
            if (index > 0) {
                (section as HTMLElement).style.display = 'none';
            }
        });
        editElements.forEach(el => (el as HTMLElement).style.display = 'none');
        trainElements.forEach(el => (el as HTMLElement).style.display = 'block');
        
        // Store current range as training target
        setTrainingRange(getCurrentSelection());
        
        // Get preset info if available
        if (currentLoadedPresetKey && loadedPresets[currentLoadedPresetKey]) {
            const preset = loadedPresets[currentLoadedPresetKey];
            setTrainingRangeName(preset.name);
            setTrainingRangeDescription(preset.description);
        } else {
            setTrainingRangeName('Custom Range');
            setTrainingRangeDescription('User-created range');
        }
        
        // Display range info
        const rangeInfoDiv = document.getElementById('train-range-info');
        if (rangeInfoDiv) {
            rangeInfoDiv.innerHTML = `
                <h2>${trainingRangeName}</h2>
                <p class="range-description">${trainingRangeDescription}</p>
            `;
        }
        
        const spotDrillRangeInfoDiv = document.getElementById('spot-drill-range-info');
        if (spotDrillRangeInfoDiv) {
            spotDrillRangeInfoDiv.innerHTML = `
                <h2>${trainingRangeName}</h2>
                <p class="range-description">${trainingRangeDescription}</p>
            `;
        }
        
        // Clear the grid for practice
        resetAll();
        
        // Ensure edit mode button states are synced
        setEditMode(currentEditMode);
        
        // Update training mode display
        updateTrainingModeDisplay();
        
        // Update toggle button
        if (modeToggle) modeToggle.textContent = '← Back to Edit Mode';
    } else {
        // Show navigation and edit elements
        if (navBar) navBar.style.display = 'block';
        // Show all nav sections
        const navSections = navBar.querySelectorAll('.nav-section');
        navSections.forEach((section) => {
            (section as HTMLElement).style.display = 'block';
        });
        editElements.forEach(el => (el as HTMLElement).style.display = 'block');
        trainElements.forEach(el => (el as HTMLElement).style.display = 'none');
        
        // Restore the training range to the grid
        const rangeGrid = document.getElementById('range-grid');
        if (rangeGrid) {
            rangeGrid.style.display = 'grid';
        }
        
        if (trainingRange) {
            loadHandsWithActions(trainingRange);
        }
        
        // Clear training data
        setTrainingRange(null);
        setTrainingRangeName('');
        setTrainingRangeDescription('');
        setSpotDrillState(null);
        setPotOddsDrillState(null);
        
        // Ensure edit mode button states are synced
        setEditMode(currentEditMode);
        
        // Update toggle button
        if (modeToggle) modeToggle.textContent = 'Switch to Train Mode →';
    }
}

/**
 * Switch between training modes (Range Recall, Spot Drill, Pot Odds)
 */
export function switchTrainingMode(mode: 'range-recall' | 'spot-drill' | 'pot-odds'): void {
    setCurrentTrainingMode(mode);
    updateTrainingModeDisplay();
    
    if (mode === 'spot-drill') {
        startSpotDrill();
        setPotOddsDrillState(null);
    } else if (mode === 'pot-odds') {
        stopSpotDrill();
        startPotOddsDrill();
    } else {
        stopSpotDrill();
        setPotOddsDrillState(null);
    }
}

/**
 * Update the display based on current training mode
 */
export function updateTrainingModeDisplay(): void {
    const rangeRecallMode = document.querySelector('.range-recall-mode') as HTMLElement;
    const spotDrillMode = document.querySelector('.spot-drill-mode') as HTMLElement;
    const potOddsMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    const rangeGrid = document.getElementById('range-grid');
    const trainControls = document.querySelector('.train-controls') as HTMLElement;
    const trainResult = document.getElementById('train-result');
    const spotDrillResult = document.getElementById('spot-drill-result');
    const potOddsResult = document.getElementById('pot-odds-result');
    const rangeRecallBtn = document.getElementById('range-recall-btn');
    const spotDrillBtn = document.getElementById('spot-drill-btn');
    const potOddsBtn = document.getElementById('pot-odds-btn');
    
    // Reset all mode buttons
    if (rangeRecallBtn) rangeRecallBtn.classList.remove('active');
    if (spotDrillBtn) spotDrillBtn.classList.remove('active');
    if (potOddsBtn) potOddsBtn.classList.remove('active');
    
    // Hide all mode-specific UI
    if (rangeRecallMode) rangeRecallMode.style.display = 'none';
    if (spotDrillMode) spotDrillMode.style.display = 'none';
    if (potOddsMode) potOddsMode.style.display = 'none';
    if (rangeGrid) rangeGrid.style.display = 'none';
    if (trainControls) trainControls.style.display = 'none';
    if (trainResult) trainResult.style.display = 'none';
    if (spotDrillResult) spotDrillResult.style.display = 'none';
    if (potOddsResult) potOddsResult.style.display = 'none';
    
    if (currentTrainingMode === 'spot-drill') {
        if (spotDrillMode) spotDrillMode.style.display = 'block';
        if (spotDrillBtn) spotDrillBtn.classList.add('active');
    } else if (currentTrainingMode === 'pot-odds') {
        if (potOddsMode) potOddsMode.style.display = 'block';
        if (potOddsBtn) potOddsBtn.classList.add('active');
    } else {
        // range-recall
        if (rangeRecallMode) rangeRecallMode.style.display = 'block';
        if (rangeGrid) rangeGrid.style.display = 'grid';
        if (trainControls) trainControls.style.display = 'flex';
        if (rangeRecallBtn) rangeRecallBtn.classList.add('active');
    }
}

/**
 * Generate a shuffled array of hands from the training range
 */
export function generateHandsQueue(count: number, excludeHands?: string[]): string[] {
    if (!trainingRange) return [];
    
    let hands = Object.keys(trainingRange);
    
    // Exclude hands that have already been shown
    if (excludeHands && excludeHands.length > 0) {
        const excludeSet = new Set(excludeHands);
        hands = hands.filter(hand => !excludeSet.has(hand));
    }
    
    // If we've exhausted all hands, shuffle and start over
    if (hands.length === 0) {
        hands = Object.keys(trainingRange);
    }
    
    const shuffled = [...hands].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Start a new Spot Drill session
 */
export function startSpotDrill(): void {
    if (!trainingRange) return;
    
    const initialHands = generateHandsQueue(INITIAL_HANDS_COUNT);
    
    setSpotDrillState({
        handsQueue: initialHands,
        currentHandIndex: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        results: []
    });
    
    // Show first hand
    displayNextHand();
    updateSpotDrillProgress();
    
    // Hide results if showing
    const resultDiv = document.getElementById('spot-drill-result');
    if (resultDiv) resultDiv.style.display = 'none';
}

/**
 * Stop Spot Drill and reset state
 */
export function stopSpotDrill(): void {
    setSpotDrillState(null);
}

/**
 * Parse a hand notation string to extract card ranks
 * Examples: "QJs" -> ["Q", "J"], "AA" -> ["A", "A"], "KQo" -> ["K", "Q"]
 */
export function parseHand(hand: string): { rank1: string; rank2: string; suited: boolean } {
    // Remove trailing 's' (suited) or 'o' (offsuit) if present
    const cleanHand = hand.replace(/[so]$/, '');
    const suited = hand.endsWith('s');
    
    if (cleanHand.length === 2) {
        // Pocket pair or two different ranks
        return {
            rank1: cleanHand[0],
            rank2: cleanHand[1],
            suited
        };
    }
    
    // Fallback for unexpected formats
    return { rank1: '?', rank2: '?', suited: false };
}

/**
 * Get color for a card based on rank (for visualization)
 * Uses only four colors: red, green, blue, and black
 */
export function getCardColor(rank: string, index: number, suited: boolean): string {
    // Only four colors: red, green, blue, black
    // Assign colors based on rank for consistency
    const rankColors: { [key: string]: string } = {
        'A': '#dc3545', // Red
        'K': '#000000', // Black
        'Q': '#007bff', // Blue
        'J': '#28a745', // Green
        'T': '#dc3545', // Red
        '9': '#28a745', // Green
        '8': '#007bff', // Blue
        '7': '#000000', // Black
        '6': '#dc3545', // Red
        '5': '#28a745', // Green
        '4': '#007bff', // Blue
        '3': '#000000', // Black
        '2': '#dc3545', // Red
    };
    
    // Use rank-based color, or fallback to index-based
    if (rankColors[rank]) {
        return rankColors[rank];
    }
    
    // Fallback: index-based coloring with four colors only
    if (index === 0) {
        return '#dc3545'; // Red
    } else {
        if (suited) {
            return '#28a745'; // Green for suited
        } else {
            return '#007bff'; // Blue for offsuit
        }
    }
}

/**
 * Create a card element as a colored square with letter
 */
export function createCardElement(rank: string, color: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card-square';
    card.textContent = rank;
    card.style.backgroundColor = color;
    return card;
}

/**
 * Display the next hand in the queue with visual card representation
 */
export function displayNextHand(): void {
    if (!spotDrillState || spotDrillState.currentHandIndex >= spotDrillState.handsQueue.length) {
        // All hands shown, show results
        showSpotDrillResults();
        return;
    }
    
    const currentHand = spotDrillState.handsQueue[spotDrillState.currentHandIndex];
    const { rank1, rank2, suited } = parseHand(currentHand);
    
    // Display in table center only
    const handDisplay = document.getElementById('current-hand-display');
    if (handDisplay) {
        handDisplay.innerHTML = '';
        
        // Create card elements
        const card1 = createCardElement(rank1, getCardColor(rank1, 0, suited));
        const card2 = createCardElement(rank2, getCardColor(rank2, 1, suited));
        
        handDisplay.appendChild(card1);
        handDisplay.appendChild(card2);
    }
}

/**
 * Handle action selection in Spot Drill
 */
export function handleSpotDrillAction(action: HandAction): void {
    if (!spotDrillState || !trainingRange) return;
    
    const currentHand = spotDrillState.handsQueue[spotDrillState.currentHandIndex];
    const correctAction = trainingRange[currentHand];
    
    const isCorrect = action === correctAction;
    
    // Record result
    spotDrillState.results.push({
        hand: currentHand,
        correctAction: correctAction,
        userAction: action,
        correct: isCorrect
    });
    
    if (isCorrect) {
        spotDrillState.correctAnswers++;
        showToast('✓ Correct!', 'success');
    } else {
        showToast(`✗ Wrong! Correct action: ${correctAction.charAt(0).toUpperCase() + correctAction.slice(1)}`, 'error');
    }
    
    spotDrillState.totalAttempts++;
    spotDrillState.currentHandIndex++;
    
    updateSpotDrillProgress();
    
    // Show next hand after a brief delay
    setTimeout(() => {
        displayNextHand();
    }, 1000);
}

/**
 * Update progress display
 */
export function updateSpotDrillProgress(): void {
    if (!spotDrillState) return;
    
    const progressText = document.getElementById('spot-drill-progress-text');
    if (progressText) {
        const completed = spotDrillState.currentHandIndex;
        const total = spotDrillState.handsQueue.length;
        progressText.textContent = `${completed} / ${total}`;
    }
}

/**
 * Show Spot Drill results
 */
export function showSpotDrillResults(): void {
    if (!spotDrillState) return;
    
    const resultDiv = document.getElementById('spot-drill-result');
    if (!resultDiv) return;
    
    const accuracy = spotDrillState.totalAttempts > 0 
        ? ((spotDrillState.correctAnswers / spotDrillState.totalAttempts) * 100).toFixed(1) 
        : '0.0';
    
    const resultsHtml = `
        <h3>Spot Drill Results</h3>
        <p class="accuracy">Accuracy: ${accuracy}%</p>
        <p>✓ Correct: ${spotDrillState.correctAnswers} / ${spotDrillState.totalAttempts}</p>
        <div class="spot-drill-results-actions">
            <button id="continue-drill-btn" class="train-button submit-button">Continue Drilling</button>
            <button id="restart-drill-btn" class="train-button reset-button">Restart</button>
        </div>
    `;
    
    resultDiv.innerHTML = resultsHtml;
    resultDiv.style.display = 'block';
    
    // Setup continue and restart buttons
    const continueBtn = document.getElementById('continue-drill-btn');
    const restartBtn = document.getElementById('restart-drill-btn');
    
    if (continueBtn) {
        // Remove old event listener by cloning and replacing
        const newContinueBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode?.replaceChild(newContinueBtn, continueBtn);
        
        newContinueBtn.addEventListener('click', () => {
            // Add more hands to queue, excluding already shown hands
            if (spotDrillState) {
                const shownHands = spotDrillState.results.map(r => r.hand);
                const additionalHands = generateHandsQueue(INITIAL_HANDS_COUNT, shownHands);
                if (additionalHands.length > 0) {
                    spotDrillState.handsQueue = [...spotDrillState.handsQueue, ...additionalHands];
                    resultDiv.style.display = 'none';
                    displayNextHand();
                } else {
                    // All hands have been shown, show final results
                    showSpotDrillResults();
                }
            }
        });
    }
    
    if (restartBtn) {
        // Remove old event listener by cloning and replacing
        const newRestartBtn = restartBtn.cloneNode(true);
        restartBtn.parentNode?.replaceChild(newRestartBtn, restartBtn);
        
        newRestartBtn.addEventListener('click', () => {
            startSpotDrill();
        });
    }
}

/**
 * Submit training attempt and show results
 */
export function submitTraining(): void {
    if (!trainingRange) return;
    
    const userAttempt = getCurrentSelection();
    let correct = 0;
    let incorrect = 0;
    let missed = 0;
    const totalHands = Object.keys(trainingRange).length;
    
    // Clear all visual states first
    handsState.forEach((handState) => {
        const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
        if (cell) {
            cell.classList.remove('train-correct', 'train-incorrect', 'train-missed');
        }
    });
    
    // Check each hand in the training range
    Object.keys(trainingRange).forEach((hand) => {
        const correctAction = trainingRange![hand];
        const userAction = userAttempt[hand];
        const cell = document.querySelector(`[data-hand="${hand}"]`);
        
        if (userAction === correctAction) {
            // Correct
            correct++;
            if (cell) cell.classList.add('train-correct');
        } else if (userAction && userAction !== correctAction) {
            // Wrong action
            incorrect++;
            if (cell) cell.classList.add('train-incorrect');
        } else {
            // Missed
            missed++;
            if (cell) cell.classList.add('train-missed');
        }
    });
    
    // Check for extra hands user added that shouldn't be there
    Object.keys(userAttempt).forEach((hand) => {
        if (!trainingRange![hand]) {
            incorrect++;
            const cell = document.querySelector(`[data-hand="${hand}"]`);
            if (cell) cell.classList.add('train-incorrect');
        }
    });
    
    // Calculate accuracy
    const accuracy = totalHands > 0 ? ((correct / totalHands) * 100).toFixed(1) : '0.0';
    
    // Show results
    const resultDiv = document.getElementById('train-result');
    if (resultDiv) {
        resultDiv.innerHTML = `
            <h3>Results</h3>
            <p class="accuracy">Accuracy: ${accuracy}%</p>
            <p>✓ Correct: ${correct} / ${totalHands}</p>
            <p>✗ Incorrect: ${incorrect}</p>
            <p>⊗ Missed: ${missed}</p>
            <p class="result-legend">Green border = Correct | Red border = Incorrect | Yellow border = Missed</p>
        `;
        resultDiv.style.display = 'block';
        resultDiv.classList.remove('pulse-animation');
        // Trigger reflow to restart animation
        void resultDiv.offsetWidth;
        resultDiv.classList.add('pulse-animation');
    }
}

/**
 * Reset training attempt
 */
export function resetTraining(): void {
    resetAll();
    
    // Clear result display
    const resultDiv = document.getElementById('train-result');
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }
    
    // Clear training visual states
    handsState.forEach((handState) => {
        const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
        if (cell) {
            cell.classList.remove('train-correct', 'train-incorrect', 'train-missed');
        }
    });
}
