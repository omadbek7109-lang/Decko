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
  /** Turn order changes direction. */
  reverse?: boolean;
  /** Can be played on any card. */
  wild?: boolean;
  /** Player who plays it names the suit the next player must follow. */
  chooseSuit?: boolean;
  /** Player who plays it must cover it with another card (drawing until they can). */
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
  /** Effects by rank (applies to every suit of that rank). */
  rankEffects: Partial<Record<Rank, CardEffect>>;
  /** Effects for one exact card; these replace the rank effect for that card. */
  cardEffects: Partial<Record<CardId, CardEffect>>;
  /** Apply the effect of the first upturned card at the start of a round. */
  applyEffectsOnStartCard: boolean;
  /** Apply draw/skip effects of the card a player finishes with. */
  applyEffectsOnFinishingCard: boolean;
  /** Penalty points for cards left in hand when a round ends. */
  cardPoints: Record<Rank, number>;
  cardPointOverrides: Partial<Record<CardId, number>>;
  /** Points added to the round winner's score for finishing with this card (usually negative). */
  finishBonusByRank: Partial<Record<Rank, number>>;
  finishBonusByCard: Partial<Record<CardId, number>>;
  /** A player whose total goes ABOVE this is eliminated. */
  eliminationScore: number;
  /** If a total lands exactly on this value it resets to 0 (null = no reset). */
  resetScoreAt: number | null;
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

/**
 * Plain Mau-Mau: match suit or rank, no special cards.
 * The only certain, variant-free rule set.
 */
export const BASIC_RULES: RuleSet = {
  id: 'basic',
  name: 'Oddiy',
  description: "Mast yoki qiymat bo'yicha tashlanadi. Maxsus kartalar yo'q.",
  handSize: 5,
  drawPerTurn: 1,
  mayPlayAfterDraw: true,
  rankEffects: {},
  cardEffects: {},
  applyEffectsOnStartCard: false,
  applyEffectsOnFinishingCard: false,
  cardPoints: DEFAULT_POINTS,
  cardPointOverrides: {},
  finishBonusByRank: {},
  finishBonusByCard: {},
  eliminationScore: 101,
  resetScoreAt: null,
  unconfirmed: ['Karta ochkolari (6–10 o‘z qiymati, 9 = 0, V = 2, D = 3, K = 4, T = 11)'],
};

/**
 * The common "101" variant. Every special effect below is configurable and
 * listed in `unconfirmed` until the product owner approves the exact rules.
 */
export const CLASSIC_101_RULES: RuleSet = {
  id: 'classic101',
  name: 'Klassik 101',
  description: 'Maxsus kartalar bilan. Ochkosi 101 dan oshgan o‘yinchi chiqib ketadi.',
  handSize: 5,
  drawPerTurn: 1,
  mayPlayAfterDraw: true,
  rankEffects: {
    '6': { mustCover: true },
    '7': { nextDraws: 2, skipNext: true },
    '8': { reverse: true },
    A: { skipNext: true },
    Q: { wild: true, chooseSuit: true },
  },
  cardEffects: {
    'K-spades': { nextDraws: 4, skipNext: true },
  },
  applyEffectsOnStartCard: false,
  applyEffectsOnFinishingCard: true,
  cardPoints: DEFAULT_POINTS,
  cardPointOverrides: {},
  finishBonusByRank: { Q: -20 },
  finishBonusByCard: { 'Q-spades': -40 },
  eliminationScore: 101,
  resetScoreAt: null,
  unconfirmed: [
    '6 — tashlagan o‘yinchi uni yana bir karta bilan yopishi kerak',
    '7 — keyingi o‘yinchi 2 ta oladi va yurishni o‘tkazib yuboradi',
    '8 — yurish yo‘nalishi o‘zgaradi',
    'Tuz (A) — keyingi o‘yinchi yurishni o‘tkazib yuboradi',
    'Dama (Q) — istalgan kartaga tashlanadi, mast tanlanadi',
    'Qirol qarg‘a (K♠) — keyingi o‘yinchi 4 ta oladi va o‘tkazib yuboradi',
    'Dama bilan tugatish: −20 ochko, qarg‘a dama bilan: −40',
    'Aynan 100 ga tushsa nolga qaytadimi — hozircha yo‘q',
    'Karta ochkolari (6–10 o‘z qiymati, 9 = 0, V = 2, D = 3, K = 4, T = 11)',
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
