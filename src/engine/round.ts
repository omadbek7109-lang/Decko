import type { Card, CardId, Suit } from './cards';
import { createDeck, deal, shuffle } from './deck';
import { createRng } from './random';
import { type CardEffect, type RuleSet, effectFor } from './rules';

export interface SeatInput {
  id: string;
  name: string;
  isBot: boolean;
}

export interface RoundPlayer extends SeatInput {
  hand: Card[];
}

export type RoundPhase = 'playing' | 'choosingSuit' | 'roundOver';

export type GameEvent =
  | { type: 'play'; playerId: string; card: Card }
  | { type: 'draw'; playerId: string; count: number; forced: boolean }
  | { type: 'skip'; playerId: string }
  | { type: 'reverse'; direction: 1 | -1 }
  | { type: 'suitChosen'; playerId: string; suit: Suit }
  | { type: 'mustCover'; playerId: string }
  | { type: 'pass'; playerId: string }
  | { type: 'reshuffle'; count: number }
  | { type: 'roundOver'; winnerId: string };

export interface RoundState {
  readonly rules: RuleSet;
  readonly seed: number;
  readonly players: readonly RoundPlayer[];
  readonly drawPile: readonly Card[];
  /** Last element is the top card. */
  readonly discardPile: readonly Card[];
  readonly currentIndex: number;
  readonly direction: 1 | -1;
  /** Suit named by a chooseSuit card; overrides the top card's suit. */
  readonly requiredSuit: Suit | null;
  /** Current player has already drawn this turn. */
  readonly hasDrawn: boolean;
  /** Current player must cover the card they just played. */
  readonly mustCover: boolean;
  readonly phase: RoundPhase;
  readonly winnerId: string | null;
  readonly reshuffles: number;
  readonly turn: number;
  /** Events produced by the most recent action. */
  readonly events: readonly GameEvent[];
}

export type GameErrorCode =
  | 'ROUND_OVER'
  | 'NOT_YOUR_TURN'
  | 'WRONG_PHASE'
  | 'CARD_NOT_IN_HAND'
  | 'ILLEGAL_CARD'
  | 'ALREADY_DREW'
  | 'CANNOT_PASS';

export class GameError extends Error {
  constructor(
    readonly code: GameErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export interface CreateRoundOptions {
  seats: readonly SeatInput[];
  rules: RuleSet;
  seed: number;
  /** Index of the player who moves first. */
  startIndex?: number;
}

export function createRound({ seats, rules, seed, startIndex = 0 }: CreateRoundOptions): RoundState {
  if (seats.length < 2 || seats.length > 4) throw new RangeError('DECKO supports 2–4 players');
  const ids = new Set(seats.map((s) => s.id));
  if (ids.size !== seats.length) throw new RangeError('Player ids must be unique');

  const rng = createRng(seed);
  const deck = shuffle(createDeck(), rng);
  const { hands, rest } = deal(deck, seats.length, rules.handSize);
  const [startCard, ...drawPile] = rest as [Card, ...Card[]];

  const players: RoundPlayer[] = seats.map((s, i) => ({ ...s, hand: hands[i] ?? [] }));
  let state: RoundState = {
    rules,
    seed,
    players,
    drawPile,
    discardPile: [startCard],
    currentIndex: ((startIndex % seats.length) + seats.length) % seats.length,
    direction: 1,
    requiredSuit: null,
    hasDrawn: false,
    mustCover: false,
    phase: 'playing',
    winnerId: null,
    reshuffles: 0,
    turn: 1,
    events: [],
  };

  if (rules.applyEffectsOnStartCard) {
    const effect = effectFor(rules, startCard);
    const events: GameEvent[] = [];
    // The start card acts as if played by the player before the first mover.
    if (effect.reverse) state = { ...state, direction: (state.direction * -1) as 1 | -1 };
    if (effect.nextDraws) state = drawInto(state, state.currentIndex, effect.nextDraws, true, events);
    if (effect.skipNext) {
      events.push({ type: 'skip', playerId: currentPlayer(state).id });
      state = { ...state, currentIndex: nextIndex(state, state.currentIndex) };
    }
    state = { ...state, events };
  }
  return state;
}

// ---------- queries ----------

export function topCard(state: RoundState): Card {
  return state.discardPile[state.discardPile.length - 1] as Card;
}

export function currentPlayer(state: RoundState): RoundPlayer {
  return state.players[state.currentIndex] as RoundPlayer;
}

export function playerIndex(state: RoundState, playerId: string): number {
  return state.players.findIndex((p) => p.id === playerId);
}

export function nextIndex(state: RoundState, from: number): number {
  const n = state.players.length;
  return (((from + state.direction) % n) + n) % n;
}

/** The suit a card must follow right now. */
export function activeSuit(state: RoundState): Suit {
  return state.requiredSuit ?? topCard(state).suit;
}

/** Whether `card` may be placed on the pile, ignoring whose turn it is. */
export function matches(state: RoundState, card: Card): boolean {
  const top = topCard(state);
  const effect = effectFor(state.rules, card);
  if (state.mustCover) {
    // Covering: same suit or same rank as the card just played (or a wild).
    return card.suit === top.suit || card.rank === top.rank || Boolean(effect.wild);
  }
  if (effect.wild) return true;
  if (card.suit === activeSuit(state)) return true;
  // After a suit was named, rank matching against the named card is not allowed.
  return state.requiredSuit === null && card.rank === top.rank;
}

export function legalCards(state: RoundState, playerId?: string): Card[] {
  if (state.phase !== 'playing') return [];
  const player = currentPlayer(state);
  if (playerId !== undefined && player.id !== playerId) return [];
  return player.hand.filter((c) => matches(state, c));
}

/** Cards that could be drawn now (pile plus what a reshuffle would add). */
export function availableToDraw(state: RoundState): number {
  return state.drawPile.length + Math.max(0, state.discardPile.length - 1);
}

export function canDraw(state: RoundState, playerId: string): boolean {
  if (state.phase !== 'playing' || currentPlayer(state).id !== playerId) return false;
  if (availableToDraw(state) === 0) return false;
  return state.mustCover || !state.hasDrawn;
}

export function canPass(state: RoundState, playerId: string): boolean {
  if (state.phase !== 'playing' || currentPlayer(state).id !== playerId) return false;
  if (state.mustCover) return availableToDraw(state) === 0 && legalCards(state).length === 0;
  if (state.hasDrawn) return true;
  // Nothing to draw and nothing to play: the player may pass.
  return availableToDraw(state) === 0 && legalCards(state).length === 0;
}

// ---------- actions ----------

function assertTurn(state: RoundState, playerId: string, phase: RoundPhase): void {
  if (state.phase === 'roundOver') throw new GameError('ROUND_OVER', 'The round is over');
  if (currentPlayer(state).id !== playerId) throw new GameError('NOT_YOUR_TURN', 'Not your turn');
  if (state.phase !== phase) throw new GameError('WRONG_PHASE', `Expected phase ${phase}`);
}

function replaceHand(state: RoundState, index: number, hand: Card[]): RoundState {
  const players = state.players.map((p, i) => (i === index ? { ...p, hand } : p));
  return { ...state, players };
}

/** Moves up to `count` cards from the pile into a player's hand, reshuffling if needed. */
function drawInto(state: RoundState, index: number, count: number, forced: boolean, events: GameEvent[]): RoundState {
  let s = state;
  let drawn = 0;
  const hand = (s.players[index] as RoundPlayer).hand.slice();
  for (let i = 0; i < count; i++) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length <= 1) break;
      const top = topCard(s);
      const rest = s.discardPile.slice(0, -1);
      const reshuffles = s.reshuffles + 1;
      const pile = shuffle(rest, createRng((s.seed ^ (reshuffles * 0x9e3779b9)) >>> 0));
      events.push({ type: 'reshuffle', count: pile.length });
      s = { ...s, drawPile: pile, discardPile: [top], reshuffles };
    }
    const [card, ...restPile] = s.drawPile as [Card, ...Card[]];
    hand.push(card);
    s = { ...s, drawPile: restPile };
    drawn++;
  }
  if (drawn > 0) events.push({ type: 'draw', playerId: (s.players[index] as RoundPlayer).id, count: drawn, forced });
  return replaceHand(s, index, hand);
}

/** Ends the current turn, applying draw/skip effects to the following player(s). */
function advance(state: RoundState, effect: CardEffect, events: GameEvent[]): RoundState {
  let s: RoundState = { ...state, hasDrawn: false, mustCover: false, turn: state.turn + 1 };
  let next = nextIndex(s, s.currentIndex);
  if (effect.nextDraws) s = drawInto(s, next, effect.nextDraws, true, events);
  if (effect.skipNext) {
    events.push({ type: 'skip', playerId: (s.players[next] as RoundPlayer).id });
    next = nextIndex(s, next);
  }
  return { ...s, currentIndex: next };
}

function finishRound(state: RoundState, winnerId: string, events: GameEvent[]): RoundState {
  events.push({ type: 'roundOver', winnerId });
  return { ...state, phase: 'roundOver', winnerId, hasDrawn: false, mustCover: false, events };
}

export function playCard(state: RoundState, playerId: string, cardId: CardId): RoundState {
  assertTurn(state, playerId, 'playing');
  const index = state.currentIndex;
  const player = currentPlayer(state);
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) throw new GameError('CARD_NOT_IN_HAND', 'Card is not in hand');
  if (!matches(state, card)) throw new GameError('ILLEGAL_CARD', 'This card cannot be played now');

  const events: GameEvent[] = [{ type: 'play', playerId, card }];
  const effect = effectFor(state.rules, card);
  let s: RoundState = replaceHand(state, index, player.hand.filter((c) => c.id !== cardId));
  s = { ...s, discardPile: [...s.discardPile, card], requiredSuit: null, mustCover: false };

  if ((s.players[index] as RoundPlayer).hand.length === 0) {
    if (state.rules.applyEffectsOnFinishingCard && (effect.nextDraws || effect.skipNext)) {
      const next = nextIndex(s, index);
      if (effect.nextDraws) s = drawInto(s, next, effect.nextDraws, true, events);
    }
    return finishRound(s, playerId, events);
  }

  if (effect.reverse) {
    s = { ...s, direction: (s.direction * -1) as 1 | -1 };
    events.push({ type: 'reverse', direction: s.direction });
  }
  if (effect.mustCover) {
    events.push({ type: 'mustCover', playerId });
    return { ...s, mustCover: true, hasDrawn: false, events };
  }
  if (effect.chooseSuit) {
    return { ...s, phase: 'choosingSuit', events };
  }
  return { ...advance(s, effect, events), events };
}

export function chooseSuit(state: RoundState, playerId: string, suit: Suit): RoundState {
  assertTurn(state, playerId, 'choosingSuit');
  const events: GameEvent[] = [{ type: 'suitChosen', playerId, suit }];
  const effect = effectFor(state.rules, topCard(state));
  const s: RoundState = { ...state, phase: 'playing', requiredSuit: suit };
  return { ...advance(s, { nextDraws: effect.nextDraws, skipNext: effect.skipNext }, events), events };
}

export function drawCard(state: RoundState, playerId: string): RoundState {
  assertTurn(state, playerId, 'playing');
  if (!state.mustCover && state.hasDrawn) throw new GameError('ALREADY_DREW', 'You already drew this turn');
  const events: GameEvent[] = [];
  const count = state.mustCover ? 1 : state.rules.drawPerTurn;
  let s = drawInto(state, state.currentIndex, count, false, events);
  s = { ...s, hasDrawn: true };
  if (!state.mustCover && !state.rules.mayPlayAfterDraw) {
    events.push({ type: 'pass', playerId });
    s = advance(s, {}, events);
  }
  return { ...s, events };
}

export function passTurn(state: RoundState, playerId: string): RoundState {
  assertTurn(state, playerId, 'playing');
  if (!canPass(state, playerId)) throw new GameError('CANNOT_PASS', 'Draw a card before passing');
  const events: GameEvent[] = [{ type: 'pass', playerId }];
  return { ...advance(state, {}, events), events };
}
