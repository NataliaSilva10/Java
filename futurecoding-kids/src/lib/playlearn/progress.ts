import { useCallback, useEffect, useState } from "react";
import type { Language } from "../storyEngine";

export type ActivityId = "letters" | "builder" | "matching" | "hangman" | "spelling" | "sentences";

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: (p: PlayProgress) => boolean;
};

export type PlayProgress = {
  stars: number;
  wins: Record<ActivityId, number>;
  /** Letters explored per language, e.g. { en: ["A","B"] }. */
  letters: Record<Language, string[]>;
  languagesPlayed: Language[];
  badges: string[];
};

const STORAGE_KEY = "futurekids-playlearn-v1";

const empty = (): PlayProgress => ({
  stars: 0,
  wins: { letters: 0, builder: 0, matching: 0, hangman: 0, spelling: 0, sentences: 0 },
  letters: { en: [], pt: [], es: [] },
  languagesPlayed: [],
  badges: [],
});

export const BADGES: Badge[] = [
  { id: "first-star", emoji: "⭐", name: "First Star", description: "Earn your first star", earned: (p) => p.stars >= 1 },
  { id: "letter-explorer", emoji: "🔤", name: "Letter Explorer", description: "Pop 10 letters", earned: (p) => Math.max(...Object.values(p.letters).map((l) => l.length)) >= 10 },
  { id: "alphabet-hero", emoji: "🏅", name: "Alphabet Hero", description: "Pop every letter in one language", earned: (p) => p.letters.en.length >= 26 || p.letters.pt.length >= 26 || p.letters.es.length >= 27 },
  { id: "word-wizard", emoji: "🧙", name: "Word Wizard", description: "Build 5 words", earned: (p) => p.wins.builder >= 5 },
  { id: "match-master", emoji: "🧩", name: "Match Master", description: "Finish 3 matching games", earned: (p) => p.wins.matching >= 3 },
  { id: "robot-builder", emoji: "🤖", name: "Robot Rescuer", description: "Win 3 Hangman words", earned: (p) => p.wins.hangman >= 3 },
  { id: "super-speller", emoji: "🐝", name: "Super Speller", description: "Spell 5 words right", earned: (p) => p.wins.spelling >= 5 },
  { id: "sentence-star", emoji: "📝", name: "Sentence Star", description: "Build 3 sentences", earned: (p) => p.wins.sentences >= 3 },
  { id: "trilingual", emoji: "🌎", name: "World Explorer", description: "Play in all 3 languages", earned: (p) => p.languagesPlayed.length >= 3 },
  { id: "superstar", emoji: "🌟", name: "Superstar", description: "Collect 50 stars", earned: (p) => p.stars >= 50 },
];

/** Stars needed per level: level 1 = 0–19 stars, level 2 = 20–39, … */
export const STARS_PER_LEVEL = 20;
export const levelOf = (stars: number) => Math.floor(stars / STARS_PER_LEVEL) + 1;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Loads saved progress, checking every field (old or damaged data never crashes the page). */
function load(): PlayProgress {
  const base = empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const d = JSON.parse(raw) as Record<string, unknown> | null;
    if (!d || typeof d !== "object") return base;
    const wins = (d.wins && typeof d.wins === "object" ? d.wins : {}) as Record<string, unknown>;
    const letters = (d.letters && typeof d.letters === "object" ? d.letters : {}) as Record<string, unknown>;
    return {
      stars: num(d.stars),
      wins: Object.fromEntries(Object.keys(base.wins).map((k) => [k, num(wins[k])])) as PlayProgress["wins"],
      letters: { en: strings(letters.en), pt: strings(letters.pt), es: strings(letters.es) },
      languagesPlayed: strings(d.languagesPlayed).filter((l): l is Language => l === "en" || l === "pt" || l === "es"),
      badges: strings(d.badges),
    };
  } catch {
    return base;
  }
}

/** Progress for Play & Learn, saved in this browser only (no personal data). */
export function usePlayProgress(language: Language) {
  const [progress, setProgress] = useState<PlayProgress>(load);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage blocked: progress lasts for this visit only */
    }
  }, [progress]);

  /** Applies a change, then unlocks any newly earned badges. */
  const update = useCallback((change: (p: PlayProgress) => PlayProgress) => {
    setProgress((current) => {
      const next = change(current);
      const unlocked = BADGES.filter((b) => !next.badges.includes(b.id) && b.earned(next));
      if (!unlocked.length) return next;
      setNewBadge(unlocked[unlocked.length - 1]);
      return { ...next, badges: [...next.badges, ...unlocked.map((b) => b.id)] };
    });
  }, []);

  useEffect(() => {
    update((p) => (p.languagesPlayed.includes(language) ? p : { ...p, languagesPlayed: [...p.languagesPlayed, language] }));
  }, [language, update]);

  const addWin = useCallback(
    (activity: ActivityId, stars: number) =>
      update((p) => ({ ...p, stars: p.stars + stars, wins: { ...p.wins, [activity]: p.wins[activity] + 1 } })),
    [update]
  );

  const exploreLetter = useCallback(
    (lang: Language, letter: string) =>
      update((p) => (p.letters[lang].includes(letter) ? p : { ...p, letters: { ...p.letters, [lang]: [...p.letters[lang], letter] } })),
    [update]
  );

  const reset = useCallback(() => setProgress(empty()), []);

  return { progress, addWin, exploreLetter, newBadge, clearBadge: () => setNewBadge(null), reset };
}
