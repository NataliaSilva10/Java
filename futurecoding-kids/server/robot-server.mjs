// FutureKids – Timmy live AI backend (no dependencies, Node 18+).
//
// Keeps the AI API key on the server. The browser only ever talks to this server.
//
// Run:   ANTHROPIC_API_KEY=sk-... node server/robot-server.mjs
//   (Windows PowerShell:  $env:ANTHROPIC_API_KEY="sk-..."; node server/robot-server.mjs)
//
// Env vars:
//   ANTHROPIC_API_KEY   required – your API key (never put it in frontend code or .env.local with VITE_)
//   ROBOT_MODEL         optional – model id (default below)
//   PORT                optional – default 8787
//   ALLOWED_ORIGIN      optional – your Vite dev URL, default http://localhost:5173
//
// Privacy: this server does not log or store children's messages. Requests are
// size-limited and only the last few messages are forwarded to the AI.

import http from "node:http";

const PORT = Number(process.env.PORT ?? 8787);
const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const MODEL = process.env.ROBOT_MODEL ?? "claude-haiku-5-5";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";
const API_URL = process.env.ANTHROPIC_API_URL ?? "https://api.anthropic.com/v1/messages";

const LANGUAGE_NAMES = { en: "English", pt: "Brazilian Portuguese", es: "Spanish" };
const LEVEL_RULES = {
  beginner: "The child is a beginner: use very short sentences (max 8 words each), very common words, and accept one-word answers happily.",
  intermediate: "The child is intermediate: use short, complete sentences and gently invite the child to answer in full sentences.",
  advanced: "The child is advanced: use natural sentences, ask open questions, and encourage longer answers.",
};

function systemPrompt({ language, level, topic, childName }) {
  const lang = LANGUAGE_NAMES[language];
  return [
    `You are Timmy, a friendly, curious, patient, playful and encouraging robot who helps children aged 5 to 12 practice ${lang}.`,
    `Always reply ONLY in ${lang}, written naturally (never a word-for-word translation).`,
    LEVEL_RULES[level],
    topic ? `Today's conversation topic: ${topic}.` : "There is no fixed topic; keep it to everyday kid topics.",
    childName ? `The child's first name is ${childName}. Use it now and then.` : "",
    "Rules:",
    "- Reply in 1 to 3 short sentences (under 35 words total) and end with ONE simple follow-up question.",
    "- If the child makes a language mistake, never say 'wrong'. Praise the try, then model the correct sentence: e.g. 'Great try! We say: \"I am happy.\"'",
    "- Now and then introduce one useful new word and invite the child to use it.",
    "- Use simple, age-appropriate vocabulary. At most one emoji.",
    "- Never ask for personal information (last name, address, school name, phone, email, photos, passwords, location). If the child shares any, do not repeat it and change the subject kindly.",
    "- Keep everything safe and kind for young children. No scary, violent, romantic or adult content, no links.",
    "- If the child says they are hurt, scared or unsafe, respond warmly and tell them to talk to a trusted grown-up right away.",
  ].filter(Boolean).join("\n");
}

// ── validation ──
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function validate(body) {
  if (!isObj(body)) return "Body must be an object";
  if (!LANGUAGE_NAMES[body.language]) return "Invalid language";
  if (!LEVEL_RULES[body.level]) return "Invalid level";
  if (body.topic != null && (typeof body.topic !== "string" || body.topic.length > 60)) return "Invalid topic";
  if (body.childName != null && (typeof body.childName !== "string" || !/^[\p{L}' -]{1,30}$/u.test(body.childName))) return "Invalid name";
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 30) return "Invalid messages";
  for (const m of body.messages) {
    if (!isObj(m) || (m.role !== "robot" && m.role !== "child") || typeof m.text !== "string" || m.text.length > 400) {
      return "Invalid message";
    }
  }
  return null;
}

/** Converts the chat into the alternating user/assistant format the API expects. */
function toApiMessages(messages) {
  const out = [];
  for (const m of messages.slice(-12)) {
    const role = m.role === "child" ? "user" : "assistant";
    const text = m.text.trim();
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n${text}`;
    else out.push({ role, content: text });
  }
  if (out[0]?.role === "assistant") out.unshift({ role: "user", content: "(The child opened the chat.)" });
  if (out[out.length - 1]?.role !== "user") out.push({ role: "user", content: "(The child is waiting for Timmy.)" });
  return out;
}

// ── tiny in-memory rate limit: 30 requests / minute / IP ──
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

async function readJson(req, limit = 20_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (req.method === "OPTIONS") return send(res, 204, {});

  if (req.method === "GET" && url.pathname === "/api/robot/health") {
    return send(res, API_KEY ? 200 : 503, { ok: Boolean(API_KEY) });
  }

  if (req.method === "POST" && url.pathname === "/api/robot/chat") {
    if (!API_KEY) return send(res, 503, { error: "AI not configured" });
    if (rateLimited(req.socket.remoteAddress ?? "?")) return send(res, 429, { error: "Too many requests" });
    let body;
    try {
      body = await readJson(req);
    } catch {
      return send(res, 400, { error: "Invalid JSON" });
    }
    const problem = validate(body);
    if (problem) return send(res, 400, { error: problem });

    try {
      const upstream = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
        // Thinking tokens count toward max_tokens, so leave room and keep effort low for quick, short replies.
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          output_config: { effort: "low" },
          system: systemPrompt(body),
          messages: toApiMessages(body.messages),
        }),
        signal: AbortSignal.timeout(18_000),
      });
      if (!upstream.ok) {
        console.error(`[robot] AI provider returned ${upstream.status}`); // status only – no child content logged
        return send(res, 502, { error: "AI provider error" });
      }
      const data = await upstream.json();
      if (data.stop_reason === "refusal") return send(res, 502, { error: "AI declined" });
      const reply = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join(" ").trim().slice(0, 500);
      if (!reply) return send(res, 502, { error: "Empty AI reply" });
      return send(res, 200, { reply });
    } catch (error) {
      console.error(`[robot] AI request failed: ${error?.name ?? "error"}`);
      return send(res, 504, { error: "AI request failed" });
    }
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Timmy AI server on http://localhost:${PORT}/api/robot  (model: ${MODEL}, key ${API_KEY ? "set" : "MISSING"})`);
});
