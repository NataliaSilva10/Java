import React from 'react';

// Turns `code` spans into <code> elements.
export function Inline({ text }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <code key={i}>{p}</code> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </>
  );
}

export function XpBar({ xp, level, into, size = 'md' }) {
  return (
    <div className={`xpbar ${size}`} aria-label={`Level ${level}, ${into} of 100 XP`}>
      <span className="xp-level">Lv {level}</span>
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${into}%` }} />
      </div>
      <span className="xp-num">{into}/100</span>
    </div>
  );
}
