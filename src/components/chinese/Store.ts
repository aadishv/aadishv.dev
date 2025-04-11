import { createStore } from "@xstate/store";
import { getSentences, CharState, type Sentence } from "./Data";
import hi from "date-fns/esm/locale/hi";

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
export type AppMode = "pinyin" | "character";

type HistoryType = {
  character: Record<string, [CharState, string]>;
  pinyin: Record<string, [CharState, string]>;
};

// Get all available lesson names
export const getAllLessons = (): string[] => {
  const allSentences = getSentences();
  const uniqueLessons = new Set<string>();

  allSentences.forEach((sentence) => {
    uniqueLessons.add(sentence.lesson);
  });

  return Array.from(uniqueLessons).sort();
};

// Load stored data and initialize context
const storedData = loadFromStorage();
const allLessons = getAllLessons();

const initialContext = {
  history: (storedData?.history || {
    character: {},
    pinyin: {},
  }) as HistoryType,
  sentences:
    storedData?.sentences ||
    ([...getSentences()].sort(() => 0.5 - Math.random()) as Sentence[]),
  sessions: (storedData?.sessions || {}) as Record<string, string>,
  completedCount: 0, // Always starts at 0 and is not persisted
  enabledLessons: storedData?.enabledLessons || allLessons, // Default to all lessons enabled
};

export const store = createStore({
  context: initialContext,
  emits: {
    completedCountChanged: (payload: {
      completedCount: number;
      history: HistoryType;
    }) => {},
  },
  on: {
    updateCharacter: (
      context,
      event: {
        character: string;
        newState: CharState;
        id: string;
        mode: AppMode;
      },
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
              [event.mode]: {
                ...context.history[event.mode],
                [event.character]: [event.newState, event.id],
              },
            } as HistoryType),
      };

      // Emit event with updated values
      enqueue.emit.completedCountChanged({
        completedCount: newContext.completedCount,
        history: newContext.history,
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
      const enabledLessons = context.enabledLessons;
      let sentences = context.sentences.slice(1);
      console.log(sentences);
      while (
        enabledLessons &&
        sentences.length > 0 &&
        !enabledLessons.includes(sentences[0].lesson)
      ) {
        sentences = sentences.slice(1);
        console.log("hi", enabledLessons, sentences[0], sentences.length > 0);
      }

      const randomShuffle =
        sentences.length > 0
          ? sentences
          : [...getSentences()].sort(() => Math.random() - 0.5);
      console.log(sentences, randomShuffle);
      return {
        ...context,
        completedCount: 0,
        sentences: randomShuffle,
      };
    },
    updateEnabledLessons: (context, event: { enabledLessons: string[] }) => {
      return {
        ...context,
        enabledLessons: event.enabledLessons,
      };
    },
  },
});

store.subscribe((snapshot) => saveToStorage(snapshot.context));
