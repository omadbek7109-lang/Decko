import type { Card } from './cards';
import { type RuleSet, finishBonus, handPoints } from './rules';
import { type RoundState, type SeatInput, createRound, topCard } from './round';

export interface MatchPlayer extends SeatInput {
  score: number;
  eliminated: boolean;
}

export interface RoundResultLine {
  playerId: string;
  /** Points added this round (negative = bonus). */
  delta: number;
  total: number;
  reset: boolean;
  eliminated: boolean;
}

export interface RoundResult {
  roundNumber: number;
  winnerId: string;
  finishingCard: Card;
  lines: RoundResultLine[];
}

export type MatchPhase = 'round' | 'roundSummary' | 'matchOver';

export interface MatchState {
  readonly rules: RuleSet;
  readonly seed: number;
  readonly players: readonly MatchPlayer[];
  readonly roundNumber: number;
  readonly round: RoundState;
  readonly results: readonly RoundResult[];
  readonly phase: MatchPhase;
  readonly winnerId: string | null;
}

function roundSeed(matchSeed: number, roundNumber: number): number {
  return (matchSeed + Math.imul(roundNumber, 0x85ebca6b)) >>> 0;
}

export function startMatch(seats: readonly SeatInput[], rules: RuleSet, seed: number): MatchState {
  const players: MatchPlayer[] = seats.map((s) => ({ ...s, score: 0, eliminated: false }));
  return {
    rules,
    seed,
    players,
    roundNumber: 1,
    round: createRound({ seats, rules, seed: roundSeed(seed, 1), startIndex: 0 }),
    results: [],
    phase: 'round',
    winnerId: null,
  };
}

/** Replaces the live round (after any player action). Scores the round when it ends. */
export function updateRound(match: MatchState, round: RoundState): MatchState {
  if (match.phase !== 'round') return match;
  if (round.phase !== 'roundOver' || round.winnerId === null) return { ...match, round };
  return scoreRound({ ...match, round });
}

function scoreRound(match: MatchState): MatchState {
  const { rules, round } = match;
  const winnerId = round.winnerId as string;
  const finishingCard = topCard(round);
  const lines: RoundResultLine[] = [];

  const players = match.players.map((p) => {
    const seat = round.players.find((rp) => rp.id === p.id);
    if (!seat || p.eliminated) return p;
    const delta = p.id === winnerId ? finishBonus(rules, finishingCard) : handPoints(rules, seat.hand);
    let total = p.score + delta;
    const replacement = rules.scoreResets[total];
    const reset = replacement !== undefined;
    if (replacement !== undefined) total = replacement;
    const eliminated = total > rules.eliminationScore;
    lines.push({ playerId: p.id, delta, total, reset, eliminated });
    return { ...p, score: total, eliminated };
  });

  const result: RoundResult = { roundNumber: match.roundNumber, winnerId, finishingCard, lines };
  const remaining = players.filter((p) => !p.eliminated);
  const base = { ...match, players, results: [...match.results, result] };

  if (remaining.length <= 1) {
    // Last player standing wins; if everyone went over, the lowest score wins.
    const winner =
      remaining[0] ?? players.reduce((best, p) => (p.score < best.score ? p : best), players[0] as MatchPlayer);
    return { ...base, phase: 'matchOver', winnerId: winner.id };
  }
  return { ...base, phase: 'roundSummary' };
}

/** Deals the next round to everyone still in the match. */
export function startNextRound(match: MatchState): MatchState {
  if (match.phase !== 'roundSummary') return match;
  const seats = match.players.filter((p) => !p.eliminated).map(({ id, name, isBot }) => ({ id, name, isBot }));
  const roundNumber = match.roundNumber + 1;
  // The previous round's winner starts, if still in; otherwise the first seat.
  const lastWinner = match.results[match.results.length - 1]?.winnerId;
  const startIndex = Math.max(0, seats.findIndex((s) => s.id === lastWinner));
  return {
    ...match,
    roundNumber,
    round: createRound({ seats, rules: match.rules, seed: roundSeed(match.seed, roundNumber), startIndex }),
    phase: 'round',
  };
}
