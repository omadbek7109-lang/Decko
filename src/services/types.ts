/**
 * Service contracts. The UI only talks to these interfaces, so the local
 * implementations in ./local can be swapped for Supabase-backed ones later
 * without touching screens or the game engine.
 */

export type AuthSource = 'telegram' | 'guest';

export interface AuthUser {
  id: string;
  displayName: string;
  username: string | null;
  photoUrl: string | null;
  source: AuthSource;
}

export interface AuthenticationService {
  /** True when running inside Telegram with a user available. */
  isTelegramAvailable(): boolean;
  getCurrentUser(): Promise<AuthUser | null>;
  /**
   * Signs in with the Telegram Mini App user. Locally this trusts
   * initDataUnsafe; the Supabase version must verify initData on the server.
   */
  signInWithTelegram(): Promise<AuthUser>;
  continueAsGuest(displayName: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export type MatchMode = 'practice' | 'online';

export interface MatchRecord {
  id: string;
  playedAt: string;
  mode: MatchMode;
  rulesId: string;
  opponents: string[];
  result: 'win' | 'loss';
  finalScore: number;
  rounds: number;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  /** Null until rated online play exists. */
  rating: number | null;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface PlayerService {
  getProfile(user: AuthUser): Promise<PlayerProfile>;
  recordMatch(userId: string, record: MatchRecord): Promise<void>;
  getMatchHistory(userId: string, limit?: number): Promise<MatchRecord[]>;
  clearLocalData(userId: string): Promise<void>;
}

export interface QuickMatchRequest {
  rulesId: string;
  players: 2 | 3 | 4;
}

export interface MatchService {
  isOnlineAvailable(): boolean;
  findQuickMatch(request: QuickMatchRequest): Promise<{ matchId: string }>;
  cancelSearch(): Promise<void>;
}

export interface Room {
  code: string;
  hostId: string;
  rulesId: string;
  maxPlayers: 2 | 3 | 4;
  playerIds: string[];
}

export interface CreateRoomRequest {
  rulesId: string;
  maxPlayers: 2 | 3 | 4;
}

export interface RoomService {
  isAvailable(): boolean;
  createRoom(request: CreateRoomRequest): Promise<Room>;
  joinRoom(code: string): Promise<Room>;
  /** Telegram deep link that opens the Mini App straight into the room, or null if the bot is not configured. */
  buildInviteLink(code: string): string | null;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  rating: number;
  wins: number;
  matchesPlayed: number;
}

export interface LeaderboardService {
  isAvailable(): boolean;
  getGlobal(limit: number): Promise<LeaderboardEntry[]>;
}

export interface Services {
  auth: AuthenticationService;
  players: PlayerService;
  matches: MatchService;
  rooms: RoomService;
  leaderboard: LeaderboardService;
}

/** Thrown by features that need the online backend, which is not connected yet. */
export class BackendNotConnectedError extends Error {
  readonly code = 'BACKEND_NOT_CONNECTED';
  constructor(feature: string) {
    super(`${feature} requires the online server, which is not connected yet.`);
    this.name = 'BackendNotConnectedError';
  }
}

export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}
