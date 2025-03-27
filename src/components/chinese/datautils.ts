import type { Sentence } from "./chinese";

/**
 * Transforms raw sentence data into structured format with character/pinyin pairs
 * @returns {Sentence[]} Array of sentences with character and pinyin pairs
 */
export function remap(): Sentence[] {
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
