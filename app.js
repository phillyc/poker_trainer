"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Poker ranks from high to low
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
// Store the state of all hands
const handsState = new Map();
// Track drag state
let isDragging = false;
let dragAction = null;
// LocalStorage key for saved ranges
const STORAGE_KEY = 'poker-trainer-saved-ranges';
// Store loaded presets
let loadedPresets = {};
let currentMode = 'edit';
let trainingRange = null;
let trainingRangeName = '';
let trainingRangeDescription = '';
let currentLoadedPresetKey = '';
/**
 * Determine the hand label and type based on grid position
 */
function getHandInfo(row, col) {
    const rank1 = RANKS[row];
    const rank2 = RANKS[col];
    if (row === col) {
        // Diagonal: Pocket pairs
        return { hand: `${rank1}${rank2}`, type: 'pair' };
    }
    else if (row < col) {
        // Above diagonal: Suited hands
        return { hand: `${rank1}${rank2}s`, type: 'suited' };
    }
    else {
        // Below diagonal: Offsuit hands
        return { hand: `${rank2}${rank1}o`, type: 'offsuit' };
    }
}
/**
 * Create and render the range grid
 */
function createRangeGrid() {
    const gridContainer = document.getElementById('range-grid');
    if (!gridContainer)
        return;
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
            // Prevent default drag behavior
            cell.addEventListener('dragstart', (e) => e.preventDefault());
            gridContainer.appendChild(cell);
            // Initialize hand state
            handsState.set(hand, { hand, type, action: 'fold' });
        }
    }
}
/**
 * Handle mouse down on a cell - start drag operation
 */
function handleMouseDown(hand, event) {
    event.preventDefault();
    const handState = handsState.get(hand);
    if (!handState)
        return;
    isDragging = true;
    // Cycle through actions: none -> raise -> call -> none
    const nextAction = getNextAction(handState.action);
    dragAction = nextAction;
    // Apply action to the clicked cell
    setHandAction(hand, nextAction);
}
/**
 * Get next action in cycle: fold -> raise -> call -> mix -> fold
 */
function getNextAction(currentAction) {
    switch (currentAction) {
        case 'fold': return 'raise';
        case 'raise': return 'call';
        case 'call': return 'mix';
        case 'mix': return 'fold';
    }
}
/**
 * Handle mouse enter on a cell during drag
 */
function handleMouseEnter(hand) {
    if (!isDragging || dragAction === null)
        return;
    // Apply the drag action to this cell
    setHandAction(hand, dragAction);
}
/**
 * Set action state of a hand
 */
function setHandAction(hand, action) {
    const handState = handsState.get(hand);
    if (!handState)
        return;
    // Only update if state is changing
    if (handState.action === action)
        return;
    handState.action = action;
    // Update UI
    const cell = document.querySelector(`[data-hand="${hand}"]`);
    if (cell) {
        // Remove all action classes
        cell.classList.remove('action-fold', 'action-raise', 'action-call', 'action-mix');
        // Add appropriate class
        cell.classList.add(`action-${action}`);
    }
    // Update stats
    updateStats();
}
/**
 * Update the selection statistics display
 */
function updateStats() {
    const raiseCount = Array.from(handsState.values()).filter(h => h.action === 'raise').length;
    const callCount = Array.from(handsState.values()).filter(h => h.action === 'call').length;
    const mixCount = Array.from(handsState.values()).filter(h => h.action === 'mix').length;
    const totalSelected = raiseCount + callCount + mixCount;
    const totalHands = 169;
    const percentage = ((totalSelected / totalHands) * 100).toFixed(1);
    const raisePercentage = ((raiseCount / totalHands) * 100).toFixed(1);
    const callPercentage = ((callCount / totalHands) * 100).toFixed(1);
    const mixPercentage = ((mixCount / totalHands) * 100).toFixed(1);
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = `${percentage}% (Raise: ${raisePercentage}%, Call: ${callPercentage}%, Mix: ${mixPercentage}%) - ${totalSelected} / ${totalHands}`;
    }
}
/**
 * Reset all hands to fold state
 */
function resetAll() {
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
function selectAll() {
    handsState.forEach((handState) => {
        if (handState.action !== 'raise') {
            setHandAction(handState.hand, 'raise');
        }
    });
}
/**
 * Load presets from JSON file
 */
function loadPresetsFromFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('presets.json');
            if (!response.ok) {
                console.error('Failed to load presets.json');
                return;
            }
            loadedPresets = yield response.json();
            console.log('Presets loaded successfully:', Object.keys(loadedPresets));
        }
        catch (error) {
            console.error('Error loading presets:', error);
        }
    });
}
/**
 * Load a preset range
 */
function loadPreset(presetName) {
    const preset = loadedPresets[presetName];
    if (!preset) {
        console.warn(`Preset "${presetName}" not found`);
        return;
    }
    // Store the current preset info for train mode
    currentLoadedPresetKey = presetName;
    // Check format type
    if (Array.isArray(preset.hands)) {
        // Format 1: Simple array - all hands are raise
        loadHandsArray(preset.hands);
    }
    else if (typeof preset.hands === 'object') {
        // Check if it's Format 2 (hand->action) or Format 3 (action->hands[])
        const firstKey = Object.keys(preset.hands)[0];
        const firstValue = preset.hands[firstKey];
        if (Array.isArray(firstValue)) {
            // Format 3: Grouped by action {"raise": ["AA", "KK"], "call": ["QQ"]}
            loadHandsGroupedByAction(preset.hands);
        }
        else {
            // Format 2: Hand to action mapping {"AA": "raise", "KK": "call"}
            loadHandsWithActions(preset.hands);
        }
    }
}
/**
 * Load hands grouped by action (new format)
 */
function loadHandsGroupedByAction(groupedHands) {
    // First clear all
    resetAll();
    // Then apply each action group
    Object.keys(groupedHands).forEach((action) => {
        const hands = groupedHands[action];
        if (Array.isArray(hands)) {
            hands.forEach((hand) => {
                const handState = handsState.get(hand);
                if (handState && (action === 'raise' || action === 'call' || action === 'mix' || action === 'fold')) {
                    setHandAction(hand, action);
                }
            });
        }
    });
}
/**
 * Load a specific array of hands (legacy format - all as raise)
 */
function loadHandsArray(hands) {
    // First clear all
    resetAll();
    // Then select the specified hands as raise
    hands.forEach((hand) => {
        const handState = handsState.get(hand);
        if (handState) {
            setHandAction(hand, 'raise');
        }
    });
}
/**
 * Load hands with specific actions
 */
function loadHandsWithActions(handsMap) {
    // First clear all
    resetAll();
    // Then apply actions
    Object.keys(handsMap).forEach((hand) => {
        const action = handsMap[hand];
        const handState = handsState.get(hand);
        if (handState && action !== 'fold') {
            setHandAction(hand, action);
        }
    });
}
/**
 * Get currently selected hands with their actions
 */
function getCurrentSelection() {
    const selected = {};
    handsState.forEach((handState) => {
        if (handState.action !== 'fold') {
            selected[handState.hand] = handState.action;
        }
    });
    return selected;
}
/**
 * Get all saved ranges from localStorage
 */
function getSavedRanges() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored)
            return [];
        return JSON.parse(stored);
    }
    catch (error) {
        console.error('Error reading saved ranges:', error);
        return [];
    }
}
/**
 * Save ranges to localStorage
 */
function saveSavedRanges(ranges) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
    }
    catch (error) {
        console.error('Error saving ranges:', error);
        alert('Failed to save range. Storage may be full or disabled.');
    }
}
/**
 * Save current selection as a named range
 */
function saveCurrentRange(name) {
    if (!name.trim()) {
        alert('Please enter a name for your range.');
        return;
    }
    const selected = getCurrentSelection();
    if (Object.keys(selected).length === 0) {
        alert('Please select at least one hand before saving.');
        return;
    }
    const ranges = getSavedRanges();
    // Check if name already exists
    const existingIndex = ranges.findIndex(r => r.name === name.trim());
    const newRange = {
        name: name.trim(),
        hands: selected,
        timestamp: Date.now()
    };
    if (existingIndex >= 0) {
        // Update existing range
        if (confirm(`A range named "${name.trim()}" already exists. Overwrite it?`)) {
            ranges[existingIndex] = newRange;
        }
        else {
            return;
        }
    }
    else {
        // Add new range
        ranges.push(newRange);
    }
    saveSavedRanges(ranges);
    renderSavedRanges();
    // Clear input field
    const input = document.getElementById('range-name-input');
    if (input) {
        input.value = '';
    }
    alert(`Range "${name.trim()}" saved successfully!`);
}
/**
 * Load a saved range
 */
function loadSavedRange(name) {
    const ranges = getSavedRanges();
    const range = ranges.find(r => r.name === name);
    if (range) {
        // Check if it's the new format (object) or old format (array)
        if (Array.isArray(range.hands)) {
            // Legacy format - convert to raise actions
            loadHandsArray(range.hands);
        }
        else {
            // New format with actions
            loadHandsWithActions(range.hands);
        }
    }
}
/**
 * Delete a saved range
 */
function deleteSavedRange(name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    const ranges = getSavedRanges();
    const filtered = ranges.filter(r => r.name !== name);
    saveSavedRanges(filtered);
    renderSavedRanges();
}
/**
 * Render the list of saved ranges
 */
function renderSavedRanges() {
    const container = document.getElementById('saved-ranges-list');
    if (!container)
        return;
    const ranges = getSavedRanges();
    if (ranges.length === 0) {
        container.innerHTML = '<p class="empty-message">No saved ranges yet</p>';
        return;
    }
    // Sort by timestamp (newest first)
    ranges.sort((a, b) => b.timestamp - a.timestamp);
    container.innerHTML = '';
    ranges.forEach((range) => {
        const item = document.createElement('div');
        item.className = 'saved-range-item';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'saved-range-name';
        nameSpan.textContent = range.name;
        const handCount = Array.isArray(range.hands) ? range.hands.length : Object.keys(range.hands).length;
        nameSpan.title = `${handCount} hands - Click to load`;
        nameSpan.addEventListener('click', () => loadSavedRange(range.name));
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-range-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete range';
        deleteBtn.addEventListener('click', () => deleteSavedRange(range.name));
        item.appendChild(nameSpan);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}
/**
 * Switch between edit and train modes
 */
function switchMode(mode) {
    currentMode = mode;
    const navBar = document.querySelector('.nav-bar');
    const editElements = document.querySelectorAll('.edit-only');
    const trainElements = document.querySelectorAll('.train-only');
    const modeToggle = document.getElementById('mode-toggle');
    if (mode === 'train') {
        // Hide navigation and edit elements
        if (navBar)
            navBar.style.display = 'none';
        editElements.forEach(el => el.style.display = 'none');
        trainElements.forEach(el => el.style.display = 'block');
        // Store current range as training target
        trainingRange = getCurrentSelection();
        // Get preset info if available
        if (currentLoadedPresetKey && loadedPresets[currentLoadedPresetKey]) {
            const preset = loadedPresets[currentLoadedPresetKey];
            trainingRangeName = preset.name;
            trainingRangeDescription = preset.description;
        }
        else {
            trainingRangeName = 'Custom Range';
            trainingRangeDescription = 'User-created range';
        }
        // Display range info
        const rangeInfoDiv = document.getElementById('train-range-info');
        if (rangeInfoDiv) {
            rangeInfoDiv.innerHTML = `
                <h2>${trainingRangeName}</h2>
                <p class="range-description">${trainingRangeDescription}</p>
            `;
        }
        // Clear the grid for practice
        resetAll();
        // Update toggle button
        if (modeToggle)
            modeToggle.textContent = '← Back to Edit Mode';
    }
    else {
        // Show navigation and edit elements
        if (navBar)
            navBar.style.display = 'block';
        editElements.forEach(el => el.style.display = 'block');
        trainElements.forEach(el => el.style.display = 'none');
        // Clear training data
        trainingRange = null;
        trainingRangeName = '';
        trainingRangeDescription = '';
        // Update toggle button
        if (modeToggle)
            modeToggle.textContent = 'Switch to Train Mode →';
    }
}
/**
 * Submit training attempt and show results
 */
function submitTraining() {
    if (!trainingRange)
        return;
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
        const correctAction = trainingRange[hand];
        const userAction = userAttempt[hand];
        const cell = document.querySelector(`[data-hand="${hand}"]`);
        if (userAction === correctAction) {
            // Correct
            correct++;
            if (cell)
                cell.classList.add('train-correct');
        }
        else if (userAction && userAction !== correctAction) {
            // Wrong action
            incorrect++;
            if (cell)
                cell.classList.add('train-incorrect');
        }
        else {
            // Missed
            missed++;
            if (cell)
                cell.classList.add('train-missed');
        }
    });
    // Check for extra hands user added that shouldn't be there
    Object.keys(userAttempt).forEach((hand) => {
        if (!trainingRange[hand]) {
            incorrect++;
            const cell = document.querySelector(`[data-hand="${hand}"]`);
            if (cell)
                cell.classList.add('train-incorrect');
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
function resetTraining() {
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
/**
 * Setup navigation button event listeners
 */
function setupNavigation() {
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }
    // Select all button
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAll);
    }
    // Save range button
    const saveRangeBtn = document.getElementById('save-range-btn');
    const rangeNameInput = document.getElementById('range-name-input');
    if (saveRangeBtn && rangeNameInput) {
        saveRangeBtn.addEventListener('click', () => {
            saveCurrentRange(rangeNameInput.value);
        });
        // Allow Enter key to save
        rangeNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveCurrentRange(rangeNameInput.value);
            }
        });
    }
    // Preset buttons
    const presetButtons = document.querySelectorAll('.preset-button');
    presetButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.target;
            const presetName = target.dataset.preset;
            if (presetName) {
                loadPreset(presetName);
            }
        });
    });
    // Render saved ranges on load
    renderSavedRanges();
    // Mode toggle button
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            if (currentMode === 'edit') {
                if (Object.keys(getCurrentSelection()).length === 0) {
                    alert('Please select or load a range first before entering train mode.');
                    return;
                }
                switchMode('train');
            }
            else {
                switchMode('edit');
            }
        });
    }
    // Train mode buttons
    const resetTrainBtn = document.getElementById('reset-train-btn');
    if (resetTrainBtn) {
        resetTrainBtn.addEventListener('click', resetTraining);
    }
    const submitTrainBtn = document.getElementById('submit-train-btn');
    if (submitTrainBtn) {
        submitTrainBtn.addEventListener('click', submitTraining);
    }
}
/**
 * Initialize the app
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Load presets from JSON file
        yield loadPresetsFromFile();
        createRangeGrid();
        setupNavigation();
        updateStats();
        // Add global mouse up listener to end drag
        document.addEventListener('mouseup', () => {
            isDragging = false;
            dragAction = null;
        });
        // Prevent text selection during drag
        document.addEventListener('selectstart', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        });
    });
}
// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
