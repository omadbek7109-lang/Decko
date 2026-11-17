import { createStore } from '../lib/store';
import { KEYS, readJson, writeJson } from '../services/local/storage';
import { type AuthUser, services } from '../services';

export type CardBackId = 'classic' | 'burgundy' | 'navy';
export type BotSpeed = 'slow' | 'normal' | 'fast';

export interface Settings {
  cardBack: CardBackId;
  rulesId: string;
  botSpeed: BotSpeed;
  haptics: boolean;
  practicePlayers: 2 | 3 | 4;
}

export const DEFAULT_SETTINGS: Settings = {
  cardBack: 'classic',
  rulesId: 'classic101',
  botSpeed: 'normal',
  haptics: true,
  practicePlayers: 2,
};

export const BOT_DELAY_MS: Record<BotSpeed, number> = { slow: 1300, normal: 850, fast: 450 };

interface SessionState {
  ready: boolean;
  user: AuthUser | null;
  settings: Settings;
}

export const sessionStore = createStore<SessionState>({
  ready: false,
  user: null,
  settings: loadSettings(),
});

function loadSettings(): Settings {
  const stored = { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(KEYS.settings, {}) };
  if (!['classic', 'burgundy', 'navy'].includes(stored.cardBack)) stored.cardBack = DEFAULT_SETTINGS.cardBack;
  return stored;
}

export async function initSession(): Promise<void> {
  let user = await services.auth.getCurrentUser();
  // Inside Telegram, always refresh the profile from the Mini App user.
  if (services.auth.isTelegramAvailable()) {
    try {
      user = await services.auth.signInWithTelegram();
    } catch {
      // fall back to the stored user
    }
  }
  sessionStore.set({ ready: true, user });
}

export function setUser(user: AuthUser | null): void {
  sessionStore.set({ user });
}

export function updateSettings(patch: Partial<Settings>): void {
  const settings = { ...sessionStore.get().settings, ...patch };
  writeJson(KEYS.settings, settings);
  sessionStore.set({ settings });
}
