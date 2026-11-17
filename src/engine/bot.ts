import { type Card, type CardId, SUITS, type Suit } from './cards';
import { cardPoints, effectFor } from './rules';
import { type RoundState, canDraw, canPass, currentPlayer, legalCards } from './round';

export type BotAction =
  | { type: 'play'; cardId: CardId }
  | { type: 'draw' }
  | { type: 'pass' }
  | { type: 'chooseSuit'; suit: Suit };

/** Suit the bot holds most of (ties broken by point value, so it sheds expensive cards). */
export function preferredSuit(state: RoundState, hand: readonly Card[]): Suit {
  let best: Suit = SUITS[0];
  let bestScore = -1;
  for (const suit of SUITS) {
    const score = hand
      .filter((c) => c.suit === suit && !effectFor(state.rules, c).wild)
      .reduce((sum, c) => sum + 100 + cardPoints(state.rules, c), 0);
    if (score > bestScore) {
      bestScore = score;
      best = suit;
    }
  }
  return best;
}

function scoreCard(state: RoundState, card: Card): number {
  const effect = effectFor(state.rules, card);
  let score = cardPoints(state.rules, card);
  if (effect.nextDraws) score += 15 + effect.nextDraws * 3;
  if (effect.mustCover) score += 3;
  if (effect.skipNext) score += 10;
  // Keep wild cards for when nothing else fits.
  if (effect.wild) score -= 40;
  if (effect.mustCover) {
    const self = currentPlayer(state);
    const canFollow = self.hand.some((c) => c.id !== card.id && (c.suit === card.suit || c.rank === card.rank));
    score += canFollow ? 5 : -60;
  }
  if (effect.reverse) score += 2;
  return score;
}

/** A simple, fair heuristic bot. It only sees its own hand and public table state. */
export function chooseBotAction(state: RoundState): BotAction | null {
  const me = currentPlayer(state);
  if (state.phase === 'roundOver') return null;
  if (state.phase === 'choosingSuit') return { type: 'chooseSuit', suit: preferredSuit(state, me.hand) };

  const legal = legalCards(state);
  if (legal.length > 0) {
    const best = legal.reduce((a, b) => (scoreCard(state, b) > scoreCard(state, a) ? b : a));
    return { type: 'play', cardId: best.id };
  }
  if (canDraw(state, me.id)) return { type: 'draw' };
  if (canPass(state, me.id)) return { type: 'pass' };
  return null;
}
