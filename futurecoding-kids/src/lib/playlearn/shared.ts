import type { Language } from "../storyEngine";
import type { ActivityId } from "./progress";
import type { AgeGroup } from "./words";

export type Speak = (text: string, language?: Language, rate?: number) => void;

/** What every Play & Learn activity receives from the page. */
export type ActivityProps = {
  language: Language;
  age: AgeGroup;
  speak: Speak;
  /** Child got it right: award stars, celebrate and show a happy message. */
  onWin: (activity: ActivityId, stars: number, message?: string) => void;
  /** Gentle encouragement after a mistake — never a harsh error. */
  onTryAgain: (message?: string) => void;
};

export const PRAISE = ["Amazing!", "You're a superstar!", "Great job!", "Fantastic!", "Wow, well done!", "You did it!"];
export const ENCOURAGE = ["Great try! Let's try again.", "Almost! You can do it!", "So close! Try one more time.", "Good thinking! Try again."];

export const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/** Pastel colors that rotate across letters and tiles. */
export const PASTELS = ["#cdbdff", "#a9d8ff", "#ffc9b0", "#ffb7d5", "#b9ecd0", "#ffe08a"];
export const PASTEL_INK = ["#5a3fc0", "#1f6fae", "#b4552a", "#b03a72", "#2c7a52", "#8a6500"];
