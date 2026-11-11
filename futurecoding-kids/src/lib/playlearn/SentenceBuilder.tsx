import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { activities, languageFlags } from "../storyContent";
import { LANGUAGES, buildWordBank, diffAttempt, formatSentence, isCorrect, type Level, type WordTile } from "../storyEngine";
import { sfx } from "./sfx";
import { ENCOURAGE, PASTELS, PASTEL_INK, PRAISE, pick, type ActivityProps } from "./shared";
import type { AgeGroup } from "./words";

const LEVEL: Record<AgeGroup, Level> = { "5-6": "beginner", "7-9": "intermediate", "10-12": "advanced" };

/** Put the words in order — reuses the Create Stories sentences, sized for the age group. */
export default function SentenceBuilder({ language, age, speak, onWin, onTryAgain }: ActivityProps) {
  const list = useMemo(() => activities.filter((a) => a.level === LEVEL[age]), [age]);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<WordTile[]>([]);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");

  const activity = list[index % list.length];
  const target = activity.targets[language];
  const bank = useMemo(() => buildWordBank(activity, language, round), [activity, language, round]);
  const usedIds = new Set(chosen.map((t) => t.id));
  const diff = status === "wrong" ? diffAttempt(chosen.map((t) => t.text), target, language) : null;

  useEffect(() => {
    setChosen([]);
    setStatus("idle");
  }, [language, age]);

  const add = (tile: WordTile) => {
    if (usedIds.has(tile.id) || status === "right") return;
    sfx.tap();
    speak(tile.text, language, 0.85);
    setChosen((c) => [...c, tile]);
    setStatus("idle");
  };

  const check = () => {
    if (isCorrect(chosen.map((t) => t.text), target, language)) {
      setStatus("right");
      sfx.success();
      speak(target.sentence, language, 0.85);
      onWin("sentences", 4, `${pick(PRAISE)} Perfect sentence!`);
    } else {
      setStatus("wrong");
      sfx.soft();
      onTryAgain(`${pick(ENCOURAGE)} Green words are in the right place.`);
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setRound((r) => r + 1);
    setChosen([]);
    setStatus("idle");
  };

  return (
    <div className="plg-sentence">
      <div className="plg-builder-picture">
        <span className="plg-builder-emoji" aria-hidden="true">{activity.emoji}</span>
        <div>
          <span className="plg-chip">{activity.title[language]}</span>
          <p className="plg-sentence-prompt" lang={language}>
            {activity.prompt[language]}
          </p>
          <p className="plg-muted">💡 {activity.hint.en}</p>
        </div>
      </div>

      <div className={`plg-sentence-tray ${status}`} lang={language}>
        {chosen.length === 0 && <span className="plg-muted">Tap the words in the right order…</span>}
        {chosen.map((tile, i) => (
          <button
            type="button"
            key={tile.id}
            className={`plg-word-chip${diff ? ` ${diff.statuses[i]}` : ""}`}
            onClick={() => status !== "right" && setChosen((c) => c.filter((t) => t.id !== tile.id))}
          >
            {tile.text}
          </button>
        ))}
      </div>
      {chosen.length > 0 && <p className="plg-sentence-preview">{formatSentence(chosen.map((t) => t.text), target, language)}</p>}

      {status !== "right" && (
        <div className="plg-tiles" lang={language}>
          {bank.map((tile, i) => (
            <button
              type="button"
              key={tile.id}
              className={`plg-word-tile${usedIds.has(tile.id) ? " placed" : ""}`}
              style={{ ["--c" as string]: PASTELS[i % PASTELS.length], ["--ink" as string]: PASTEL_INK[i % PASTELS.length] }}
              onClick={() => add(tile)}
              disabled={usedIds.has(tile.id)}
            >
              {tile.text}
            </button>
          ))}
        </div>
      )}

      {status === "right" ? (
        <div className="plg-solved">
          <div className="plg-translations">
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <button type="button" key={l} lang={l} onClick={() => speak(activity.targets[l].sentence, l, 0.85)}>
                <span aria-hidden="true">{languageFlags[l]}</span> {activity.targets[l].sentence} <Volume2 size={14} />
              </button>
            ))}
          </div>
          <button type="button" className="plg-btn plg-btn-primary plg-btn-big" onClick={next}>
            Next sentence →
          </button>
        </div>
      ) : (
        <div className="plg-row plg-center">
          <button type="button" className="plg-btn" onClick={() => { setChosen([]); setStatus("idle"); }}>
            <RotateCcw size={18} /> Start again
          </button>
          <button type="button" className="plg-btn" onClick={() => speak(target.sentence, language, 0.7)}>
            <Volume2 size={18} /> Listen to the answer
          </button>
          <button type="button" className="plg-btn plg-btn-primary" onClick={check} disabled={!chosen.length}>
            Check ✨
          </button>
        </div>
      )}
    </div>
  );
}
