import { type Card, type CardId, parseCardId } from '../cards';
import { CLASSIC_101_RULES, type RuleSet } from '../rules';
import type { RoundState } from '../round';

export function c(id: string): Card {
  const card = parseCardId(id);
  if (!card) throw new Error(`Bad card id in test: ${id}`);
  return card;
}

export function cards(...ids: string[]): Card[] {
  return ids.map(c);
}

export function ids(list: readonly Card[]): CardId[] {
  return list.map((x) => x.id);
}

/** A hand-built round so each test controls exactly what is on the table. */
export function table(opts: {
  hands: string[][];
  top: string;
  pile?: string[];
  rules?: RuleSet;
  current?: number;
  requiredSuit?: RoundState['requiredSuit'];
}): RoundState {
  return {
    rules: opts.rules ?? CLASSIC_101_RULES,
    seed: 42,
    players: opts.hands.map((h, i) => ({ id: `p${i}`, name: `P${i}`, isBot: i > 0, hand: cards(...h) })),
    drawPile: cards(...(opts.pile ?? ['9-clubs', '10-clubs', '9-spades', '10-spades', 'J-hearts'])),
    discardPile: [c(opts.top)],
    currentIndex: opts.current ?? 0,
    direction: 1,
    requiredSuit: opts.requiredSuit ?? null,
    hasDrawn: false,
    mustCover: false,
    phase: 'playing',
    winnerId: null,
    reshuffles: 0,
    turn: 1,
    events: [],
  };
}
