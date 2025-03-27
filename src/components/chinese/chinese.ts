export interface Sentence {
  lesson: string;
  words: {
    character: string;
    pinyin: string;
  }[];
}

export enum AppState {
  startingScreen = 0,
  reviewingSentence = 1,
  allDone = 2,
}

export enum CharState {
  green = 0, // correctly written without hints
  yellow = 1, // correctly written with hints
  red = 2, // incorrectly written even with hints
}