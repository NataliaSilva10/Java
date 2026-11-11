import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * One shared progress store for the whole app: stars, XP & levels, streak,
 * daily challenges and achievements. Saved only in this browser (no accounts,
 * no personal data except an optional nickname the child chooses).
 */

export type SectionId = "home" | "speak" | "play" | "stories" | "cultures";

export type LearnerEvent =
  | { type: "star"; amount: number; section: SectionId } // a success
  | { type: "effort"; section: SectionId } // a try (rewarded with XP too!)
  | { type: "word" } // learned / practised a word
  | { type: "chat" } // talked with Timmy
  | { type: "letter" } // popped a letter
  | { type: "story-saved" }
  | { type: "story-read" }
  | { type: "country"; id: string };

export type Challenge = {
  id: string;
  emoji: string;
  title: string;
  target: number;
  section: SectionId;
  counts: (e: LearnerEvent) => number;
};

export type Achievement = { id: string; emoji: string; name: string; description: string; earned: (s: LearnerState) => boolean };

export type LearnerState = {
  nickname: string;
  stars: number;
  xp: number;
  words: number;
  chats: number;
  storiesSaved: number;
  countries: string[];
  visits: Record<SectionId, number>;
  /** Days (YYYY-MM-DD) with any learning activity, newest last (kept short). */
  activeDays: string[];
  daily: { day: string; ids: string[]; progress: Record<string, number>; bonusClaimed: boolean };
  achievements: string[];
};

const STORAGE_KEY = "futurekids-learner-v1";
export const XP_PER_LEVEL = 100;
export const DAILY_BONUS = 10;

export const CHALLENGES: Challenge[] = [
  { id: "letters", emoji: "🔤", title: "Pop 5 letters", target: 5, section: "play", counts: (e) => (e.type === "letter" ? 1 : 0) },
  { id: "words", emoji: "📚", title: "Practise 3 words", target: 3, section: "play", counts: (e) => (e.type === "word" ? 1 : 0) },
  { id: "chat", emoji: "💬", title: "Say 3 things to Timmy", target: 3, section: "speak", counts: (e) => (e.type === "chat" ? 1 : 0) },
  { id: "story", emoji: "📖", title: "Save a story", target: 1, section: "stories", counts: (e) => (e.type === "story-saved" ? 1 : 0) },
  { id: "read", emoji: "🔊", title: "Listen to a story", target: 1, section: "stories", counts: (e) => (e.type === "story-read" ? 1 : 0) },
  { id: "country", emoji: "🌍", title: "Explore a country", target: 1, section: "cultures", counts: (e) => (e.type === "country" ? 1 : 0) },
  { id: "stars", emoji: "⭐", title: "Earn 10 stars", target: 10, section: "play", counts: (e) => (e.type === "star" ? e.amount : 0) },
  { id: "tries", emoji: "💪", title: "Try 5 activities", target: 5, section: "play", counts: (e) => (e.type === "effort" || e.type === "star" ? 1 : 0) },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-steps", emoji: "👣", name: "First Steps", description: "Earn your first star", earned: (s) => s.stars >= 1 },
  { id: "chatty", emoji: "💬", name: "Chatty Explorer", description: "Say 10 things to Timmy", earned: (s) => s.chats >= 10 },
  { id: "word-collector", emoji: "📚", name: "Word Collector", description: "Practise 20 words", earned: (s) => s.words >= 20 },
  { id: "storyteller", emoji: "📖", name: "Storyteller", description: "Save your first story", earned: (s) => s.storiesSaved >= 1 },
  { id: "traveler", emoji: "🧳", name: "World Traveler", description: "Explore 5 countries", earned: (s) => s.countries.length >= 5 },
  { id: "streak-3", emoji: "🔥", name: "On Fire", description: "Learn 3 days in a row", earned: (s) => streakOf(s.activeDays) >= 3 },
  { id: "level-5", emoji: "🚀", name: "Rocket Learner", description: "Reach level 5", earned: (s) => levelOf(s.xp) >= 5 },
  { id: "daily-hero", emoji: "🏅", name: "Daily Hero", description: "Finish all daily goals", earned: (s) => s.daily.bonusClaimed },
];

// ───────── pure helpers ─────────

export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const previousDay = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
};

/** Consecutive days up to today (or yesterday, so the streak isn't lost before you play today). */
export function streakOf(days: string[], today = dayKey()): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : previousDay(today);
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor = previousDay(cursor);
  }
  return count;
}

export const levelOf = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

/** Same 3 challenges all day, different each day. */
export function challengesFor(day: string): string[] {
  let seed = 0;
  for (const ch of day) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const ids = CHALLENGES.map((c) => c.id);
  const picked: string[] = [];
  for (let guard = 0; picked.length < 3 && guard < 200; guard++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const id = ids[(seed >>> 16) % ids.length];
    if (!picked.includes(id)) picked.push(id);
  }
  for (const id of ids) if (picked.length < 3 && !picked.includes(id)) picked.push(id);
  return picked;
}

const freshDaily = (day: string): LearnerState["daily"] => ({ day, ids: challengesFor(day), progress: {}, bonusClaimed: false });

const empty = (): LearnerState => ({
  nickname: "",
  stars: 0,
  xp: 0,
  words: 0,
  chats: 0,
  storiesSaved: 0,
  countries: [],
  visits: { home: 0, speak: 0, play: 0, stories: 0, cultures: 0 },
  activeDays: [],
  daily: freshDaily(dayKey()),
  achievements: [],
});

// Saved data may come from an older version or be edited by hand: check every field.
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function load(): LearnerState {
  const base = empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const d = JSON.parse(raw) as Record<string, unknown> | null;
    if (!d || typeof d !== "object") return base;
    const visits = (d.visits && typeof d.visits === "object" ? d.visits : {}) as Record<string, unknown>;
    const daily = (d.daily && typeof d.daily === "object" ? d.daily : {}) as Record<string, unknown>;
    const validDaily =
      daily.day === dayKey() && Array.isArray(daily.ids) && daily.ids.every((id) => CHALLENGES.some((c) => c.id === id));
    return {
      nickname: typeof d.nickname === "string" ? d.nickname.slice(0, 20) : "",
      stars: num(d.stars),
      xp: num(d.xp),
      words: num(d.words),
      chats: num(d.chats),
      storiesSaved: num(d.storiesSaved),
      countries: strings(d.countries),
      visits: { home: num(visits.home), speak: num(visits.speak), play: num(visits.play), stories: num(visits.stories), cultures: num(visits.cultures) },
      activeDays: strings(d.activeDays).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(-60),
      daily: validDaily
        ? {
            day: dayKey(),
            ids: daily.ids as string[],
            progress: Object.fromEntries(
              Object.entries((daily.progress && typeof daily.progress === "object" ? daily.progress : {}) as Record<string, unknown>).map(([k, v]) => [k, num(v)])
            ),
            bonusClaimed: daily.bonusClaimed === true,
          }
        : freshDaily(dayKey()),
      achievements: strings(d.achievements),
    };
  } catch {
    return base;
  }
}

const XP_FOR: Record<LearnerEvent["type"], number> = {
  star: 5,
  effort: 2,
  word: 3,
  chat: 3,
  letter: 1,
  "story-saved": 15,
  "story-read": 5,
  country: 10,
};

/** Applies one event to the state (pure, so it's easy to test). */
export function applyEvent(state: LearnerState, event: LearnerEvent, today = dayKey()): LearnerState {
  const s: LearnerState = { ...state, visits: { ...state.visits } };
  if (s.daily.day !== today) s.daily = freshDaily(today);
  s.xp += XP_FOR[event.type] + (event.type === "star" ? event.amount : 0);
  if (event.type === "star") s.stars += event.amount;
  if (event.type === "word") s.words += 1;
  if (event.type === "chat") s.chats += 1;
  if (event.type === "story-saved") {
    s.storiesSaved += 1;
    s.stars += 3;
  }
  if (event.type === "country" && !s.countries.includes(event.id)) s.countries = [...s.countries, event.id];
  if (!s.activeDays.includes(today)) s.activeDays = [...s.activeDays, today].slice(-60);

  // Daily challenges
  const progress = { ...s.daily.progress };
  for (const id of s.daily.ids) {
    const challenge = CHALLENGES.find((c) => c.id === id);
    if (challenge) progress[id] = Math.min(challenge.target, (progress[id] ?? 0) + challenge.counts(event));
  }
  s.daily = { ...s.daily, progress };
  const allDone = s.daily.ids.every((id) => (progress[id] ?? 0) >= (CHALLENGES.find((c) => c.id === id)?.target ?? 1));
  if (allDone && !s.daily.bonusClaimed) {
    s.daily = { ...s.daily, bonusClaimed: true };
    s.stars += DAILY_BONUS;
    s.xp += 25;
  }
  return s;
}

// ───────── React context ─────────

type LearnerApi = {
  state: LearnerState;
  level: number;
  levelProgress: number; // 0–100
  streak: number;
  record: (event: LearnerEvent) => void;
  visit: (section: SectionId) => void;
  setNickname: (name: string) => void;
  reset: () => void;
  /** Achievement just unlocked (for a celebration), if any. */
  unlocked: Achievement | null;
  dismissUnlocked: () => void;
  /** True the moment all daily goals are finished (for a celebration). */
  dailyJustDone: boolean;
};

const LearnerContext = createContext<LearnerApi | null>(null);

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(load);
  const [unlocked, setUnlocked] = useState<Achievement | null>(null);
  const [dailyJustDone, setDailyJustDone] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage blocked: progress lasts for this visit */
    }
  }, [state]);

  // Unlock achievements whenever the state changes.
  useEffect(() => {
    const fresh = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && a.earned(state));
    if (!fresh.length) return;
    setUnlocked(fresh[fresh.length - 1]);
    setState((s) => ({ ...s, achievements: [...s.achievements, ...fresh.map((a) => a.id)] }));
  }, [state]);

  const record = useCallback((event: LearnerEvent) => setState((current) => applyEvent(current, event)), []);

  // Celebrate the moment today's goals are all done.
  const wasClaimed = useRef(state.daily.bonusClaimed);
  useEffect(() => {
    if (state.daily.bonusClaimed && !wasClaimed.current) setDailyJustDone(true);
    wasClaimed.current = state.daily.bonusClaimed;
  }, [state.daily.bonusClaimed]);

  useEffect(() => {
    if (!dailyJustDone) return;
    const t = window.setTimeout(() => setDailyJustDone(false), 4000);
    return () => window.clearTimeout(t);
  }, [dailyJustDone]);

  const visit = useCallback((section: SectionId) => {
    setState((s) => ({ ...s, visits: { ...s.visits, [section]: s.visits[section] + 1 } }));
  }, []);

  const setNickname = useCallback((name: string) => {
    // First name / nickname only, letters and spaces, short.
    const clean = name.replace(/[^\p{L}\s'-]/gu, "").trim().slice(0, 20);
    setState((s) => ({ ...s, nickname: clean }));
  }, []);

  const reset = useCallback(() => setState(empty()), []);

  const api = useMemo<LearnerApi>(
    () => ({
      state,
      level: levelOf(state.xp),
      levelProgress: ((state.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100,
      streak: streakOf(state.activeDays),
      record,
      visit,
      setNickname,
      reset,
      unlocked,
      dismissUnlocked: () => setUnlocked(null),
      dailyJustDone,
    }),
    [state, record, visit, setNickname, reset, unlocked, dailyJustDone]
  );

  return <LearnerContext.Provider value={api}>{children}</LearnerContext.Provider>;
}

export function useLearner(): LearnerApi {
  const api = useContext(LearnerContext);
  if (!api) throw new Error("useLearner must be used inside <LearnerProvider>");
  return api;
}

/** Recommends what to do next: an unfinished daily goal first, then the least-visited section. */
export function recommend(state: LearnerState): { section: SectionId; reason: string } {
  const open = state.daily.ids
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .find((c) => c && (state.daily.progress[c.id] ?? 0) < c.target);
  if (open) return { section: open.section, reason: `Today's goal: ${open.title.toLowerCase()}!` };
  const sections: SectionId[] = ["speak", "play", "stories", "cultures"];
  const least = sections.reduce((a, b) => (state.visits[b] < state.visits[a] ? b : a));
  const reasons: Record<SectionId, string> = {
    home: "",
    speak: "Let's chat — I want to hear your voice!",
    play: "Let's play a word game together!",
    stories: "Let's write a story with pictures!",
    cultures: "Let's travel the world and meet new friends!",
  };
  return { section: least, reason: reasons[least] };
}
