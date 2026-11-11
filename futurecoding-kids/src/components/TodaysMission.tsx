import { useState } from "react";
import { ArrowRight, Check, ChevronRight, Flame, Gamepad2, Globe2, Languages, Sparkles, Star, Trophy, X, Zap } from "lucide-react";
// @ts-expect-error CSS side-effect imports are handled by the bundler.
import "./TodaysMission.css";

export type MissionChallenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  xp: number;
  icon: "speak" | "play" | "explore";
  destination: string;
};

type Props = {
  childName?: string;
  onStartChallenge?: (challenge: MissionChallenge) => void;
  onProgressChange?: (completedIds: string[], xpEarned: number) => void;
  className?: string;
};

const challenges: MissionChallenge[] = [
  { id: "speak", title: "Say 3 new words", description: "Practice a mini conversation", category: "SPEAK & PRACTICE", xp: 30, icon: "speak", destination: "speak" },
  { id: "play", title: "Beat the word game", description: "Match words before time runs out", category: "PLAY & LEARN", xp: 20, icon: "play", destination: "play" },
  { id: "explore", title: "Visit a new place", description: "Discover a fun fact about a culture", category: "WORLD EXPLORER", xp: 25, icon: "explore", destination: "cultures" },
];

function ChallengeIcon({ kind }: { kind: MissionChallenge["icon"] }) {
  if (kind === "speak") return <Languages aria-hidden="true" />;
  if (kind === "play") return <Gamepad2 aria-hidden="true" />;
  return <Globe2 aria-hidden="true" />;
}

export default function TodaysMission({ childName = "Explorer", onStartChallenge, onProgressChange, className = "" }: Props) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [active, setActive] = useState<MissionChallenge | null>(null);
  const xp = challenges.reduce((sum, c) => sum + (completed.includes(c.id) ? c.xp : 0), 0);
  const progress = Math.round(completed.length / challenges.length * 100);
  const next = challenges.find(c => !completed.includes(c.id));

  const start = (challenge: MissionChallenge) => {
    setActive(challenge);
    onStartChallenge?.(challenge);
  };

  const complete = (challenge: MissionChallenge) => {
    const ids = completed.includes(challenge.id) ? completed : [...completed, challenge.id];
    setCompleted(ids);
    onProgressChange?.(ids, challenges.reduce((sum, c) => sum + (ids.includes(c.id) ? c.xp : 0), 0));
    setActive(null);
  };

  return (
    <section className={`fk-mission ${className}`} aria-labelledby="fk-mission-title">
      <span className="fk-mission__spark fk-mission__spark--one" aria-hidden="true">✦</span>
      <span className="fk-mission__spark fk-mission__spark--two" aria-hidden="true">✧</span>
      <div className="fk-mission__topline">
        <span className="fk-mission__eyebrow"><Sparkles size={15} /> TODAY'S MISSION</span>
        <span className="fk-mission__date"><Flame size={15} /> Little steps, big brain energy</span>
      </div>

      <div className="fk-mission__hero">
        <div className="fk-mission__copy">
          <p className="fk-mission__hello">HEY, {childName.toUpperCase()}! <span aria-hidden="true">👋</span></p>
          <h2 id="fk-mission-title">Ready to <span>level up?</span></h2>
          <p className="fk-mission__intro">Your next adventure is calling. Complete a challenge, collect XP, and keep your curiosity glowing.</p>
          <div className="fk-mission__hero-actions">
            <button className="fk-button fk-button--primary" onClick={() => next && start(next)} disabled={!next}>
              {next ? "Start my mission" : "Mission complete!"} {next ? <ArrowRight size={17} /> : <Check size={17} />}
            </button>
            <span className="fk-mission__tiny-note"><Star size={14} fill="currentColor" /> No pressure. Just progress.</span>
          </div>
        </div>

        <div className="fk-mission__mascot" aria-label="A cheerful space buddy">
          <div className="fk-mission__orbit" />
          <div className="fk-mission__planet">
            <i className="fk-mission__eye fk-mission__eye--left" />
            <i className="fk-mission__eye fk-mission__eye--right" />
            <i className="fk-mission__smile">⌣</i>
            <i className="fk-mission__blush fk-mission__blush--left" />
            <i className="fk-mission__blush fk-mission__blush--right" />
          </div>
          <span className="fk-mission__floating-star fk-mission__floating-star--a">✦</span>
          <span className="fk-mission__floating-star fk-mission__floating-star--b">✧</span>
          <span className="fk-mission__floating-star fk-mission__floating-star--c">✦</span>
          <div className="fk-mission__xp-bubble"><Zap size={14} fill="currentColor" /> +XP</div>
        </div>
      </div>

      <div className="fk-mission__bottom">
        <div className="fk-mission__progress-card">
          <div className="fk-mission__progress-heading">
            <div className="fk-mission__progress-icon"><Trophy size={19} /></div>
            <div className="fk-mission__progress-label"><strong>Your mission progress</strong><span>{completed.length} of {challenges.length} challenges complete</span></div>
            <b className="fk-mission__progress-percent">{progress}%</b>
          </div>
          <div className="fk-mission__progress-track" role="progressbar" aria-label="Mission progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="fk-mission__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="fk-mission__progress-footer">
            <span><Zap size={14} fill="currentColor" /> {xp} XP earned</span>
            <span>{completed.length === challenges.length ? "You did it! 🎉" : `${challenges.length - completed.length} more to go`}</span>
          </div>
        </div>

        <div className="fk-mission__challenge-list">
          {challenges.map((challenge, index) => {
            const done = completed.includes(challenge.id);
            return (
              <article key={challenge.id} className={`fk-challenge fk-challenge--${challenge.icon} ${done ? "is-complete" : ""}`} style={{ animationDelay: `${index * 90}ms` }}>
                <div className="fk-challenge__icon">{done ? <Check /> : <ChallengeIcon kind={challenge.icon} />}</div>
                <div className="fk-challenge__body">
                  <span className="fk-challenge__category">{challenge.category}</span>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.description}</p>
                </div>
                <div className="fk-challenge__actions">
                  <span className="fk-challenge__xp"><Star size={13} fill="currentColor" /> {done ? "Earned!" : `+${challenge.xp} XP`}</span>
                  <button className="fk-challenge__button" disabled={done} onClick={() => !done && start(challenge)} aria-label={done ? `${challenge.title} completed` : `Start ${challenge.title}`}>
                    {done ? <Check size={16} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="fk-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setActive(null); }}>
          <div className="fk-challenge-modal" role="dialog" aria-modal="true" aria-labelledby="fk-modal-title">
            <button className="fk-challenge-modal__close" onClick={() => setActive(null)} aria-label="Close challenge"><X size={19} /></button>
            <div className={`fk-challenge-modal__icon fk-challenge-modal__icon--${active.icon}`}><ChallengeIcon kind={active.icon} /></div>
            <span className="fk-challenge__category">{active.category}</span>
            <h3 id="fk-modal-title">{active.title}</h3>
            <p>{active.description}. Ready to give it a try?</p>
            <div className="fk-challenge-modal__reward"><Star size={17} fill="currentColor" /> Earn {active.xp} XP for completing this challenge.</div>
            <div className="fk-challenge-modal__actions">
              <button className="fk-button fk-button--quiet" onClick={() => setActive(null)}>Maybe later</button>
              <button className="fk-button fk-button--primary" onClick={() => complete(active)}>Mark complete <Check size={17} /></button>
            </div>
            <p className="fk-challenge-modal__hint">Demo interaction: connect this button to real activity completion when your learning screens are ready.</p>
          </div>
        </div>
      )}
    </section>
  );
}
