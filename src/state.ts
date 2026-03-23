import { HandAction, HandCell, PresetsData, AppMode, TrainingMode, SpotDrillState } from './types';

// Store the state of all hands
export const handsState: Map<string, HandCell> = new Map();

// Track drag state
export let isDragging = false;
export let dragAction: HandAction | null = null;
export let isTouching = false;
export let lastTouchedHand: string | null = null;

// Current edit mode (default to 'raise')
export let currentEditMode: HandAction = 'raise';

// Store loaded presets
export let loadedPresets: PresetsData = {};

// App mode
export let currentMode: AppMode = 'edit';
export let currentTrainingMode: TrainingMode = 'range-recall';
export let trainingRange: { [hand: string]: HandAction } | null = null;
export let trainingRangeName: string = '';
export let trainingRangeDescription: string = '';
export let currentLoadedPresetKey: string = '';

// Spot Drill state
export let spotDrillState: SpotDrillState | null = null;

// State setters (needed because ES modules export bindings, not references for let)
export function setIsDragging(value: boolean): void { isDragging = value; }
export function setDragAction(value: HandAction | null): void { dragAction = value; }
export function setIsTouching(value: boolean): void { isTouching = value; }
export function setLastTouchedHand(value: string | null): void { lastTouchedHand = value; }
export function setCurrentEditMode(value: HandAction): void { currentEditMode = value; }
export function setLoadedPresets(value: PresetsData): void { loadedPresets = value; }
export function setCurrentMode(value: AppMode): void { currentMode = value; }
export function setCurrentTrainingMode(value: TrainingMode): void { currentTrainingMode = value; }
export function setTrainingRange(value: { [hand: string]: HandAction } | null): void { trainingRange = value; }
export function setTrainingRangeName(value: string): void { trainingRangeName = value; }
export function setTrainingRangeDescription(value: string): void { trainingRangeDescription = value; }
export function setCurrentLoadedPresetKey(value: string): void { currentLoadedPresetKey = value; }
export function setSpotDrillState(value: SpotDrillState | null): void { spotDrillState = value; }
