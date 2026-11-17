import { type Card, RANKS, SUITS, makeCard } from './cards';
import type { Rng } from './random';

/** A new, ordered 36-card deck. */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push(makeCard(rank, suit));
  }
  return deck;
}

/** Fisher–Yates shuffle. Returns a new array; the input is left untouched. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

export interface DealResult {
  hands: Card[][];
  rest: Card[];
}

/** Deals `handSize` cards to each player, one at a time, round-robin. */
export function deal(deck: readonly Card[], playerCount: number, handSize: number): DealResult {
  if (playerCount < 2) throw new RangeError('At least 2 players are required');
  if (handSize < 1) throw new RangeError('Hand size must be at least 1');
  if (playerCount * handSize >= deck.length) {
    throw new RangeError('Not enough cards to deal and still start a discard pile');
  }
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  let cursor = 0;
  for (let round = 0; round < handSize; round++) {
    for (let p = 0; p < playerCount; p++) {
      (hands[p] as Card[]).push(deck[cursor] as Card);
      cursor++;
    }
  }
  return { hands, rest: deck.slice(cursor) };
}
