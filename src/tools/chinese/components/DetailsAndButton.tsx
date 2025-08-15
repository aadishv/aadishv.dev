import { useEffect, useState } from "react";
import { useSelector } from "@xstate/store/react";
import { store } from "../Store";
import type { Sentence } from "../Data";

export function Button({
  name,
  onClick,
  red = false,
}: {
  name: string;
  onClick: () => void;
  red?: boolean;
}) {
  return (
    <button
      className={`m-0 h-8 justify-center truncate p-0 font-lora underline transition-all duration-300 ease-in-out ${red ? "hover:decoration-red-600" : "hover:decoration-header"} ${red ? "decoration-red-400" : "decoration-header2"}`}
      onClick={onClick}
    >
      {name}
    </button>
  );
}

/**
 * Basic sentence details with click-to-reveal English meaning
 */
export function SentenceDetails() {
  const [revealMeaning, setRevealMeaning] = useState(false);
  const sentence: Sentence = useSelector(
    store,
    (state) => state.context.sentences[0],
  );
  useEffect(() => {
    setRevealMeaning(false);
  }, [sentence])
  return (<div className="text-xl flex flex-col">
    <span className="text-black/50">{sentence.lesson}</span>
        {revealMeaning ? (
            sentence.def
        ) : (
          <button
            className="text-black/70 mr-auto"
            onClick={() => setRevealMeaning(true)}
          >
            click to reveal english definition
          </button>
        )}
  </div>);
}
