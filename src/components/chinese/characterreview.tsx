import React, { useState, useRef, useEffect } from "react";
import HanziWriter from "hanzi-writer";
import { useSelector, useStore } from "@xstate/store/react";
import { store } from "./Store";
import { CharState } from "./Data";

const CHARACTER_SIZE_STYLE = "h-28 w-28";
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
      <div className="my-2 flex h-[12.875rem] flex-col px-2 font-lora">
        <div className="my-auto text-3xl">{character}</div>
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
    <div className="my-2 flex flex-col px-2">
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
          className="font-lora text-lg underline decoration-header2 hover:decoration-header"
          onClick={() => local_store.trigger.buttonClick()}
        >
          {buttonName}
        </button>
      </div>
    </div>
  );
}
