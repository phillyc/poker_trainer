import { HandAction, SavedRange } from './types';
import { STORAGE_KEY } from './constants';
import { handsState } from './state';
import { getCurrentSelection } from './actions';
import { showToast, showConfirm } from './ui';
import { loadHandsArray, loadHandsWithActions } from './presets';

/**
 * Get all saved ranges from localStorage
 */
export function getSavedRanges(): SavedRange[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as SavedRange[];
    } catch (error) {
        console.error('Error reading saved ranges:', error);
        return [];
    }
}

/**
 * Save ranges to localStorage
 */
export function saveSavedRanges(ranges: SavedRange[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
    } catch (error) {
        console.error('Error saving ranges:', error);
        showToast('Failed to save range. Storage may be full or disabled.', 'error');
    }
}

/**
 * Save current selection as a named range
 */
export function saveCurrentRange(name: string): void {
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
    
    const newRange: SavedRange = {
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
                } else {
                    currentRanges.push(newRange);
                }
                saveSavedRanges(currentRanges);
                renderSavedRanges();
                
                // Clear input field
                const input = document.getElementById('range-name-input') as HTMLInputElement;
                if (input) {
                    input.value = '';
                }
                
                showToast(`Range "${name.trim()}" saved successfully!`, 'success');
            }
        });
        return;
    } else {
        // Add new range
        ranges.push(newRange);
    }
    
    saveSavedRanges(ranges);
    renderSavedRanges();
    
    // Clear input field
    const input = document.getElementById('range-name-input') as HTMLInputElement;
    if (input) {
        input.value = '';
    }
    
    showToast(`Range "${name.trim()}" saved successfully!`, 'success');
}

/**
 * Load a saved range
 */
export function loadSavedRange(name: string): void {
    const ranges = getSavedRanges();
    const range = ranges.find(r => r.name === name);
    
    if (range) {
        // Check if it's the new format (object) or old format (array)
        if (Array.isArray(range.hands)) {
            // Legacy format - convert to raise actions
            loadHandsArray(range.hands);
        } else {
            // New format with actions
            loadHandsWithActions(range.hands);
        }
    }
}

/**
 * Delete a saved range
 */
export function deleteSavedRange(name: string): void {
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
export function formatRangeForPresets(range: SavedRange): string {
    // Group hands by action (exclude fold actions)
    const groupedByAction: { [action: string]: string[] } = {
        raise: [],
        call: [],
        'mix-rc': [],
        'mix-rf': []
    };
    
    // Handle both old format (array) and new format (object)
    if (Array.isArray(range.hands)) {
        // Legacy format - all hands are raise
        groupedByAction.raise = range.hands;
    } else {
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
export async function copyRangeToClipboard(name: string): Promise<void> {
    const ranges = getSavedRanges();
    const range = ranges.find(r => r.name === name);
    
    if (!range) {
        showToast(`Range "${name}" not found.`, 'error');
        return;
    }
    
    try {
        const jsonString = formatRangeForPresets(range);
        await navigator.clipboard.writeText(jsonString);
        showToast(`Range "${name}" copied to clipboard! You can now paste it into presets.json`, 'success');
    } catch (error) {
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
        } catch (fallbackError) {
            showToast('Failed to copy to clipboard. Please check your browser permissions.', 'error');
        }
        document.body.removeChild(textArea);
    }
}

/**
 * Render the list of saved ranges
 */
export function renderSavedRanges(): void {
    const container = document.getElementById('saved-ranges-list');
    if (!container) return;
    
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
