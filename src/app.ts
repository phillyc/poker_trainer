import { HandAction } from './types';
import {
    isDragging, currentMode,
    setIsDragging, setDragAction
} from './state';
import { setEditMode, resetAll, selectAll, getCurrentSelection, updateStats } from './actions';
import { createRangeGrid, handleTouchEnd } from './grid';
import { loadPresetsFromFile, loadPreset } from './presets';
import { saveCurrentRange, renderSavedRanges } from './storage';
import { switchMode, switchTrainingMode, handleSpotDrillAction, submitTraining, resetTraining } from './training';
import { startPotOddsDrill } from './pot-odds';
import { showToast, setupMobileNavigation } from './ui';

/**
 * Setup navigation button event listeners
 */
function setupNavigation(): void {
    // Edit mode buttons
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
    
    // Mode toggle button
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            if (currentMode === 'edit') {
                const hasRange = Object.keys(getCurrentSelection()).length > 0;
                if (!hasRange) {
                    // No range loaded — enter train mode with pot-odds as default
                    switchMode('train');
                    switchTrainingMode('pot-odds');
                    return;
                }
                switchMode('train');
            } else {
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
    
    const potOddsBtn = document.getElementById('pot-odds-btn');
    if (potOddsBtn) {
        potOddsBtn.addEventListener('click', () => {
            switchTrainingMode('pot-odds');
        });
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
