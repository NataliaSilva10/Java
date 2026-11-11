import { LESSONS, lessonsInModule } from '../data/lessons.js';
import { todayKey, yesterdayKey } from './storage.js';

export const LEVEL_XP = 100;
export const levelFor = (xp) => Math.floor(xp / LEVEL_XP) + 1;
export const xpIntoLevel = (xp) => xp % LEVEL_XP;
export const FIRST_TRY_BONUS = 5;

export const BADGES = [
  { id: 'first-steps', emoji: '👣', name: 'First Steps', desc: 'Finish your first lesson' },
  { id: 'bullseye', emoji: '🎯', name: 'Bullseye', desc: 'Pass a lesson on the first try with no hint' },
  { id: 'on-fire', emoji: '🔥', name: 'On Fire', desc: 'Code 3 days in a row' },
  { id: 'loop-master', emoji: '🔁', name: 'Loop Master', desc: 'Finish every loop lesson' },
  { id: 'halfway', emoji: '⛰️', name: 'Halfway There', desc: 'Finish half of all lessons' },
  { id: 'graduate', emoji: '🎓', name: 'Code Graduate', desc: 'Finish every lesson' },
];

export function earnedBadges(p) {
  const done = Object.keys(p.completed);
  const loops = lessonsInModule('loops');
  const ids = [];
  if (done.length >= 1) ids.push('first-steps');
  if (Object.values(p.completed).some((c) => c.attempts === 1 && !c.usedHint)) ids.push('bullseye');
  if ((p.streak || 0) >= 3) ids.push('on-fire');
  if (loops.length && loops.every((l) => p.completed[l.id])) ids.push('loop-master');
  if (done.length >= Math.ceil(LESSONS.length / 2)) ids.push('halfway');
  if (done.length === LESSONS.length) ids.push('graduate');
  return ids;
}

export function lessonStatus(progress, index) {
  const lesson = LESSONS[index];
  if (progress.completed[lesson.id]) return 'done';
  if (index === 0 || progress.completed[LESSONS[index - 1].id]) return 'open';
  return 'locked';
}

export function nextLesson(progress) {
  return LESSONS.find((_, i) => lessonStatus(progress, i) === 'open') || null;
}

// Teacher shortcut: marks every mission as passed (no first-try bonus) and awards XP and badges.
export function completeAllLessons(user) {
  let u = user;
  for (const lesson of LESSONS) {
    u = completeLesson(u, lesson, { attempts: 2, usedHint: true }).user;
  }
  return u;
}

// Returns { user, gained, newBadges }. Re-passing a finished lesson earns nothing.
export function completeLesson(user, lesson, { attempts, usedHint }) {
  const p = user.progress;
  if (p.completed[lesson.id]) return { user, gained: 0, newBadges: [] };

  const today = todayKey();
  let streak = 1;
  if (p.lastDay === today) streak = p.streak || 1;
  else if (p.lastDay === yesterdayKey()) streak = (p.streak || 0) + 1;

  const gained = lesson.xp + (attempts === 1 && !usedHint ? FIRST_TRY_BONUS : 0);
  const progress = {
    ...p,
    xp: p.xp + gained,
    streak,
    lastDay: today,
    completed: { ...p.completed, [lesson.id]: { at: Date.now(), attempts, usedHint } },
  };
  const earned = earnedBadges(progress);
  const newBadges = earned.filter((b) => !p.badges.includes(b));
  progress.badges = earned;
  return { user: { ...user, progress }, gained, newBadges: newBadges.map((id) => BADGES.find((b) => b.id === id)) };
}
