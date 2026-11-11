import { useCallback, useEffect, useMemo, useState } from "react";
import "./CreateStories.css";
import { activities, languageFlags, languageNames, levelNames, ui, type UiKey } from "./storyContent";
import {
  LANGUAGES,
  LEVELS,
  buildWordBank,
  diffAttempt,
  formatSentence,
  isCorrect,
  nextCorrectWord,
  tokenize,
  validateActivities,
  type Language,
  type Level,
  type WordTile,
} from "./storyEngine";
import RobotCompanion from "./robot/RobotCompanion";
import { useRobotCompanion } from "./robot/useRobotCompanion";

// Report content mistakes (missing translations, bad alternatives) while developing.
if (import.meta.env?.DEV) {
  const problems = validateActivities(activities);
  if (problems.length) console.warn("[CreateStories] content problems:\n" + problems.join("\n"));
}

const STORAGE_KEY = "futurekids-create-stories-v3";
const OLD_STORAGE_KEY = "futurekids-create-stories-v2";
/** Activity order of the previous version, used to carry old stars over. */
const OLD_ACTIVITY_IDS = ["reading", "bicycle", "cat", "garden", "explorer", "stars"];
const AUTO_ADVANCE_SECONDS = 8;

type Status = "idle" | "correct" | "wrong";
/** Only progress and settings are saved — never names, voice or conversations. */
type Saved = { completed: string[]; learnLang: Language; uiLang: Language; level: Level };

const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language);
const isLevel = (value: unknown): value is Level => LEVELS.includes(value as Level);

function loadSaved(): Partial<Saved> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Record<string, unknown> | null;
      if (!d || typeof d !== "object") return {};
      return {
        completed: Array.isArray(d.completed) ? d.completed.filter((x): x is string => typeof x === "string") : [],
        learnLang: isLanguage(d.learnLang) ? d.learnLang : undefined,
        uiLang: isLanguage(d.uiLang) ? d.uiLang : undefined,
        level: isLevel(d.level) ? d.level : undefined,
      };
    }
    // Carry over stars from the previous Create Stories version.
    const old = JSON.parse(window.localStorage.getItem(OLD_STORAGE_KEY) ?? "null") as
      | { language?: unknown; completed?: unknown }
      | null;
    if (!old) return {};
    const lang = isLanguage(old.language) ? old.language : "en";
    const completed = Array.isArray(old.completed)
      ? old.completed
          .filter((n): n is number => typeof n === "number" && OLD_ACTIVITY_IDS[n] !== undefined)
          .map((n) => `${OLD_ACTIVITY_IDS[n]}:${lang}`)
      : [];
    return { completed, learnLang: lang };
  } catch {
    return {};
  }
}

type Props = {
  /** Optional: let the dashboard control the language (keeps Timmy and the app in sync). */
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  /** Called once each time the child earns a NEW star. */
  onStarEarned?: () => void;
};

export default function CreateStories({ language, onLanguageChange, onStarEarned }: Props) {
  const saved = useMemo(loadSaved, []);
  const [ownLang, setOwnLang] = useState<Language>(isLanguage(saved.learnLang) ? saved.learnLang : "en");
  const learnLang = language ?? ownLang;
  const [uiLang, setUiLang] = useState<Language>(isLanguage(saved.uiLang) ? saved.uiLang : "en");
  const [level, setLevel] = useState<Level>(isLevel(saved.level) ? saved.level : "intermediate");
  const [activityIndex, setActivityIndex] = useState(0);
  const [chosen, setChosen] = useState<WordTile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [justEarned, setJustEarned] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shuffleRound, setShuffleRound] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [advanceIn, setAdvanceIn] = useState<number | null>(null);
  // A star = one activity completed in one language, so stars can't be farmed
  // by re-checking the same sentence, and each language counts separately.
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(saved.completed ?? []));
  const [customStory, setCustomStory] = useState("");

  useEffect(() => {
    try {
      const data: Saved = { completed: [...completed], learnLang, uiLang, level };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* private mode / storage blocked: progress just isn't remembered */
    }
  }, [completed, learnLang, uiLang, level]);

  /** Interface text in the chosen instruction language, with {placeholders}. */
  const t = useCallback(
    (key: UiKey, vars: Record<string, string | number> = {}) =>
      ui[key][uiLang].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? "")),
    [uiLang]
  );

  const levelActivities = useMemo(() => activities.filter((a) => a.level === level), [level]);
  const total = levelActivities.length;
  const index = activityIndex % total;
  const activity = levelActivities[index];
  const target = activity.targets[learnLang];
  const answerLength = tokenize(target.sentence, learnLang).length;
  const bank = useMemo(() => buildWordBank(activity, learnLang, shuffleRound), [activity, learnLang, shuffleRound]);
  const usedIds = new Set(chosen.map((tile) => tile.id));
  const words = chosen.map((tile) => tile.text);
  const sentence = formatSentence(words, target, learnLang);
  const keyFor = (id: string, lang: Language = learnLang) => `${id}:${lang}`;
  const isDone = completed.has(keyFor(activity.id));
  const totalStars = activities.length * LANGUAGES.length;
  const allDone = completed.size >= totalStars;
  const diff = status === "wrong" ? diffAttempt(words, target, learnLang) : null;
  const showImage = Boolean(activity.image) && !failedImages.includes(activity.image ?? "");

  const wordsKey = words.join(" ");
  const sentenceHelp = useCallback(
    () => (status === "correct" ? null : nextCorrectWord(wordsKey ? wordsKey.split(" ") : [], target, learnLang)),
    [status, wordsKey, target, learnLang]
  );

  const robot = useRobotCompanion({ learnLang, level, vocabulary: activity.vocabulary, sentenceHelp });

  const resetBuilder = () => {
    setChosen([]);
    setStatus("idle");
    setJustEarned(false);
    setShowHint(false);
    setAdvanceIn(null);
  };

  const goTo = useCallback(
    (next: number) => {
      setActivityIndex(((next % total) + total) % total);
      setChosen([]);
      setStatus("idle");
      setJustEarned(false);
      setShowHint(false);
      setAdvanceIn(null);
      setCustomStory("");
    },
    [total]
  );

  const addWord = (tile: WordTile) => {
    if (usedIds.has(tile.id)) return;
    robot.speak(tile.text, learnLang, { rate: 0.8 });
    setChosen((current) => [...current, tile]);
    setStatus("idle");
  };

  const removeWord = (id: string) => {
    setChosen((current) => current.filter((tile) => tile.id !== id));
    setStatus("idle");
  };

  const undoLast = () => {
    setChosen((current) => current.slice(0, -1));
    setStatus("idle");
  };

  const changeLearnLang = (next: Language) => {
    // Word banks differ per language (different words AND order), so start fresh.
    if (onLanguageChange) onLanguageChange(next);
    else setOwnLang(next);
    resetBuilder();
  };

  // If the dashboard changes the language, clear the half-built sentence.
  useEffect(() => {
    setChosen([]);
    setStatus("idle");
    setAdvanceIn(null);
  }, [learnLang]);

  const changeLevel = (next: Level) => {
    setLevel(next);
    setActivityIndex(0);
    resetBuilder();
  };

  const checkSentence = () => {
    if (isCorrect(words, target, learnLang)) {
      const earned = !completed.has(keyFor(activity.id));
      setStatus("correct");
      setJustEarned(earned);
      setShowHint(false);
      setCompleted((current) => new Set(current).add(keyFor(activity.id)));
      if (earned) onStarEarned?.();
      robot.celebrateActivity(activity, earned);
      setAdvanceIn(AUTO_ADVANCE_SECONDS);
    } else {
      setStatus("wrong");
      robot.encourageActivity(activity, diffAttempt(words, target, learnLang));
    }
  };

  /** Fills in the correct sentence and lets Timmy explain it. */
  const showAnswer = () => {
    const remaining = [...bank];
    const answerTiles = tokenize(target.sentence, learnLang).flatMap((word) => {
      const i = remaining.findIndex((tile) => tile.text === word);
      return i === -1 ? [] : remaining.splice(i, 1);
    });
    setChosen(answerTiles);
    setStatus("idle");
    robot.explainActivity(activity);
  };

  /** Next picture: prefer one this child hasn't finished yet in this language. */
  const nextUnfinished = useCallback(() => {
    for (let step = 1; step <= total; step++) {
      const candidate = (index + step) % total;
      if (!completed.has(`${levelActivities[candidate].id}:${learnLang}`)) return goTo(candidate);
    }
    goTo(index + 1);
  }, [total, index, completed, levelActivities, learnLang, goTo]);

  const resetProgress = () => {
    setCompleted(new Set());
    goTo(0);
  };

  // Countdown to the next picture after a correct sentence.
  useEffect(() => {
    if (advanceIn === null) return;
    if (advanceIn <= 0) {
      nextUnfinished();
      return;
    }
    const timer = window.setTimeout(() => setAdvanceIn((n) => (n === null ? null : n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [advanceIn, nextUnfinished]);

  const milestones = t("milestones").split("|");

  return (
    <main className="create-stories" lang={uiLang}>
      <header className="cs-header">
        <div>
          <span className="cs-eyebrow">{t("eyebrow")}</span>
          <h1>
            {t("heading")} <span aria-hidden="true">✨</span>
          </h1>
          <p>{t("tagline")}</p>
        </div>
        <div
          className={robot.celebrate ? "cs-star-counter cs-star-pop" : "cs-star-counter"}
          key={robot.celebrate}
          aria-label={t("starsEarned", { n: completed.size })}
        >
          <span aria-hidden="true">⭐</span>
          <strong>{completed.size}</strong>
          <small>/ {totalStars} {t("stars")}</small>
        </div>
      </header>

      <div className="cs-language-bar">
        <nav className="cs-language-tabs" aria-label={t("learnLabel")}>
          <span className="cs-language-label">{t("learnLabel")}</span>
          {LANGUAGES.map((item) => (
            <button
              type="button"
              key={item}
              className={learnLang === item ? "cs-language active" : "cs-language"}
              onClick={() => changeLearnLang(item)}
              aria-pressed={learnLang === item}
            >
              <span aria-hidden="true">{languageFlags[item]}</span> {languageNames[item]}
              {completed.has(keyFor(activity.id, item)) && <span aria-hidden="true"> ⭐</span>}
            </button>
          ))}
        </nav>
        <div className="cs-level-tabs" role="group" aria-label={t("levelLabel")}>
          <span className="cs-language-label">{t("levelLabel")}</span>
          {LEVELS.map((item) => (
            <button
              type="button"
              key={item}
              className={level === item ? "cs-level active" : "cs-level"}
              onClick={() => changeLevel(item)}
              aria-pressed={level === item}
            >
              {levelNames[item][uiLang]}
            </button>
          ))}
        </div>
        <label className="cs-ui-language">
          {t("helpLabel")}
          <select value={uiLang} onChange={(event) => setUiLang(event.target.value as Language)}>
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {languageFlags[item]} {languageNames[item]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!robot.hasVoice(learnLang) && (
        <p className="cs-voice-note" role="note">
          🔈 {t("noVoice", { lang: languageNames[learnLang] })}
        </p>
      )}

      <RobotCompanion companion={robot} learnLang={learnLang} uiLang={uiLang} t={t} />

      <section className="cs-layout">
        <div className="cs-main-column">
          <article className="cs-picture-card" key={activity.id}>
            <div className="cs-picture-copy">
              <span className="cs-step">
                {t("activityOf", { n: index + 1, total })}
                {isDone ? ` · ${t("done")}` : ""}
              </span>
              <h2 lang={learnLang}>{activity.title[learnLang]}</h2>
              <p lang={learnLang}>
                {activity.prompt[learnLang]}{" "}
                <button
                  type="button"
                  className="cs-icon-button"
                  onClick={() => robot.speak(activity.prompt[learnLang], learnLang)}
                  aria-label={t("listen")}
                >
                  🔊
                </button>
              </p>
              {uiLang !== learnLang && (
                <p className="cs-prompt-translation" lang={uiLang}>
                  {activity.prompt[uiLang]}
                </p>
              )}
              <div className="cs-dots" role="tablist" aria-label={t("chooseActivity")}>
                {levelActivities.map((item, i) => (
                  <button
                    type="button"
                    key={item.id}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${i + 1}: ${item.title[uiLang]}`}
                    className={["cs-dot", i === index ? "current" : "", completed.has(keyFor(item.id)) ? "done" : ""].join(" ")}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            </div>

            <div className="cs-scene" role="img" aria-label={activity.scene[uiLang]}>
              {showImage ? (
                <img
                  key={activity.image}
                  className="cs-scene-image"
                  src={activity.image}
                  alt={activity.scene[uiLang]}
                  onError={() =>
                    setFailedImages((current) =>
                      activity.image && !current.includes(activity.image) ? [...current, activity.image] : current
                    )
                  }
                />
              ) : (
                <>
                  <span className="cs-scene-sun" aria-hidden="true">☀️</span>
                  <span className="cs-scene-emoji" aria-hidden="true">{activity.emoji}</span>
                  <span className="cs-scene-sparkle" aria-hidden="true">✦</span>
                  <span className="cs-scene-caption" lang={learnLang}>{activity.scene[learnLang]}</span>
                </>
              )}
            </div>
          </article>

          <section className="cs-builder-card">
            <div className="cs-section-heading">
              <div>
                <span className="cs-eyebrow">{t("step1")}</span>
                <h3>{t("buildTitle")}</h3>
                <p>{t("buildHelp")}</p>
              </div>
              <span className="cs-pencil" aria-hidden="true">✏️</span>
            </div>

            <div className="cs-word-bank" aria-label={t("wordBank")} lang={learnLang}>
              {bank.map((tile) => {
                const used = usedIds.has(tile.id);
                return (
                  <button
                    type="button"
                    key={tile.id}
                    className={used ? "cs-word used" : "cs-word"}
                    onClick={() => addWord(tile)}
                    disabled={used || status === "correct"}
                  >
                    {tile.text}
                    <span aria-hidden="true">{used ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>

            <div className={`cs-sentence-area ${status}`}>
              <div className="cs-sentence-label">
                <span>{t("mySentence")}</span>
                <span>{t("wordsOf", { n: chosen.length, total: answerLength })}</span>
              </div>
              {chosen.length === 0 ? (
                <p className="cs-placeholder">{t("placeholder")}</p>
              ) : (
                <>
                  <div className="cs-selected-words" lang={learnLang}>
                    {chosen.map((tile, i) => {
                      const mark = diff?.statuses[i];
                      return (
                        <button
                          type="button"
                          key={tile.id}
                          className={`cs-selected-word${mark ? ` ${mark}` : ""}`}
                          onClick={() => removeWord(tile.id)}
                          title={
                            mark
                              ? t(mark === "right" ? "legendRight" : mark === "misplaced" ? "legendMisplaced" : "legendExtra")
                              : t("removeWord")
                          }
                          disabled={status === "correct"}
                        >
                          {tile.text} <span aria-hidden="true">×</span>
                        </button>
                      );
                    })}
                    {diff?.missing.map((_, i) => (
                      <span key={`missing-${i}`} className="cs-missing-slot" aria-hidden="true">?</span>
                    ))}
                  </div>
                  <p className="cs-sentence-built" lang={learnLang}>{sentence}</p>
                </>
              )}
            </div>

            <div className="cs-actions">
              <button type="button" className="cs-button cs-button-light" onClick={resetBuilder}>
                {t("startAgain")}
              </button>
              <button type="button" className="cs-button cs-button-light" onClick={undoLast} disabled={!chosen.length || status === "correct"}>
                {t("undo")}
              </button>
              <button type="button" className="cs-button cs-button-light" onClick={() => robot.speak(sentence, learnLang)} disabled={!sentence}>
                {t("listen")}
              </button>
              <button type="button" className="cs-button cs-button-light" onClick={() => robot.speak(target.sentence, learnLang, { rate: 0.7 })}>
                {t("listeningChallenge")}
              </button>
              <button
                type="button"
                className="cs-button cs-button-light"
                onClick={() => setShuffleRound((n) => n + 1)}
                disabled={status === "correct"}
              >
                {t("shuffle")}
              </button>
              <button
                type="button"
                className="cs-button cs-button-primary"
                onClick={checkSentence}
                disabled={!chosen.length || status === "correct"}
              >
                {t("check")}
              </button>
            </div>

            <div aria-live="polite">
              {status === "correct" && (
                <div className="cs-feedback cs-success" role="status">
                  <span aria-hidden="true">🌟</span>
                  <div className="cs-feedback-body">
                    <strong>{t("successTitle")}</strong>
                    <p>{justEarned ? t("successStar") : t("successAgain")}</p>
                    <div className="cs-advance">
                      {advanceIn !== null && (
                        <>
                          <div className="cs-advance-bar" aria-hidden="true">
                            <div style={{ width: `${(advanceIn / AUTO_ADVANCE_SECONDS) * 100}%` }} />
                          </div>
                          <span>{t("nextIn", { n: advanceIn })}</span>
                          <button type="button" className="cs-button cs-button-light" onClick={() => setAdvanceIn(null)}>
                            {t("stayHere")}
                          </button>
                        </>
                      )}
                      <button type="button" className="cs-button cs-button-primary" onClick={nextUnfinished}>
                        {t("nextPicture")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {status === "wrong" && diff && (
                <div className="cs-feedback cs-try-again" role="status">
                  <span aria-hidden="true">🤔</span>
                  <div className="cs-feedback-body">
                    <strong>{t("tryAgain")}</strong>
                    <ul className="cs-legend">
                      <li className="right">{t("legendRight")}</li>
                      <li className="misplaced">{t("legendMisplaced")}</li>
                      <li className="extra">{t("legendExtra")}</li>
                    </ul>
                    {diff.missing.length > 0 && <p>{t("missingWords", { n: diff.missing.length })}</p>}
                    <p>💡 {activity.hint[uiLang]}</p>
                  </div>
                </div>
              )}
            </div>

            {status !== "correct" && (
              <div className="cs-help-row">
                <button type="button" className="cs-link" onClick={() => setShowHint((v) => !v)}>
                  {showHint ? t("hideHint") : t("needHint")}
                </button>
                <button type="button" className="cs-link" onClick={showAnswer}>
                  {t("showAnswer")}
                </button>
                <button type="button" className="cs-link" onClick={() => robot.explainActivity(activity)}>
                  {t("showMe")}
                </button>
              </div>
            )}
            {showHint && status !== "correct" && <p className="cs-hint">💡 {activity.hint[uiLang]}</p>}

            {(status === "correct" || isDone) && (
              <div className="cs-translations">
                <span className="cs-eyebrow">{t("sayIn3")}</span>
                {LANGUAGES.map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    lang={lang}
                    className="cs-translation"
                    onClick={() => robot.speak(activity.targets[lang].sentence, lang)}
                    title={t("listen")}
                  >
                    <span aria-hidden="true">{languageFlags[lang]}</span>
                    <span>{activity.targets[lang].sentence}</span>
                    <span aria-hidden="true">🔊</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="cs-side-column">
          <section className="cs-side-card cs-vocab-card">
            <span className="cs-eyebrow">{t("newWords")}</span>
            <h3>{t("threeLanguages")}</h3>
            <ul className="cs-vocab-list">
              {activity.vocabulary.map((item) => (
                <li key={item.en}>
                  <span className="cs-vocab-emoji" aria-hidden="true">{item.emoji}</span>
                  <div className="cs-vocab-words">
                    {LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang}
                        lang={lang}
                        className={lang === learnLang ? "cs-vocab-word active" : "cs-vocab-word"}
                        onClick={() => robot.speak(item[lang], lang)}
                        title={languageNames[lang]}
                      >
                        <span aria-hidden="true">{languageFlags[lang]}</span> {item[lang]}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="cs-side-card cs-progress-card">
            <span className="cs-eyebrow">{t("journey")}</span>
            <h3>{t("explorer")}</h3>
            <div className="cs-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={totalStars} aria-valuenow={completed.size}>
              <div style={{ width: `${(completed.size / totalStars) * 100}%` }} />
            </div>
            <p>{t("progress", { n: completed.size, total: totalStars })}</p>
            <div className="cs-milestones">
              {milestones.map((label, i) => (
                <span key={label} className={completed.size >= Math.ceil((totalStars * i) / milestones.length) ? "reached" : ""}>
                  {label}
                </span>
              ))}
            </div>
            {completed.size > 0 && (
              <button type="button" className="cs-link cs-reset" onClick={resetProgress}>
                {t("resetProgress")}
              </button>
            )}
          </section>

          <section className="cs-side-card cs-write-card">
            <span className="cs-eyebrow">{t("imagination")}</span>
            <h3>{t("writeOwn")}</h3>
            <textarea
              value={customStory}
              onChange={(event) => setCustomStory(event.target.value)}
              placeholder={ui.onceUpon[learnLang]}
              lang={learnLang}
              rows={4}
              aria-label={t("writeOwn")}
            />
            <button
              type="button"
              className="cs-button cs-button-primary cs-full-button"
              onClick={() => robot.speak(customStory, learnLang)}
              disabled={!customStory.trim()}
            >
              {t("readStory")}
            </button>
          </section>
        </aside>
      </section>

      <footer className="cs-footer">
        <span>{allDone ? t("allDone") : t("footer")}</span>
        <div className="cs-footer-buttons">
          <button type="button" className="cs-button cs-button-light" onClick={() => goTo(index - 1)}>
            {t("back")}
          </button>
          <button type="button" className="cs-button cs-button-primary" onClick={nextUnfinished}>
            {t("next")}
          </button>
        </div>
      </footer>
    </main>
  );
}
