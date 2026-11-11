import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { languageFlags, languageNames } from "../storyContent";
import type { Language } from "../storyEngine";
import { sfx } from "./sfx";
import { ENCOURAGE, PRAISE, pick, type ActivityProps } from "./shared";
import { alphabets, conceptById, concepts, isSingleWord, shuffle, type AgeGroup } from "./words";

/** letter→picture (5–6), word→picture (7–9), word→translation (10–12). */
type Mode = "letter" | "word" | "translate";

type Card = { pairId: string; label: string; lang?: Language; big?: boolean };

const DEFAULT_MODE: Record<AgeGroup, Mode> = { "5-6": "letter", "7-9": "word", "10-12": "translate" };
const PAIRS: Record<AgeGroup, number> = { "5-6": 3, "7-9": 4, "10-12": 5 };

const MODES: { id: Mode; label: string }[] = [
  { id: "letter", label: "🔤 Letter ↔ Picture" },
  { id: "word", label: "📖 Word ↔ Picture" },
  { id: "translate", label: "🌎 Word ↔ Translation" },
];

/** Tap one card on the left, then its partner on the right. */
export default function MatchingGame({ language, age, speak, onWin, onTryAgain }: ActivityProps) {
  const [mode, setMode] = useState<Mode>(DEFAULT_MODE[age]);
  const [left, setLeft] = useState<Card[]>([]);
  const [right, setRight] = useState<Card[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  // Older children translate to a different language than the one they're learning.
  const otherLang: Language = language === "en" ? "es" : "en";

  useEffect(() => setMode(DEFAULT_MODE[age]), [age]);

  const deal = useCallback(() => {
    const count = PAIRS[age];
    let l: Card[] = [];
    let r: Card[] = [];
    if (mode === "letter") {
      const entries = shuffle(alphabets[language]).slice(0, count);
      l = entries.map((e) => ({ pairId: e.letter, label: e.letter, lang: language, big: true }));
      r = entries.map((e) => ({ pairId: e.letter, label: conceptById(e.conceptId).emoji, big: true }));
    } else {
      // Unique pictures, and (for translations) words that actually differ between the two languages.
      const seen = new Set<string>();
      const pool = shuffle(concepts)
        .filter((c) => isSingleWord(c.word[language]) && (mode !== "translate" || c.word[language] !== c.word[otherLang]))
        .filter((c) => !seen.has(c.emoji) && Boolean(seen.add(c.emoji)))
        .slice(0, count);
      l = pool.map((c) => ({ pairId: c.id, label: c.word[language], lang: language }));
      r =
        mode === "word"
          ? pool.map((c) => ({ pairId: c.id, label: c.emoji, big: true }))
          : pool.map((c) => ({ pairId: c.id, label: c.word[otherLang], lang: otherLang }));
    }
    setLeft(shuffle(l));
    setRight(shuffle(r));
    setPicked(null);
    setMatched([]);
    setWrong(null);
  }, [mode, age, language, otherLang]);

  useEffect(() => deal(), [deal, round]);

  const chooseLeft = (card: Card) => {
    if (matched.includes(card.pairId)) return;
    sfx.tap();
    setPicked(card.pairId);
    if (card.lang) speak(card.label, card.lang, 0.85);
  };

  const chooseRight = (card: Card) => {
    if (matched.includes(card.pairId)) return;
    if (!picked) {
      onTryAgain("First pick a card on the left!");
      return;
    }
    if (card.pairId === picked) {
      sfx.pop();
      const next = [...matched, card.pairId];
      setMatched(next);
      setPicked(null);
      if (card.lang) speak(card.label, card.lang, 0.85);
      if (next.length === left.length) {
        sfx.success();
        onWin("matching", left.length, `${pick(PRAISE)} You matched them all!`);
      }
    } else {
      sfx.soft();
      setWrong(card.pairId + card.label);
      onTryAgain(pick(ENCOURAGE));
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  const done = left.length > 0 && matched.length === left.length;

  return (
    <div className="plg-matching">
      <div className="plg-toolbar">
        <div className="plg-segment" role="group" aria-label="Matching difficulty">
          {MODES.map((m) => (
            <button type="button" key={m.id} className={mode === m.id ? "active" : ""} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <span className="plg-chip">
          {matched.length} / {left.length} pairs
        </span>
      </div>
      {mode === "translate" && (
        <p className="plg-muted plg-center">
          Match {languageFlags[language]} {languageNames[language]} with {languageFlags[otherLang]} {languageNames[otherLang]}
        </p>
      )}

      <div className="plg-match-board">
        <div className="plg-match-col">
          {left.map((card) => (
            <button
              type="button"
              key={card.pairId}
              lang={card.lang}
              className={`plg-match-card${card.big ? " big" : ""}${picked === card.pairId ? " picked" : ""}${matched.includes(card.pairId) ? " matched" : ""}`}
              onClick={() => chooseLeft(card)}
              disabled={matched.includes(card.pairId)}
            >
              {card.label}
              {matched.includes(card.pairId) && <Check size={18} className="plg-match-check" />}
            </button>
          ))}
        </div>
        <div className="plg-match-col">
          {right.map((card) => (
            <button
              type="button"
              key={card.pairId}
              lang={card.lang}
              className={`plg-match-card right${card.big ? " big" : ""}${matched.includes(card.pairId) ? " matched" : ""}${wrong === card.pairId + card.label ? " shake" : ""}`}
              onClick={() => chooseRight(card)}
              disabled={matched.includes(card.pairId)}
            >
              {card.label}
              {matched.includes(card.pairId) && <Check size={18} className="plg-match-check" />}
            </button>
          ))}
        </div>
      </div>

      {done && (
        <div className="plg-solved">
          <p className="plg-solved-word">🧩 All matched!</p>
          <button type="button" className="plg-btn plg-btn-primary plg-btn-big" onClick={() => setRound((r) => r + 1)}>
            Play again →
          </button>
        </div>
      )}
    </div>
  );
}
