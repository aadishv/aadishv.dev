import lessonData11 from "./data/1-1.json";
import lessonData12 from "./data/1-2.json";
import lessonData21 from "./data/2-1.json";
import lessonData22 from "./data/2-2.json";
import lessonData31 from "./data/3-1.json";
import lessonData32 from "./data/3-2.json";
import lessonData41 from "./data/4-1.json";
import lessonData42 from "./data/4-2.json";
import lessonData51 from "./data/5-1.json";
import lessonData52 from "./data/5-2.json";
import lessonData61 from "./data/6-1.json";
import lessonData62 from "./data/6-2.json";
import lessonData71 from "./data/7-1.json";
import lessonData72 from "./data/7-2.json";
import lessonData81 from "./data/8-1.json";
import lessonData82 from "./data/8-2.json";
import lessonData91 from "./data/9-1.json";

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

type LessonJsonData = {
  sentences: Array<{
    def: string;
    words: Array<{
      character: string;
      pinyin: string;
    }>;
  }>;
};

/**
 * Transforms JSON data from lesson files into the Sentence[] format
 * @param jsonData The raw JSON data from the lesson file
 * @param lessonId The lesson identifier (e.g., "ic lesson 1-1")
 * @returns {Sentence[]} Array of sentences in the required format
 */
function transformLessonData(
  jsonData: LessonJsonData,
  lessonId: string,
): Sentence[] {
  if (!jsonData || !jsonData.sentences || !Array.isArray(jsonData.sentences)) {
    return [];
  }

  return jsonData.sentences.map((sentence) => ({
    lesson: lessonId,
    def: sentence.def,
    words: sentence.words.map((word) => ({
      character: word.character,
      pinyin: word.pinyin,
    })),
    id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
  }));
}

export function getSentences(): Sentence[] {
  const lessonData = lessonData11;
  return [
    ...transformLessonData(lessonData11, "ic lesson 1-1"),
    ...transformLessonData(lessonData12, "ic lesson 1-2"),
    ...transformLessonData(lessonData21, "ic lesson 2-1"),
    ...transformLessonData(lessonData22, "ic lesson 2-2"),
    ...transformLessonData(lessonData31, "ic lesson 3-1"),
    ...transformLessonData(lessonData32, "ic lesson 3-2"),
    ...transformLessonData(lessonData41, "ic lesson 4-1"),
    ...transformLessonData(lessonData42, "ic lesson 4-2"),
    ...transformLessonData(lessonData51, "ic lesson 5-1"),
    ...transformLessonData(lessonData52, "ic lesson 5-2"),
    ...transformLessonData(lessonData61, "ic lesson 6-1"),
    ...transformLessonData(lessonData62, "ic lesson 6-2"),
    ...transformLessonData(lessonData71, "ic lesson 7-1"),
    ...transformLessonData(lessonData72, "ic lesson 7-2"),
    ...transformLessonData(lessonData81, "ic lesson 8-1"),
    ...transformLessonData(lessonData82, "ic lesson 8-2"),
    ...transformLessonData(lessonData91, "ic lesson 9-1"),
  ];
}

/**
 * Transforms raw sentence data into structured format with character/pinyin pairs
 * @returns {Sentence[]} Array of sentences with character and pinyin pairs
 */
function getSentencesOld(): Sentence[] {
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
