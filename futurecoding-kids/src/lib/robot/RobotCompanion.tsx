import { useEffect, useRef, useState, type FormEvent } from "react";
import "./RobotCompanion.css";
import Robot from "./Robot";
import { useMicLevel } from "../useMicLevel";
import { topics } from "./topics";
import type { RobotCompanion as Companion } from "./useRobotCompanion";
import type { Language } from "../storyEngine";
import type { UiKey } from "../storyContent";

type Props = {
  companion: Companion;
  learnLang: Language;
  uiLang: Language;
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
};

const STATE_LABEL = {
  idle: "stateIdle",
  speaking: "stateSpeaking",
  listening: "stateListening",
  thinking: "stateThinking",
  happy: "stateHappy",
  encouraging: "stateEncouraging",
} as const;

const MODE_LABEL = { live: "modeLive", local: "modeLocal", checking: "modeChecking", unavailable: "modeUnavailable" } as const;

/** The robot section: character, speech bubbles, chat, mic/text input and the six robot buttons. */
export default function RobotCompanion({ companion: c, learnLang, uiLang, t }: Props) {
  const [draft, setDraft] = useState("");
  const micLevel = useMicLevel(c.listening);
  const logRef = useRef<HTMLDivElement>(null);
  const lastRobot = [...c.messages].reverse().find((m) => m.role === "robot");

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [c.messages.length, c.thinking, c.aiError]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || c.thinking) return;
    c.sendChild(draft);
    setDraft("");
  };

  const stateText = t(STATE_LABEL[c.state]);

  return (
    <section className="rc" aria-label={t("robotTitle")}>
      <div className="rc-stage">
        <div className="rc-stage-top">
          <span className="cs-eyebrow">{t("robotEyebrow")}</span>
          <span className={`rc-mode rc-mode--${c.aiMode}`} title={t(c.aiMode === "live" ? "modeLiveInfo" : "modeLocalInfo")}>
            <span className="rc-mode-dot" aria-hidden="true" />
            {t(MODE_LABEL[c.aiMode])}
          </span>
        </div>

        {lastRobot && (
          <div className="rc-float-bubble" key={lastRobot.id} lang={lastRobot.language}>
            {lastRobot.text}
          </div>
        )}

        <Robot state={c.state} speaking={c.speaking} label={`Timmy – ${stateText}`} />
        <p className={`rc-state rc-state--${c.state}`} aria-live="polite">
          {stateText}
        </p>
        {c.celebrate > 0 && (
          <div className="rc-confetti" key={c.celebrate} aria-hidden="true">
            {["⭐", "✨", "🌟", "⭐", "✨", "🎉"].map((s, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>{s}</span>
            ))}
          </div>
        )}
        <p className="rc-mode-info">{t(c.aiMode === "live" ? "modeLiveInfo" : "modeLocalInfo")}</p>
        {c.aiMode === "unavailable" && (
          <button type="button" className="rc-link" onClick={() => c.reconnect()}>
            {t("tryLive")}
          </button>
        )}
      </div>

      <div className="rc-chat">
        <div className="rc-topics">
          <span className="rc-topics-label">{t("topicLabel")}</span>
          <div className="rc-topic-list">
            {topics.map((topic) => (
              <button
                type="button"
                key={topic.id}
                className={c.topicId === topic.id ? "rc-topic active" : "rc-topic"}
                onClick={() => c.setTopicId(topic.id)}
                aria-pressed={c.topicId === topic.id}
                lang={learnLang}
              >
                <span aria-hidden="true">{topic.emoji}</span> {cap(topic.name[learnLang])}
                {c.activeTopic === topic.id && <span className="rc-live-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        <div className="rc-log" ref={logRef} role="log" aria-label={t("chatLog")} aria-live="polite">
          {c.messages.length === 0 && !c.thinking && <p className="rc-empty">{t("emptyChat")}</p>}
          {c.messages.map((m) => (
            <div key={m.id} className={`rc-msg rc-msg--${m.role}`}>
              {m.role === "robot" && <span className="rc-avatar" aria-hidden="true">🤖</span>}
              <div className="rc-bubble">
                <p lang={m.language}>
                  {m.spoken && <span aria-hidden="true">🎤 </span>}
                  {m.text}
                </p>
                {m.role === "robot" && m.translations && uiLang !== m.language && m.translations[uiLang] !== m.text && (
                  <p className="rc-sub" lang={uiLang}>{m.translations[uiLang]}</p>
                )}
                {m.role === "robot" && (
                  <div className="rc-bubble-meta">
                    {m.source === "ai" && <span className="rc-tag">AI</span>}
                    <button
                      type="button"
                      className="rc-replay"
                      onClick={() => c.speak(m.text, m.language, { rate: 0.75 })}
                      aria-label={t("hearAgain")}
                      title={t("hearAgain")}
                    >
                      🔊
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {c.thinking && (
            <div className="rc-msg rc-msg--robot">
              <span className="rc-avatar" aria-hidden="true">🤖</span>
              <div className="rc-bubble rc-typing" aria-label={t("stateThinking")}>
                <span /> <span /> <span />
              </div>
            </div>
          )}
          {c.aiError && (
            <div className="rc-error" role="alert">
              <p>⚠️ {t("aiError")}</p>
              <div>
                <button type="button" className="cs-button cs-button-light" onClick={c.retryAi}>↻ {t("retry")}</button>
                <button type="button" className="cs-button cs-button-light" onClick={c.switchToPractice}>{t("usePractice")}</button>
              </div>
            </div>
          )}
        </div>

        {c.suggestions.length > 0 && (
          <div className="rc-suggestions">
            <span>{t("youCanSay")}</span>
            {c.suggestions.map((s) => (
              <button type="button" key={s[learnLang]} className="rc-suggestion" lang={learnLang} onClick={() => setDraft(s[learnLang])}>
                {s[learnLang]}
              </button>
            ))}
          </div>
        )}

        {c.listening && (
          <div className="rc-hearing" aria-live="polite">
            <div className="rc-meter" aria-hidden="true">
              {[0.15, 0.35, 0.55, 0.75, 0.9].map((threshold, i) => (
                <span key={i} className={micLevel >= threshold ? "on" : ""} style={{ height: `${10 + i * 5}px` }} />
              ))}
            </div>
            <p className="rc-interim">
              🎤 {t("hearing")} <em lang={learnLang}>{c.interim || "…"}</em>
            </p>
          </div>
        )}
        {!c.micSupported && <p className="rc-mic-note">⌨️ {t("noMicBrowser")}</p>}

        <form className="rc-input" onSubmit={submit}>
          <button
            type="button"
            className={c.listening ? "rc-mic listening" : "rc-mic"}
            onClick={() => void c.listenToMe()}
            aria-pressed={c.listening}
            aria-label={c.listening ? t("stopMic") : t("mic")}
            title={c.micSupported ? t("mic") : t("modeLocalInfo")}
          >
            🎤
          </button>
          <input
            ref={c.inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("typeHere")}
            maxLength={200}
            lang={learnLang}
            aria-label={t("typeHere")}
          />
          <button type="submit" className="cs-button cs-button-primary" disabled={!draft.trim() || c.thinking}>
            {t("send")}
          </button>
        </form>

        <div className="rc-actions">
          <button type="button" className="rc-action rc-action--main" onClick={() => c.startConversation()}>
            💬 {t("startConversation")}
          </button>
          <button type="button" className="rc-action" onClick={c.talk}>🗣️ {t("talk")}</button>
          <button type="button" className={c.listening ? "rc-action listening" : "rc-action"} onClick={() => void c.listenToMe()}>
            👂 {t("listenToMe")}
          </button>
          <button type="button" className="rc-action" onClick={c.repeat}>🔁 {t("repeat")}</button>
          <button type="button" className="rc-action" onClick={c.help}>🛟 {t("helpMe")}</button>
          <button type="button" className="rc-action" onClick={c.teachWord}>📚 {t("teachWord")}</button>
          <button type="button" className="rc-voice" onClick={() => c.setVoiceOn(!c.voiceOn)} aria-pressed={c.voiceOn}>
            {c.voiceOn ? t("voiceOn") : t("voiceOff")}
          </button>
        </div>
      </div>
    </section>
  );
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
