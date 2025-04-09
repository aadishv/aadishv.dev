import React, { useState, useRef, useEffect } from "react";
import HanziWriter from "hanzi-writer";
import { useSelector, useStore } from "@xstate/store/react";
import { store } from "./Store";
import { CharState } from "./Data";

const CHARACTER_SIZE_STYLE = "h-28 w-28";
const CHARACTER_SIZE_HEIGHT = "h-28";

/**
 * Converts pinyin with number tones to standard pinyin
 * @param {string} pinyin - Pinyin with number tones (e.g. "ni3")
 * @returns {string} - Standard pinyin (e.g. "nǐ")
 */
function convertNumberTonesToMarks(pinyin: string): string {
  const pinyinLower = pinyin.toLowerCase();

  // Map of vowels and their tone variants
  const toneMap = {
    a: ["ā", "á", "ǎ", "à"],
    e: ["ē", "é", "ě", "è"],
    i: ["ī", "í", "ǐ", "ì"],
    o: ["ō", "ó", "ǒ", "ò"],
    u: ["ū", "ú", "ǔ", "ù"],
    ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
    v: ["ǖ", "ǘ", "ǚ", "ǜ"], // v is often used as a substitute for ü
  };

  // No tone number found, return as is
  if (!/[1-4]$/.test(pinyinLower)) {
    return pinyinLower;
  }

  // Extract tone number and remove it from the string
  const toneNumber = parseInt(pinyinLower.slice(-1)) - 1;
  const pinyinWithoutTone = pinyinLower.slice(0, -1);

  // Replace 'v' with 'ü' first
  const normalizedPinyin = pinyinWithoutTone.replace(/v/g, "ü");

  // Priority order for tone marks
  const vowelPriority = ["a", "e", "o", "i", "u", "ü"];

  // Find the vowel to modify based on priority
  for (const vowel of vowelPriority) {
    if (normalizedPinyin.includes(vowel)) {
      // Replace the first occurrence of this vowel with its toned version
      return normalizedPinyin.replace(vowel, toneMap[vowel][toneNumber]);
    }
  }

  // No vowel found to modify, return as is
  return normalizedPinyin;
}

/**
 * Normalizes pinyin for comparison - handles both number tones and standard pinyin
 * @param {string} input - The pinyin input to normalize
 * @returns {string} Normalized pinyin in lowercase without spaces
 */
function normalizePinyin(input: string): string {
  // Remove spaces and make lowercase
  const trimmed = input.toLowerCase().trim();

  // Check if this is likely a number-tone pinyin
  if (/[a-z]+[1-4]$/.test(trimmed)) {
    return convertNumberTonesToMarks(trimmed);
  }

  return trimmed;
}

/**
 * TrafficLights component that displays green, yellow, and red indicators
 * showing the current state of character practice
 * @param {boolean} checkMark - Whether to show the check mark in the selected state
 * @param {CharState} state - The current state to highlight (green, yellow, or red)
 * @returns A set of colored indicators showing the current practice state
 */
export function TrafficLights({
  checkMark,
  state,
}: {
  checkMark: boolean;
  state: CharState;
}) {
  const checkMarkElement = (
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
  return (
    <div className="flex gap-2">
      <div
        className={`h-5 w-5 rounded-full bg-green-500 transition-all ${state === CharState.green ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
      >
        {checkMark && state === CharState.green && checkMarkElement}
      </div>
      <div
        className={`h-5 w-5 rounded-full bg-yellow-500 transition-all ${state === CharState.yellow ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
      >
        {checkMark && state === CharState.yellow && checkMarkElement}
      </div>
      <div
        className={`h-5 w-5 rounded-full bg-red-500 transition-all ${state === CharState.red ? "hover:opacity-70" : "opacity-30 hover:opacity-15"}`}
      >
        {checkMark && state === CharState.red && checkMarkElement}
      </div>
    </div>
  );
}

/**
 * Component for practicing writing a single Chinese character
 * @param {string} character - The Chinese character to practice
 * @param {string} pinyin - The pinyin pronunciation (can be empty for punctuation)
 * @param {string} persistentId - Unique ID for the current practice session
 */
export function CharacterReview({
  character,
  pinyin,
  persistentId,
  done,
}: {
  character: string;
  pinyin: string;
  persistentId: string;
  done: () => void;
}) {
  if (pinyin === "") {
    useEffect(() => {
      done();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
      // Single div with appropriate top padding to align with other characters
      <div className="px-2 mt-24 inline-flex flex-col items-center">
        <span className="font-kaishu text-5xl text-gray-600" title="Punctuation">{character}</span>
      </div>
    );
  }

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

        if (context.state === CharState.green && newMistakes >= 5) {
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.yellow,
            redLimit: newMistakes + 7,
          };
        }

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

        return { ...context, mistakes: newMistakes };
      },

      buttonClick: (context) => {
        if (context.isCompleted || context.state2 === CharState.red) {
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

  const state = useSelector(local_store, (state) => state.context.state);
  const isCompleted = useSelector(
    local_store,
    (state) => state.context.isCompleted,
  );

  const writer = useSelector(local_store, (state) => state.context.writer);

  const buttonName = useSelector(local_store, (state) => {
    if (state.context.isCompleted || state.context.state2 === CharState.red) {
      return "Replay";
    }
    return state.context.state2 === CharState.green
      ? "Show outline"
      : "Show solution";
  });

  const writerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    local_store.trigger.initWriter({ ref: writerRef });
  }, []);

  useEffect(() => {
    if (!writer) return;
    writer.quiz({
      onMistake: local_store.trigger.mistake,
      onComplete: local_store.trigger.solved,
      leniency: 1.2,
    });
  }, [writer]);

  useEffect(() => {
    if (isCompleted) {
      store.trigger.updateCharacter({
        character: character,
        newState: state,
        id: persistentId,
      });
    }
  }, [isCompleted, state, character, persistentId]);

  return (
    <div className="-px-1 my-2 flex flex-col">
      <div>
        <span className="mr-auto font-lora">{pinyin}</span>
        <div className="ml-auto">
          <TrafficLights state={state} checkMark={isCompleted} />
        </div>
      </div>

      <div
        className={`mt-2 ${CHARACTER_SIZE_STYLE} border border-header bg-white`}
        ref={writerRef}
      ></div>

      <div>
        <button
          className="font-lora text-base underline decoration-header2 hover:decoration-header"
          onClick={() => local_store.trigger.buttonClick()}
        >
          {buttonName}
        </button>
      </div>
    </div>
  );
}

/**
 * Component for practicing typing pinyin for a Chinese character
 * @param {string} character - The Chinese character to show
 * @param {string} pinyin - The correct pinyin pronunciation
 * @param {string} persistentId - Unique ID for the current practice session
 */
export function PinyinReview({
  character,
  pinyin,
  persistentId,
  done,
}: {
  character: string;
  pinyin: string;
  persistentId: string;
  done: () => void;
}) {
  // Special handling for punctuation marks
  if (pinyin === "") {
    // Use effect to mark as complete immediately
    useEffect(() => {
      // Notify parent that this component is done
      done();
    }, []);

    // For punctuation, we only render the character itself, but maintain the same structure
    // for consistent spacing and alignment
    return (
      <div className="flex flex-col items-center" style={{ width: "130px" }}>
        {/* Empty space where traffic lights would be */}
        <div className="mb-2 flex h-5 w-full justify-center"></div>

        <div className="flex flex-col items-center">
          {/* Only render the character itself */}
          <span className="font-kaishu text-7xl text-gray-600" title="Punctuation">{character}</span>

          {/* Empty space with same height as input field */}
          <div className="relative h-8 w-28"></div>
        </div>

        {/* Empty space where button would be */}
        <div className="h-8 w-full"></div>
      </div>
    );
  }

  // Rest of the component for regular characters remains the same
  const local_store = useStore({
    context: {
      mistakes: 0,
      state: CharState.green,
      state2: CharState.green,
      isCompleted: false,
      yellowLimit: 2, // After 2 mistakes, go to yellow
      redLimit: 4, // After 4 total mistakes, go to red
      inputValue: "",
      showError: false,
      isErrorAnimating: false,
      hint: "",
      lastIncorrectInput: "", // Track last incorrect input to avoid penalizing repeated submissions
    },
    on: {
      // ... all the handlers remain unchanged
      solved: (context) => {
        return {
          ...context,
          isCompleted: true,
          inputValue: pinyin,
        };
      },

      mistake: (context) => {
        const newMistakes = context.mistakes + 1;

        if (
          context.state === CharState.green &&
          newMistakes >= context.yellowLimit
        ) {
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.yellow,
            showError: true,
            isErrorAnimating: true,
          };
        }

        if (
          context.state === CharState.yellow &&
          newMistakes >= context.redLimit
        ) {
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.red,
            showError: true,
            isErrorAnimating: true,
          };
        }

        return {
          ...context,
          mistakes: newMistakes,
          showError: true,
          isErrorAnimating: true,
        };
      },

      resetErrorAnimation: (context) => {
        return {
          ...context,
          isErrorAnimating: false,
        };
      },

      updateInput: (context, event: { value: string }) => {
        return {
          ...context,
          inputValue: event.value,
          showError: false,
        };
      },

      submit: (context, _, enqueue) => {
        // If already completed, do nothing
        if (context.isCompleted) return context;

        // Don't count empty submissions as wrong
        if (!context.inputValue.trim()) {
          return context;
        }

        // Normalize the input and correct pinyin for comparison
        const normalizedInput = normalizePinyin(context.inputValue);
        const normalizedPinyin = normalizePinyin(pinyin);

        if (normalizedInput === normalizedPinyin) {
          // Use the solved handler directly to ensure inputValue is updated consistently
          return {
            ...context,
            isCompleted: true,
            state: context.state,
            inputValue: pinyin, // Set the input value to the correct pinyin
          };
        } else {
          // Check if this is a repeated submission of the same incorrect answer
          // Don't count repeating the same wrong answer multiple times
          if (
            context.showError &&
            context.inputValue === context.lastIncorrectInput
          ) {
            return context;
          }
          // Instead of triggering mistake, we'll directly update the context here
          const newMistakes = context.mistakes + 1;

          // Store the last incorrect input to avoid penalizing repeated submissions
          const lastIncorrectInput = context.inputValue;

          // Check if we need to change state based on mistake count
          if (
            context.state === CharState.green &&
            newMistakes >= context.yellowLimit
          ) {
            return {
              ...context,
              mistakes: newMistakes,
              state: CharState.yellow,
              showError: true,
              isErrorAnimating: true,
              lastIncorrectInput,
            };
          }

          if (
            context.state === CharState.yellow &&
            newMistakes >= context.redLimit
          ) {
            return {
              ...context,
              mistakes: newMistakes,
              state: CharState.red,
              showError: true,
              isErrorAnimating: true,
              lastIncorrectInput,
            };
          }

          // Default case - increment mistakes but keep same state
          return {
            ...context,
            mistakes: newMistakes,
            showError: true,
            isErrorAnimating: true,
            lastIncorrectInput,
          };
        }
      },

      buttonClick: (context) => {
        if (context.isCompleted) {
          return context; // Do nothing if already completed
        }

        if (context.state2 === CharState.green) {
          // Show all letters but strip tones
          const noTones = pinyin
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return {
            ...context,
            hint: noTones,
            inputValue: noTones, // Set input value to the hint
            // Keep the state as red if it's already red, otherwise go to yellow
            state:
              context.state === CharState.red
                ? CharState.red
                : CharState.yellow,
            state2: CharState.yellow,
          };
        } else if (context.state2 === CharState.yellow) {
          // Show full solution
          return {
            ...context,
            hint: pinyin,
            inputValue: pinyin,
            isCompleted: true,
            state: CharState.red,
            state2: CharState.red,
          };
        }

        return context;
      },
    },
  });

  // All the useSelector and useEffect code remains the same
  const state = useSelector(local_store, (state) => state.context.state);
  const state2 = useSelector(local_store, (state) => state.context.state2);
  const isCompleted = useSelector(
    local_store,
    (state) => state.context.isCompleted,
  );
  const inputValue = useSelector(
    local_store,
    (state) => state.context.inputValue,
  );
  const showError = useSelector(
    local_store,
    (state) => state.context.showError,
  );
  const isErrorAnimating = useSelector(
    local_store,
    (state) => state.context.isErrorAnimating,
  );

  // Determine button text based on state2
  const buttonName = useSelector(local_store, (state) => {
    if (state.context.isCompleted) {
      return ""; // No button when completed
    }
    return state.context.state2 === CharState.green
      ? "Show letters"
      : "Show solution";
  });

  // Handle error animation
  useEffect(() => {
    if (isErrorAnimating) {
      const timer = setTimeout(() => {
        local_store.trigger.resetErrorAnimation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isErrorAnimating]);

  // Update the global state when completed
  useEffect(() => {
    if (isCompleted) {
      store.trigger.updateCharacter({
        character: character,
        newState: state,
        id: persistentId,
      });
      done();
    }
  }, [isCompleted, state, character, persistentId]);

  return (
    <div
      className="my-2 flex flex-col items-center px-2"
      style={{ width: "130px" }}
    >
      <div className="mb-2 flex w-full justify-center">
        <TrafficLights state={state} checkMark={isCompleted} />
      </div>

      <div className="flex flex-col items-center">
        {/* Character display - square box without border */}
        <span className="font-kaishu text-7xl">{character}</span>

        {/* Input field - same width as character display */}
        <div className="relative w-28 mx-auto">
          <div className="flex items-center justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) =>
                local_store.trigger.updateInput({ value: e.target.value })
              }
              className={`w-full bg-transparent py-1 ${isCompleted ? 'text-center' : 'pr-8'} font-lora text-header outline-none ${isErrorAnimating ? "opacity-50 transition-all duration-300" : "transition-all duration-300"} underline ${isErrorAnimating ? "decoration-red-500" : "decoration-header2"}`}
              disabled={isCompleted}
              placeholder="Pinyin"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  local_store.trigger.submit();
                }
              }}
            />
            {!isCompleted && (
              <button
                className="absolute right-1 cursor-pointer"
                onClick={() => local_store.trigger.submit()}
                aria-label="Submit"
              >
                <span className="text-lg text-header">⏎</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        {buttonName && (
          <button
            className="w-full font-lora text-lg underline decoration-header2 hover:decoration-header"
            onClick={() => local_store.trigger.buttonClick()}
          >
            {buttonName}
          </button>
        )}
      </div>
    </div>
  );
}
