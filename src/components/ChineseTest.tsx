import React, { useState } from "react";
import { Button } from "./chinese/button";
import { SentenceReview } from "./chinese/sentencereview";
import { AppState } from "./chinese/chinese";

/**
 * Main application component that manages app state and renders appropriate view
 */
export default function ChineseApp() {
  const [state, setState] = useState<AppState>(AppState.startingScreen);

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
