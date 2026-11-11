import type { Language, Level, Translated } from "../storyEngine";

/** What the robot character is showing right now. */
export type RobotState = "idle" | "speaking" | "listening" | "thinking" | "happy" | "encouraging";

/** Emotional reaction set by events (the other states come from voice/AI activity). */
export type RobotMood = "idle" | "happy" | "encouraging";

export type ChatRole = "robot" | "child";

/** Where a robot line came from — shown so live AI is never confused with practice mode. */
export type MessageSource = "local" | "ai" | "child";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  language: Language;
  source: MessageSource;
  /** For local robot lines: the same line in every language (used for the subtitle). */
  translations?: Translated;
  /** True when the child spoke it with the microphone (vs. typed). */
  spoken?: boolean;
};

/** live = backend reachable · local = practice mode · checking = health check running · unavailable = backend configured but down */
export type AiMode = "local" | "checking" | "live" | "unavailable";

export type StepExpectation = "name" | "feeling" | "free";

export type TopicStep = {
  ask: Translated;
  /** A model answer: shown as a suggestion and used by "Help me". */
  example: Translated;
  expects?: StepExpectation;
  /** Extra tappable answers for beginners. */
  choices?: Translated[];
};

export type ConversationTopic = {
  id: string;
  emoji: string;
  name: Translated;
  steps: TopicStep[];
};

/** Everything the local (offline) conversation needs to remember during the session. */
export type ConversationContext = {
  language: Language;
  level: Level;
  /** First name only, kept in memory for this session. Never saved. */
  childName: string | null;
  topicId: string | null;
  step: number;
  /** Already asked for a full sentence on this step (only ask once). */
  nudged: boolean;
  /** The robot just asked an activity follow-up question. */
  followUp: boolean;
};

export type RobotReply = {
  lines: Translated[];
  mood: RobotMood;
  context: ConversationContext;
  /** Tappable answer suggestions (shown for beginners). */
  suggestions: Translated[];
};

/** Sent to the backend. Only what the AI needs — no IDs, no device data. */
export type RobotChatRequest = {
  language: Language;
  level: Level;
  topic: string | null;
  childName: string | null;
  messages: { role: ChatRole; text: string }[];
};
