// Action types for hands
export type HandAction = 'fold' | 'raise' | 'call' | 'mix-rc' | 'mix-rf';

// Type for a hand cell
export interface HandCell {
    hand: string;
    type: 'pair' | 'suited' | 'offsuit';
    action: HandAction;
}

// Interface for saved ranges
export interface SavedRange {
    name: string;
    hands: { [hand: string]: HandAction };
    timestamp: number;
}

// Interface for preset structure (supports multiple formats)
export interface Preset {
    name: string;
    description: string;
    hands: string[] | { [hand: string]: HandAction } | { [action: string]: string[] };
}

// Interface for presets file
export interface PresetsData {
    [key: string]: Preset;
}

// App mode
export type AppMode = 'edit' | 'train';
export type TrainingMode = 'range-recall' | 'spot-drill';

// Spot Drill state
export interface SpotDrillState {
    handsQueue: string[];
    currentHandIndex: number;
    correctAnswers: number;
    totalAttempts: number;
    results: Array<{ hand: string; correctAction: HandAction; userAction: HandAction; correct: boolean }>;
}
