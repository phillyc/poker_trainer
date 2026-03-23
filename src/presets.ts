import { HandAction, PresetsData } from './types';
import { loadedPresets, setLoadedPresets, setCurrentLoadedPresetKey } from './state';
import { setHandAction, resetAll } from './actions';
import { handsState } from './state';

/**
 * Load presets from JSON file
 */
export async function loadPresetsFromFile(): Promise<void> {
    try {
        const response = await fetch('presets.json');
        if (!response.ok) {
            console.error('Failed to load presets.json');
            return;
        }
        setLoadedPresets(await response.json());
        console.log('Presets loaded successfully:', Object.keys(loadedPresets));
        // Render preset buttons after loading
        renderPresetButtons();
    } catch (error) {
        console.error('Error loading presets:', error);
    }
}

/**
 * Render preset buttons dynamically from loaded presets
 */
export function renderPresetButtons(): void {
    const container = document.getElementById('presets-container');
    if (!container) return;
    
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
export function loadPreset(presetName: string): void {
    const preset = loadedPresets[presetName];
    if (!preset) {
        console.warn(`Preset "${presetName}" not found`);
        return;
    }
    
    // Store the current preset info for train mode
    setCurrentLoadedPresetKey(presetName);
    
    // Check format type
    if (Array.isArray(preset.hands)) {
        // Format 1: Simple array - all hands are raise
        loadHandsArray(preset.hands);
    } else if (typeof preset.hands === 'object') {
        // Check if it's Format 2 (hand->action) or Format 3 (action->hands[])
        const firstKey = Object.keys(preset.hands)[0];
        const firstValue = preset.hands[firstKey];
        
        if (Array.isArray(firstValue)) {
            // Format 3: Grouped by action {"raise": ["AA", "KK"], "call": ["QQ"]}
            loadHandsGroupedByAction(preset.hands as { [action: string]: string[] });
        } else {
            // Format 2: Hand to action mapping {"AA": "raise", "KK": "call"}
            loadHandsWithActions(preset.hands as { [hand: string]: HandAction });
        }
    }
}

/**
 * Load hands grouped by action (new format)
 */
export function loadHandsGroupedByAction(groupedHands: { [action: string]: string[] }): void {
    // First clear all
    resetAll();
    
    // Then apply each action group
    Object.keys(groupedHands).forEach((action) => {
        const hands = groupedHands[action];
        if (Array.isArray(hands)) {
            hands.forEach((hand) => {
                const handState = handsState.get(hand);
                // Support legacy 'mix' as 'mix-rc' for backward compatibility
                const normalizedAction = action === 'mix' ? 'mix-rc' : action;
                if (handState && (normalizedAction === 'raise' || normalizedAction === 'call' || normalizedAction === 'mix-rc' || normalizedAction === 'mix-rf' || normalizedAction === 'fold')) {
                    setHandAction(hand, normalizedAction as HandAction);
                }
            });
        }
    });
}

/**
 * Load a specific array of hands (legacy format - all as raise)
 */
export function loadHandsArray(hands: string[]): void {
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
export function loadHandsWithActions(handsMap: { [hand: string]: HandAction }): void {
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
