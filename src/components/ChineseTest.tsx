/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import HanziWriter from "hanzi-writer";
import { useSelector, useStore } from "@xstate/store/react";
import { createStore } from "@xstate/store";

const CHARACTER_SIZE_STYLE = "h-28 w-28";

// Simple button component
function Button({ name, onClick }) {
  return (
    <button
      className="m-0 h-8 justify-center truncate p-0 font-lora underline decoration-header2 hover:decoration-header"
      onClick={onClick}
    >
      {name}
    </button>
  );
}

// Data transformation function to convert raw data into structured sentences
function remap() {
  const sentences_old = [
    {
      lesson: "l8-1",
      words: [
        "你",
        "nǐ",
        "你",
        "nǐ",
        "是",
        "shì",
        "我",
        "wǒ",
        "的",
        "de",
        "朋",
        "péng",
        "友",
        "you",
        "吗",
        "ma",
        "?",
        "",
      ],
    },
  ];

  return sentences_old.map((sentence) => ({
    ...sentence,
    words: sentence.words.reduce((acc, current, index, array) => {
      if (index % 2 === 0 && index < array.length - 1) {
        acc.push({
          character: current,
          pinyin: array[index + 1],
        });
      }
      return acc;
    }, []),
  }));
}

// Type definitions
interface Sentence {
  lesson: string;
  words: {
    character: string;
    pinyin: string;
  }[];
}

enum AppState {
  startingScreen = 0,
  reviewingSentence = 1,
  allDone = 2,
}

enum CharState {
  green = 0, // correctly written without hints
  yellow = 1, // correctly written with hints
  red = 2, // incorrectly written even with hints
}

// Define a storage key for localStorage
const STORAGE_KEY = "com.aadishv.chineseapp.persistence";

// Function to load from localStorage
const loadFromStorage = () => {
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

// Function to save to localStorage
const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

// Get stored data or use defaults
const storedData = loadFromStorage();
const initialContext = storedData || {
  history: {} as Record<string, [CharState, string]>,
  sentences: [...remap()].sort(() => Math.random() - 0.5) as Sentence[],
};

const store = createStore({
  // Initial context from localStorage or default
  context: initialContext,
  // Transitions
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

// Add subscriber to persist changes to localStorage
store.subscribe((snapshot) => {
  saveToStorage(snapshot.context);
});

// Character writing practice component
function CharacterReview({ character, pinyin, persistentId }) {
  // character: obvious purpose, assumed to be nonemptry
  // pinyin: same, can be empty
  // persistentId: id of the current sentence review, used when updated the global store
  if (pinyin === "") {
    // not a Chinese character
    return (
      <div className="bg-stripes-header2 my-2 flex h-[12.875rem] flex-col px-2 font-lora">
        <div className="my-auto text-3xl">{character}</div>
      </div>
    );
  }

  const checkMark = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="white"
    >
      <path
        fillRule="evenodd"
        d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
      />
    </svg>
  );
  // State machine for character writing
  // who would've known you needed 100 loc for basic state management ;-;
  const local_store = useStore({
    context: {
      mistakes: 0,
      state: CharState.green,
      state2: CharState.green,
      isCompleted: false,
      redLimit: 12,
      writer: null as HanziWriter | null,
    },
    on: {
      solved: (context) => {
        setTimeout(() => {
          context.writer?.animateCharacter();
        }, 1000);
        return { ...context, isCompleted: true };
      },

      mistake: (context) => {
        const newMistakes = context.mistakes + 1;

        // Show outline after 5 mistakes in green state
        if (context.state === CharState.green && newMistakes >= 5) {
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.yellow,
            redLimit: newMistakes + 7,
          };
        }

        // Show solution after reaching red limit in yellow state
        if (
          context.state === CharState.yellow &&
          newMistakes >= context.redLimit
        ) {
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.red,
          };
        }

        // Just increment mistakes otherwise
        return { ...context, mistakes: newMistakes };
      },

      buttonClick: (context) => {
        // Green state: show outline
        if (context.isCompleted || context.state2 === CharState.red) {
          // replay animation
          context.writer?.animateCharacter();
          return context;
        }
        if (context.state2 === CharState.green) {
          context.writer?.showOutline();
          return {
            ...context,
            state:
              context.state === CharState.red
                ? CharState.red
                : CharState.yellow,
            state2: CharState.yellow,
          };
        } else if (context.state2 === CharState.yellow) {
          context.writer?.animateCharacter();
          return {
            ...context,
            state: CharState.red,
            state2: CharState.red,
            isCompleted: true,
          };
        }
      },

      initWriter: (
        context,
        event: { ref: React.RefObject<HTMLDivElement> },
      ) => {
        const hanziWriter = HanziWriter.create(event.ref.current, character, {
          padding: 5,
          strokeColor: "#0851D0",
          drawingColor: "#0851D0",
          outlineColor: "rgba(130, 169, 229, 0.5)",
          acceptBackwardsStrokes: true,
          showHintAfterMisses: false,
          showOutline: false,
          strokeFadeDuration: 0,
        });
        return { ...context, writer: hanziWriter };
      },
    },
  });

  // Selectors for the store
  const state = useSelector(local_store, (state) => state.context.state);
  const isCompleted = useSelector(
    local_store,
    (state) => state.context.isCompleted,
  );

  const writer = useSelector(local_store, (state) => state.context.writer);

  // Determine button text based on current state
  const buttonName = useSelector(local_store, (state) => {
    if (state.context.isCompleted || state.context.state2 === CharState.red) {
      return "Replay";
    }
    return state.context.state2 === CharState.green
      ? "Show outline"
      : "Show solution";
  });

  const writerRef = useRef<HTMLDivElement>(null);
  // Initialize writer when component mounts
  useEffect(() => {
    local_store.trigger.initWriter({ ref: writerRef });
  }, []);

  // Setup quiz when writer is available
  useEffect(() => {
    if (!writer) return;
    writer.quiz({
      onMistake: local_store.trigger.mistake,
      onComplete: local_store.trigger.solved,
    });
  }, [writer]);

  useEffect(() => {
    console.log(isCompleted);
    if (isCompleted) {
      store.trigger.updateCharacter({
        character: character,
        newState: state,
        id: persistentId,
      });
    }
  }, [isCompleted]);
  return (
    <div className="bg-stripes-header2 my-2 flex flex-col px-2">
      {/* Character header with pinyin and status */}
      <div>
        <span className="mr-auto font-lora">{pinyin}</span>
        <div className="ml-auto">
          <div className="flex gap-2">
            <div
              className={`h-5 w-5 rounded-full bg-green-500 transition-all ${state === CharState.green ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
            >
              {isCompleted && state == CharState.green && checkMark}
            </div>
            <div
              className={`h-5 w-5 rounded-full bg-yellow-500 transition-all ${state === CharState.yellow ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
            >
              {isCompleted && state == CharState.yellow && checkMark}
            </div>
            <div
              className={`h-5 w-5 rounded-full bg-red-500 transition-all ${state === CharState.red ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
            >
              {isCompleted && state == CharState.red && checkMark}
            </div>
          </div>
        </div>
      </div>

      {/* Drawing area */}
      <div
        className={`mt-2 ${CHARACTER_SIZE_STYLE} border border-header bg-white`}
        ref={writerRef}
      ></div>

      {/* Controls */}
      <div>
        <button
          className="font-lora text-lg underline decoration-header2 hover:decoration-header"
          onClick={() => local_store.trigger.buttonClick()}
        >
          {buttonName}
        </button>
      </div>
    </div>
  );
}

// Renders multiple characters for review
function SentenceReview() {
  const sentences = useSelector(store, (state) => state.context.sentences);
  // Use useRef to maintain a stable id across rerenders
  const id = useRef(
    Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
  ).current;
  return (
    <div className="flex flex-wrap">
      {sentences[0].words.map(
        (word: { character: string; pinyin: string }, index: number) => (
          <div key={index}>
            <CharacterReview
              character={word.character}
              pinyin={word.pinyin}
              persistentId={id}
            />
          </div>
        ),
      )}
    </div>
  );
}

// Main app component
export default function ChineseApp() {
  const [state, setState] = useState<AppState>(AppState.reviewingSentence);

  return (
    <div className="flex h-full w-full items-center justify-center text-2xl">
      {state === AppState.startingScreen ? (
        <Button
          name="Begin"
          onClick={() => setState(AppState.reviewingSentence)}
        />
      ) : state === AppState.reviewingSentence ? (
        <SentenceReview />
      ) : (
        <div>All done!</div>
      )}
    </div>
  );
}
