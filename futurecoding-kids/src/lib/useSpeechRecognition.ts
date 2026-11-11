import { useCallback, useEffect, useRef, useState } from "react";
import { locale, type Language } from "./storyEngine";

// The Web Speech recognition API isn't in TypeScript's DOM types yet, so we
// describe just the parts we use.
type RecognitionAlternative = { transcript: string; confidence: number };
type RecognitionResult = { isFinal: boolean; length: number; [index: number]: RecognitionAlternative };
type RecognitionEvent = { resultIndex: number; results: { length: number; [index: number]: RecognitionResult } };
type RecognitionErrorEvent = { error: string };
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function getRecognition(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Why nothing was heard:
 * unsupported (browser can't), insecure (page not on https/localhost), denied (mic permission),
 * no-mic (no microphone found), network (Chrome/Edge send audio to an online service), no-speech, aborted, error.
 */
export type ListenFailure = "unsupported" | "insecure" | "denied" | "no-mic" | "network" | "no-speech" | "aborted" | "error";

/** What the child said — or why nothing was heard. We never invent a transcript. */
export type ListenOutcome =
  | { ok: true; transcript: string; alternatives: string[] }
  | { ok: false; reason: ListenFailure };

/**
 * Microphone input via the browser's SpeechRecognition (Chrome, Edge, Safari).
 * Audio is processed by the browser; this app doesn't record or store it.
 */
export function useSpeechRecognition() {
  const Ctor = getRecognition();
  const supported = Ctor !== null;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const active = useRef<Recognition | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  const stop = useCallback(() => active.current?.stop(), []);

  const listen = useCallback(
    (language: Language): Promise<ListenOutcome> => {
      if (!Ctor) return Promise.resolve({ ok: false, reason: "unsupported" });
      if (typeof window !== "undefined" && window.isSecureContext === false) return Promise.resolve({ ok: false, reason: "insecure" });
      active.current?.abort();
      return new Promise<ListenOutcome>((resolve) => {
        const recognition = new Ctor();
        recognition.lang = locale(language);
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 3;
        let finalText = "";
        let alternatives: string[] = [];
        let failure: ListenFailure | null = null;
        // Safety net: some browsers never fire "end" if the mic hangs.
        const watchdog = window.setTimeout(() => recognition.stop(), 15000);

        recognition.onresult = (event) => {
          let partial = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript;
              alternatives = Array.from({ length: result.length }, (_, k) => result[k].transcript.trim());
            } else partial += result[0].transcript;
          }
          setInterim((finalText + " " + partial).trim());
        };
        recognition.onerror = (event) => {
          failure =
            event.error === "not-allowed" || event.error === "service-not-allowed"
              ? "denied"
              : event.error === "audio-capture"
                ? "no-mic"
                : event.error === "network"
                  ? "network"
                  : event.error === "no-speech"
                    ? "no-speech"
                    : event.error === "aborted"
                      ? "aborted"
                      : "error";
        };
        recognition.onend = () => {
          window.clearTimeout(watchdog);
          if (active.current === recognition) active.current = null;
          setListening(false);
          setInterim("");
          const transcript = finalText.trim();
          if (transcript) resolve({ ok: true, transcript, alternatives: alternatives.length ? alternatives : [transcript] });
          else resolve({ ok: false, reason: failure ?? "no-speech" });
        };

        active.current = recognition;
        setInterim("");
        setListening(true);
        try {
          recognition.start();
        } catch {
          window.clearTimeout(watchdog);
          active.current = null;
          setListening(false);
          resolve({ ok: false, reason: "error" });
        }
      });
    },
    [Ctor]
  );

  return { supported, listening, interim, listen, stop };
}
