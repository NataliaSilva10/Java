import { useMemo } from "react";

const COLORS = ["#ffd34d", "#ff9fbc", "#a9d8ff", "#b9ecd0", "#cdbdff", "#ffc9b0"];
const SHAPES = ["★", "●", "■", "▲", "✦"];

/** Confetti burst. Re-mount it (change `key`) to play again. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() - 0.5) * 720,
        size: 10 + Math.random() * 12,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[i % SHAPES.length],
      })),
    [pieces]
  );
  return (
    <div className="plg-confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            color: b.color,
            fontSize: b.size,
            animationDelay: `${b.delay}s`,
            ["--drift" as string]: `${b.drift}px`,
            ["--spin" as string]: `${b.spin}deg`,
          }}
        >
          {b.shape}
        </span>
      ))}
    </div>
  );
}

/** "+3 ⭐" that floats up from the star counter. */
export function StarPop({ amount }: { amount: number }) {
  return (
    <span className="plg-star-pop" aria-hidden="true">
      +{amount} ⭐
    </span>
  );
}
