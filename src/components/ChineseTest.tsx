/* eslint-disable react/prop-types */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
  use,
} from "react";
import HanziWriter from "hanzi-writer";
import { useSelector, useStore } from "@xstate/store/react";
import type { HTMLTag } from "astro/types";
import { createStore } from "@xstate/store";

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
  const sentences = sentences_old.map((sentence) => ({
    ...sentence,
    words: sentence.words.reduce((acc, current, index, array) => {
      // Check if we're on a character (even index)
      if (index % 2 === 0 && index < array.length - 1) {
        acc.push({
          character: current,
          pinyin: array[index + 1],
        });
      }
      return acc;
    }, []),
  }));
  return sentences;
}

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
  green = 0, // correctly written w/o char
  red = 1, // incorrectly written w/ char
  yellow = 2, // correctly written w/ char
}
function CharacterReview({ character, pinyin, history, setHistory }) {
  // who would've known you needed an 80-line state machine for a singular character 🤷
  const store = useStore({
    context: {
      mistakes: 0,
      state: CharState.green,
      isCompleted: false,
      redLimit: 12,
      writer: null as HanziWriter | null,
      message: "",
    },
    on: {
      // STATE MACHINE DONE
      solved: (context) => {
        setTimeout(() => {
          context.writer?.animateCharacter();
        }, 1000);

        return { ...context, isCompleted: true };
      },
      mistake: (context) => {
        const newMistakes = context.mistakes + 1;
        if (context.state == CharState.green && newMistakes >= 5) {
          context.writer?.showOutline();
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.yellow,
            redLimit: newMistakes + 7,
            message: "Showing outline because of excess of mistakes",
          };
        }
        if (
          context.state == CharState.yellow &&
          newMistakes >= context.redLimit
        ) {
          context.writer?.animateCharacter();
          return {
            ...context,
            mistakes: newMistakes,
            state: CharState.red,
            message: "Showing solution because of excess of mistakes",
          };
        }
        return { ...context, mistakes: newMistakes };
      }, // mistake
      buttonClick: (context) => {
        if (context.state == CharState.green && !context.isCompleted) {
          // show outline
          context.writer?.showOutline();
          return { ...context, state: CharState.yellow };
        } else {
          // show/replay solution
          context.writer?.animateCharacter();
          if (context.isCompleted && context.state == CharState.yellow) {
            return { ...context, isCompleted: true };
          }
          return { ...context, state: CharState.red, isCompleted: true };
        }
      },
      initWriter: (
        context,
        event: { ref: React.RefObject<HTMLDivElement> },
      ) => {
        const hanziWriter = HanziWriter.create(event.ref.current, character, {
          width: 250,
          height: 250,
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
  const mistakes = useSelector(store, (state) => state.context.mistakes);
  const state = useSelector(store, (state) => state.context.state);
  const buttonName = useSelector(store, (state) => {
    let name = "Replay animation";
    if (!(state.context.isCompleted || state.context.state === CharState.red)) {
      if (state.context.state === CharState.green) {
        name = "Show outline";
      } else if (state.context.state === CharState.yellow) {
        name = "Show solution";
      }
    }
    return name;
  });
  const isCompleted = useSelector(store, (state) => state.context.isCompleted);
  const message = useSelector(store, (state) => state.context.message);
  const writer = useSelector(store, (state) => state.context.writer);

  const charHistory = history[character] ?? [];
  const writerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store.trigger.initWriter({ ref: writerRef });
  }, []);

  useEffect(() => {
    if (!writer) return;
    writer.quiz({
      onMistake: () => {
        store.trigger.mistake();
      },
      onComplete: store.trigger.solved,
    });
  }, [writer]);

  const [hasUpdatedHistory, setHasUpdatedHistory] = useState(false);
  useEffect(() => {
    if (isCompleted) {
      // Update history with the current state
      if (!hasUpdatedHistory) {
        setHistory((prevHistory) => {
          const currState = state;
          const currentCharHistory = prevHistory[character] || [];
          return {
            ...prevHistory,
            [character]: [currState, ...currentCharHistory],
          };
        });
      }
      setHasUpdatedHistory(true);
    }
  }, [isCompleted]);
  console.log(character);
  return (
    <div className="flex animate-roll-in flex-col">
      <div className="flex p-0 font-mono">
        <span className="mr-auto size-[20px]">{pinyin}</span>
        <span className="ml-auto">
          {isCompleted ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              fill={
                state === CharState.green
                  ? "#22c55e"
                  : state === CharState.red
                    ? "#ef4444"
                    : "#eab308"
              }
            >
              <path
                fillRule="evenodd"
                d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
              />
            </svg>
          ) : (
            `${mistakes} mistakes`
          )}
        </span>
      </div>
      <div className="flex items-center">
        <span className="pr-4 font-mono">Status:</span>
        {(isCompleted ? charHistory : [state, ...charHistory]).map(
          (state, index) => {
            const isFirst = index === 0;
            const stateColor =
              state === CharState.green
                ? "bg-green-500"
                : state === CharState.red
                  ? "bg-red-500"
                  : "bg-yellow-500";

            return (
              <div
                className={`border-b-2 ${isFirst && !isCompleted ? "animate-chinese-widen border-header" : "border-[white]"} h-9 w-7 px-1 py-2`}
              >
                <div
                  className={`mb-2 h-5 w-5 rounded-full transition-all duration-300 hover:opacity-70 ${stateColor}`}
                ></div>
              </div>
            );
          },
        )}
      </div>
      <div
        className="bg-stripes-header2 mt-2 rounded-xl border border-header p-[10px]"
        ref={writerRef}
      ></div>
      <div>
        <Button
          onClick={() => store.trigger.buttonClick()}
          name={buttonName}
        ></Button>
        <div className="w-[270px] text-wrap font-lora text-xl">{message}</div>
      </div>
    </div>
  );
}
function SentenceReview({ sentences, setSentences, history, setHistory }) {
  return (
    <div className="flex flex-wrap">
      {sentences[0].words.map((word) => (
        <div className="m-2">
          <CharacterReview
            character={word.character}
            pinyin={word.pinyin}
            history={history}
            setHistory={setHistory}
          />
        </div>
      ))}
    </div>
  );
}

export default function ChineseApp() {
  const [sentences, setSentences] = useState<Sentence[]>(() => {
    return [...remap()].sort(() => Math.random() - 0.5);
  });
  const [history, setHistory] = useState<{ [key: string]: CharState[] }>({});
  const [state, setState] = useState<AppState>(AppState.reviewingSentence);
  return (
    <div className="flex h-full w-full items-center justify-center text-2xl">
      {state === AppState.startingScreen ? (
        <Button
          name="Begin"
          onClick={() => setState(AppState.reviewingSentence)}
        />
      ) : state === AppState.reviewingSentence ? (
        <SentenceReview
          sentences={sentences}
          setSentences={setSentences}
          history={history}
          setHistory={setHistory}
        />
      ) : (
        <div>All done!</div>
      )}
    </div>
  );
}

/*
  // State machine of a character:
  // 1. green
  // 2. yellow1 (mistake-caused)
  // 3. yellow2 (intentional)
  // 4. red
  //
  // green && 5 mistakes -> yellow1 && 5 mistakes
  // green && show outline -> yellow2 && 0 mistakes
  // yellow1 && 12 mistakes -> red
  // yellow2 && 7 mistakes -> red
  // yellow1/2 && show solution -> red
  // green && solved -> green && green check
  // yellow1/2 && solved -> yellow && yellow check
  // red -> show solution -> red && red check

  const charHistory = history["我"] ?? [];

  type InternalCharState = "green" | "yellow" | "red";
  const [currentState, setCurrentState] = useState<InternalCharState>("green");
  // -1 if completed V
  const [mistakes, setMistakes] = useState(0);
  const [redLimit, setRedLimit] = useState(12);
  const [currentStatePublic, setCurrentStatePublic] = useState<CharState>(
    CharState.green,
  );
  useEffect(() => {
    let publicState: CharState;
    switch (currentState) {
      case "green":
        publicState = CharState.green;
        break;
      case "yellow":
        publicState = CharState.yellow;
        break;
      case "red":
        publicState = CharState.red;
        break;
      default:
        publicState = CharState.green;
    }
    setCurrentStatePublic(publicState);
  }, [currentState]);

  const writerRef = useRef<HTMLDivElement>(null);
  const [writer, setWriter] = useState<HanziWriter | null>(null);

  // State machine transition function
  const transitionState = useCallback(
    (
      action:
        | "mistake"
        | "showOutline"
        | "showSolution"
        | "solved"
        | "replayAnimation",
    ) => {
      // Save current state before transition
      const prevState = currentState;
      let newState = currentState;

      // Calculate new mistakes count first
      const newMistakes = mistakes + (action === "mistake" ? 1 : 0);
      // Log the updated count, not the stale value

      switch (prevState) {
        case "green":
          if (action === "mistake" && newMistakes >= 5) {
            newState = "yellow";
            writer?.showOutline();
            setRedLimit(newMistakes + 7);
          } else if (action === "showOutline") {
            newState = "yellow";
            writer?.showOutline();
            setRedLimit(newMistakes + 7);
          } else if (action === "solved") {
            // green && solved -> green with check
            setMistakes(-1);
            return; // Early return to avoid the setMistakes call at the end
          }
          break;

        case "yellow":
          if (action === "mistake" && newMistakes >= redLimit) {
            // yellow1/2 && max mistakes -> red
            newState = "red";
            writer?.animateCharacter();
            setMistakes(-1);
            return; // Early return to avoid the setMistakes call at the end
          } else if (action === "showSolution") {
            // yellow1/2 && show solution -> red
            newState = "red";
            writer?.animateCharacter();
            setMistakes(-1);
            return; // Early return to avoid the setMistakes call at the end
          } else if (action === "solved") {
            // yellow1/2 && solved -> yellow with check
            setMistakes(-1);
            return; // Early return to avoid the setMistakes call at the end
          }
          break;

        case "red":
          if (action === "replayAnimation") {
            // Replay the animation in red state
            writer?.animateCharacter();
          }
          // Red state is terminal - no state changes
          break;
      }

        `State transition: ${prevState} -> ${newState}, mistakes: ${newMistakes}`,
      );
      setCurrentState(newState);

      // Only set mistakes for 'mistake' action or when not explicitly set elsewhere
      if (action === "mistake") {
        setMistakes(newMistakes);
      }
    },
    [currentState, mistakes, redLimit, writer],
  );

  // Manual state transitions
  const showOutlineOrSolution = () => {
    if (currentState === "green") {
      transitionState("showOutline");
    } else if (currentState === "yellow") {
      transitionState("showSolution");
    } else if (currentState === "red") {
      transitionState("replayAnimation");
    }
  };

  // Initialize HanziWriter
  useEffect(() => {
    const hanziWriter = HanziWriter.create(writerRef.current, "我", {
      width: 250,
      height: 250,
      padding: 5,
      strokeColor: "#0851D0",
      drawingColor: "#0851D0",
      outlineColor: "rgba(130, 169, 229, 0.5)",
      acceptBackwardsStrokes: true,
      showHintAfterMisses: false,
      showOutline: false,
      strokeFadeDuration: 0,
    });

    setWriter(hanziWriter);

    return () => {
      if (hanziWriter) {
        // Cleanup if needed
        setWriter(null);
      }
    };
  }, []);

  // Set up quiz when writer is ready
  useEffect(() => {
    if (!writer) return;

    const quizOptions = {
      onMistake: () => {
        transitionState("mistake");
      },
      onComplete: () => {
        transitionState("solved");
      },
    };

    writer.quiz(quizOptions);
  }, [writer, redLimit]);

  return (
    <div className="flex animate-roll-in flex-col">
      <div className="flex">
        <span className="mr-auto p-0 font-mono">wǒ</span>
        <span className="ml-auto">{mistakes} mistakes</span>
      </div>
      <div className="flex items-center">
        <span className="pr-4 font-mono">Status:</span>
        {[currentStatePublic, ...charHistory].map((state, index) => {
          const isFirst = index === 0;
          const baseClasses =
            "h-5 w-5 rounded-full mb-2 transition-all duration-300 hover:opacity-70";
          const stateClasses =
            state === CharState.green
              ? "bg-green-500"
              : state === CharState.red
                ? "bg-red-500"
                : "bg-yellow-500";
          const firstStateClasses = isFirst
            ? "animate-chinese-widen border-b-2 border-header py-2 px-1 w-7 h-9"
            : "border-b-2 border-[white] py-2 px-1 w-7 h-9";

          return (
            <div className={`${firstStateClasses}`}>
              <div className={`${baseClasses} ${stateClasses}`}></div>
            </div>
          );
        })}
      </div>
      <div
        className="bg-stripes-header2 mt-2 rounded-xl border border-header p-1"
        ref={writerRef}
      ></div>
      <div>
        <Button
          onClick={() => {
            if (currentState === "red" || currentState === "yellow") {
              updateState("red");
            } else if (currentState === "green") {
              setCurrentState("yellow");
            }
          }}
          name={
            currentState === "red"
              ? "Replay animation"
              : `Show ${currentState === "green" ? "outline" : "solution"}`
          }
        ></Button>
      </div>
    </div>
  );
*/
