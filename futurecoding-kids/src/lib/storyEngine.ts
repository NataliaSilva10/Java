// Pure, framework-free logic for the Create Stories activity.
// Keeping this separate from the React component makes it easy to test
// and reuse (e.g. in a future "Write a story" or quiz screen).

export type Language = "en" | "pt" | "es";

export const LANGUAGES: Language[] = ["en", "pt", "es"];

/** Beginner = words & short phrases, intermediate = full sentences, advanced = longer sentences. */
export type Level = "beginner" | "intermediate" | "advanced";

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

/** One string per language. Used for titles, prompts, hints, UI copy. */
export type Translated = Record<Language, string>;

/**
 * A sentence the child builds in ONE language.
 *
 * Each language gets its own full sentence instead of a word-by-word mapping,
 * because word order and word count differ between languages
 * (e.g. "in the sky" → "no céu", "a beautiful butterfly" → "una mariposa hermosa").
 */
export type SentenceTarget = {
  /** The main correct sentence, written naturally with capital + punctuation. */
  sentence: string;
  /** Other word orders that are also correct, e.g. "Una hermosa mariposa". */
  alternatives?: string[];
  /** Extra words added to the word bank to make it a little harder. */
  distractors?: string[];
};

/** A word shown in all three languages so children can compare them. */
export type VocabItem = Translated & { emoji?: string };

export type Activity = {
  id: string;
  level: Level;
  /** Optional picture (e.g. "/images/cat-sleeping.png" in /public). Falls back to the emoji scene. */
  image?: string;
  emoji: string;
  title: Translated;
  prompt: Translated;
  scene: Translated;
  hint: Translated;
  targets: Record<Language, SentenceTarget>;
  vocabulary: VocabItem[];
  /** Conversation question the robot asks after the sentence is completed. */
  followUp: Translated;
  /** Simple explanation of how the sentence is built, written IN that language. */
  explain: Translated;
};

export type WordStatus = "right" | "misplaced" | "extra";

export type AttemptDiff = {
  /** One status per chosen word. */
  statuses: WordStatus[];
  /** Words from the sentence the child hasn't used yet. */
  missing: string[];
  /** The correct sentence the attempt was compared with (closest option). */
  closest: string[];
};

/** A tile in the word bank. `id` is unique even when two tiles have the same text. */
export type WordTile = { id: string; text: string };

const PUNCTUATION = /[.,!?¡¿;:"“”«»]/g;

/** Lower-cases and strips punctuation, keeping accents (é ≠ e matters in pt/es). */
export function normalizeWord(word: string, language: Language): string {
  return word.replace(PUNCTUATION, "").trim().toLocaleLowerCase(locale(language));
}

/** "The girl is watering the flowers." → ["the", "girl", "is", "watering", "the", "flowers"] */
export function tokenize(sentence: string, language: Language): string[] {
  return sentence
    .split(/\s+/)
    .map((word) => normalizeWord(word, language))
    .filter(Boolean);
}

/** Deterministic shuffle so the bank doesn't jump around on every re-render. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  const next = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Never show the answer already in the right order.
  if (result.length > 1 && result.every((item, i) => item === items[i])) {
    result.push(result.shift() as T);
  }
  return result;
}

/** Builds the shuffled word bank for one activity in one language. */
export function buildWordBank(activity: Activity, language: Language, round = 0): WordTile[] {
  const target = activity.targets[language];
  const words = [...tokenize(target.sentence, language), ...(target.distractors ?? []).map((w) => normalizeWord(w, language))];
  const tiles = words.map((text, index) => ({ id: `${activity.id}-${language}-${index}`, text }));
  return seededShuffle(tiles, `${activity.id}:${language}:${round}`);
}

/**
 * Compares by word TEXT, not tile id, so two identical tiles ("the" / "the")
 * are interchangeable, and accepts any listed alternative word order.
 */
export function isCorrect(chosen: string[], target: SentenceTarget, language: Language): boolean {
  const attempt = chosen.map((w) => normalizeWord(w, language)).join(" ");
  return [target.sentence, ...(target.alternatives ?? [])].some(
    (option) => tokenize(option, language).join(" ") === attempt
  );
}

/**
 * Counts how many words are in the right place from the start, so feedback can
 * say "the first 3 words are right!" instead of just "wrong".
 */
export function correctPrefixLength(chosen: string[], target: SentenceTarget, language: Language): number {
  const attempt = chosen.map((w) => normalizeWord(w, language));
  let best = 0;
  for (const option of [target.sentence, ...(target.alternatives ?? [])]) {
    const expected = tokenize(option, language);
    let n = 0;
    while (n < attempt.length && n < expected.length && attempt[n] === expected[n]) n++;
    best = Math.max(best, n);
  }
  return best;
}

/**
 * Word-by-word feedback for a wrong attempt:
 *  - right:     correct word in the correct place
 *  - misplaced: the word belongs in the sentence, but somewhere else
 *  - extra:     the word isn't part of this sentence (e.g. a distractor)
 * Compared against whichever correct option (main sentence or alternative) is closest.
 */
export function diffAttempt(chosen: string[], target: SentenceTarget, language: Language): AttemptDiff {
  const attempt = chosen.map((w) => normalizeWord(w, language));
  let best: AttemptDiff | null = null;
  let bestScore = -1;
  for (const option of [target.sentence, ...(target.alternatives ?? [])]) {
    const expected = tokenize(option, language);
    const remaining = new Map<string, number>();
    expected.forEach((word, i) => {
      if (attempt[i] !== word) remaining.set(word, (remaining.get(word) ?? 0) + 1);
    });
    const statuses: WordStatus[] = attempt.map((word, i) => {
      if (expected[i] === word) return "right";
      const left = remaining.get(word) ?? 0;
      if (left > 0) {
        remaining.set(word, left - 1);
        return "misplaced";
      }
      return "extra";
    });
    const missing = [...remaining.entries()].flatMap(([word, n]) => Array<string>(n).fill(word));
    const score = statuses.filter((s) => s === "right").length * 2 + statuses.filter((s) => s === "misplaced").length;
    if (score > bestScore) {
      bestScore = score;
      best = { statuses, missing, closest: expected };
    }
  }
  return best as AttemptDiff;
}

/** The next word the child should add (used by the robot's "Help me"). */
export function nextCorrectWord(chosen: string[], target: SentenceTarget, language: Language): string | null {
  const { statuses, closest } = diffAttempt(chosen, target, language);
  const firstWrong = statuses.findIndex((s) => s !== "right");
  const index = firstWrong === -1 ? chosen.length : firstWrong;
  return closest[index] ?? null;
}

/** Display form: first letter capitalised + final punctuation from the target sentence. */
export function formatSentence(words: string[], target: SentenceTarget, language: Language): string {
  if (!words.length) return "";
  const text = words.join(" ");
  const capitalised = text.charAt(0).toLocaleUpperCase(locale(language)) + text.slice(1);
  const ending = target.sentence.trim().match(/[.!?]$/)?.[0] ?? "";
  const opening = ending === "?" && language === "es" ? "¿" : ending === "!" && language === "es" ? "¡" : "";
  return `${opening}${capitalised}${ending}`;
}

export function locale(language: Language): string {
  return { en: "en-US", pt: "pt-BR", es: "es-ES" }[language];
}

/**
 * Development check for content authors. Returns a list of problems such as a
 * missing translation, or an alternative that can't be built from the bank.
 */
export function validateActivities(activities: Activity[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const activity of activities) {
    if (ids.has(activity.id)) problems.push(`Duplicate activity id "${activity.id}"`);
    ids.add(activity.id);
    for (const language of LANGUAGES) {
      for (const field of ["title", "prompt", "scene", "hint", "followUp", "explain"] as const) {
        if (!activity[field][language]?.trim()) problems.push(`${activity.id}: missing ${field}.${language}`);
      }
      const target = activity.targets[language];
      if (!target?.sentence.trim()) {
        problems.push(`${activity.id}: missing sentence for ${language}`);
        continue;
      }
      const bank = tokenize(target.sentence, language).sort().join(" ");
      for (const alt of target.alternatives ?? []) {
        if (tokenize(alt, language).sort().join(" ") !== bank) {
          problems.push(`${activity.id}/${language}: alternative "${alt}" uses different words than "${target.sentence}"`);
        }
      }
      activity.vocabulary.forEach((item, i) => {
        if (!item[language]?.trim()) problems.push(`${activity.id}: vocabulary[${i}] missing ${language}`);
      });
    }
  }
  return problems;
}
