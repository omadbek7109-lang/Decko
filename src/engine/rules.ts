import type { Card, CardId, Rank } from './cards';

/**
 * What happens when a card is played. Every field is optional; an empty
 * object means "no special effect". Effects are resolved in this order:
 * reverse → mustCover → chooseSuit → nextDraws → skipNext.
 */
export interface CardEffect {
  /** Next player draws this many cards. */
  nextDraws?: number;
  /** Next player loses their turn. */
  skipNext?: boolean;
  /**
   * The draw penalty can be passed on: the targeted player may answer with a
   * card of the same rank, adding to the penalty for the following player.
   */
  stackable?: boolean;
  /** Turn order changes direction. */
  reverse?: boolean;
  /** Can be played on any card. */
  wild?: boolean;
  /** Player who plays it names the suit the next player must follow. */
  chooseSuit?: boolean;
  /** Player who plays it must play again (drawing until they can). */
  mustCover?: boolean;
}

export interface RuleSet {
  id: string;
  /** Short display name (Uzbek, shown in the UI). */
  name: string;
  description: string;
  /** Cards dealt to each player at the start of a round. */
  handSize: number;
  /** Cards taken from the deck when a player chooses "draw". */
  drawPerTurn: number;
  /** After drawing, the player may still play a matching card this turn. */
  mayPlayAfterDraw: boolean;
  /** After drawing, the turn passes automatically when nothing in hand can be played. */
  autoPassAfterDraw: boolean;
  /** Effects by rank (applies to every suit of that rank). */
  rankEffects: Partial<Record<Rank, CardEffect>>;
  /** Effects for one exact card; these replace the rank effect for that card. */
  cardEffects: Partial<Record<CardId, CardEffect>>;
  /** Apply the effect of the first upturned card at the start of a round. */
  applyEffectsOnStartCard: boolean;
  /** Apply draw effects of the card a player finishes with. */
  applyEffectsOnFinishingCard: boolean;
  /** A round cannot be finished with a card that must be covered. */
  mustCoverBlocksFinish: boolean;
  /** Penalty points for cards left in hand when a round ends. */
  cardPoints: Record<Rank, number>;
  cardPointOverrides: Partial<Record<CardId, number>>;
  /** Points added to the round winner's score for finishing with this card (usually negative). */
  finishBonusByRank: Partial<Record<Rank, number>>;
  finishBonusByCard: Partial<Record<CardId, number>>;
  /** A player whose total goes ABOVE this is eliminated. */
  eliminationScore: number;
  /** Exact totals that are replaced, e.g. { 100: 50, 101: 0 }. */
  scoreResets: Record<number, number>;
  /**
   * Rule details that are configurable but not yet confirmed by the product
   * owner. Shown in docs/RULES.md and the in-app rules screen.
   */
  unconfirmed: string[];
}

const DEFAULT_POINTS: Record<Rank, number> = {
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 0,
  '10': 10,
  J: 2,
  Q: 3,
  K: 4,
  A: 11,
};

/** Plain Mau-Mau: match suit or rank, no special cards. */
export const BASIC_RULES: RuleSet = {
  id: 'basic',
  name: 'Oddiy',
  description: "Mast yoki qiymat bo'yicha tashlanadi. Maxsus kartalar yo'q.",
  handSize: 5,
  drawPerTurn: 1,
  mayPlayAfterDraw: true,
  autoPassAfterDraw: true,
  rankEffects: {},
  cardEffects: {},
  applyEffectsOnStartCard: false,
  applyEffectsOnFinishingCard: false,
  mustCoverBlocksFinish: false,
  cardPoints: DEFAULT_POINTS,
  cardPointOverrides: {},
  finishBonusByRank: {},
  finishBonusByCard: {},
  eliminationScore: 101,
  scoreResets: { 100: 50, 101: 0 },
  unconfirmed: [],
};

/**
 * Classic "101" (Сто одно) as played in the popular CIS apps:
 * 6 → +1 and skip, 7 → +2 and skip (both can be passed on with the same rank),
 * 8 → play again, 10 → reverse, A → skip, Q → any card + name a suit,
 * K♠ → +4 and skip. 100 → 50, exactly 101 → 0, above 101 → out.
 */
export const CLASSIC_101_RULES: RuleSet = {
  id: 'classic101',
  name: 'Klassik 101',
  description: '6, 7, 8, 10, tuz, dama va qarg‘a qirol maxsus. Ochkosi 101 dan oshgan o‘yinchi chiqadi.',
  handSize: 5,
  drawPerTurn: 1,
  mayPlayAfterDraw: true,
  autoPassAfterDraw: true,
  rankEffects: {
    '6': { nextDraws: 1, skipNext: true, stackable: true },
    '7': { nextDraws: 2, skipNext: true, stackable: true },
    '8': { mustCover: true },
    '10': { reverse: true },
    A: { skipNext: true },
    Q: { wild: true, chooseSuit: true },
  },
  cardEffects: {
    'K-spades': { nextDraws: 4, skipNext: true },
  },
  applyEffectsOnStartCard: false,
  applyEffectsOnFinishingCard: true,
  mustCoverBlocksFinish: true,
  cardPoints: DEFAULT_POINTS,
  cardPointOverrides: {},
  finishBonusByRank: { Q: -20 },
  finishBonusByCard: { 'Q-spades': -40 },
  eliminationScore: 101,
  scoreResets: { 100: 50, 101: 0 },
  unconfirmed: [
    'Qo‘lga 5 ta karta tarqatiladi (ba’zi ilovalarda 4)',
    'Dama istalgan kartaga tashlanadi (ba’zi variantlarda faqat mast bo‘yicha)',
    '8 bilan raundni tugatib bo‘lmaydi — uni yopish kerak',
    'Qarg‘a qirol: +4 (ba’zi variantlarda +5)',
  ],
};

export const RULE_SETS: readonly RuleSet[] = [CLASSIC_101_RULES, BASIC_RULES];

export function getRuleSet(id: string): RuleSet {
  return RULE_SETS.find((r) => r.id === id) ?? CLASSIC_101_RULES;
}

/** The effect of a card under a rule set (exact-card effects win over rank effects). */
export function effectFor(rules: RuleSet, card: Card): CardEffect {
  return rules.cardEffects[card.id] ?? rules.rankEffects[card.rank] ?? {};
}

export function hasEffect(effect: CardEffect): boolean {
  return Boolean(
    effect.nextDraws || effect.skipNext || effect.reverse || effect.wild || effect.chooseSuit || effect.mustCover,
  );
}

export function cardPoints(rules: RuleSet, card: Card): number {
  return rules.cardPointOverrides[card.id] ?? rules.cardPoints[card.rank];
}

export function handPoints(rules: RuleSet, hand: readonly Card[]): number {
  return hand.reduce((sum, c) => sum + cardPoints(rules, c), 0);
}

export function finishBonus(rules: RuleSet, card: Card): number {
  return rules.finishBonusByCard[card.id] ?? rules.finishBonusByRank[card.rank] ?? 0;
}
