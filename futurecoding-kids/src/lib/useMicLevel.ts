import { useEffect, useState } from "react";

/**
 * Live microphone loudness (0–1) while `active` is true, so children can SEE that
 * Timmy hears them. Audio is analysed in the browser only — never recorded or sent.
 */
export function useMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!active || !navigator.mediaDevices?.getUserMedia) {
      setLevel(0);
      return;
    }
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let frame = 0;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        ctx = new AudioContext();
        // Some browsers start audio "suspended" until resumed after a tap.
        void ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let peak = 0;
          for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
          setLevel(Math.min(1, peak / 50));
          frame = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => setLevel(0)); // the speech recogniser reports permission problems itself

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
      setLevel(0);
    };
  }, [active]);

  return level;
}

export type MicCheck = { id: string; label: string; ok: boolean; help?: string };

/** Step-by-step microphone check for the Parent area. */
export async function checkMicrophone(): Promise<MicCheck[]> {
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  const results: MicCheck[] = [
    {
      id: "browser",
      label: "Browser can understand speech",
      ok: Boolean(w.SpeechRecognition || w.webkitSpeechRecognition),
      help: "Use Google Chrome or Microsoft Edge (Firefox can't do speech recognition). Typing always works.",
    },
    {
      id: "secure",
      label: "Page is secure (localhost or https)",
      ok: window.isSecureContext,
      help: "Open the app at http://localhost:5173 (from npm run dev) or an https address.",
    },
    {
      id: "online",
      label: "Internet connection",
      ok: navigator.onLine,
      help: "Chrome and Edge send speech to an online service to understand it, so Timmy needs internet to hear.",
    },
  ];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    results.push({ id: "mic", label: "Microphone found and allowed", ok: true });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    results.push({
      id: "mic",
      label: "Microphone found and allowed",
      ok: false,
      help:
        name === "NotAllowedError"
          ? "The microphone is blocked. Click the 🔒 / 🎤 icon in the address bar and choose Allow, then reload."
          : name === "NotFoundError"
            ? "No microphone was found. Plug one in (or check Windows Settings → Privacy → Microphone)."
            : "The microphone couldn't start. Close other apps using it (Zoom, Teams…) and try again.",
    });
  }
  return results;
}
