import React, { useEffect, useRef, useState } from 'react';
import { LESSONS, MODULES } from '../data/lessons.js';
import { checkLesson, runCode } from '../lib/runner.js';
import { completeLesson, FIRST_TRY_BONUS } from '../lib/progress.js';
import { Inline } from './bits.jsx';

export default function LessonView({ user, lesson, onUpdateUser, onBack, onOpen }) {
  const done = !!user.progress.completed[lesson.id];
  const [code, setCode] = useState(user.progress.drafts[lesson.id] ?? lesson.starter);
  const [result, setResult] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [reward, setReward] = useState(null);
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const attempts = useRef(0);
  const usedHint = useRef(false);
  const saveTimer = useRef(null);

  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextL = LESSONS[idx + 1];
  const mod = MODULES.find((m) => m.id === lesson.module);

  // Autosave the draft shortly after the kid stops typing.
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdateUser((u) => ({ ...u, progress: { ...u.progress, drafts: { ...u.progress.drafts, [lesson.id]: code } } }));
    }, 600);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const run = async () => {
    setBusy(true);
    setVerdict(null);
    const res = await runCode(code);
    setResult(res);
    setBusy(false);
    return res;
  };

  const check = async () => {
    attempts.current += 1;
    const res = await run();
    const v = checkLesson(lesson, code, res);
    setVerdict(v);
    if (v.passed && !done && !reward) {
      const opts = { attempts: attempts.current, usedHint: usedHint.current };
      // completeLesson is pure: compute the reward for display, then apply it to saved state.
      const preview = completeLesson(user, lesson, opts);
      setReward({ gained: preview.gained, newBadges: preview.newBadges });
      onUpdateUser((u) => completeLesson(u, lesson, opts).user);
    }
  };

  const reset = () => {
    setCode(lesson.starter);
    setResult(null);
    setVerdict(null);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target;
      const { selectionStart: s, selectionEnd: en } = t;
      const next = code.slice(0, s) + '  ' + code.slice(en);
      setCode(next);
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; });
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      check();
    }
  };

  const showHint = () => {
    usedHint.current = true;
    setHint(true);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="btn ghost small" onClick={onBack}>← Missions</button>
        <div className="crumb" style={{ '--mod': mod.color }}>
          <span>{mod.emoji} {mod.title}</span>
          <span className="dot">•</span>
          <span>Mission {idx + 1} of {LESSONS.length}</span>
        </div>
        <span className="stat">⚡ {user.progress.xp} XP</span>
      </header>

      <main className="lesson">
        <aside className="panel guide">
          <h1><span aria-hidden>{lesson.emoji}</span> {lesson.title}</h1>
          <p className="story">{lesson.story}</p>
          <h3>Learn</h3>
          <ul className="learn">
            {lesson.learn.map((l, i) => (
              <li key={i}><Inline text={l} /></li>
            ))}
          </ul>
          <div className="task">
            <h3>🎯 Your mission</h3>
            <p>{lesson.task}</p>
            <p className="expected-label">Goal output</p>
            <pre className="goal">{lesson.expected.join('\n')}</pre>
          </div>
          {!hint ? (
            <button className="btn ghost small" onClick={showHint}>💡 Need a hint?</button>
          ) : (
            <div className="hint"><strong>Hint:</strong> <pre>{lesson.hint}</pre></div>
          )}
        </aside>

        <section className="panel workspace">
          <div className="editor-bar">
            <span>my-code.js</span>
            <button className="linkish" onClick={reset}>Start over</button>
          </div>
          <textarea
            className="editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Code editor"
          />
          <div className="actions">
            <button className="btn alt" onClick={run} disabled={busy}>▶ Run</button>
            <button className="btn" onClick={check} disabled={busy}>✔ Check my answer</button>
            <span className="fine">Ctrl/⌘ + Enter to check</span>
          </div>

          <div className="output" aria-live="polite">
            <div className="editor-bar"><span>Output</span></div>
            <pre>
              {result
                ? result.logs.length
                  ? result.logs.join('\n')
                  : result.ok ? '(nothing printed yet)' : ''
                : 'Press Run to see what your code does.'}
            </pre>
            {result && !result.ok && <p className="error">⚠️ {result.error}</p>}
          </div>

          {verdict && !verdict.passed && result?.ok !== false && (
            <p className="feedback bad">🤔 {verdict.message}</p>
          )}
          {verdict?.passed && (
            <div className="feedback good">
              <h2>🎉 Mission complete!</h2>
              {reward ? (
                <p>
                  You earned <strong>+{reward.gained} XP</strong>
                  {reward.gained > lesson.xp && ` (including +${FIRST_TRY_BONUS} first-try bonus)`}.
                </p>
              ) : (
                <p>{done ? 'Nice replay! You already earned XP here.' : 'Great job!'}</p>
              )}
              {reward?.newBadges?.length > 0 && (
                <ul className="new-badges">
                  {reward.newBadges.map((b) => (
                    <li key={b.id}>{b.emoji} New badge: <strong>{b.name}</strong></li>
                  ))}
                </ul>
              )}
              <div className="row">
                <button className="btn ghost" onClick={onBack}>All missions</button>
                {nextL && <button className="btn" onClick={() => onOpen(nextL.id)}>Next: {nextL.title} →</button>}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
