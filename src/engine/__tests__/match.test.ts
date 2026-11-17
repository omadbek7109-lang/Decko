import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chooseBotAction } from '../bot';
import { type MatchState, startMatch, startNextRound, updateRound } from '../match';
import { BASIC_RULES, CLASSIC_101_RULES, type RuleSet, handPoints } from '../rules';
import { type RoundState, chooseSuit, currentPlayer, drawCard, passTurn, playCard } from '../round';
import { cards, table } from './helpers';

function botStep(round: RoundState): RoundState {
  const action = chooseBotAction(round);
  const id = currentPlayer(round).id;
  assert.ok(action, 'bot must always have an action while the round is live');
  switch (action.type) {
    case 'play':
      return playCard(round, id, action.cardId);
    case 'draw':
      return drawCard(round, id);
    case 'pass':
      return passTurn(round, id);
    case 'chooseSuit':
      return chooseSuit(round, id, action.suit);
  }
}

function playWholeMatch(rules: RuleSet, seed: number, players: number): MatchState {
  const seats = Array.from({ length: players }, (_, i) => ({ id: `b${i}`, name: `Bot ${i}`, isBot: true }));
  let match = startMatch(seats, rules, seed);
  let steps = 0;
  while (match.phase !== 'matchOver') {
    if (match.phase === 'roundSummary') {
      match = startNextRound(match);
      continue;
    }
    match = updateRound(match, botStep(match.round));
    steps++;
    assert.ok(steps < 50_000, 'match did not finish');
  }
  return match;
}

describe('scoring', () => {
  it('counts hand points with the configured values', () => {
    assert.equal(handPoints(CLASSIC_101_RULES, cards('9-hearts', 'A-clubs', 'K-spades', '10-hearts')), 0 + 11 + 4 + 10);
  });

  it('adds hand points to losers and the finish bonus to the winner', () => {
    const seats = [
      { id: 'p0', name: 'A', isBot: false },
      { id: 'p1', name: 'B', isBot: true },
    ];
    const match = startMatch(seats, CLASSIC_101_RULES, 1);
    const round = table({ hands: [['Q-hearts'], ['A-clubs', '10-spades']], top: '9-hearts' });
    const done = updateRound({ ...match, round }, playCard(round, 'p0', 'Q-hearts'));
    assert.equal(done.phase, 'roundSummary');
    assert.equal(done.players[0]?.score, -20);
    assert.equal(done.players[1]?.score, 21);
  });

  it('eliminates a player who goes above 101 and ends a 2-player match', () => {
    const seats = [
      { id: 'p0', name: 'A', isBot: false },
      { id: 'p1', name: 'B', isBot: true },
    ];
    let match = startMatch(seats, BASIC_RULES, 1);
    match = { ...match, players: match.players.map((p) => (p.id === 'p1' ? { ...p, score: 95 } : p)) };
    const round = table({ rules: BASIC_RULES, hands: [['9-clubs'], ['A-clubs']], top: '9-hearts' });
    const done = updateRound({ ...match, round }, playCard(round, 'p0', '9-clubs'));
    assert.equal(done.phase, 'matchOver');
    assert.equal(done.winnerId, 'p0');
    assert.equal(done.players[1]?.eliminated, true);
  });

  it('exactly 101 is not eliminated', () => {
    const seats = [
      { id: 'p0', name: 'A', isBot: false },
      { id: 'p1', name: 'B', isBot: true },
    ];
    let match = startMatch(seats, BASIC_RULES, 1);
    match = { ...match, players: match.players.map((p) => (p.id === 'p1' ? { ...p, score: 90 } : p)) };
    const round = table({ rules: BASIC_RULES, hands: [['9-clubs'], ['A-clubs']], top: '9-hearts' });
    const done = updateRound({ ...match, round }, playCard(round, 'p0', '9-clubs'));
    assert.equal(done.players[1]?.score, 101);
    assert.equal(done.players[1]?.eliminated, false);
    assert.equal(done.phase, 'roundSummary');
  });
});

describe('game completion', () => {
  for (const players of [2, 3, 4]) {
    it(`bots always finish a full ${players}-player match (classic + basic, many seeds)`, () => {
      for (let seed = 1; seed <= 60; seed++) {
        for (const rules of [CLASSIC_101_RULES, BASIC_RULES]) {
          const m = playWholeMatch(rules, seed * 7919, players);
          assert.equal(m.phase, 'matchOver');
          assert.ok(m.winnerId);
          const standing = m.players.filter((p) => !p.eliminated);
          assert.ok(standing.length <= 1);
          // Card conservation in the final round.
          const r = m.round;
          const total = r.players.reduce((n, p) => n + p.hand.length, 0) + r.drawPile.length + r.discardPile.length;
          assert.equal(total, 36);
        }
      }
    });
  }
});
