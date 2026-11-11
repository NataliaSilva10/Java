import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Turtle, Volume2 } from "lucide-react";
import { languageFlags } from "../storyContent";
import { LANGUAGES } from "../storyEngine";
import { sfx } from "./sfx";
import { ENCOURAGE, PRAISE, pick, type ActivityProps } from "./shared";
import { misspellings, pickFresh, shuffle, wordsForAge, type AgeGroup, type Concept } from "./words";

const OPTIONS: Record<AgeGroup, number> = { "5-6": 2, "7-9": 3, "10-12": 4 };

/** Hear a word, then pick the right spelling. Letters light up green/red to show the difference. */
export default function SoundSpelling({ language, age, speak, onWin, onTryAgain }: ActivityProps) {
  const used = useRef<string[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [tries, setTries] = useState<string[]>([]);
  const [showPicture, setShowPicture] = useState(age === "5-6");

  const next = useCallback(() => {
    const c = pickFresh(wordsForAge(language, age), used.current);
    used.current = [...used.current.slice(-20), c.id];
    const correct = c.word[language];
    setConcept(c);
    setOptions(shuffle([correct, ...misspellings(correct, OPTIONS[age] - 1, language)]));
    setChosen(null);
    setTries([]);
    setShowPicture(age === "5-6");
    window.setTimeout(() => speak(correct, language, 0.75), 250);
  }, [language, age, speak]);

  useEffect(() => next(), [next]);

  if (!concept) return null;
  const correct = concept.word[language];
  const solved = chosen === correct;

  const choose = (option: string) => {
    if (solved || tries.includes(option)) return;
    setChosen(option);
    if (option === correct) {
      sfx.success();
      setShowPicture(true);
      speak(correct, language, 0.8);
      onWin("spelling", tries.length === 0 ? 3 : 2, `${pick(PRAISE)} “${correct}” is right!`);
    } else {
      sfx.soft();
      setTries((t) => [...t, option]);
      onTryAgain(`${pick(ENCOURAGE)} Look at the red letters.`);
    }
  };

  /** Colors each letter of a spelling: green = matches the right word at that spot. */
  const letterMarks = (option: string) =>
    [...option].map((ch, i) => ({ ch, ok: ch.toLocaleLowerCase() === (correct[i] ?? "").toLocaleLowerCase() }));

  return (
    <div className="plg-spelling">
      <div className="plg-spelling-top">
        <button type="button" className="plg-sound-orb" onClick={() => speak(correct, language, 0.75)} aria-label="Play the word">
          <Volume2 size={44} />
        </button>
        <div>
          <h3>Listen… which spelling is right?</h3>
          <div className="plg-row">
            <button type="button" className="plg-btn" onClick={() => speak(correct, language, 0.5)}>
              <Turtle size={18} /> Slowly
            </button>
            {!showPicture && (
              <button type="button" className="plg-btn" onClick={() => setShowPicture(true)}>
                <Eye size={18} /> Show the picture
              </button>
            )}
          </div>
        </div>
        <div className={`plg-spelling-picture${showPicture ? " shown" : ""}`} aria-hidden={!showPicture}>
          {showPicture ? concept.emoji : "❓"}
        </div>
      </div>

      <div className="plg-spelling-options">
        {options.map((option) => {
          const wrong = tries.includes(option);
          const right = solved && option === correct;
          return (
            <button
              type="button"
              key={option}
              lang={language}
              className={`plg-spell-option${wrong ? " wrong" : ""}${right ? " right" : ""}`}
              onClick={() => choose(option)}
              disabled={solved || wrong}
            >
              {(wrong || right ? letterMarks(option) : [...option].map((ch) => ({ ch, ok: true }))).map((m, i) => (
                <span key={i} className={wrong && !m.ok ? "bad" : right ? "good" : ""} style={{ ["--i" as string]: i }}>
                  {m.ch}
                </span>
              ))}
            </button>
          );
        })}
      </div>

      {solved && (
        <div className="plg-solved">
          <div className="plg-translations">
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <button type="button" key={l} lang={l} onClick={() => speak(concept.word[l], l, 0.8)}>
                <span aria-hidden="true">{languageFlags[l]}</span> {concept.word[l]} <Volume2 size={14} />
              </button>
            ))}
          </div>
          <button type="button" className="plg-btn plg-btn-primary plg-btn-big" onClick={next}>
            Next word →
          </button>
        </div>
      )}
    </div>
  );
}
