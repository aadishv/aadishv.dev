import { createStore } from "@xstate/store";
import { getSentences, CharState, type Sentence } from "./Data";

// Single storage key for all Chinese app data
const CHINESE_APP_STORAGE_KEY = "chinese_app_data";

/**
 * Loads saved application state from localStorage
 * @returns {Object|null} Parsed stored data or null if none exists
 */
export const loadFromStorage = () => {
  try {
    const storedData = localStorage.getItem(CHINESE_APP_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
  }
  return null;
};

/**
 * Saves application state to localStorage
 * @param {any} data - Current application state to persist
 */
export const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(CHINESE_APP_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

// Get the current mode from URL or localStorage
export const getCurrentMode = (): "chinese" | "pinyin" => {
  // First check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get("mode");
  
  // If valid mode in URL, use it and also save to localStorage as last used mode
  if (modeParam === "chinese" || modeParam === "pinyin") {
    // Load existing data
    const storedData = loadFromStorage();
    if (storedData) {
      // Update lastMode in localStorage
      saveToStorage({
        ...storedData,
        lastMode: modeParam
      });
    } else {
      // Initialize with this mode
      saveToStorage({
        chinese: {},
        pinyin: {},
        sessions: {},
        lastMode: modeParam
      });
    }
    return modeParam;
  }
  
  // If no valid mode in URL, check localStorage
  const storedData = loadFromStorage();
  const lastMode = storedData?.lastMode;
  
  // Return stored mode or default to 'chinese'
  return (lastMode === "chinese" || lastMode === "pinyin") ? lastMode : "chinese";
};

// Get the current mode - evaluated at runtime
export const CURRENT_MODE = typeof window !== "undefined" ? getCurrentMode() : "chinese";

// Load stored data and initialize context
const storedData = loadFromStorage();
const initialContext = {
  // Get history specific to current mode or create empty object
  history: (storedData?.[CURRENT_MODE] || {}) as Record<string, [CharState, string]>,
  sentences:
    storedData?.sentences ||
    ([...getSentences()].sort(() => 0.5 - Math.random()) as Sentence[]),
  sessions: (storedData?.sessions || {}) as Record<string, string>,
  completedCount: 0, // Always starts at 0 and is not persisted
};

export const store = createStore({
  context: initialContext,
  emits: {
    completedCountChanged: (payload: {
      completedCount: number;
      history: Record<string, [CharState, string]>;
    }) => {
      // Event signature definition
    },
  },
  on: {
    updateCharacter: (
      context,
      event: { character: string; newState: CharState; id: string },
      enqueue,
    ) => {
      const lastState = context.history[event.character];
      const noChange = lastState && lastState[0] === event.newState;

      const newContext = {
        ...context,
        completedCount: context.completedCount + 1,
        history: noChange
          ? context.history
          : ({
              ...context.history,
              [event.character]: [event.newState, event.id],
            } as Record<string, [CharState, string]>),
      };

      // Emit event with updated values
      enqueue.emit.completedCountChanged({
        completedCount: newContext.completedCount,
        history: newContext.history as Record<string, [CharState, string]>,
      });

      return newContext;
    },
    resetCompletedCount: (context, _, enqueue) => {
      const newContext = {
        ...context,
        completedCount: 0,
      };
      return newContext;
    },
    updateSession: (context, event: { key: string; date: Date }) => {
      return {
        ...context,
        sessions: {
          ...context.sessions,
          [event.key]: event.date.toISOString(),
        },
      };
    },
    progressSentence: (context) => {
      const randomShuffle = [...getSentences()].sort(() => Math.random() - 0.5);
      console.log(context.sentences.map((s) => s.lesson));
      return {
        ...context,
        completedCount: 0,
        sentences:
          context.sentences.length == 1
            ? randomShuffle
            : context.sentences.slice(1),
      };
    },
  },
});

store.subscribe((snapshot) => {
  // Load the full data object
  const storedData = loadFromStorage() || {
    chinese: {},
    pinyin: {},
    sessions: {},
    lastMode: CURRENT_MODE
  };
  
  // Update only the current mode's data and sessions
  const updatedData = {
    ...storedData,
    [CURRENT_MODE]: snapshot.context.history,
    sessions: snapshot.context.sessions,
    sentences: snapshot.context.sentences,
  };
  
  // Save the updated data
  saveToStorage(updatedData);
});