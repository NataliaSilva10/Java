// Runs kid code in a Web Worker so it can't touch the page, and so a
// never-ending loop can be stopped after a short time.

const WORKER_SRC = `
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.WebSocket = undefined;
self.importScripts = undefined;
const fmt = (v) => {
  if (typeof v === 'string') return v;
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return String(v);
  try { return typeof v === 'object' ? JSON.stringify(v) : String(v); } catch (e) { return String(v); }
};
const out = [];
const push = (...a) => { if (out.length < 200) out.push(a.map(fmt).join(' ')); };
self.console = { log: push, info: push, warn: push, error: push };
self.onmessage = (e) => {
  try {
    new Function(e.data)();
    self.postMessage({ ok: true, logs: out });
  } catch (err) {
    self.postMessage({ ok: false, logs: out, error: String((err && err.message) || err) });
  }
};
`;

export function friendlyError(msg = '') {
  const notDefined = msg.match(/^(\w+) is not defined/);
  if (notDefined) return `The computer doesn't know what "${notDefined[1]}" is. Check the spelling, or make sure you created it with let.`;
  if (/Unexpected end of input/.test(msg)) return 'Something is missing at the end. Did you close every ( and { and quote?';
  if (/Unexpected token|Invalid or unexpected token|missing \)/.test(msg)) return `A symbol is in the wrong place (${msg}). Look for missing quotes, brackets or commas.`;
  if (/is not a function/.test(msg)) return `${msg}. Check the name and spelling of what you are calling.`;
  return msg;
}

export function runCode(code, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let worker;
    let url;
    let done = false;
    const finish = (res) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { worker && worker.terminate(); } catch (e) { /* ignore */ }
      try { url && URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
      resolve(res);
    };
    const timer = setTimeout(
      () => finish({ ok: false, logs: [], timedOut: true, error: 'Your code ran for too long. Is there a loop that never stops? 🔁' }),
      timeoutMs
    );
    try {
      url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = (e) => finish({ ...e.data, error: e.data.error ? friendlyError(e.data.error) : undefined });
      worker.onerror = (e) => finish({ ok: false, logs: [], error: friendlyError(e.message) });
      worker.postMessage(code);
    } catch (err) {
      finish({ ok: false, logs: [], error: 'This browser could not run code. Try Chrome, Edge, Firefox or Safari.' });
    }
  });
}

// Compare a run result with what the lesson expects.
export function checkLesson(lesson, code, result) {
  if (!result.ok) return { passed: false, message: result.error || 'Something went wrong.' };
  for (const r of lesson.require || []) {
    if (!r.re.test(code)) return { passed: false, message: r.msg };
  }
  const got = result.logs.map((l) => String(l).trimEnd());
  const want = lesson.expected;
  const same = got.length === want.length && got.every((l, i) => l === want[i]);
  if (same) return { passed: true, message: 'Perfect!' };
  if (got.length === 0) return { passed: false, message: 'Your code ran but printed nothing. Use console.log to show your answer.' };
  return {
    passed: false,
    message: `Close! I expected ${want.length} line${want.length === 1 ? '' : 's'} and your code printed ${got.length}. Compare the output with the goal.`,
  };
}
