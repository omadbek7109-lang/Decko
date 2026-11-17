/**
 * Traditional 36-card deck primitives: 6–A in four suits.
 */

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
export type Rank = (typeof RANKS)[number];

export type CardId = `${Rank}-${Suit}`;

export interface Card {
  readonly id: CardId;
  readonly rank: Rank;
  readonly suit: Suit;
}

export const DECK_SIZE = SUITS.length * RANKS.length; // 36

export function makeCard(rank: Rank, suit: Suit): Card {
  return { id: `${rank}-${suit}`, rank, suit };
}

export function parseCardId(id: string): Card | null {
  const dash = id.indexOf('-');
  if (dash < 1) return null;
  const rank = id.slice(0, dash);
  const suit = id.slice(dash + 1);
  if (!(RANKS as readonly string[]).includes(rank)) return null;
  if (!(SUITS as readonly string[]).includes(suit)) return null;
  return makeCard(rank as Rank, suit as Suit);
}

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function isCourtRank(rank: Rank): boolean {
  return rank === 'J' || rank === 'Q' || rank === 'K';
}
