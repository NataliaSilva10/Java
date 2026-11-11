import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Ear, Mic, Search, Sparkles, Turtle, Volume2 } from "lucide-react";
import { languageFlags, languageNames } from "../storyContent";
import { LANGUAGES, type Language } from "../storyEngine";
import { useSpeechRecognition } from "../useSpeechRecognition";
import { sfx } from "./sfx";
import { ENCOURAGE, PASTELS, PASTEL_INK, PRAISE, pick, type ActivityProps } from "./shared";
import { alphabets, conceptById, shuffle, type AlphabetEntry } from "./words";

type Props = ActivityProps & {
  explored: string[];
  onExplore: (language: Language, letter: string) => void;
};

type Mode = "explore" | "find";

const plain = (s: string) => s.toLocaleLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Big floating alphabet: tap/drag a letter to hear it and see a word and picture. */
export default function LetterPop({ language, age, speak, onWin, onTryAgain, explored, onExplore }: Props) {
  const alphabet = alphabets[language];
  const [selected, setSelected] = useState<AlphabetEntry>(alphabet[0]);
  const [popKey, setPopKey] = useState(0);
  const [mode, setMode] = useState<Mode>("explore");
  const [target, setTarget] = useState<AlphabetEntry | null>(null);
  const [choices, setChoices] = useState<AlphabetEntry[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sayResult, setSayResult] = useState<string | null>(null);
  const mic = useSpeechRecognition();
  const cardRef = useRef<HTMLDivElement>(null);

  // New language → new alphabet.
  useEffect(() => {
    setSelected(alphabets[language][0]);
    setTarget(null);
    setSayResult(null);
  }, [language]);

  const concept = conceptById(selected.conceptId);
  const word = concept.word[language];
  // Younger children see capitals; older ones also practise lowercase.
  const showCase = (letter: string, i: number) => (age === "5-6" || i % 2 === 0 ? letter : letter.toLocaleLowerCase());

  const choose = (entry: AlphabetEntry) => {
    sfx.pop();
    setSelected(entry);
    setPopKey((k) => k + 1);
    setSayResult(null);
    onExplore(language, entry.letter);
    // On small screens the picture card sits above the letters, so bring it into view.
    if (window.innerWidth < 860) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const w = conceptById(entry.conceptId).word[language];
    speak(`${entry.letter}… ${w}`, language, 0.8);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const letter = event.dataTransfer.getData("text/plain");
    const entry = alphabet.find((e) => e.letter === letter);
    if (entry) choose(entry);
  };

  // ── "Find the letter" game ──
  const choiceCount = age === "5-6" ? 4 : age === "7-9" ? 6 : 8;
  const newRound = () => {
    const next = alphabet[Math.floor(Math.random() * alphabet.length)];
    const others = shuffle(alphabet.filter((e) => e.letter !== next.letter)).slice(0, choiceCount - 1);
    setTarget(next);
    setChoices(shuffle([next, ...others]));
    setWrong(null);
    speak(next.letter, language, 0.75);
  };

  const answer = (entry: AlphabetEntry) => {
    if (!target) return;
    if (entry.letter === target.letter) {
      sfx.success();
      onExplore(language, entry.letter);
      onWin("letters", 1, `${pick(PRAISE)} That's ${entry.letter}!`);
      setSelected(entry);
      setPopKey((k) => k + 1);
      window.setTimeout(newRound, 900);
    } else {
      sfx.soft();
      setWrong(entry.letter);
      onTryAgain(`${pick(ENCOURAGE)} Listen again!`);
      speak(target.letter, language, 0.7);
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    if (next === "find") newRound();
    else setTarget(null);
  };

  // ── Pronunciation: say the word into the mic ──
  const sayIt = async () => {
    if (!mic.supported) {
      setSayResult("🎤 This browser can't listen — try Chrome or Edge. You can still repeat after Timmy!");
      return;
    }
    setSayResult(null);
    const outcome = await mic.listen(language);
    if (!outcome.ok) {
      const messages: Record<string, string> = {
        denied: "🎤 Please allow the microphone (🔒 icon in the address bar), then try again.",
        "no-mic": "🎤 I can't find a microphone. A grown-up can plug one in.",
        network: "🎤 Listening needs the internet. Check the connection and try again.",
        insecure: "🎤 Open the app on localhost or https so I can listen.",
        "no-speech": "🎤 I didn't hear anything. Tap and try again!",
        unsupported: "🎤 This browser can't listen — try Chrome or Edge.",
      };
      if (outcome.reason !== "aborted") setSayResult(messages[outcome.reason] ?? "🎤 Let's try that again.");
      return;
    }
    const heard = outcome.alternatives.map(plain);
    if (heard.some((h) => h.split(/\s+/).includes(plain(word)) || h === plain(word))) {
      sfx.success();
      setSayResult(`🎉 Perfect! You said “${word}”.`);
      onWin("letters", 1, `${pick(PRAISE)} Great pronunciation!`);
    } else {
      sfx.soft();
      setSayResult(`👂 I heard “${outcome.transcript}”. Listen and try again: “${word}”.`);
      onTryAgain();
    }
  };

  const progressText = useMemo(
    () => `${explored.length} / ${alphabet.length} letters popped`,
    [explored.length, alphabet.length]
  );

  return (
    <div className="plg-letters">
      <div className="plg-toolbar">
        <div className="plg-segment" role="group" aria-label="Letter game mode">
          <button type="button" className={mode === "explore" ? "active" : ""} onClick={() => switchMode("explore")}>
            <Sparkles size={16} /> Explore
          </button>
          <button type="button" className={mode === "find" ? "active" : ""} onClick={() => switchMode("find")}>
            <Search size={16} /> Find the letter
          </button>
        </div>
        <span className="plg-chip">🔤 {progressText}</span>
      </div>

      {mode === "find" && target && (
        <div className="plg-find">
          <button type="button" className="plg-big-listen" onClick={() => speak(target.letter, language, 0.7)}>
            <Ear size={22} /> Listen and find the letter!
          </button>
          <div className="plg-find-choices">
            {choices.map((entry, i) => (
              <button
                type="button"
                key={entry.letter}
                className={`plg-letter-bubble${wrong === entry.letter ? " shake" : ""}`}
                style={{ ["--c" as string]: PASTELS[i % PASTELS.length], ["--ink" as string]: PASTEL_INK[i % PASTELS.length] }}
                onClick={() => answer(entry)}
                aria-label={`Letter ${entry.letter}`}
              >
                {showCase(entry.letter, i)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="plg-letters-layout">
        <div className="plg-alphabet" aria-label={`${languageNames[language]} alphabet`}>
          {alphabet.map((entry, i) => {
            const done = explored.includes(entry.letter);
            return (
              <button
                type="button"
                key={entry.letter}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", entry.letter)}
                className={`plg-letter${selected.letter === entry.letter ? " selected" : ""}${done ? " done" : ""}`}
                style={{
                  ["--c" as string]: PASTELS[i % PASTELS.length],
                  ["--ink" as string]: PASTEL_INK[i % PASTELS.length],
                  ["--d" as string]: `${(i % 7) * 0.35}s`,
                }}
                onClick={() => choose(entry)}
                aria-label={`Letter ${entry.letter}`}
              >
                <span className="upper">{entry.letter}</span>
                <span className="lower">{entry.letter.toLocaleLowerCase()}</span>
                {done && <span className="plg-letter-star" aria-hidden="true">★</span>}
              </button>
            );
          })}
        </div>

        <div
          ref={cardRef}
          className={`plg-letter-card${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          aria-live="polite"
        >
          <span className="plg-drop-hint">✋ Drag a letter here!</span>
          <div className="plg-letter-hero" key={popKey}>
            <span className="plg-hero-upper">{selected.letter}</span>
            <span className="plg-hero-lower">{selected.letter.toLocaleLowerCase()}</span>
          </div>
          <div className="plg-hero-picture" key={`p${popKey}`} aria-hidden="true">
            {concept.emoji}
          </div>
          <p className="plg-hero-word" lang={language}>
            <strong>{word.charAt(0)}</strong>
            {word.slice(1)}
          </p>
          <div className="plg-hero-actions">
            <button type="button" className="plg-btn plg-btn-primary" onClick={() => speak(`${selected.letter}… ${word}`, language, 0.8)}>
              <Volume2 size={18} /> Hear it
            </button>
            <button type="button" className="plg-btn" onClick={() => speak(word, language, 0.55)}>
              <Turtle size={18} /> Slowly
            </button>
            <button type="button" className={mic.listening ? "plg-btn listening" : "plg-btn"} onClick={() => void sayIt()}>
              <Mic size={18} /> {mic.listening ? "Listening…" : "Say it!"}
            </button>
          </div>
          {mic.listening && mic.interim && <p className="plg-say-result">🎤 {mic.interim}</p>}
          {sayResult && <p className="plg-say-result">{sayResult}</p>}

          <div className="plg-translations">
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <button type="button" key={l} lang={l} onClick={() => speak(concept.word[l], l, 0.8)} title={`Hear it in ${languageNames[l]}`}>
                <span aria-hidden="true">{languageFlags[l]}</span> {concept.word[l]} <Volume2 size={14} />
              </button>
            ))}
          </div>
          {(selected.letter === "Ñ" || selected.letter === "Ç") && (
            <p className="plg-note">“{selected.letter}” is a special letter in {languageNames[language]}!</p>
          )}
        </div>
      </div>
    </div>
  );
}
