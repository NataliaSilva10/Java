import React from 'react';
import { LESSONS, MODULES, lessonsInModule } from '../data/lessons.js';
import { BADGES, completeAllLessons, levelFor, lessonStatus, nextLesson, xpIntoLevel } from '../lib/progress.js';
import { XpBar } from './bits.jsx';

export default function Dashboard({ user, onOpen, onLogout, onUpdateUser }) {
  const passAll = () => {
    if (window.confirm('Pass all 10 missions for this explorer? This unlocks everything and adds the XP and badges.')) {
      onUpdateUser(completeAllLessons);
    }
  };
  const p = user.progress;
  const doneCount = Object.keys(p.completed).length;
  const pct = Math.round((doneCount / LESSONS.length) * 100);
  const next = nextLesson(p);
  const streakLive = p.lastDay && p.streak > 0;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="who">
          <span className="avatar">{user.avatar}</span>
          <div>
            <strong>{user.name}</strong>
            <XpBar xp={p.xp} level={levelFor(p.xp)} into={xpIntoLevel(p.xp)} size="sm" />
          </div>
        </div>
        <div className="stats">
          <span className="stat" title="Total XP">⚡ {p.xp} XP</span>
          <span className="stat" title="Day streak">🔥 {streakLive ? p.streak : 0} day{p.streak === 1 ? '' : 's'}</span>
          <button className="btn ghost small" onClick={onLogout}>Switch</button>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <h1>{doneCount === 0 ? `Welcome, ${user.name}!` : doneCount === LESSONS.length ? `You did it, ${user.name}!` : `Welcome back, ${user.name}!`}</h1>
            <p>
              {next
                ? `Next mission: ${next.emoji} ${next.title}`
                : 'You finished every mission. You are a certified coder!'}
            </p>
            {next && (
              <button className="btn big" onClick={() => onOpen(next.id)}>
                {doneCount === 0 ? 'Start your first mission' : 'Continue'}
              </button>
            )}
          </div>
          <div className="progress-ring" role="img" aria-label={`${pct}% complete`}>
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" className="ring-bg" />
              <circle cx="18" cy="18" r="15.9" className="ring-fg" strokeDasharray={`${pct} 100`} />
            </svg>
            <span>{pct}%</span>
          </div>
        </section>

        <section>
          <h2>Badges</h2>
          <ul className="badges">
            {BADGES.map((b) => {
              const has = p.badges.includes(b.id);
              return (
                <li key={b.id} className={`badge ${has ? 'on' : ''}`} title={b.desc}>
                  <span className="badge-emoji">{has ? b.emoji : '🔒'}</span>
                  <strong>{b.name}</strong>
                  <small>{b.desc}</small>
                </li>
              );
            })}
          </ul>
        </section>

        {MODULES.map((m) => {
          const ls = lessonsInModule(m.id);
          const done = ls.filter((l) => p.completed[l.id]).length;
          return (
            <section key={m.id} className="module" style={{ '--mod': m.color }}>
              <div className="module-head">
                <span className="module-emoji">{m.emoji}</span>
                <div>
                  <h2>{m.title}</h2>
                  <p>{m.blurb}</p>
                </div>
                <span className="module-count">{done}/{ls.length}</span>
              </div>
              <div className="lessons">
                {ls.map((l) => {
                  const idx = LESSONS.findIndex((x) => x.id === l.id);
                  const status = lessonStatus(p, idx);
                  return (
                    <button
                      key={l.id}
                      className={`lesson-card ${status}`}
                      disabled={status === 'locked'}
                      onClick={() => onOpen(l.id)}
                    >
                      <span className="lesson-emoji">{status === 'locked' ? '🔒' : l.emoji}</span>
                      <span className="lesson-title">{l.title}</span>
                      <span className="lesson-meta">
                        {status === 'done' ? '✅ Done' : status === 'open' ? `+${l.xp} XP` : 'Locked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        <section id="welcome">
  {/* Welcome hero */}
</section>

<section id="todays-mission">
  {/* Challenges and XP */}
</section>

<section id="adventures">
  {/* Learning activities */}
</section>

<section id="learning-universe">
  {/* Levels and checkpoints */}
</section>

<section id="creative-playground">
  {/* Stories and AI activities */}
</section>

<section id="achievements">
  {/* Badges and progress */}
</section>

        <section className="teacher-tools">
          <h3>Teacher tools</h3>
          <button className="btn alt" onClick={passAll} disabled={doneCount === LESSONS.length}>
            {doneCount === LESSONS.length ? '✅ All missions passed' : '⏩ Pass all missions & unlock everything'}
          </button>
        </section>
      </main>
    </div>
  );
}
