import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeWord, type Activity, type AttemptDiff, type Language, type Level, type Translated, type VocabItem } from "../storyEngine";
import { useSpeech } from "../useSpeech";
import { useSpeechRecognition, type ListenOutcome } from "../useSpeechRecognition";
import { createContext, extractName, replyLocally, startTopic, currentStep } from "./localConversation";
import { phrase } from "./robotPhrases";
import { askRobot, checkLiveAi, isLiveAiConfigured } from "./robotService";
import { topicById } from "./topics";
import type { AiMode, ChatMessage, ConversationContext, RobotMood, RobotState } from "./types";

type Options = {
  learnLang: Language;
  level: Level;
  /** Vocabulary for "Teach me a word" (from the current activity). */
  vocabulary: VocabItem[];
  /** Returns the next correct word of the sentence the child is building, if any. */
  sentenceHelp: () => string | null;
  /** Called whenever the child says or types something to Timmy (for progress). */
  onChildMessage?: () => void;
  /** Called when the child pronounces a practice word correctly. */
  onWordPractised?: () => void;
};

type AiError = { pendingText: string };

const RATE: Record<Level, number> = { beginner: 0.75, intermediate: 0.85, advanced: 0.95 };
const MAX_MESSAGES = 60;

let counter = 0;
const newId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

/**
 * Everything Timmy does: talking, listening, local conversation, live AI and
 * reacting to sentence activities. The conversation lives only in memory for
 * this session — nothing is saved.
 */
export function useRobotCompanion({ learnLang, level, vocabulary, sentenceHelp, onChildMessage, onWordPractised }: Options) {
  const callbacks = useRef({ onChildMessage, onWordPractised });
  callbacks.current = { onChildMessage, onWordPractised };
  const speech = useSpeech();
  const mic = useSpeechRecognition();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<RobotMood>("idle");
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [suggestions, setSuggestions] = useState<Translated[]>([]);
  const [aiMode, setAiMode] = useState<AiMode>(isLiveAiConfigured ? "checking" : "local");
  const [aiError, setAiError] = useState<AiError | null>(null);
  const [practiceWord, setPracticeWord] = useState<VocabItem | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const ctxRef = useRef<ConversationContext>(createContext(learnLang, level));
  const [topicId, setTopicId] = useState<string>("intro");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const wordIndex = useRef(0);
  const moodTimer = useRef<number | undefined>(undefined);
  const aiAbort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // Keep the conversation context in sync with language and level.
  useEffect(() => {
    ctxRef.current = { ...ctxRef.current, language: learnLang, level };
  }, [learnLang, level]);

  // Health check for live AI (only if a backend URL is configured).
  const connect = useCallback(() => {
    if (!isLiveAiConfigured) return () => undefined;
    const controller = new AbortController();
    setAiMode("checking");
    checkLiveAi(controller.signal).then((ok) => {
      if (!controller.signal.aborted) setAiMode(ok ? "live" : "unavailable");
    });
    return () => controller.abort();
  }, []);
  useEffect(() => connect(), [connect]);

  useEffect(
    () => () => {
      window.clearTimeout(moodTimer.current);
      aiAbort.current?.abort();
    },
    []
  );

  const flashMood = useCallback((next: RobotMood, ms = 2600) => {
    window.clearTimeout(moodTimer.current);
    setMood(next);
    if (next !== "idle") moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  }, []);

  const push = useCallback((items: ChatMessage[]) => {
    setMessages((current) => [...current, ...items].slice(-MAX_MESSAGES));
  }, []);

  /** Robot says one or more lines (local, translated) — shows bubbles and speaks them. */
  const say = useCallback(
    (lines: Translated[], nextMood: RobotMood = "idle") => {
      if (!lines.length) return;
      const language = ctxRef.current.language;
      push(
        lines.map((line) => ({
          id: newId(),
          role: "robot" as const,
          text: line[language],
          language,
          source: "local" as const,
          translations: line,
        }))
      );
      flashMood(nextMood);
      if (voiceOn) speech.speak(lines.map((line) => line[language]).join(" "), language, { rate: RATE[level] });
    },
    [push, flashMood, voiceOn, speech, level]
  );

  /** Robot line that came from the live AI (single language, no subtitle). */
  const sayAi = useCallback(
    (text: string) => {
      const language = ctxRef.current.language;
      push([{ id: newId(), role: "robot", text, language, source: "ai" }]);
      flashMood("happy", 1500);
      if (voiceOn) speech.speak(text, language, { rate: RATE[level] });
    },
    [push, flashMood, voiceOn, speech, level]
  );

  // When the learning language changes, Timmy switches too.
  // (Compare with the previous value, so React's dev-mode double effects don't trigger it.)
  const prevLang = useRef(learnLang);
  useEffect(() => {
    if (prevLang.current === learnLang) return;
    prevLang.current = learnLang;
    speech.stop();
    aiAbort.current?.abort();
    setThinking(false);
    setAiError(null);
    setPracticeWord(null);
    setSuggestions([]);
    setActiveTopic(null);
    ctxRef.current = { ...ctxRef.current, language: learnLang, topicId: null, step: 0, followUp: false };
    const line = phrase("switchLanguage")[learnLang];
    say([{ en: line, pt: line, es: line }], "happy");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to language changes
  }, [learnLang]);

  const applyReply = useCallback(
    (reply: ReturnType<typeof replyLocally>) => {
      ctxRef.current = reply.context;
      setActiveTopic(reply.context.topicId);
      setSuggestions(reply.suggestions);
      say(reply.lines, reply.mood);
    },
    [say]
  );

  const replyWithAi = useCallback(
    async (history: ChatMessage[], pendingText: string) => {
      aiAbort.current?.abort();
      const controller = new AbortController();
      aiAbort.current = controller;
      setThinking(true);
      setAiError(null);
      const ctx = ctxRef.current;
      try {
        const reply = await askRobot(
          {
            language: ctx.language,
            level: ctx.level,
            topic: topicById(ctx.topicId)?.name.en ?? null,
            childName: ctx.childName,
            messages: history.slice(-12).map((m) => ({ role: m.role, text: m.text })),
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        ctxRef.current = { ...ctxRef.current, followUp: false };
        setSuggestions([]);
        sayAi(reply);
      } catch {
        if (controller.signal.aborted) return;
        setAiError({ pendingText });
        flashMood("encouraging");
      } finally {
        if (aiAbort.current === controller) {
          aiAbort.current = null;
          setThinking(false);
        }
      }
    },
    [sayAi, flashMood]
  );

  /** Robot answers in practice mode, with a short "thinking" pause so it feels alive. */
  const replyOffline = useCallback(
    (text: string) => {
      setThinking(true);
      window.setTimeout(() => {
        setThinking(false);
        applyReply(replyLocally(ctxRef.current, text));
      }, 550);
    },
    [applyReply]
  );

  /** Pronunciation practice: compare what the child said with the word. */
  const checkPracticeWord = useCallback(
    (heard: string[], word: VocabItem) => {
      const language = ctxRef.current.language;
      const target = normalizeWord(word[language], language);
      const ok = heard.some((h) =>
        h.split(/\s+/).map((w) => normalizeWord(w, language)).includes(target) || normalizeWord(h, language) === target
      );
      if (ok) {
        callbacks.current.onWordPractised?.();
        setPracticeWord(null);
        setCelebrate((n) => n + 1);
        say([phrase("wordGood", { word: word[language] })], "happy");
      } else {
        say([phrase("wordAlmost", { word: word[language], heard: heard[0] ?? "" })], "encouraging");
      }
    },
    [say]
  );

  /** The child said or typed something. */
  const sendChild = useCallback(
    (raw: string, options: { spoken?: boolean; alternatives?: string[] } = {}) => {
      const text = raw.trim().slice(0, 200);
      if (!text) return;
      const language = ctxRef.current.language;
      const childMessage: ChatMessage = { id: newId(), role: "child", text, language, source: "child", spoken: options.spoken };
      const history = [...messagesRef.current, childMessage];
      push([childMessage]);
      setSuggestions([]);
      callbacks.current.onChildMessage?.();

      if (practiceWord) {
        checkPracticeWord(options.alternatives ?? [text], practiceWord);
        return;
      }
      // Remember the first name for this session only (used to greet the child).
      if (!ctxRef.current.childName) {
        const step = currentStep(ctxRef.current);
        const name = extractName(text, language, step?.expects !== "name");
        if (name && aiMode === "live") ctxRef.current = { ...ctxRef.current, childName: name };
      }
      if (aiMode === "live") void replyWithAi(history, text);
      else replyOffline(text);
    },
    [push, practiceWord, checkPracticeWord, aiMode, replyWithAi, replyOffline]
  );

  const handleOutcome = useCallback(
    (outcome: ListenOutcome) => {
      if (outcome.ok) {
        sendChild(outcome.transcript, { spoken: true, alternatives: outcome.alternatives });
        return;
      }
      // Be honest: say exactly why nothing was heard.
      if (outcome.reason === "aborted") return;
      if (outcome.reason === "denied") say([phrase("micDenied")], "encouraging");
      else if (outcome.reason === "no-mic") say([phrase("noMicFound")], "encouraging");
      else if (outcome.reason === "network") say([phrase("micOffline")], "encouraging");
      else if (outcome.reason === "insecure") say([phrase("micInsecure")], "encouraging");
      else if (outcome.reason === "no-speech") say([phrase("notHeard")], "encouraging");
      else if (outcome.reason === "unsupported") say([phrase("noMic")], "encouraging");
      else say([phrase("micError")], "encouraging");
      inputRef.current?.focus();
    },
    [sendChild, say]
  );

  // ───────── Buttons ─────────

  const listenToMe = useCallback(async () => {
    if (mic.listening) {
      mic.stop();
      return;
    }
    if (!mic.supported) {
      handleOutcome({ ok: false, reason: "unsupported" });
      return;
    }
    speech.stop(); // don't let Timmy hear himself
    handleOutcome(await mic.listen(ctxRef.current.language));
  }, [mic, speech, handleOutcome]);

  const talk = useCallback(() => {
    say([phrase("talkPrompt")], "happy");
    inputRef.current?.focus();
  }, [say]);

  const startConversation = useCallback(
    (id: string = topicId) => {
      aiAbort.current?.abort();
      setAiError(null);
      setPracticeWord(null);
      applyReply(startTopic(ctxRef.current, id));
    },
    [topicId, applyReply]
  );

  const repeat = useCallback(() => {
    const last = [...messagesRef.current].reverse().find((m) => m.role === "robot");
    if (!last) {
      say([phrase("nothingToRepeat")]);
      return;
    }
    // Repeat slowly so the child can copy the pronunciation.
    speech.speak(last.text, last.language, { rate: Math.max(0.6, RATE[level] - 0.15) });
  }, [say, speech, level]);

  const help = useCallback(() => {
    const language = ctxRef.current.language;
    if (practiceWord) {
      say([phrase("helpWord", { word: practiceWord[language] })], "encouraging");
      return;
    }
    const step = currentStep(ctxRef.current);
    if (step && !ctxRef.current.followUp) {
      say([phrase("helpAnswer", { example: step.example[language] })], "encouraging");
      setSuggestions([step.example]);
      return;
    }
    const nextWord = sentenceHelp();
    if (nextWord) say([phrase("helpNextWord", { word: nextWord })], "encouraging");
    else say([phrase("helpGeneral")], "encouraging");
  }, [practiceWord, say, sentenceHelp]);

  const teachWord = useCallback(() => {
    if (!vocabulary.length) return;
    const word = vocabulary[wordIndex.current % vocabulary.length];
    wordIndex.current += 1;
    const language = ctxRef.current.language;
    setPracticeWord(word);
    setSuggestions([]);
    say([phrase("teachWord", { word: word[language], emoji: word.emoji ?? "" })], "happy");
  }, [vocabulary, say]);

  const retryAi = useCallback(() => {
    if (!aiError) return;
    void replyWithAi(messagesRef.current, aiError.pendingText);
  }, [aiError, replyWithAi]);

  const switchToPractice = useCallback(() => {
    aiAbort.current?.abort();
    setAiMode("local");
    const pending = aiError?.pendingText;
    setAiError(null);
    // The AI was leading the chat, so continue as free chat instead of restarting the scripted topic.
    ctxRef.current = { ...ctxRef.current, topicId: null, step: 0, nudged: false };
    setActiveTopic(null);
    if (pending) replyOffline(pending);
  }, [aiError, replyOffline]);

  // ───────── Reactions to the sentence activity ─────────

  const celebrateActivity = useCallback(
    (activity: Activity, earnedStar: boolean) => {
      const name = ctxRef.current.childName;
      const praise = name ? phrase("praiseName", { name }) : phrase("praise");
      ctxRef.current = { ...ctxRef.current, followUp: true, topicId: null, step: 0 };
      setActiveTopic(null);
      setPracticeWord(null);
      if (earnedStar) setCelebrate((n) => n + 1);
      say([praise, activity.followUp], "happy");
    },
    [say]
  );

  const encourageActivity = useCallback(
    (activity: Activity, _diff: AttemptDiff) => {
      say([phrase("tryAgain"), activity.hint], "encouraging");
    },
    [say]
  );

  const explainActivity = useCallback(
    (activity: Activity) => {
      const language = ctxRef.current.language;
      say([phrase("explain", { sentence: activity.targets[language].sentence, explain: activity.explain[language] })], "encouraging");
    },
    [say]
  );

  const state: RobotState = mic.listening ? "listening" : thinking ? "thinking" : mood !== "idle" ? mood : speech.speaking ? "speaking" : "idle";

  return useMemo(
    () => ({
      // state
      state,
      speaking: speech.speaking,
      messages,
      suggestions,
      thinking,
      aiMode,
      aiError,
      voiceOn,
      practiceWord,
      celebrate,
      topicId,
      activeTopic,
      micSupported: mic.supported,
      listening: mic.listening,
      interim: mic.interim,
      inputRef,
      hasVoice: speech.hasVoice,
      // actions
      setTopicId,
      setVoiceOn: (on: boolean) => {
        if (!on) speech.stop();
        setVoiceOn(on);
      },
      sendChild,
      talk,
      listenToMe,
      repeat,
      help,
      teachWord,
      startConversation,
      retryAi,
      switchToPractice,
      reconnect: connect,
      speak: speech.speak,
      celebrateActivity,
      encourageActivity,
      explainActivity,
    }),
    [
      state, speech, messages, suggestions, thinking, aiMode, aiError, voiceOn, practiceWord, celebrate, topicId,
      activeTopic, mic.supported, mic.listening, mic.interim, sendChild, talk, listenToMe, repeat, help, teachWord,
      startConversation, retryAi, switchToPractice, connect, celebrateActivity, encourageActivity, explainActivity,
    ]
  );
}

export type RobotCompanion = ReturnType<typeof useRobotCompanion>;
