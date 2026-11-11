/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the Timmy AI backend, e.g. http://localhost:8787/api/robot. Leave empty for practice mode. */
  readonly VITE_ROBOT_API_URL?: string;
}
