import { useCallback, useEffect, useState } from "react";
import type { Language, Translated } from "../storyEngine";
import { concepts, type AgeGroup } from "../playlearn/words";

const conceptExists = (id: string) => concepts.some((c) => c.id === id);

export type SceneId = "forest" | "space" | "ocean" | "city" | "farm" | "castle" | "beach" | "night";

export type Sticker = { id: string; conceptId: string; x: number; y: number; size: 1 | 2 | 3 };
export type StoryPage = { id: string; scene: SceneId; stickers: Sticker[]; text: string };
export type SavedStory = {
  id: string;
  title: string;
  language: Language;
  age: AgeGroup;
  pages: StoryPage[];
  finished: boolean;
  updatedAt: number;
};

export const SCENES: { id: SceneId; emoji: string; name: string; background: string; ground: string }[] = [
  { id: "forest", emoji: "🌳", name: "Forest", background: "linear-gradient(180deg,#d9f2ff 0%,#e9f9e4 55%,#a9dd9b 100%)", ground: "🌳🌲🌿🍄🌳" },
  { id: "space", emoji: "🚀", name: "Space", background: "radial-gradient(circle at 20% 20%,#5b4ba8 0,#2d2660 55%,#1b1640 100%)", ground: "🪐✨🌙⭐✨" },
  { id: "ocean", emoji: "🌊", name: "Ocean", background: "linear-gradient(180deg,#bfe6ff 0%,#7cc6f0 50%,#3f97cf 100%)", ground: "🪸🐚🌊🪸🐚" },
  { id: "city", emoji: "🏙️", name: "City", background: "linear-gradient(180deg,#ffe6f0 0%,#fff3d9 60%,#d9d4e8 100%)", ground: "🏢🏠🏬🏫🏠" },
  { id: "farm", emoji: "🐮", name: "Farm", background: "linear-gradient(180deg,#fff4c2 0%,#fdf8e3 50%,#c9e7a7 100%)", ground: "🌾🏡🌻🌾🚜" },
  { id: "castle", emoji: "🏰", name: "Castle", background: "linear-gradient(180deg,#efe6ff 0%,#fbe9ff 55%,#cfe8c4 100%)", ground: "🌸🏰🌳🌸🌷" },
  { id: "beach", emoji: "🏖️", name: "Beach", background: "linear-gradient(180deg,#c9ecff 0%,#e8f8ff 45%,#ffe9b0 100%)", ground: "🌴🐚⛱️🦀🌴" },
  { id: "night", emoji: "🌙", name: "Night", background: "linear-gradient(180deg,#2f3a7a 0%,#4b4f99 60%,#6f6cb3 100%)", ground: "🏠🌲🦉🌲🏠" },
];

export const STARTERS: Translated[] = [
  { en: "Once upon a time,", pt: "Era uma vez", es: "Había una vez" },
  { en: "One day,", pt: "Um dia,", es: "Un día," },
  { en: "Suddenly,", pt: "De repente,", es: "De repente," },
  { en: "Then,", pt: "Depois,", es: "Después," },
  { en: "In the end,", pt: "No final,", es: "Al final," },
];

/** Little helper words for the youngest writers. */
export const HELPER_WORDS: Record<Language, string[]> = {
  en: ["the", "a", "is", "and", "big", "small", "happy", "sees", "likes", "plays"],
  pt: ["o", "a", "é", "e", "grande", "pequeno", "feliz", "vê", "gosta de", "brinca"],
  es: ["el", "la", "es", "y", "grande", "pequeño", "feliz", "ve", "le gusta", "juega"],
};

/** Writing prompts for ages 10–12 (one per page, in a loop). */
export const PROMPTS = [
  "Where does your story happen? Describe the place.",
  "Who is your main character? How do they feel?",
  "Uh-oh! What problem appears?",
  "How does your character try to solve it?",
  "How does the story end? What did they learn?",
];

export const TEXT_LIMIT: Record<AgeGroup, number> = { "5-6": 120, "7-9": 300, "10-12": 900 };

const KEY = "futurekids-stories-v1";
export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const blankPage = (scene: SceneId = "forest"): StoryPage => ({ id: newId(), scene, stickers: [], text: "" });

const SCENE_IDS = new Set<string>(SCENES.map((s) => s.id));

/** Keeps only stories that have the expected shape (older or damaged data is skipped, not crashed on). */
function load(): SavedStory[] {
  try {
    const data = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.flatMap((raw): SavedStory[] => {
      if (!raw || typeof raw !== "object" || typeof raw.id !== "string" || !Array.isArray(raw.pages)) return [];
      const pages = raw.pages
        .filter((p: unknown): p is StoryPage => Boolean(p && typeof p === "object"))
        .map((p: StoryPage) => ({
          id: typeof p.id === "string" ? p.id : newId(),
          scene: SCENE_IDS.has(p.scene) ? p.scene : "forest",
          text: typeof p.text === "string" ? p.text : "",
          stickers: Array.isArray(p.stickers)
            ? p.stickers.filter((st) => st && typeof st.conceptId === "string" && conceptExists(st.conceptId) && typeof st.x === "number" && typeof st.y === "number")
            : [],
        }));
      if (!pages.length) return [];
      return [
        {
          id: raw.id,
          title: typeof raw.title === "string" ? raw.title : "",
          language: raw.language === "pt" || raw.language === "es" ? raw.language : "en",
          age: raw.age === "5-6" || raw.age === "10-12" ? raw.age : "7-9",
          pages,
          finished: raw.finished === true,
          updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
        },
      ];
    });
  } catch {
    return [];
  }
}

/** The child's stories, saved in this browser only. */
export function useStoryLibrary() {
  const [stories, setStories] = useState<SavedStory[]>(load);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(stories));
      setSaveError(false);
    } catch {
      setSaveError(true); // storage full or blocked
    }
  }, [stories]);

  const upsert = useCallback((story: SavedStory) => {
    setStories((list) => {
      const next = { ...story, updatedAt: Date.now() };
      const exists = list.some((s) => s.id === story.id);
      return exists ? list.map((s) => (s.id === story.id ? next : s)) : [next, ...list];
    });
  }, []);

  const remove = useCallback((id: string) => setStories((list) => list.filter((s) => s.id !== id)), []);

  return { stories, upsert, remove, saveError };
}
