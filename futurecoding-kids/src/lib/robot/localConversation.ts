// Practice mode: a working offline conversation with ready-made, natural replies.
// Used when no AI backend is configured or it can't be reached.
// Pure functions only (no React), so it's easy to test.

import { normalizeWord, type Language, type Translated } from "../storyEngine";
import { phrase } from "./robotPhrases";
import { topicById } from "./topics";
import type { ConversationContext, RobotReply, TopicStep } from "./types";

export function createContext(language: Language, level: ConversationContext["level"]): ConversationContext {
  return { language, level, childName: null, topicId: null, step: 0, nudged: false, followUp: false };
}

export function currentStep(ctx: ConversationContext): TopicStep | null {
  return topicById(ctx.topicId)?.steps[ctx.step] ?? null;
}

// ───────── Understanding the child ─────────

const NAME_PATTERNS: Record<Language, RegExp> = {
  en: /\b(?:my name is|my name's|i am|i'm|call me|it's)\s+([\p{L}'-]+)/iu,
  pt: /\b(?:meu nome é|meu nome e|me chamo|eu me chamo|eu sou|sou)\s+(?:o\s+|a\s+)?([\p{L}'-]+)/iu,
  es: /\b(?:me llamo|mi nombre es|yo soy|soy)\s+([\p{L}'-]+)/iu,
};

/** Words that are never a name ("I am happy", "Soy feliz"). */
const NOT_NAMES = new Set([
  "happy", "sad", "tired", "fine", "good", "ok", "okay", "hungry", "a", "an", "the", "not",
  "feliz", "triste", "cansado", "cansada", "bem", "bom", "boa", "um", "uma",
  "bien", "un", "una", "contento", "contenta", "yo", "eu", "my", "meu", "mi", "is", "es", "é",
]);

const capitalise = (word: string) => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();

/**
 * Finds the child's first name. With `strict`, only explicit phrases like
 * "My name is Alex" count; otherwise a one- or two-word answer is taken as the name.
 */
export function extractName(text: string, language: Language, strict = false): string | null {
  const clean = text.trim().replace(/[.!?¡¿,]/g, "");
  const match = clean.match(NAME_PATTERNS[language]);
  let candidate = match?.[1] ?? null;
  if (!candidate && !strict) {
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 2) candidate = words[0];
  }
  if (!candidate) return null;
  if (NOT_NAMES.has(candidate.toLocaleLowerCase()) || candidate.length > 20 || /\d/.test(candidate)) return null;
  return capitalise(candidate);
}

export type Feeling = "happy" | "sad" | "tired";

const FEELINGS: Record<Language, [Feeling, RegExp][]> = {
  en: [["sad", /\b(sad|bad|upset|not good)\b/i], ["tired", /\b(tired|sleepy)\b/i], ["happy", /\b(happy|great|good|fine|excited|awesome|ok|okay)\b/i]],
  pt: [["sad", /\b(triste|mal|chateado|chateada)\b/i], ["tired", /\b(cansad[oa]|sono)\b/i], ["happy", /\b(feliz|bem|ótim[oa]|animad[oa]|legal|alegre)\b/i]],
  es: [["sad", /\b(triste|mal)\b/i], ["tired", /\b(cansad[oa]|sueño)\b/i], ["happy", /\b(feliz|bien|content[oa]|genial|alegre)\b/i]],
};

export function detectFeeling(text: string, language: Language): Feeling | null {
  return FEELINGS[language].find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

/**
 * Common beginner mistakes, fixed the way a teacher would "recast" them —
 * we show the right way without saying "wrong".
 */
const CORRECTIONS: Record<Language, [RegExp, string][]> = {
  en: [
    [/^i (happy|sad|tired|fine|good|ok|hungry|sleepy|excited)\b/i, "I am $1"],
    [/^i likes\b/i, "I like"],
    [/^me (like|have|want)\b/i, "I $1"],
    [/^i has\b/i, "I have"],
    [/\b(he|she|it) (have)\b/i, "$1 has"],
    [/\b(he|she|it) (like|play|eat|want|go)\b/i, "$1 $2s"],
  ],
  pt: [
    [/^eu (feliz|triste|cansad[oa]|bem|animad[oa])\b/i, "Eu estou $1"],
    [/^eu gosta\b/i, "Eu gosto"],
    [/^eu tem\b/i, "Eu tenho"],
    [/^eu é\b/i, "Eu sou"],
    [/^eu gosto (?!de\b)(\p{L}+)/iu, "Eu gosto de $1"],
  ],
  es: [
    [/^yo (feliz|triste|cansad[oa]|bien|content[oa])\b/i, "Yo estoy $1"],
    [/^(?:yo )?soy (cansad[oa]|bien)\b/i, "Estoy $1"],
    [/^yo gusta\b/i, "Me gusta"],
    [/^yo tiene\b/i, "Yo tengo"],
    [/^yo es\b/i, "Yo soy"],
  ],
};

/** Returns the gently corrected sentence, or null if nothing to fix. */
export function gentleCorrection(text: string, language: Language): string | null {
  const trimmed = text.trim().replace(/[.!?]+$/, "");
  for (const [pattern, replacement] of CORRECTIONS[language]) {
    if (pattern.test(trimmed)) {
      const fixed = trimmed.replace(pattern, replacement);
      return fixed.charAt(0).toLocaleUpperCase() + fixed.slice(1) + ".";
    }
  }
  return null;
}

const GREETINGS = /^(hi|hello|hey|oi|olá|ola|hola|buenas|bom dia|buenos días)\b/i;

const wordCount = (text: string, language: Language) =>
  text.split(/\s+/).map((w) => normalizeWord(w, language)).filter(Boolean).length;

/** Beginners may answer with one word; older levels are invited to use full sentences. */
const minWords = { beginner: 0, intermediate: 3, advanced: 4 } as const;

// ───────── Replies ─────────

function suggestionsFor(ctx: ConversationContext): Translated[] {
  const step = currentStep(ctx);
  if (!step || ctx.level === "advanced") return [];
  if (ctx.level === "intermediate") return [step.example];
  return [step.example, ...(step.choices ?? [])];
}

function advance(ctx: ConversationContext, lines: Translated[], mood: RobotReply["mood"]): RobotReply {
  const topic = topicById(ctx.topicId);
  const next: ConversationContext = { ...ctx, step: ctx.step + 1, nudged: false };
  if (!topic || next.step >= topic.steps.length) {
    lines.push(ctx.childName ? phrase("topicDoneName", { name: ctx.childName }) : phrase("topicDone"));
    const done = { ...next, topicId: null, step: 0 };
    return { lines, mood: "happy", context: done, suggestions: [] };
  }
  lines.push(topic.steps[next.step].ask);
  return { lines, mood, context: next, suggestions: suggestionsFor(next) };
}

export function startTopic(ctx: ConversationContext, topicId: string): RobotReply {
  const topic = topicById(topicId);
  if (!topic) return { lines: [phrase("helpGeneral")], mood: "idle", context: ctx, suggestions: [] };
  let step = 0;
  const lines: Translated[] = [];
  // Skip "what's your name?" if we already know it.
  if (topic.steps[0]?.expects === "name" && ctx.childName) {
    step = 1;
    lines.push(phrase("helloName", { name: ctx.childName }));
  } else if (topic.steps[0]?.expects !== "name") {
    // topic.name is Translated, so each language gets its own natural topic name.
    const vars = { topic: topic.name, emoji: topic.emoji, name: ctx.childName ?? "" };
    lines.push(ctx.childName ? phrase("greetTopicName", vars) : phrase("greetTopic", vars));
  }
  const context: ConversationContext = { ...ctx, topicId, step, nudged: false, followUp: false };
  lines.push(topic.steps[step].ask);
  return { lines, mood: "happy", context, suggestions: suggestionsFor(context) };
}

/** Robot's reply to something the child said, in practice (offline) mode. */
export function replyLocally(ctx: ConversationContext, text: string): RobotReply {
  const language = ctx.language;
  const lines: Translated[] = [];
  const correction = gentleCorrection(text, language);

  // Answer to a question asked after a sentence activity.
  if (ctx.followUp) {
    if (correction) lines.push(phrase("recast", { fixed: correction }));
    else lines.push(phrase("interest"));
    lines.push(phrase("followUpThanks"));
    return { lines, mood: "happy", context: { ...ctx, followUp: false }, suggestions: [] };
  }

  const step = currentStep(ctx);

  // Free chat (no topic running).
  if (!step) {
    const name = ctx.childName ?? extractName(text, language, true);
    if (!ctx.childName && name) {
      lines.push(phrase("niceToMeet", { name }), phrase("freeChat"));
      return { lines, mood: "happy", context: { ...ctx, childName: name }, suggestions: [] };
    }
    if (GREETINGS.test(text.trim()) && !ctx.childName) return startTopic(ctx, "intro");
    if (correction) lines.push(phrase("recast", { fixed: correction }));
    else lines.push(phrase("interest"));
    lines.push(phrase("freeChat"));
    return { lines, mood: "happy", context: ctx, suggestions: [] };
  }

  if (step.expects === "name") {
    const name = extractName(text, language);
    if (!name) return { lines: [phrase("askNameAgain")], mood: "encouraging", context: ctx, suggestions: suggestionsFor(ctx) };
    return advance({ ...ctx, childName: name }, [phrase("niceToMeet", { name })], "happy");
  }

  if (step.expects === "feeling") {
    const feeling = detectFeeling(text, language);
    if (correction) lines.push(phrase("recast", { fixed: correction }));
    if (feeling === "happy") lines.push(phrase("feelingHappy"));
    else if (feeling === "sad") lines.push(phrase("feelingSad"));
    else if (feeling === "tired") lines.push(phrase("feelingTired"));
    else if (!correction) lines.push(phrase("interest"));
    return advance(ctx, lines, feeling === "happy" ? "happy" : "encouraging");
  }

  if (correction) return advance(ctx, [phrase("recast", { fixed: correction })], "encouraging");

  if (!ctx.nudged && wordCount(text, language) < minWords[ctx.level]) {
    return {
      // The example stays in the language being learned, even in the subtitle.
      lines: [phrase("fullSentence", { example: step.example[language] })],
      mood: "encouraging",
      context: { ...ctx, nudged: true },
      suggestions: [step.example],
    };
  }

  return advance(ctx, [phrase("interest")], "happy");
}
