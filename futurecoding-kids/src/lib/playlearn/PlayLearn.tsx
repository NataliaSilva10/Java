import { useCallback, useEffect, useRef, useState } from "react";
import { Award, Lock, Trophy, Volume2, VolumeX } from "lucide-react";
import "./PlayLearn.css";
import Robot from "../robot/Robot";
import type { RobotState } from "../robot/types";
import { languageFlags, languageNames } from "../storyContent";
import { LANGUAGES, type Language } from "../storyEngine";
import { useSpeech } from "../useSpeech";
import { Confetti, StarPop } from "./Celebration";
import HangmanGame from "./HangmanGame";
import LetterPop from "./LetterPop";
import MatchingGame from "./MatchingGame";
import { BADGES, STARS_PER_LEVEL, levelOf, usePlayProgress, type ActivityId } from "./progress";
import SentenceBuilder from "./SentenceBuilder";
import { setMuted, sfx } from "./sfx";
import { ENCOURAGE, PASTELS, pick, type ActivityProps } from "./shared";
import SoundSpelling from "./SoundSpelling";
import WordBuilder from "./WordBuilder";
import { AGE_GROUPS, type AgeGroup } from "./words";
import { useAgeGroup } from "../learner/useAgeGroup";

type Props = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  /** Adds stars to the dashboard total. */
  onStarsEarned?: (stars: number) => void;
  /** Counts a new word for the dashboard's "Words learned". */
  onWordLearned?: () => void;
  /** A letter was popped (daily goals). */
  onLetter?: () => void;
  /** The child tried (effort earns XP too). */
  onEffort?: () => void;
};

const AGES: Record<AgeGroup, { emoji: string; label: string; tagline: string }> = {
  "5-6": { emoji: "🐣", label: "Ages 5–6", tagline: "Letters, sounds & pictures" },
  "7-9": { emoji: "🚀", label: "Ages 7–9", tagline: "Spelling, matching & words" },
  "10-12": { emoji: "🏆", label: "Ages 10–12", tagline: "Challenges & sentences" },
};

const ACTIVITIES: { id: ActivityId; emoji: string; name: string; description: string; color: string; ages: AgeGroup[] }[] = [
  { id: "letters", emoji: "🔤", name: "Letter Pop", description: "Pop letters, hear them, find them!", color: "lavender", ages: ["5-6", "7-9"] },
  { id: "builder", emoji: "🧱", name: "Word Builder", description: "Drag letters to build words", color: "blue", ages: ["7-9", "10-12"] },
  { id: "matching", emoji: "🧩", name: "Matching", description: "Match letters, words & pictures", color: "peach", ages: ["5-6", "7-9"] },
  { id: "hangman", emoji: "🤖", name: "Word Challenge", description: "Guess the word, save Timmy's robot", color: "mint", ages: ["7-9", "10-12"] },
  { id: "spelling", emoji: "🐝", name: "Sound & Spelling", description: "Listen and pick the right spelling", color: "pink", ages: ["5-6", "7-9", "10-12"] },
  { id: "sentences", emoji: "📝", name: "Sentence Builder", description: "Put the words in order", color: "yellow", ages: ["10-12"] },
];

const FLOATING = "AaBbCcÑñÇçXyZ".split("");
const WORD_ACTIVITIES: ActivityId[] = ["builder", "hangman", "spelling"];

/** Play & Learn — an interactive, trilingual learning playground. */
export default function PlayLearn({ language, onLanguageChange, onStarsEarned, onWordLearned, onLetter, onEffort }: Props) {
  const [age, setAge] = useAgeGroup();
  const [activity, setActivity] = useState<ActivityId>("letters");
  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("Hi! I'm Timmy. Pick a game and let's play! 🎈");
  const [mood, setMood] = useState<RobotState>("idle");
  const [burst, setBurst] = useState<{ id: number; stars: number; big: boolean } | null>(null);
  const { progress, addWin, exploreLetter, newBadge, clearBadge } = usePlayProgress(language);
  const speech = useSpeech();
  const moodTimer = useRef<number | undefined>(undefined);

  useEffect(() => setMuted(!soundOn), [soundOn]);
  useEffect(() => () => window.clearTimeout(moodTimer.current), []);

  // Stable speak function, so games don't restart when browser voices finish loading.
  const speakRef = useRef(speech.speak);
  speakRef.current = speech.speak;
  const speak = useCallback<ActivityProps["speak"]>(
    (text, lang = language, rate = 0.85) => speakRef.current(text, lang, { rate }),
    [language]
  );

  const react = useCallback((next: RobotState, text: string) => {
    window.clearTimeout(moodTimer.current);
    setMood(next);
    setMessage(text);
    moodTimer.current = window.setTimeout(() => setMood("idle"), 2600);
  }, []);

  const onWin = useCallback<ActivityProps["onWin"]>(
    (id, stars, text) => {
      addWin(id, stars);
      onStarsEarned?.(stars);
      if (WORD_ACTIVITIES.includes(id)) onWordLearned?.();
      const big = id !== "letters";
      setBurst({ id: Date.now(), stars, big });
      react("happy", text ?? "Amazing! ⭐");
    },
    [addWin, onStarsEarned, onWordLearned, react]
  );

  const onTryAgain = useCallback<ActivityProps["onTryAgain"]>(
    (text) => {
      onEffort?.();
      react("encouraging", text ?? pick(ENCOURAGE));
    },
    [react, onEffort]
  );

  const onExploreLetter = useCallback(
    (lang: Language, letter: string) => {
      exploreLetter(lang, letter);
      onLetter?.();
    },
    [exploreLetter, onLetter]
  );

  // Hide the star pop / confetti after they finish.
  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(null), 1900);
    return () => window.clearTimeout(timer);
  }, [burst]);

  useEffect(() => {
    if (!newBadge) return;
    sfx.fanfare();
    const timer = window.setTimeout(clearBadge, 4200);
    return () => window.clearTimeout(timer);
  }, [newBadge, clearBadge]);

  const level = levelOf(progress.stars);
  const levelProgress = ((progress.stars % STARS_PER_LEVEL) / STARS_PER_LEVEL) * 100;
  const shared: ActivityProps = { language, age, speak, onWin, onTryAgain };
  const robotState: RobotState = mood !== "idle" ? mood : speech.speaking ? "speaking" : "idle";

  return (
    <div className="plg" lang="en">
      {/* ── Hero ── */}
      <section className="plg-hero">
        <div className="plg-floating" aria-hidden="true">
          {FLOATING.map((letter, i) => (
            <span
              key={i}
              style={{
                ["--i" as string]: i,
                color: PASTELS[i % PASTELS.length],
                left: `${(i * 7.6) % 96}%`,
                top: `${6 + ((i * 37) % 78)}%`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="plg-hero-copy">
          <span className="plg-kicker">✨ LEARNING PLAYGROUND</span>
          <h2>
            Play, listen &amp; <span>learn!</span>
          </h2>
          <p>Pop letters, build words and play games in English, Português and Español.</p>
          <div className="plg-stats">
            <div className="plg-stat plg-stat-stars">
              <span className="plg-stat-icon">⭐</span>
              <div>
                <strong>{progress.stars}</strong>
                <small>stars</small>
              </div>
              {burst && <StarPop key={burst.id} amount={burst.stars} />}
            </div>
            <div className="plg-stat plg-stat-level">
              <span className="plg-stat-icon">
                <Trophy size={18} />
              </span>
              <div>
                <strong>Level {level}</strong>
                <div className="plg-level-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(levelProgress)}>
                  <span style={{ width: `${levelProgress}%` }} />
                </div>
                <small>{STARS_PER_LEVEL - (progress.stars % STARS_PER_LEVEL)} ⭐ to level {level + 1}</small>
              </div>
            </div>
            <div className="plg-stat">
              <span className="plg-stat-icon">
                <Award size={18} />
              </span>
              <div>
                <strong>
                  {progress.badges.length}/{BADGES.length}
                </strong>
                <small>badges</small>
              </div>
            </div>
          </div>
        </div>
        <div className="plg-mascot">
          <div className={`plg-bubble plg-bubble--${mood}`} key={message} aria-live="polite">
            {message}
          </div>
          <Robot state={robotState} speaking={speech.speaking} label={`Timmy is ${robotState}`} size={170} />
        </div>
      </section>

      {/* ── Controls ── */}
      <section className="plg-controls">
        <div className="plg-control-group" role="group" aria-label="Language">
          {LANGUAGES.map((l) => (
            <button
              type="button"
              key={l}
              className={`plg-pill${language === l ? " active" : ""}`}
              onClick={() => onLanguageChange(l)}
              aria-pressed={language === l}
            >
              <span aria-hidden="true">{languageFlags[l]}</span> {languageNames[l]}
            </button>
          ))}
        </div>
        <div className="plg-control-group" role="group" aria-label="Age group">
          {AGE_GROUPS.map((a) => (
            <button
              type="button"
              key={a}
              className={`plg-pill plg-age${age === a ? " active" : ""}`}
              onClick={() => setAge(a)}
              aria-pressed={age === a}
              title={AGES[a].tagline}
            >
              <span aria-hidden="true">{AGES[a].emoji}</span> {AGES[a].label}
            </button>
          ))}
        </div>
        <button type="button" className="plg-pill plg-sound" onClick={() => setSoundOn((s) => !s)} aria-pressed={soundOn}>
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundOn ? "Sounds on" : "Sounds off"}
        </button>
      </section>

      {/* ── Activity picker ── */}
      <nav className="plg-activities" aria-label="Games">
        {ACTIVITIES.map((a) => (
          <button
            type="button"
            key={a.id}
            className={`plg-activity plg-activity--${a.color}${activity === a.id ? " active" : ""}`}
            onClick={() => {
              sfx.tap();
              setActivity(a.id);
            }}
            aria-pressed={activity === a.id}
          >
            <span className="plg-activity-emoji" aria-hidden="true">{a.emoji}</span>
            <strong>{a.name}</strong>
            <small>{a.description}</small>
            {a.ages.includes(age) && <span className="plg-recommended">★ Great for {AGES[age].label.replace("Ages ", "")}</span>}
            {progress.wins[a.id] > 0 && <span className="plg-activity-count">{progress.wins[a.id]} ✓</span>}
          </button>
        ))}
      </nav>

      {/* ── Game stage ── */}
      <section className="plg-stage" aria-label={ACTIVITIES.find((a) => a.id === activity)?.name}>
        {burst?.big && <Confetti key={burst.id} />}
        {activity === "letters" && (
          <LetterPop {...shared} explored={progress.letters[language]} onExplore={onExploreLetter} />
        )}
        {activity === "builder" && <WordBuilder {...shared} />}
        {activity === "matching" && <MatchingGame {...shared} />}
        {activity === "hangman" && <HangmanGame {...shared} />}
        {activity === "spelling" && <SoundSpelling {...shared} />}
        {activity === "sentences" && <SentenceBuilder {...shared} />}
      </section>

      {/* ── Badges ── */}
      <section className="plg-badges">
        <h3>
          <Award size={20} /> My badges
        </h3>
        <div className="plg-badge-grid">
          {BADGES.map((b) => {
            const earned = progress.badges.includes(b.id);
            return (
              <div key={b.id} className={`plg-badge${earned ? " earned" : ""}`} title={b.description}>
                <span className="plg-badge-emoji">{earned ? b.emoji : <Lock size={20} />}</span>
                <strong>{b.name}</strong>
                <small>{b.description}</small>
              </div>
            );
          })}
        </div>
      </section>

      {newBadge && (
        <div className="plg-badge-toast" role="status">
          <Confetti key={newBadge.id} pieces={50} />
          <span className="plg-badge-toast-emoji">{newBadge.emoji}</span>
          <div>
            <small>NEW BADGE UNLOCKED!</small>
            <strong>{newBadge.name}</strong>
            <p>{newBadge.description} — you're a superstar!</p>
          </div>
        </div>
      )}
    </div>
  );
}
