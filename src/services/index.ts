import { createLocalServices } from './local/localServices';
import type { Services } from './types';

/**
 * Service container. Phase 2 adds a Supabase implementation here
 * (e.g. createSupabaseServices(url, anonKey)) chosen by env vars.
 */
const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined)?.replace(/^@/, '') || null;

export const services: Services = createLocalServices(botUsername);

export * from './types';
