import { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb, Volume2 } from "lucide-react";
import "../../PlayLearn.css";
import { languageFlags } from "../storyContent";
import { LANGUAGES } from "../storyEngine";
import { sfx } from "./sfx";
import { ENCOURAGE, PRAISE, pick, type ActivityProps } from "./shared";
import { categoryNames, keyboards, normalizeLetter, pickFresh, wordsForAge, type Concept } from "./words";

type GameStatus = "playing" | "won" | "lost";
const MAX_WRONG = 6;

/**
 * Hangman Word Challenge — the same game as before (Timmy's robot gets built with
 * each wrong guess, physical keyboard support), now with picture hints, age-based
 * words and all three languages.
 */
export default function HangmanGame({ language, age, speak, onWin, onTryAgain }: ActivityProps) {
  const used = useRef<string[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");

  const nextWord = useCallback(() => {
    const chosen = pickFresh(wordsForAge(language, age), used.current);
    used.current = [...used.current.slice(-20), chosen.id];
    setConcept(chosen);
    setGuessed([]);
    setStatus("playing");
  }, [language, age]);

  useEffect(() => nextWord(), [nextWord]);

  const word = concept ? concept.word[language].toLocaleUpperCase() : "";
  const chars = [...word];
  const inWord = (letter: string) => chars.some((c) => normalizeLetter(c) === letter);
  const wrong = guessed.filter((g) => !inWord(g)).length;

  const guess = useCallback(
    (input: string) => {
      if (status !== "playing" || !concept) return;
      const letter = normalizeLetter(input);
      if (!/^[A-ZÑÇ]$/.test(letter) || guessed.includes(letter)) return;
      const next = [...guessed, letter];
      setGuessed(next);
      if (inWord(letter)) sfx.tap();
      else sfx.soft();
      const allFound = chars.every((c) => next.includes(normalizeLetter(c)));
      const wrongCount = next.filter((g) => !inWord(g)).length;
      if (allFound) {
        setStatus("won");
        sfx.success();
        speak(concept.word[language], language, 0.8);
        onWin("hangman", 5, `${pick(PRAISE)} You found “${concept.word[language]}”!`);
      } else if (wrongCount >= MAX_WRONG) {
        setStatus("lost");
        speak(concept.word[language], language, 0.8);
        onTryAgain("Great try, explorer! Let's try another word.");
      } else if (!inWord(letter)) {
        onTryAgain(pick(ENCOURAGE));
      }
    },
    // inWord/chars derive from concept + language
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, concept, guessed, language, speak, onWin, onTryAgain]
  );

  // Physical keyboard support (as before).
  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key.length !== 1 || !/[a-zA-ZÀ-ÿ]/.test(event.key)) return;
      event.preventDefault();
      guess(event.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, guess]);

  /** Hint: reveals one missing letter (costs one robot part). */
  const revealLetter = () => {
    if (!concept || status !== "playing" || wrong >= MAX_WRONG - 1) return;
    const missing = chars.map(normalizeLetter).find((c) => !guessed.includes(c));
    if (!missing) return;
    const next = [...guessed, missing, `#${guessed.length}`]; // "#n" = one hint used
    setGuessed(next);
    sfx.tap();
    if (chars.every((c) => next.includes(normalizeLetter(c)))) {
      setStatus("won");
      sfx.success();
      speak(concept.word[language], language, 0.8);
      onWin("hangman", 4, `${pick(PRAISE)} You found “${concept.word[language]}”!`);
    }
  };

  if (!concept) return null;
  const reveal = status === "lost";
  const shown = chars.map((c) => (guessed.includes(normalizeLetter(c)) || reveal ? c : ""));

  return (
    <div className="activity-card hangman-card plg-hangman">
      <div className="hangman-game-layout">
        <div className="hangman-robot-panel">
        <svg
          className="hangman-robot"
          viewBox="0 0 240 250"
          role="img"
          aria-label={`Timmy's friendly robot has ${wrong} of 6 parts assembled`}
        >
          <ellipse
            cx="120"
            cy="226"
            rx="70"
            ry="10"
            fill="#E8E5F5"
          />
          <rect
            x="84"
            y="132"
            width="72"
            height="64"
            rx="18"
            fill="#C8BDF9"
            stroke="#7968CF"
            strokeWidth="3"
          />
          <rect
            x="96"
            y="145"
            width="48"
            height="32"
            rx="10"
            fill="#F8F7FF"
          />
          <circle cx="111" cy="158" r="4" fill="#6D5CC5" />
          <circle cx="129" cy="158" r="4" fill="#6D5CC5" />
          <path
            d="M111 167 Q120 174 129 167"
            fill="none"
            stroke="#6D5CC5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {wrong >= 1 && (
            <g>
              <rect
                x="79"
                y="48"
                width="82"
                height="76"
                rx="24"
                fill="#B8E9E0"
                stroke="#3C9E92"
                strokeWidth="3"
              />
              <rect
                x="89"
                y="64"
                width="62"
                height="39"
                rx="13"
                fill="#FFFFFF"
              />
              <circle cx="107" cy="81" r="5" fill="#5C9DE8" />
              <circle cx="133" cy="81" r="5" fill="#5C9DE8" />
              <path
                d="M108 92 Q120 101 132 92"
                fill="none"
                stroke="#3C9E92"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          {wrong >= 2 && (
            <g
              stroke="#7968CF"
              strokeWidth="8"
              strokeLinecap="round"
            >
              <path d="M83 146 L61 163" />
              <path d="M157 146 L179 163" />
            </g>
          )}

          {wrong >= 3 && (
            <g
              stroke="#3C9E92"
              strokeWidth="8"
              strokeLinecap="round"
            >
              <path d="M100 194 L91 211" />
              <path d="M140 194 L149 211" />
            </g>
          )}

          {wrong >= 4 && (
            <g fill="#FFD78C" stroke="#D99A37" strokeWidth="3">
              <circle cx="57" cy="167" r="9" />
              <circle cx="183" cy="167" r="9" />
            </g>
          )}

          {wrong >= 5 && (
            <g>
              <path
                d="M120 48 L120 30"
                stroke="#7968CF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle
                cx="120"
                cy="23"
                r="9"
                fill="#FFB4C8"
                stroke="#D76C91"
                strokeWidth="3"
              />
              <path
                d="M90 119 L78 128 M150 119 L162 128"
                stroke="#3C9E92"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          )}

          {wrong >= 6 && (
            <g>
              <path
                d="M108 155 L114 161 L108 167 M132 155 L126 161 L132 167"
                fill="none"
                stroke="#FF9FBC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M109 184 Q120 176 131 184"
                fill="none"
                stroke="#7968CF"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          <text
            x="120"
            y="242"
            textAnchor="middle"
            fontSize="11"
            fill="#766E96"
            fontWeight="600"
          >
            TIMMY'S ROBOT
          </text>
        </svg>
          <div className="robot-progress">
            <span>Robot progress</span>
            <div className="robot-progress-track">
              <div style={{ width: `${(Math.min(wrong, MAX_WRONG) / MAX_WRONG) * 100}%` }} />
            </div>
            <small>
              {Math.min(wrong, MAX_WRONG)} of {MAX_WRONG} wrong guesses
            </small>
          </div>
        </div>

        <div className="hangman-word-panel">
          <div className="hangman-word-emoji plg-float" aria-hidden="true">
            {concept.emoji}
          </div>
          <span className="hangman-category">{categoryNames[concept.category].en}</span>
          {concept.hint && (
            <p className="hangman-hint">
              <strong>Hint:</strong> {concept.hint}
            </p>
          )}

          <div className="hangman-letter-slots" aria-label="Word to guess">
            {shown.map((letter, index) => (
              <span
                className={`hangman-letter-slot ${letter ? "revealed" : ""}${reveal && !guessed.includes(normalizeLetter(chars[index])) ? " plg-missed" : ""}`}
                key={`${concept.id}-${index}`}
                aria-label={letter || "blank"}
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="plg-row plg-center">
            <button type="button" className="text-button hangman-hear-button" onClick={() => speak(concept.word[language], language, 0.75)}>
              <Volume2 size={16} /> Hear it
            </button>
            <button type="button" className="text-button hangman-hear-button" onClick={revealLetter} disabled={status !== "playing"}>
              <Lightbulb size={16} /> Show a letter
            </button>
          </div>

          <div className="hangman-keyboard" aria-label="Choose a letter">
            {keyboards[language].map((letter) => {
              const isGuessed = guessed.includes(normalizeLetter(letter));
              const correct = inWord(normalizeLetter(letter));
              return (
                <button
                  key={letter}
                  type="button"
                  className={`hangman-key ${isGuessed ? (correct ? "key-correct" : "key-wrong") : ""}`}
                  onClick={() => guess(letter)}
                  disabled={isGuessed || status !== "playing"}
                  aria-label={`Guess letter ${letter}${isGuessed ? ", already guessed" : ""}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          <p className="hangman-keyboard-tip">Tip: You can also use your physical keyboard!</p>
        </div>
      </div>

      <div className={`hangman-result ${status !== "playing" ? "visible" : ""} ${status}`} aria-live="polite" aria-atomic="true" role="status">
        {status === "won" && (
          <>
            <span className="hangman-result-emoji">🎉</span>
            <div>
              <h3>Fantastic! You did it!</h3>
              <p>
                You found <strong>{concept.word[language]}</strong>! You earned 5 stars and learned a new word.
              </p>
            </div>
          </>
        )}
        {status === "lost" && (
          <>
            <span className="hangman-result-emoji">🤗</span>
            <div>
              <h3>Great try, explorer!</h3>
              <p>
                The word was <strong>{concept.word[language]}</strong>. Every guess helps you learn. Let's try another!
              </p>
            </div>
          </>
        )}
        {status === "playing" && (
          <>
            <span className="hangman-result-emoji">✨</span>
            <div>
              <h3>You've got this!</h3>
              <p>Choose a letter and see what you discover.</p>
            </div>
          </>
        )}
      </div>

      {status !== "playing" && (
        <>
          <div className="plg-translations plg-center">
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <button type="button" key={l} lang={l} onClick={() => speak(concept.word[l], l, 0.8)}>
                <span aria-hidden="true">{languageFlags[l]}</span> {concept.word[l]} <Volume2 size={14} />
              </button>
            ))}
          </div>
          <div className="hangman-next-row">
            <button type="button" className="primary-button" onClick={nextWord}>
              Next word →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
