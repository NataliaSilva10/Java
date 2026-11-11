import "./Robot.css";
import type { RobotState } from "./types";

type RobotProps = {
  state: RobotState;
  /** Mouth moves while the voice is playing, even when Timmy is also happy. */
  speaking?: boolean;
  /** Accessible label, e.g. "Timmy is listening". */
  label: string;
  size?: number;
};

// Same palette as Timmy's robot in the Play & Learn game.
const MINT = "#B8E9E0";
const TEAL = "#3C9E92";
const LAVENDER = "#C8BDF9";
const PURPLE = "#7968CF";
const BLUE = "#5C9DE8";
const PINK = "#FFB4C8";
const YELLOW = "#FFD78C";

/**
 * Timmy, the FutureKids robot, as an animated SVG.
 * States: idle · speaking · listening · thinking · happy · encouraging.
 */
export default function Robot({ state, speaking = false, label, size = 220 }: RobotProps) {
  const happy = state === "happy";
  const thinking = state === "thinking";
  const listening = state === "listening";
  const encouraging = state === "encouraging";
  const talking = speaking || state === "speaking";

  return (
    <div
      className={`tbot tbot--${state}${talking ? " tbot--talking" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 200 210" width="100%" height="100%" aria-hidden="true">
        <ellipse className="tbot-shadow" cx="100" cy="200" rx="50" ry="7" />

        <g className="tbot-body">
          {/* antenna */}
          <line x1="100" y1="36" x2="100" y2="18" stroke={PURPLE} strokeWidth="5" strokeLinecap="round" />
          <circle className="tbot-antenna-bulb" cx="100" cy="12" r="9" fill={PINK} stroke="#D76C91" strokeWidth="3" />

          {/* ears – glow while listening */}
          <rect className="tbot-ear" x="28" y="62" width="14" height="30" rx="7" stroke={TEAL} strokeWidth="3" />
          <rect className="tbot-ear" x="158" y="62" width="14" height="30" rx="7" stroke={TEAL} strokeWidth="3" />
          {listening && (
            <g className="tbot-waves" fill="none" stroke="#4caf7a" strokeWidth="3" strokeLinecap="round">
              <path d="M16 66 q-8 11 0 22" />
              <path d="M8 60 q-12 17 0 34" />
              <path d="M184 66 q8 11 0 22" />
              <path d="M192 60 q12 17 0 34" />
            </g>
          )}

          {/* head */}
          <g className="tbot-head">
            <rect x="40" y="36" width="120" height="96" rx="28" fill={MINT} stroke={TEAL} strokeWidth="3" />
            <rect x="54" y="52" width="92" height="56" rx="18" fill="#FFFFFF" />

            <g className={thinking ? "tbot-eyes tbot-eyes--up" : "tbot-eyes"}>
              {happy ? (
                <g fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round">
                  <path d="M70 80 q9 -11 18 0" />
                  <path d="M112 80 q9 -11 18 0" />
                </g>
              ) : (
                <g className="tbot-blink">
                  <circle cx="79" cy="77" r={encouraging ? 8 : 9} fill={BLUE} />
                  <circle cx="121" cy="77" r={encouraging ? 8 : 9} fill={BLUE} />
                  <circle cx="82" cy="73" r="3" fill="#fff" />
                  <circle cx="124" cy="73" r="3" fill="#fff" />
                </g>
              )}
            </g>

            <circle cx="64" cy="98" r="6" fill="#FF9FBC" opacity={happy || encouraging ? 0.8 : 0.4} />
            <circle cx="136" cy="98" r="6" fill="#FF9FBC" opacity={happy || encouraging ? 0.8 : 0.4} />

            {talking ? (
              <ellipse className="tbot-mouth-talk" cx="100" cy="97" rx="10" ry="6" fill={TEAL} />
            ) : happy ? (
              <path d="M86 92 q14 15 28 0 z" fill={TEAL} />
            ) : thinking ? (
              <path d="M91 98 h18" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
            ) : (
              <path d="M88 94 q12 9 24 0" fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
            )}
          </g>

          {/* body */}
          <rect x="62" y="136" width="76" height="52" rx="18" fill={LAVENDER} stroke={PURPLE} strokeWidth="3" />
          <rect x="74" y="146" width="52" height="30" rx="10" fill="#F8F7FF" />
          <path
            className="tbot-heart"
            d="M100 170 l-10 -10 a6 6 0 0 1 10 -8 a6 6 0 0 1 10 8 z"
            fill={happy || encouraging ? "#FF7FA3" : PURPLE}
            opacity={happy || encouraging ? 1 : 0.55}
          />

          {/* arms + hands */}
          <g className="tbot-arm tbot-arm--left">
            <path d="M64 148 L42 164" stroke={PURPLE} strokeWidth="8" strokeLinecap="round" />
            <circle cx="38" cy="167" r="9" fill={YELLOW} stroke="#D99A37" strokeWidth="3" />
          </g>
          <g className="tbot-arm tbot-arm--right">
            <path d="M136 148 L158 164" stroke={PURPLE} strokeWidth="8" strokeLinecap="round" />
            <circle cx="162" cy="167" r="9" fill={YELLOW} stroke="#D99A37" strokeWidth="3" />
          </g>
        </g>

        {thinking && (
          <g className="tbot-thought" fill={LAVENDER}>
            <circle cx="164" cy="34" r="4" />
            <circle cx="176" cy="23" r="5" />
            <circle cx="189" cy="12" r="6" />
          </g>
        )}
        {happy && (
          <g className="tbot-sparkles" fill="#FFC94D">
            <path d="M20 34 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" />
            <path d="M180 120 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3z" />
          </g>
        )}
      </svg>
    </div>
  );
}
