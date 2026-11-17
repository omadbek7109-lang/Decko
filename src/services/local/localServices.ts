import {
  type AuthUser,
  type AuthenticationService,
  BackendNotConnectedError,
  type CreateRoomRequest,
  type LeaderboardEntry,
  type LeaderboardService,
  type MatchRecord,
  type MatchService,
  type PlayerProfile,
  type PlayerService,
  type QuickMatchRequest,
  type Room,
  type RoomService,
  type Services,
} from '../types';
import { KEYS, readJson, removeKey, writeJson } from './storage';
import { getTelegramWebApp } from './telegram';

function guestId(): string {
  const bytes = new Uint8Array(6);
  globalThis.crypto?.getRandomValues?.(bytes);
  return `guest-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export class LocalAuthService implements AuthenticationService {
  isTelegramAvailable(): boolean {
    return Boolean(getTelegramWebApp()?.initDataUnsafe.user);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return readJson<AuthUser | null>(KEYS.user, null);
  }

  async signInWithTelegram(): Promise<AuthUser> {
    const tgUser = getTelegramWebApp()?.initDataUnsafe.user;
    if (!tgUser) throw new Error('Telegram user is not available outside Telegram.');
    const user: AuthUser = {
      id: `tg-${tgUser.id}`,
      displayName: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Telegram',
      username: tgUser.username ?? null,
      photoUrl: tgUser.photo_url ?? null,
      source: 'telegram',
    };
    writeJson(KEYS.user, user);
    return user;
  }

  async continueAsGuest(displayName: string): Promise<AuthUser> {
    const name = displayName.trim().slice(0, 24) || 'Mehmon';
    const existing = await this.getCurrentUser();
    const user: AuthUser = {
      id: existing?.source === 'guest' ? existing.id : guestId(),
      displayName: name,
      username: null,
      photoUrl: null,
      source: 'guest',
    };
    writeJson(KEYS.user, user);
    return user;
  }

  async signOut(): Promise<void> {
    removeKey(KEYS.user);
  }
}

export class LocalPlayerService implements PlayerService {
  async getProfile(user: AuthUser): Promise<PlayerProfile> {
    const history = await this.getMatchHistory(user.id, Number.POSITIVE_INFINITY);
    const wins = history.filter((m) => m.result === 'win').length;
    return {
      id: user.id,
      displayName: user.displayName,
      rating: null,
      wins,
      losses: history.length - wins,
      matchesPlayed: history.length,
    };
  }

  async recordMatch(userId: string, record: MatchRecord): Promise<void> {
    const history = readJson<MatchRecord[]>(KEYS.history(userId), []);
    writeJson(KEYS.history(userId), [record, ...history].slice(0, 200));
  }

  async getMatchHistory(userId: string, limit = 50): Promise<MatchRecord[]> {
    return readJson<MatchRecord[]>(KEYS.history(userId), []).slice(0, limit);
  }

  async clearLocalData(userId: string): Promise<void> {
    removeKey(KEYS.history(userId));
  }
}

/** Online matchmaking needs the backend; this local stub says so honestly. */
export class OfflineMatchService implements MatchService {
  isOnlineAvailable(): boolean {
    return false;
  }
  async findQuickMatch(_request: QuickMatchRequest): Promise<{ matchId: string }> {
    throw new BackendNotConnectedError('Quick match');
  }
  async cancelSearch(): Promise<void> {
    // Nothing to cancel offline.
  }
}

export class OfflineRoomService implements RoomService {
  constructor(private readonly botUsername: string | null) {}
  isAvailable(): boolean {
    return false;
  }
  async createRoom(_request: CreateRoomRequest): Promise<Room> {
    throw new BackendNotConnectedError('Rooms');
  }
  async joinRoom(_code: string): Promise<Room> {
    throw new BackendNotConnectedError('Rooms');
  }
  buildInviteLink(code: string): string | null {
    if (!this.botUsername) return null;
    return `https://t.me/${this.botUsername}?startapp=room_${encodeURIComponent(code)}`;
  }
}

export class OfflineLeaderboardService implements LeaderboardService {
  isAvailable(): boolean {
    return false;
  }
  async getGlobal(_limit: number): Promise<LeaderboardEntry[]> {
    throw new BackendNotConnectedError('Leaderboard');
  }
}

export function createLocalServices(botUsername: string | null): Services {
  return {
    auth: new LocalAuthService(),
    players: new LocalPlayerService(),
    matches: new OfflineMatchService(),
    rooms: new OfflineRoomService(botUsername),
    leaderboard: new OfflineLeaderboardService(),
  };
}
