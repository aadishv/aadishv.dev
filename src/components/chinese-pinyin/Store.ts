import { createStore } from "@xstate/store";
import { getSentences, CharState, type Sentence } from "./Data";

export const STORAGE_KEY = "com.aadishv.chineseapp.pinyin.persistence";

/**
 * Loads saved application state from localStorage
 * @returns {Object|null} Parsed stored data or null if none exists
 */
export const loadFromStorage = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

const storedData = loadFromStorage();
const initialContext = {
  history: (storedData?.history || {}) as Record<string, [CharState, string]>,
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
  // Only save history, sentences, and sessions to localStorage, not completedCount
  const { history, sentences, sessions } = snapshot.context;
  saveToStorage({ history, sentences, sessions });
});
