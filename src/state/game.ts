import {
  type CardId,
  GameError,
  type MatchState,
  type RoundState,
  type Suit,
  chooseBotAction,
  chooseSuit,
  currentPlayer,
  drawCard,
  getRuleSet,
  passTurn,
  playCard,
  randomSeed,
  startMatch,
  startNextRound,
  updateRound,
} from '../engine';
import { createStore } from '../lib/store';
import { services } from '../services';
import { BOT_DELAY_MS, sessionStore } from './session';

const BOT_NAMES = ['Jasur', 'Malika', 'Sardor', 'Nodira', 'Bekzod', 'Dilnoza'];

interface GameStoreState {
  match: MatchState | null;
  humanId: string | null;
  /** Short message shown after an invalid action. */
  notice: string | null;
  /** Quick-chat bubble from the human player. */
  bubble: string | null;
  recorded: boolean;
}

export const gameStore = createStore<GameStoreState>({
  match: null,
  humanId: null,
  notice: null,
  bubble: null,
  recorded: false,
});

let botTimer: ReturnType<typeof setTimeout> | null = null;
let bubbleTimer: ReturnType<typeof setTimeout> | null = null;
let noticeTimer: ReturnType<typeof setTimeout> | null = null;

function clearBotTimer(): void {
  if (botTimer !== null) clearTimeout(botTimer);
  botTimer = null;
}

export function startPracticeMatch(players: 2 | 3 | 4, rulesId: string): void {
  clearBotTimer();
  const user = sessionStore.get().user;
  const humanId = user?.id ?? 'local-player';
  const offset = randomSeed() % BOT_NAMES.length;
  const bots = Array.from({ length: players - 1 }, (_, i) => ({
    id: `bot-${i + 1}`,
    name: BOT_NAMES[(offset + i) % BOT_NAMES.length] as string,
    isBot: true,
  }));
  const seats = [{ id: humanId, name: user?.displayName ?? 'Siz', isBot: false }, ...bots];
  const match = startMatch(seats, getRuleSet(rulesId), randomSeed());
  gameStore.set({ match, humanId, notice: null, bubble: null, recorded: false });
  scheduleBot();
}

export function abandonMatch(): void {
  clearBotTimer();
  gameStore.set({ match: null, humanId: null, notice: null, bubble: null, recorded: false });
}

function commit(round: RoundState): void {
  const { match } = gameStore.get();
  if (!match) return;
  const next = updateRound(match, round);
  gameStore.set({ match: next, notice: null });
  const humanOut = next.players.some((p) => p.id === gameStore.get().humanId && p.eliminated);
  if (next.phase === 'matchOver' || humanOut) void recordResult(next);
  scheduleBot();
}

function runHuman(action: (round: RoundState, playerId: string) => RoundState): void {
  const { match, humanId } = gameStore.get();
  if (!match || !humanId || match.phase !== 'round') return;
  try {
    commit(action(match.round, humanId));
  } catch (err) {
    gameStore.set({ notice: err instanceof GameError ? noticeFor(err) : 'Xatolik yuz berdi' });
    if (noticeTimer !== null) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => gameStore.set({ notice: null }), 1800);
  }
}

function noticeFor(err: GameError): string {
  switch (err.code) {
    case 'NOT_YOUR_TURN':
      return 'Hozir sizning navbatingiz emas';
    case 'ILLEGAL_CARD':
      return 'Noto‘g‘ri karta';
    case 'ALREADY_DREW':
      return 'Bu navbatda karta olgansiz';
    case 'CANNOT_PASS':
      return 'Avval karta oling';
    default:
      return 'Bu harakatni hozir qilib bo‘lmaydi';
  }
}

export const humanActions = {
  play: (cardId: CardId) => runHuman((r, id) => playCard(r, id, cardId)),
  draw: () => runHuman((r, id) => drawCard(r, id)),
  pass: () => runHuman((r, id) => passTurn(r, id)),
  chooseSuit: (suit: Suit) => runHuman((r, id) => chooseSuit(r, id, suit)),
};

export function nextRound(): void {
  const { match } = gameStore.get();
  if (!match) return;
  gameStore.set({ match: startNextRound(match) });
  scheduleBot();
}

export function sayPhrase(text: string): void {
  if (bubbleTimer !== null) clearTimeout(bubbleTimer);
  gameStore.set({ bubble: text });
  bubbleTimer = setTimeout(() => gameStore.set({ bubble: null }), 2500);
}

function scheduleBot(): void {
  clearBotTimer();
  const { match } = gameStore.get();
  if (!match || match.phase !== 'round') return;
  const round = match.round;
  if (round.phase === 'roundOver' || !currentPlayer(round).isBot) return;
  const delay = BOT_DELAY_MS[sessionStore.get().settings.botSpeed];
  botTimer = setTimeout(runBot, delay);
}

function runBot(): void {
  botTimer = null;
  const { match } = gameStore.get();
  if (!match || match.phase !== 'round') return;
  const round = match.round;
  const bot = currentPlayer(round);
  if (!bot.isBot) return;
  const action = chooseBotAction(round);
  if (!action) return;
  switch (action.type) {
    case 'play':
      commit(playCard(round, bot.id, action.cardId));
      break;
    case 'draw':
      commit(drawCard(round, bot.id));
      break;
    case 'pass':
      commit(passTurn(round, bot.id));
      break;
    case 'chooseSuit':
      commit(chooseSuit(round, bot.id, action.suit));
      break;
  }
}

async function recordResult(match: MatchState): Promise<void> {
  const { humanId, recorded } = gameStore.get();
  const user = sessionStore.get().user;
  if (recorded || !humanId || !user) return;
  gameStore.set({ recorded: true });
  const me = match.players.find((p) => p.id === humanId);
  await services.players.recordMatch(user.id, {
    id: `practice-${match.seed}`,
    playedAt: new Date().toISOString(),
    mode: 'practice',
    rulesId: match.rules.id,
    opponents: match.players.filter((p) => p.id !== humanId).map((p) => p.name),
    result: match.winnerId === humanId ? 'win' : 'loss',
    finalScore: me?.score ?? 0,
    rounds: match.roundNumber,
  });
}
