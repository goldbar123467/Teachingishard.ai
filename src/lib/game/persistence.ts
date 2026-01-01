import type { GameState } from './types';

const STORAGE_KEY = 'classroom-sim-save';
const SAVES_LIST_KEY = 'classroom-sim-saves-list';
const MAX_SAVES = 5;

export interface SaveMetadata {
  id: string;
  name: string;
  createdAt: string;
  lastSavedAt: string;
  week: number;
  day: string;
  classAverage: number;
}

export interface SaveData {
  metadata: SaveMetadata;
  state: GameState;
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Get list of all saves
export function getSavesList(): SaveMetadata[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const data = localStorage.getItem(SAVES_LIST_KEY);
    if (!data) return [];
    return JSON.parse(data) as SaveMetadata[];
  } catch (error) {
    console.error('Failed to load saves list:', error);
    return [];
  }
}

// Save the list of saves
function saveSavesList(list: SaveMetadata[]): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to save saves list:', error);
  }
}

// Generate a save name based on game state
export function generateSaveName(state: GameState): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Week ${state.turn.week} - ${date}`;
}

// Save game state
export function saveGame(state: GameState, name?: string): SaveMetadata | null {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return null;
  }

  try {
    const metadata: SaveMetadata = {
      id: state.saveId,
      name: name || generateSaveName(state),
      createdAt: state.createdAt,
      lastSavedAt: new Date().toISOString(),
      week: state.turn.week,
      day: state.turn.dayOfWeek,
      classAverage: state.classAverage,
    };

    const saveData: SaveData = {
      metadata,
      state: {
        ...state,
        lastSavedAt: metadata.lastSavedAt,
      },
    };

    // Save the game data
    localStorage.setItem(`${STORAGE_KEY}-${state.saveId}`, JSON.stringify(saveData));

    // Update saves list
    let savesList = getSavesList();
    const existingIndex = savesList.findIndex(s => s.id === state.saveId);

    if (existingIndex >= 0) {
      // Update existing save
      savesList[existingIndex] = metadata;
    } else {
      // Add new save
      savesList.unshift(metadata);

      // Remove oldest saves if over limit
      if (savesList.length > MAX_SAVES) {
        const removed = savesList.splice(MAX_SAVES);
        // Clean up removed saves from storage
        for (const save of removed) {
          localStorage.removeItem(`${STORAGE_KEY}-${save.id}`);
        }
      }
    }

    saveSavesList(savesList);
    return metadata;
  } catch (error) {
    console.error('Failed to save game:', error);
    return null;
  }
}

// Load game state by ID
export function loadGame(saveId: string): GameState | null {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return null;
  }

  try {
    const data = localStorage.getItem(`${STORAGE_KEY}-${saveId}`);
    if (!data) {
      console.error('Save not found:', saveId);
      return null;
    }

    const saveData = JSON.parse(data) as SaveData;
    return saveData.state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

// Load the most recent save
export function loadMostRecentSave(): GameState | null {
  const saves = getSavesList();
  if (saves.length === 0) return null;

  // Sort by lastSavedAt descending
  const sorted = [...saves].sort(
    (a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
  );

  return loadGame(sorted[0].id);
}

// Delete a save
export function deleteSave(saveId: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.removeItem(`${STORAGE_KEY}-${saveId}`);

    const savesList = getSavesList().filter(s => s.id !== saveId);
    saveSavesList(savesList);

    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Check if there are any saves
export function hasSaves(): boolean {
  return getSavesList().length > 0;
}

// Quick save (overwrite current save)
export function quickSave(state: GameState): boolean {
  const result = saveGame(state);
  return result !== null;
}

// Export save as JSON (for backup)
export function exportSave(saveId: string): string | null {
  const state = loadGame(saveId);
  if (!state) return null;

  return JSON.stringify(state, null, 2);
}

// Import save from JSON
export function importSave(jsonString: string): GameState | null {
  try {
    const state = JSON.parse(jsonString) as GameState;

    // Validate essential fields
    if (!state.saveId || !state.students || !state.teacher || !state.turn) {
      console.error('Invalid save data');
      return null;
    }

    // Generate new ID to avoid conflicts
    state.saveId = crypto.randomUUID();
    state.lastSavedAt = new Date().toISOString();

    // Save the imported game
    saveGame(state, `Imported - Week ${state.turn.week}`);

    return state;
  } catch (error) {
    console.error('Failed to import save:', error);
    return null;
  }
}

// Get storage usage info
export function getStorageInfo(): { used: number; available: boolean } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: false };
  }

  let used = 0;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(STORAGE_KEY) || key === SAVES_LIST_KEY) {
      used += localStorage.getItem(key)?.length || 0;
    }
  }

  return { used, available: true };
}
