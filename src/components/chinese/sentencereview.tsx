import React, { useRef } from "react";
import { useSelector } from "@xstate/store/react";
import { store } from "./chinesestore";
import { CharacterReview } from "./characterreview";

/**
 * Component that renders a full sentence review interface with multiple characters
 */
export function SentenceReview() {
  const sentences = useSelector(store, (state) => state.context.sentences);
  const id = useRef(
    Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
  ).current;

  return (
    <div className="flex animate-roll-in flex-wrap">
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
