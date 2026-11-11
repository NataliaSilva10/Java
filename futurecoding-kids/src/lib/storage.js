// Profiles + progress, stored in this browser only (localStorage).
// Swap these functions for API calls when you add a real backend.

const USERS_KEY = 'fck.users.v1';

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    /* storage unavailable or full */
  }
};

export const todayKey = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};
export const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
};

// Light obfuscation for a 4-digit kid PIN. It keeps siblings out of each
// other's profiles; it is not real security.
export function hashPin(pin) {
  let h = 5381;
  for (const c of 'fck:' + pin) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}

export const emptyProgress = () => ({ xp: 0, completed: {}, streak: 0, lastDay: null, badges: [], drafts: {} });

export const loadUsers = () => read(USERS_KEY, []);
export const saveUsers = (users) => write(USERS_KEY, users);

export function createUser({ name, avatar, pin }) {
  const id = (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(36).slice(2);
  return { id, name: name.trim(), avatar, pinHash: hashPin(pin), created: Date.now(), progress: emptyProgress() };
}
