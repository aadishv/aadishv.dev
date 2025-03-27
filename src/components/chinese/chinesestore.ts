import { createStore } from "@xstate/store";
import { loadFromStorage, saveToStorage } from "./storage";
import { remap } from "./datautils";
import { CharState } from "./chinese";

const storedData = loadFromStorage();
const initialContext = storedData || {
  history: {} as Record<string, [CharState, string]>,
  sentences: [...remap()].sort(() => Math.random() - 0.5),
};

export const store = createStore({
  context: initialContext,
  on: {
    updateCharacter: (
      context,
      event: { character: string; newState: CharState; id: string },
    ) => {
      const lastState = context.history[event.character];
      if (lastState) {
        if (lastState[1] === event.id) {
          return context;
        }
      }
      return {
        ...context,
        history: {
          ...context.history,
          [event.character]: [event.newState, event.id],
        },
      };
    },
  },
});

store.subscribe((snapshot) => {
  saveToStorage(snapshot.context);
});
