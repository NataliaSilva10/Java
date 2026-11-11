import { useEffect, useState, type FormEvent } from "react";
import { ChevronRight, Flame, Pencil, Star, Trophy, Volume2 } from "lucide-react";
import "./home.css";
import Robot from "../robot/Robot";
import type { RobotState } from "../robot/types";
import { useSpeech } from "../useSpeech";
import type { Language } from "../storyEngine";
import {
  ACHIEVEMENTS,
  CHALLENGES,
  DAILY_BONUS,
  XP_PER_LEVEL,
  dayKey,
  recommend,
  useLearner,
  type SectionId,
} from "../learner/learnerStore";

type Props = {
  language: Language;
  onNavigate: (section: SectionId) => void;
};

const HELLO: Record<Language, string> = { en: "Hello!", es: "¡Hola!", pt: "Olá!" };

const SECTIONS: { id: SectionId; emoji: string; title: string; category: string; description: string; color: string }[] = [
  { id: "speak", emoji: "💬", title: "Speak & Practice", category: "SPEAKING", description: "Chat and practise with Timmy.", color: "mint" },
  { id: "play", emoji: "🧩", title: "Play & Learn", category: "MINI GAMES", description: "Letters, words and fun games.", color: "lavender" },
  { id: "stories", emoji: "📖", title: "Create Stories", category: "IMAGINATION", description: "Write and illustrate stories.", color: "pink" },
  { id: "cultures", emoji: "🌍", title: "Discover Cultures", category: "WORLD EXPLORER", description: "Travel the world on the map.", color: "blue" },
];

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

/** Last 7 days, oldest first, for the streak dots. */
function lastWeek(): { key: string; label: string }[] {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ key: dayKey(d), label: d.toLocaleDateString("en-US", { weekday: "narrow" }) });
  }
  return out;
}

/** Personalized home: Timmy's welcome, daily goals, progress, streak and recommendations. */
export default function HomeDashboard({ language, onNavigate }: Props) {
  const { state, level, levelProgress, streak, setNickname } = useLearner();
  const speech = useSpeech();
  const [editing, setEditing] = useState(!state.nickname);
  const [draft, setDraft] = useState(state.nickname);
  const [mood, setMood] = useState<RobotState>("happy");
  const pick = recommend(state);
  const picked = SECTIONS.find((s) => s.id === pick.section);
  const name = state.nickname || "explorer";

  useEffect(() => {
    const t = window.setTimeout(() => setMood("idle"), 2500);
    return () => window.clearTimeout(t);
  }, []);

  const welcome =
    streak > 1
      ? `${greeting()}, ${name}! You're on a ${streak}-day streak! 🔥`
      : state.xp === 0
        ? `${HELLO[language]} I'm Timmy, your learning buddy! Let's start our first adventure, ${name}!`
        : `${greeting()}, ${name}! I'm so happy to see you!`;

  const sayHello = () => {
    setMood("happy");
    speech.speak(`${HELLO[language]} ${state.nickname}`, language, { rate: 0.9, onEnd: () => setMood("idle") });
  };

  const saveName = (event: FormEvent) => {
    event.preventDefault();
    setNickname(draft);
    setEditing(false);
    setMood("happy");
  };

  const goals = state.daily.ids.map((id) => CHALLENGES.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const goalsDone = goals.filter((g) => (state.daily.progress[g.id] ?? 0) >= g.target).length;
  const week = lastWeek();
  const robotState: RobotState = speech.speaking ? "speaking" : mood;

  return (
    <div className="home">
      {/* ── Welcome ── */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <img className="home-logo" src="/brand/futurekids-logo-small.png" alt="FutureKids – Born to create the future" />
          <div className="home-bubble" key={welcome} aria-live="polite">
            {welcome}
          </div>
          {editing ? (
            <form className="home-name-form" onSubmit={saveName}>
              <label htmlFor="nickname">What should Timmy call you?</label>
              <div>
                <input id="nickname" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={20} placeholder="Your first name or nickname" autoComplete="off" />
                <button type="submit" className="home-btn home-btn-primary" disabled={!draft.trim()}>
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="home-hero-actions">
              <button type="button" className="home-btn home-btn-primary home-btn-big" onClick={() => onNavigate(pick.section)}>
                {picked?.emoji} {pick.reason} <ChevronRight size={18} />
              </button>
              <button type="button" className="home-btn" onClick={sayHello}>
                <Volume2 size={17} /> Say hello
              </button>
              <button type="button" className="home-btn home-btn-ghost" onClick={() => setEditing(true)}>
                <Pencil size={15} /> Change name
              </button>
            </div>
          )}
        </div>
        <div className="home-timmy">
          <Robot state={robotState} speaking={speech.speaking} label="Timmy waving hello" size={200} />
        </div>
      </section>

      {/* ── Progress ── */}
      <section className="home-stats" aria-label="My progress">
        <div className="home-stat home-stat--yellow">
          <Star size={22} fill="currentColor" />
          <div>
            <strong>{state.stars}</strong>
            <span>stars</span>
          </div>
        </div>
        <div className="home-stat home-stat--lavender">
          <Trophy size={22} />
          <div className="home-stat-grow">
            <strong>Level {level}</strong>
            <div className="home-bar" role="progressbar" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={state.xp % XP_PER_LEVEL}>
              <span style={{ width: `${levelProgress}%` }} />
            </div>
            <span>
              {state.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
            </span>
          </div>
        </div>
        <div className="home-stat home-stat--peach">
          <Flame size={22} />
          <div>
            <strong>{streak} day{streak === 1 ? "" : "s"}</strong>
            <div className="home-week" aria-label="This week">
              {week.map((d) => (
                <span key={d.key} className={state.activeDays.includes(d.key) ? "on" : ""} title={d.key}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="home-stat home-stat--blue">
          <span className="home-stat-emoji">📚</span>
          <div>
            <strong>{state.words}</strong>
            <span>words practised</span>
          </div>
        </div>
      </section>

      <div className="home-columns">
        {/* ── Daily goals ── */}
        <section className="home-card home-goals">
          <div className="home-card-head">
            <h2>🎯 Today's goals</h2>
            <span className="home-chip">
              {goalsDone}/{goals.length} · +{DAILY_BONUS} ⭐ bonus
            </span>
          </div>
          <ul>
            {goals.map((goal) => {
              const value = state.daily.progress[goal.id] ?? 0;
              const done = value >= goal.target;
              return (
                <li key={goal.id} className={done ? "done" : ""}>
                  <span className="home-goal-emoji">{done ? "✅" : goal.emoji}</span>
                  <div className="home-goal-body">
                    <strong>{goal.title}</strong>
                    <div className="home-bar">
                      <span style={{ width: `${(value / goal.target) * 100}%` }} />
                    </div>
                    <small>
                      {value} / {goal.target}
                    </small>
                  </div>
                  {!done && (
                    <button type="button" className="home-btn" onClick={() => onNavigate(goal.section)}>
                      Go <ChevronRight size={15} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {state.daily.bonusClaimed && <p className="home-goals-done">🏅 All done today — you earned +{DAILY_BONUS} bonus stars!</p>}
        </section>

        {/* ── Achievements ── */}
        <section className="home-card home-achievements">
          <div className="home-card-head">
            <h2>🏆 Achievements</h2>
            <span className="home-chip">
              {state.achievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="home-badges">
            {ACHIEVEMENTS.map((a) => {
              const earned = state.achievements.includes(a.id);
              return (
                <div key={a.id} className={earned ? "home-badge earned" : "home-badge"} title={a.description}>
                  <span>{earned ? a.emoji : "🔒"}</span>
                  <strong>{a.name}</strong>
                  <small>{a.description}</small>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Adventures ── */}
      <section className="home-adventures">
        <h2>
          Pick your adventure <span aria-hidden="true">✨</span>
        </h2>
        <div className="home-adventure-grid">
          {SECTIONS.map((s) => (
            <button type="button" key={s.id} className={`home-adventure home-adventure--${s.color}`} onClick={() => onNavigate(s.id)}>
              {s.id === pick.section && <span className="home-recommended">⭐ Timmy recommends</span>}
              <span className="home-adventure-emoji" aria-hidden="true">{s.emoji}</span>
              <small>{s.category}</small>
              <strong>{s.title}</strong>
              <p>{s.description}</p>
              <span className="home-adventure-meta">
                {state.visits[s.id] > 0 ? `Visited ${state.visits[s.id]}×` : "New!"} <ChevronRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
