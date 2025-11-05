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
// Current edit mode (default to 'raise')
let currentEditMode = 'raise';
// LocalStorage key for saved ranges
const STORAGE_KEY = 'poker-trainer-saved-ranges';
// Store loaded presets
let loadedPresets = {};
let currentMode = 'edit';
let currentTrainingMode = 'range-recall';
let trainingRange = null;
let trainingRangeName = '';
let trainingRangeDescription = '';
let currentLoadedPresetKey = '';
let spotDrillState = null;
const INITIAL_HANDS_COUNT = 5;
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
    // Use the currently selected edit mode
    dragAction = currentEditMode;
    // Apply action to the clicked cell
    setHandAction(hand, currentEditMode);
}
/**
 * Set the current edit mode
 */
function setEditMode(action) {
    currentEditMode = action;
    // Update button states
    const buttons = document.querySelectorAll('.edit-mode-btn');
    buttons.forEach((btn) => {
        const button = btn;
        if (button.dataset.action === action) {
            button.classList.add('active');
        }
        else {
            button.classList.remove('active');
        }
    });
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
            // Render preset buttons after loading
            renderPresetButtons();
        }
        catch (error) {
            console.error('Error loading presets:', error);
        }
    });
}
/**
 * Render preset buttons dynamically from loaded presets
 */
function renderPresetButtons() {
    const container = document.getElementById('presets-container');
    if (!container)
        return;
    // Clear existing buttons
    container.innerHTML = '';
    // Get all preset keys and sort them for consistent ordering
    const presetKeys = Object.keys(loadedPresets).sort();
    if (presetKeys.length === 0) {
        container.innerHTML = '<p class="empty-message">No presets available</p>';
        return;
    }
    // Create a button for each preset
    presetKeys.forEach((presetKey) => {
        const preset = loadedPresets[presetKey];
        const button = document.createElement('button');
        button.className = 'preset-button';
        button.dataset.preset = presetKey;
        button.textContent = preset.name || presetKey;
        button.title = preset.description || `Load ${preset.name || presetKey}`;
        container.appendChild(button);
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
        showToast('Failed to save range. Storage may be full or disabled.', 'error');
    }
}
/**
 * Save current selection as a named range
 */
function saveCurrentRange(name) {
    if (!name.trim()) {
        showToast('Please enter a name for your range.', 'error');
        return;
    }
    const selected = getCurrentSelection();
    if (Object.keys(selected).length === 0) {
        showToast('Please select at least one hand before saving.', 'error');
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
        // Update existing range - use async confirmation
        showConfirm(`A range named "${name.trim()}" already exists. Overwrite it?`).then((confirmed) => {
            if (confirmed) {
                // Get fresh ranges to avoid race conditions
                const currentRanges = getSavedRanges();
                const currentIndex = currentRanges.findIndex(r => r.name === name.trim());
                if (currentIndex >= 0) {
                    currentRanges[currentIndex] = newRange;
                }
                else {
                    currentRanges.push(newRange);
                }
                saveSavedRanges(currentRanges);
                renderSavedRanges();
                // Clear input field
                const input = document.getElementById('range-name-input');
                if (input) {
                    input.value = '';
                }
                showToast(`Range "${name.trim()}" saved successfully!`, 'success');
            }
        });
        return;
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
    showToast(`Range "${name.trim()}" saved successfully!`, 'success');
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
    showConfirm(`Are you sure you want to delete "${name}"?`).then((confirmed) => {
        if (confirmed) {
            const ranges = getSavedRanges();
            const filtered = ranges.filter(r => r.name !== name);
            saveSavedRanges(filtered);
            renderSavedRanges();
            showToast(`Range "${name}" deleted successfully.`, 'success');
        }
    });
}
/**
 * Convert a saved range to presets.json compatible format
 */
function formatRangeForPresets(range) {
    // Group hands by action (exclude fold actions)
    const groupedByAction = {
        raise: [],
        call: [],
        mix: []
    };
    // Handle both old format (array) and new format (object)
    if (Array.isArray(range.hands)) {
        // Legacy format - all hands are raise
        groupedByAction.raise = range.hands;
    }
    else {
        // New format with actions
        Object.keys(range.hands).forEach((hand) => {
            const action = range.hands[hand];
            if (action !== 'fold' && groupedByAction[action]) {
                groupedByAction[action].push(hand);
            }
        });
    }
    // Create preset object matching presets.json structure
    const preset = {
        name: range.name,
        description: `Custom range: ${range.name}`,
        hands: groupedByAction
    };
    // Generate a key from the range name (lowercase, replace spaces with hyphens)
    const key = range.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Format as JSON with proper indentation, including the key
    // This makes it easy to paste directly into presets.json
    const presetWithKey = {
        [key]: preset
    };
    return JSON.stringify(presetWithKey, null, 2);
}
/**
 * Copy a saved range to clipboard as presets.json compatible JSON
 */
function copyRangeToClipboard(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const ranges = getSavedRanges();
        const range = ranges.find(r => r.name === name);
        if (!range) {
            showToast(`Range "${name}" not found.`, 'error');
            return;
        }
        try {
            const jsonString = formatRangeForPresets(range);
            yield navigator.clipboard.writeText(jsonString);
            showToast(`Range "${name}" copied to clipboard! You can now paste it into presets.json`, 'success');
        }
        catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = formatRangeForPresets(range);
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast(`Range "${name}" copied to clipboard! You can now paste it into presets.json`, 'success');
            }
            catch (fallbackError) {
                showToast('Failed to copy to clipboard. Please check your browser permissions.', 'error');
            }
            document.body.removeChild(textArea);
        }
    });
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
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'range-action-buttons';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-range-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy to clipboard (presets.json format)';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyRangeToClipboard(range.name);
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-range-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete range';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSavedRange(range.name);
        });
        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(deleteBtn);
        item.appendChild(nameSpan);
        item.appendChild(buttonContainer);
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
        // Keep nav bar visible for mode toggle button, but hide other nav sections
        if (navBar)
            navBar.style.display = 'block';
        const navSections = navBar.querySelectorAll('.nav-section');
        navSections.forEach((section, index) => {
            // Keep first section (mode toggle) visible, hide others
            if (index > 0) {
                section.style.display = 'none';
            }
        });
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
        if (modeToggle)
            modeToggle.textContent = '← Back to Edit Mode';
    }
    else {
        // Show navigation and edit elements
        if (navBar)
            navBar.style.display = 'block';
        // Show all nav sections
        const navSections = navBar.querySelectorAll('.nav-section');
        navSections.forEach((section) => {
            section.style.display = 'block';
        });
        editElements.forEach(el => el.style.display = 'block');
        trainElements.forEach(el => el.style.display = 'none');
        // Restore the training range to the grid
        const rangeGrid = document.getElementById('range-grid');
        if (rangeGrid) {
            rangeGrid.style.display = 'grid';
        }
        if (trainingRange) {
            loadHandsWithActions(trainingRange);
        }
        // Clear training data
        trainingRange = null;
        trainingRangeName = '';
        trainingRangeDescription = '';
        spotDrillState = null;
        // Ensure edit mode button states are synced
        setEditMode(currentEditMode);
        // Update toggle button
        if (modeToggle)
            modeToggle.textContent = 'Switch to Train Mode →';
    }
}
/**
 * Switch between training modes (Range Recall vs Spot Drill)
 */
function switchTrainingMode(mode) {
    currentTrainingMode = mode;
    updateTrainingModeDisplay();
    if (mode === 'spot-drill') {
        startSpotDrill();
    }
    else {
        stopSpotDrill();
    }
}
/**
 * Update the display based on current training mode
 */
function updateTrainingModeDisplay() {
    const rangeRecallMode = document.querySelector('.range-recall-mode');
    const spotDrillMode = document.querySelector('.spot-drill-mode');
    const rangeGrid = document.getElementById('range-grid');
    const trainControls = document.querySelector('.train-controls');
    const trainResult = document.getElementById('train-result');
    const spotDrillResult = document.getElementById('spot-drill-result');
    const rangeRecallBtn = document.getElementById('range-recall-btn');
    const spotDrillBtn = document.getElementById('spot-drill-btn');
    if (currentTrainingMode === 'spot-drill') {
        if (rangeRecallMode)
            rangeRecallMode.style.display = 'none';
        if (spotDrillMode)
            spotDrillMode.style.display = 'block';
        if (rangeGrid)
            rangeGrid.style.display = 'none';
        if (trainControls)
            trainControls.style.display = 'none';
        if (trainResult)
            trainResult.style.display = 'none';
        if (rangeRecallBtn)
            rangeRecallBtn.classList.remove('active');
        if (spotDrillBtn)
            spotDrillBtn.classList.add('active');
    }
    else {
        if (rangeRecallMode)
            rangeRecallMode.style.display = 'block';
        if (spotDrillMode)
            spotDrillMode.style.display = 'none';
        if (rangeGrid)
            rangeGrid.style.display = 'grid';
        if (trainControls)
            trainControls.style.display = 'flex';
        if (spotDrillResult)
            spotDrillResult.style.display = 'none';
        if (rangeRecallBtn)
            rangeRecallBtn.classList.add('active');
        if (spotDrillBtn)
            spotDrillBtn.classList.remove('active');
    }
}
/**
 * Generate a shuffled array of hands from the training range
 */
function generateHandsQueue(count, excludeHands) {
    if (!trainingRange)
        return [];
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
function startSpotDrill() {
    if (!trainingRange)
        return;
    const initialHands = generateHandsQueue(INITIAL_HANDS_COUNT);
    spotDrillState = {
        handsQueue: initialHands,
        currentHandIndex: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        results: []
    };
    // Show first hand
    displayNextHand();
    updateSpotDrillProgress();
    // Hide results if showing
    const resultDiv = document.getElementById('spot-drill-result');
    if (resultDiv)
        resultDiv.style.display = 'none';
}
/**
 * Stop Spot Drill and reset state
 */
function stopSpotDrill() {
    spotDrillState = null;
}
/**
 * Parse a hand notation string to extract card ranks
 * Examples: "QJs" -> ["Q", "J"], "AA" -> ["A", "A"], "KQo" -> ["K", "Q"]
 */
function parseHand(hand) {
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
function getCardColor(rank, index, suited) {
    // Only four colors: red, green, blue, black
    // Assign colors based on rank for consistency
    const rankColors = {
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
    }
    else {
        if (suited) {
            return '#28a745'; // Green for suited
        }
        else {
            return '#007bff'; // Blue for offsuit
        }
    }
}
/**
 * Create a card element as a colored square with letter
 */
function createCardElement(rank, color) {
    const card = document.createElement('div');
    card.className = 'card-square';
    card.textContent = rank;
    card.style.backgroundColor = color;
    return card;
}
/**
 * Display the next hand in the queue with visual card representation
 */
function displayNextHand() {
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
function handleSpotDrillAction(action) {
    if (!spotDrillState || !trainingRange)
        return;
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
    }
    else {
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
function updateSpotDrillProgress() {
    if (!spotDrillState)
        return;
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
function showSpotDrillResults() {
    var _a, _b;
    if (!spotDrillState)
        return;
    const resultDiv = document.getElementById('spot-drill-result');
    if (!resultDiv)
        return;
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
        (_a = continueBtn.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newContinueBtn, continueBtn);
        newContinueBtn.addEventListener('click', () => {
            // Add more hands to queue, excluding already shown hands
            if (spotDrillState) {
                const shownHands = spotDrillState.results.map(r => r.hand);
                const additionalHands = generateHandsQueue(INITIAL_HANDS_COUNT, shownHands);
                if (additionalHands.length > 0) {
                    spotDrillState.handsQueue = [...spotDrillState.handsQueue, ...additionalHands];
                    resultDiv.style.display = 'none';
                    displayNextHand();
                }
                else {
                    // All hands have been shown, show final results
                    showSpotDrillResults();
                }
            }
        });
    }
    if (restartBtn) {
        // Remove old event listener by cloning and replacing
        const newRestartBtn = restartBtn.cloneNode(true);
        (_b = restartBtn.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(newRestartBtn, restartBtn);
        newRestartBtn.addEventListener('click', () => {
            startSpotDrill();
        });
    }
}
/**
 * Show a toast notification
 */
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container)
        return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    // Remove after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 2000);
}
/**
 * Show a confirmation dialog using a modal
 * Returns a Promise that resolves to true if confirmed, false if cancelled
 */
function showConfirm(message) {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'confirm-message';
        messageDiv.textContent = message;
        // Create buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'confirm-buttons';
        // Create confirm button
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn confirm-btn-ok';
        confirmBtn.textContent = 'OK';
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        // Create cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'confirm-btn confirm-btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        // Assemble modal
        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modal.appendChild(messageDiv);
        modal.appendChild(buttonsDiv);
        overlay.appendChild(modal);
        // Add to DOM
        document.body.appendChild(overlay);
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
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
    // Edit mode buttons
    const editModeButtons = document.querySelectorAll('.edit-mode-btn');
    editModeButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset.action;
            if (action) {
                setEditMode(action);
            }
        });
    });
    // Initialize edit mode to 'raise' by default
    setEditMode('raise');
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
    // Set up event delegation for preset buttons (works with dynamically created buttons)
    const presetsContainer = document.getElementById('presets-container');
    if (presetsContainer) {
        presetsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('preset-button')) {
                const presetName = target.dataset.preset;
                if (presetName) {
                    loadPreset(presetName);
                }
            }
        });
    }
    // Render saved ranges on load
    renderSavedRanges();
    // Mode toggle button
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            if (currentMode === 'edit') {
                if (Object.keys(getCurrentSelection()).length === 0) {
                    showToast('Please select or load a range first before entering train mode.', 'error');
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
    // Training mode selector buttons
    const rangeRecallBtn = document.getElementById('range-recall-btn');
    if (rangeRecallBtn) {
        rangeRecallBtn.addEventListener('click', () => {
            switchTrainingMode('range-recall');
        });
    }
    const spotDrillBtn = document.getElementById('spot-drill-btn');
    if (spotDrillBtn) {
        spotDrillBtn.addEventListener('click', () => {
            switchTrainingMode('spot-drill');
        });
    }
    // Spot drill action buttons
    const spotActionButtons = document.querySelectorAll('.spot-action-btn');
    spotActionButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset.action;
            if (action) {
                handleSpotDrillAction(action);
            }
        });
    });
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
