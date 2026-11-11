// Service layer between the app and the live AI backend.
//
// The browser NEVER talks to an AI provider directly and never holds an API key.
// It calls YOUR backend (see server/robot-server.mjs), which keeps the key on the server.
//
// Configure with an env var in .env.local (Vite only exposes vars starting with VITE_):
//   VITE_ROBOT_API_URL=http://localhost:8787/api/robot
// If it's not set, the app stays in practice mode and never claims live AI.

import type { RobotChatRequest } from "./types";

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const API_URL = (env.VITE_ROBOT_API_URL ?? "").trim().replace(/\/$/, "");

export const isLiveAiConfigured = API_URL.length > 0;

export class RobotServiceError extends Error {
  constructor(
    message: string,
    readonly kind: "not-configured" | "network" | "timeout" | "server" | "bad-response" | "aborted"
  ) {
    super(message);
    this.name = "RobotServiceError";
  }
}

async function request(path: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  if (!isLiveAiConfigured) throw new RobotServiceError("Live AI is not configured", "not-configured");
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort("timeout"), timeoutMs);
  const onAbort = () => controller.abort("aborted");
  signal?.addEventListener("abort", onAbort);
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason === "timeout" ? "timeout" : "aborted";
      throw new RobotServiceError(reason === "timeout" ? "The AI took too long to answer" : "Request cancelled", reason);
    }
    throw new RobotServiceError(error instanceof Error ? error.message : "Network error", "network");
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** True only if the backend answers its health check. */
export async function checkLiveAi(signal?: AbortSignal): Promise<boolean> {
  if (!isLiveAiConfigured) return false;
  try {
    const response = await request("/health", { method: "GET" }, 5000, signal);
    if (!response.ok) return false;
    const body = (await response.json()) as { ok?: boolean };
    return body.ok === true;
  } catch {
    return false;
  }
}

/** Sends the recent conversation and returns Timmy's next line. */
export async function askRobot(payload: RobotChatRequest, signal?: AbortSignal): Promise<string> {
  const response = await request(
    "/chat",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    20000,
    signal
  );
  if (!response.ok) throw new RobotServiceError(`Server error (${response.status})`, "server");
  let body: { reply?: unknown };
  try {
    body = await response.json();
  } catch {
    throw new RobotServiceError("The server sent something unexpected", "bad-response");
  }
  if (typeof body.reply !== "string" || !body.reply.trim()) {
    throw new RobotServiceError("The server sent an empty answer", "bad-response");
  }
  return body.reply.trim();
}
