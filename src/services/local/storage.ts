/** Small, failure-tolerant wrapper around localStorage (it can throw in private modes and some webviews). */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the app keeps working without persistence.
  }
}

export function removeKey(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // ignore
  }
}

export const KEYS = {
  user: 'decko.user.v1',
  settings: 'decko.settings.v1',
  history: (userId: string) => `decko.history.v1.${userId}`,
} as const;
