import { useCallback, useMemo, useState } from "react";
import RobotCompanion from "./RobotCompanion";
import { useRobotCompanion } from "./useRobotCompanion";
import { activities, languageFlags, languageNames, levelNames, ui, type UiKey } from "../storyContent";
import { LANGUAGES, LEVELS, type Language, type Level, type VocabItem } from "../storyEngine";
import { useLearner } from "../learner/learnerStore";

type Props = {
  /** Language Timmy speaks. Controlled by the dashboard's language selector. */
  language: Language;
  onLanguageChange: (language: Language) => void;
};

const noSentenceHelp = () => null;

/**
 * Speak & Practice page: free conversation with Timmy on everyday topics,
 * vocabulary lessons and pronunciation practice.
 */
export default function SpeakWithTimmy({ language, onLanguageChange }: Props) {
  const [level, setLevel] = useState<Level>("beginner");
  const uiLang: Language = "en"; // the dashboard itself is in English

  // "Teach me a word" uses the vocabulary of every picture activity at this level.
  const vocabulary = useMemo(() => {
    const seen = new Set<string>();
    const words: VocabItem[] = [];
    for (const activity of activities.filter((a) => a.level === level)) {
      for (const item of activity.vocabulary) {
        if (!seen.has(item.en)) {
          seen.add(item.en);
          words.push(item);
        }
      }
    }
    return words;
  }, [level]);

  const { record } = useLearner();
  const robot = useRobotCompanion({
    learnLang: language,
    level,
    vocabulary,
    sentenceHelp: noSentenceHelp,
    onChildMessage: () => record({ type: "chat" }),
    onWordPractised: () => {
      record({ type: "word" });
      record({ type: "star", amount: 1, section: "speak" });
    },
  });

  const t = useCallback(
    (key: UiKey, vars: Record<string, string | number> = {}) =>
      ui[key][uiLang].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? "")),
    []
  );

  return (
    <div className="speak-timmy">
      <div className="speak-timmy-bar">
        <div className="speak-timmy-group" role="group" aria-label="Language">
          {LANGUAGES.map((item) => (
            <button
              type="button"
              key={item}
              className={language === item ? "cs-language active" : "cs-language"}
              aria-pressed={language === item}
              onClick={() => onLanguageChange(item)}
            >
              <span aria-hidden="true">{languageFlags[item]}</span> {languageNames[item]}
            </button>
          ))}
        </div>
        <div className="speak-timmy-group" role="group" aria-label={t("levelLabel")}>
          {LEVELS.map((item) => (
            <button
              type="button"
              key={item}
              className={level === item ? "cs-level active" : "cs-level"}
              aria-pressed={level === item}
              onClick={() => setLevel(item)}
            >
              {levelNames[item][uiLang]}
            </button>
          ))}
        </div>
      </div>
      <RobotCompanion companion={robot} learnLang={language} uiLang={uiLang} t={t} />
    </div>
  );
}
