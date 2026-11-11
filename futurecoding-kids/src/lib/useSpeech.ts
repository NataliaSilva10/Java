import { useCallback, useEffect, useRef, useState } from "react";
import { locale, type Language } from "./storyEngine";

/**
 * Text-to-speech that picks a real voice for each language.
 *
 * - Voices load asynchronously in Chrome/Safari; we listen for `voiceschanged`.
 * - We choose a matching voice (en-US, es-ES, pt-BR first) instead of letting the
 *   browser read Portuguese with an English voice.
 * - Emojis are removed before speaking (otherwise the browser reads "star emoji").
 * - `speaking` lets the robot animate its mouth while talking.
 */
const PREFERRED: Record<Language, string[]> = {
  en: ["en-US", "en-GB", "en"],
  pt: ["pt-BR", "pt-PT", "pt"],
  es: ["es-ES", "es-MX", "es-US", "es"],
};

function findVoice(voices: SpeechSynthesisVoice[], language: Language) {
  const normalized = voices.map((voice) => ({ voice, tag: voice.lang.replace("_", "-").toLowerCase() }));
  for (const wanted of PREFERRED[language]) {
    const w = wanted.toLowerCase();
    const matches = normalized.filter(({ tag }) => tag === w || (w.length === 2 && tag.startsWith(`${w}-`)));
    if (matches.length) {
      const best = matches.find(({ voice }) => /natural|google|premium|enhanced/i.test(voice.name)) ?? matches[0];
      return best.voice;
    }
  }
  return undefined;
}

export function cleanForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|️|‍|[⃣]/gu, "")
    .replace(/[“”"«»]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type SpeakOptions = { rate?: number; onEnd?: () => void };

export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const current = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const hasVoice = useCallback(
    (language: Language) => !supported || voices.length === 0 || Boolean(findVoice(voices, language)),
    [supported, voices]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    current.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, language: Language, options: SpeakOptions = {}) => {
      const spoken = cleanForSpeech(text);
      if (!supported || !spoken) {
        options.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = locale(language);
      const voice = findVoice(voices, language);
      if (voice) utterance.voice = voice;
      utterance.rate = options.rate ?? 0.85;
      const finish = () => {
        // Ignore events from an utterance that was replaced by a newer one.
        if (current.current !== utterance) return;
        current.current = null;
        setSpeaking(false);
        options.onEnd?.();
      };
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = finish;
      utterance.onerror = finish;
      current.current = utterance;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, voices]
  );

  return { supported, speak, stop, speaking, hasVoice };
}
