// Tiny sound effects made with the Web Audio API — no audio files, no dependencies.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export const sfx = {
  /** Bubbly pop when a letter is tapped. */
  pop: () => {
    tone(520, 0, 0.12, "triangle");
    tone(880, 0.05, 0.1, "sine", 0.08);
  },
  /** Soft click when a tile is placed. */
  tap: () => tone(660, 0, 0.07, "triangle", 0.08),
  /** Happy little arpeggio for correct answers. */
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle", 0.11)),
  /** Gentle, not scary, "try again" sound. */
  soft: () => {
    tone(392, 0, 0.16, "sine", 0.08);
    tone(330, 0.12, 0.2, "sine", 0.07);
  },
  /** Big fanfare for badges and finished challenges. */
  fanfare: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, "triangle", 0.12)),
};
