import { HandAction, NavTab } from './types';
import {
    isDragging, currentMode,
    setIsDragging, setDragAction
} from './state';
import { setEditMode, resetAll, resetAppToInitialState, selectAll, getCurrentSelection, updateStats } from './actions';
import { createRangeGrid, handleTouchEnd } from './grid';
import { loadPresetsFromFile, loadPreset } from './presets';
import { saveCurrentRange, renderSavedRanges } from './storage';
import { switchNavTab, startTraining, backToEditor, handleSpotDrillAction, submitTraining, resetTraining } from './training';
import { showToast, setupMobileNavigation } from './ui';

/**
 * Setup navigation button event listeners
 */
function setupNavigation(): void {
    // === SIDEBAR TAB NAVIGATION ===
    document.querySelectorAll('.nav-tab[data-tab]').forEach((tab) => {
        tab.addEventListener('click', function(this: HTMLElement) {
            const tabName = this.getAttribute('data-tab') as NavTab;
            if (tabName) {
                switchNavTab(tabName);
            }
        });
    });

    // === EDIT MODE BUTTONS (sidebar + mobile + training) ===
    const editModeButtons = document.querySelectorAll('.edit-mode-btn');
    editModeButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const action = target.dataset.action as HandAction;
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
    
    // Nav-brand reset: clicking Poker Trainer header resets app to initial state
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', (e) => {
            // Don't trigger if clicking on the mobile toggle or other overlapping elements
            resetAppToInitialState();
        });
        navBrand.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetAppToInitialState();
            }
        });
    }
    
    // Select all button
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', selectAll);
    }
    
    // Save range button
    const saveRangeBtn = document.getElementById('save-range-btn');
    const rangeNameInput = document.getElementById('range-name-input') as HTMLInputElement;
    
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
            const target = e.target as HTMLElement;
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
    
    // === PRACTICE MODE BUTTONS ===
    const startRangeRecallBtn = document.getElementById('start-range-recall-btn');
    if (startRangeRecallBtn) {
        startRangeRecallBtn.addEventListener('click', () => startTraining('range-recall'));
    }
    
    const startSpotDrillBtn = document.getElementById('start-spot-drill-btn');
    if (startSpotDrillBtn) {
        startSpotDrillBtn.addEventListener('click', () => startTraining('spot-drill'));
    }
    
    const startPotOddsBtn = document.getElementById('start-pot-odds-btn');
    if (startPotOddsBtn) {
        startPotOddsBtn.addEventListener('click', () => startTraining('pot-odds'));
    }
    
    // Back to editor button
    const backToEditorBtn = document.getElementById('back-to-editor-btn');
    if (backToEditorBtn) {
        backToEditorBtn.addEventListener('click', backToEditor);
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
    
    // Spot drill action buttons
    const spotActionButtons = document.querySelectorAll('.spot-action-btn');
    spotActionButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const action = target.dataset.action as HandAction;
            if (action) {
                handleSpotDrillAction(action);
            }
        });
    });
}

/**
 * Initialize the app
 */
async function init(): Promise<void> {
    // Load presets from JSON file
    await loadPresetsFromFile();
    
    createRangeGrid();
    setupNavigation();
    setupMobileNavigation();
    updateStats();
    
    // Add global mouse up listener to end drag
    document.addEventListener('mouseup', () => {
        setIsDragging(false);
        setDragAction(null);
    });
    
    // Add global touch end listener to end drag
    document.addEventListener('touchend', () => {
        handleTouchEnd();
    });
    
    // Add global touch cancel listener
    document.addEventListener('touchcancel', () => {
        handleTouchEnd();
    });
    
    // Prevent text selection during drag
    document.addEventListener('selectstart', (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose reset function for console/testing use
(window as any).resetAppToInitialState = resetAppToInitialState;
