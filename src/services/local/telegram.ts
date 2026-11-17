/** Minimal typing for the parts of the Telegram WebApp SDK DECKO uses. */
export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; start_param?: string };
  colorScheme: 'light' | 'dark';
  ready(): void;
  expand(): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  HapticFeedback?: { impactOccurred(style: 'light' | 'medium' | 'heavy'): void };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  const app = window.Telegram?.WebApp;
  // The SDK script defines WebApp everywhere; initData is only set inside Telegram.
  return app && app.initData ? app : null;
}

export function initTelegramShell(background: string): void {
  const app = getTelegramWebApp();
  if (!app) return;
  try {
    app.ready();
    app.expand();
    app.setHeaderColor?.(background);
    app.setBackgroundColor?.(background);
  } catch {
    // Older clients may not support every call.
  }
}

export function hapticTap(): void {
  try {
    getTelegramWebApp()?.HapticFeedback?.impactOccurred('light');
  } catch {
    // ignore
  }
}
