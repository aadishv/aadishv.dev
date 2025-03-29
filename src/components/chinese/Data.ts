export interface Sentence {
  lesson: string;
  def: string;
  words: {
    character: string;
    pinyin: string;
  }[];
  id: string;
}

export enum CharState {
  green = 0, // correctly written without hints
  yellow = 1, // correctly written with hints
  red = 2, // incorrectly written even with hints
}

/**
 * Transforms raw sentence data into structured format with character/pinyin pairs
 * @returns {Sentence[]} Array of sentences with character and pinyin pairs
 */
export function getSentences(): Sentence[] {
  const so = [
    {
      lesson: "ic lesson 8-1",
      def: "Are you my friend?",
      words: [
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
  const sentences_old = [
    so[0],
    {
      lesson: "ic lesson 6-6",
      def: "Are you my friend?",
      words: ["的", "de", "朋", "péng", "友", "you", "ma", "?", ""],
    },
    {
      lesson: "ic lesson 1-1",
      def: "hello",
      words: ["你", "nǐ", "好", "hǎo"],
    },
    {
      lesson: "ic lesson 1-2",
      def: "goodbye",
      words: ["再", "zài", "见", "jiàn"],
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
    id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
  }));
}
