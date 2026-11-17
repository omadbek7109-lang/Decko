import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BASIC_RULES, CLASSIC_101_RULES } from '../rules';
import {
  GameError,
  canDraw,
  canPass,
  chooseSuit,
  createRound,
  currentPlayer,
  drawCard,
  legalCards,
  passTurn,
  playCard,
  topCard,
} from '../round';
import { ids, table } from './helpers';

const seats = [
  { id: 'me', name: 'Men', isBot: false },
  { id: 'bot', name: 'Bot', isBot: true },
];

describe('createRound', () => {
  it('deals 5 cards each, flips one start card and keeps all 36 cards', () => {
    const r = createRound({ seats, rules: CLASSIC_101_RULES, seed: 1 });
    assert.equal(r.players[0]?.hand.length, 5);
    assert.equal(r.players[1]?.hand.length, 5);
    assert.equal(r.discardPile.length, 1);
    assert.equal(r.drawPile.length, 36 - 10 - 1);
    const all = [...r.players.flatMap((p) => p.hand), ...r.drawPile, ...r.discardPile].map((c) => c.id);
    assert.equal(new Set(all).size, 36);
    assert.equal(r.phase, 'playing');
  });

  it('is reproducible from the seed', () => {
    const a = createRound({ seats, rules: CLASSIC_101_RULES, seed: 5 });
    const b = createRound({ seats, rules: CLASSIC_101_RULES, seed: 5 });
    assert.deepEqual(a, b);
  });

  it('supports 2 to 4 players only', () => {
    assert.throws(() => createRound({ seats: seats.slice(0, 1), rules: BASIC_RULES, seed: 1 }), RangeError);
    const five = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, name: `P${i}`, isBot: true }));
    assert.throws(() => createRound({ seats: five, rules: BASIC_RULES, seed: 1 }), RangeError);
  });
});

describe('valid moves', () => {
  it('allows same suit or same rank only (basic rules)', () => {
    const s = table({ rules: BASIC_RULES, hands: [['8-hearts', '9-spades', 'K-diamonds', 'Q-clubs'], ['6-clubs']], top: '9-hearts' });
    assert.deepEqual(ids(legalCards(s)).sort(), ['8-hearts', '9-spades'].sort());
  });

  it('treats the queen as wild in classic 101', () => {
    const s = table({ hands: [['Q-clubs', '10-spades'], ['6-clubs']], top: '9-hearts' });
    assert.deepEqual(ids(legalCards(s)), ['Q-clubs']);
  });

  it('rejects illegal cards, cards not in hand and moves out of turn', () => {
    const s = table({ hands: [['10-spades', '9-clubs'], ['6-clubs']], top: '9-hearts' });
    assert.throws(() => playCard(s, 'p0', '10-spades'), (e: unknown) => e instanceof GameError && e.code === 'ILLEGAL_CARD');
    assert.throws(() => playCard(s, 'p0', 'A-hearts'), (e: unknown) => e instanceof GameError && e.code === 'CARD_NOT_IN_HAND');
    assert.throws(() => playCard(s, 'p1', '6-clubs'), (e: unknown) => e instanceof GameError && e.code === 'NOT_YOUR_TURN');
  });

  it('a played card goes to the top and the turn passes on', () => {
    const s = playCard(table({ hands: [['9-clubs', '10-hearts'], ['6-clubs']], top: '9-hearts' }), 'p0', '9-clubs');
    assert.equal(topCard(s).id, '9-clubs');
    assert.deepEqual(ids(s.players[0]?.hand ?? []), ['10-hearts']);
    assert.equal(currentPlayer(s).id, 'p1');
  });
});

describe('classic 101 card effects', () => {
  it('7: next player must take 2 and is skipped, or pass it on with a 7', () => {
    let s = playCard(table({ hands: [['7-hearts', '10-clubs'], ['6-clubs', 'J-spades']], top: '9-hearts' }), 'p0', '7-hearts');
    assert.deepEqual(s.pending, { draws: 2, rank: '7', skip: true });
    assert.equal(currentPlayer(s).id, 'p1');
    assert.deepEqual(ids(legalCards(s)), []);
    assert.equal(canPass(s, 'p1'), false);
    s = drawCard(s, 'p1'); // takes the penalty
    assert.equal(s.players[1]?.hand.length, 4);
    assert.equal(s.pending, null);
    assert.equal(currentPlayer(s).id, 'p0');
  });

  it('7 on 7 passes the accumulated penalty to the next player', () => {
    let s = playCard(
      table({ hands: [['7-hearts', '10-clubs'], ['7-spades', 'J-spades'], ['6-diamonds', 'K-clubs']], top: '9-hearts' }),
      'p0',
      '7-hearts',
    );
    assert.deepEqual(ids(legalCards(s)), ['7-spades']);
    s = playCard(s, 'p1', '7-spades');
    assert.deepEqual(s.pending, { draws: 4, rank: '7', skip: true });
    assert.equal(currentPlayer(s).id, 'p2');
    s = drawCard(s, 'p2');
    assert.equal(s.players[2]?.hand.length, 6);
    assert.equal(currentPlayer(s).id, 'p0');
  });

  it('6: next player takes 1 and is skipped; a 6 passes it on', () => {
    let s = playCard(table({ hands: [['6-hearts', '10-clubs'], ['6-clubs', 'J-spades']], top: '9-hearts' }), 'p0', '6-hearts');
    assert.deepEqual(s.pending, { draws: 1, rank: '6', skip: true });
    s = playCard(s, 'p1', '6-clubs');
    assert.deepEqual(s.pending, { draws: 2, rank: '6', skip: true });
    assert.equal(currentPlayer(s).id, 'p0');
  });

  it('K♠: next player draws 4 and is skipped; other kings are plain', () => {
    const s = playCard(table({ hands: [['K-spades', '10-clubs'], ['6-clubs']], top: '9-spades' }), 'p0', 'K-spades');
    assert.equal(s.players[1]?.hand.length, 5);
    assert.equal(currentPlayer(s).id, 'p0');
    const plain = playCard(table({ hands: [['K-hearts', '10-clubs'], ['6-clubs']], top: '9-hearts' }), 'p0', 'K-hearts');
    assert.equal(plain.players[1]?.hand.length, 1);
    assert.equal(currentPlayer(plain).id, 'p1');
  });

  it('A: next player is skipped', () => {
    const s = playCard(table({ hands: [['A-hearts', '10-clubs'], ['6-clubs'], ['6-spades']], top: '9-hearts' }), 'p0', 'A-hearts');
    assert.equal(currentPlayer(s).id, 'p2');
  });

  it('10: reverses direction', () => {
    const s = playCard(table({ hands: [['10-hearts', 'J-clubs'], ['6-clubs'], ['6-spades']], top: '9-hearts' }), 'p0', '10-hearts');
    assert.equal(s.direction, -1);
    assert.equal(currentPlayer(s).id, 'p2');
  });

  it('Q: player names a suit, the next player must follow it', () => {
    let s = playCard(table({ hands: [['Q-clubs', '10-clubs'], ['6-diamonds', '9-hearts', 'Q-hearts']], top: '9-hearts' }), 'p0', 'Q-clubs');
    assert.equal(s.phase, 'choosingSuit');
    assert.equal(currentPlayer(s).id, 'p0');
    s = chooseSuit(s, 'p0', 'diamonds');
    assert.equal(s.requiredSuit, 'diamonds');
    assert.equal(currentPlayer(s).id, 'p1');
    assert.deepEqual(ids(legalCards(s)).sort(), ['6-diamonds', 'Q-hearts'].sort());
  });

  it('8: the player plays again, drawing until they can cover it', () => {
    let s = playCard(
      table({ hands: [['8-hearts', '10-clubs'], ['6-clubs']], top: '9-hearts', pile: ['J-spades', 'K-hearts'] }),
      'p0',
      '8-hearts',
    );
    assert.equal(s.mustCover, true);
    assert.equal(currentPlayer(s).id, 'p0');
    assert.equal(canPass(s, 'p0'), false);
    s = drawCard(s, 'p0'); // J♠ — cannot cover a heart 8
    assert.equal(canDraw(s, 'p0'), true);
    s = drawCard(s, 'p0'); // K♥ — covers
    assert.deepEqual(ids(legalCards(s)), ['K-hearts']);
    s = playCard(s, 'p0', 'K-hearts');
    assert.equal(s.mustCover, false);
    assert.equal(currentPlayer(s).id, 'p1');
  });

  it('a round cannot be finished with an 8', () => {
    const s = playCard(table({ hands: [['8-hearts'], ['6-clubs']], top: '9-hearts' }), 'p0', '8-hearts');
    assert.equal(s.phase, 'playing');
    assert.equal(s.mustCover, true);
    assert.equal(currentPlayer(s).id, 'p0');
  });
});

describe('drawing and passing', () => {
  it('draw once, then pass; a second draw is refused', () => {
    let s = table({ hands: [['10-spades'], ['6-clubs']], top: '9-hearts' });
    assert.equal(canPass(s, 'p0'), false);
    assert.throws(() => passTurn(s, 'p0'), (e: unknown) => e instanceof GameError && e.code === 'CANNOT_PASS');
    s = drawCard(s, 'p0');
    assert.equal(s.players[0]?.hand.length, 2);
    assert.throws(() => drawCard(s, 'p0'), (e: unknown) => e instanceof GameError && e.code === 'ALREADY_DREW');
    s = passTurn(s, 'p0');
    assert.equal(currentPlayer(s).id, 'p1');
    assert.equal(s.hasDrawn, false);
  });

  it('may play the drawn card when it matches', () => {
    let s = table({ hands: [['10-spades'], ['6-clubs']], top: '9-hearts', pile: ['J-hearts'] });
    s = drawCard(s, 'p0');
    assert.deepEqual(ids(legalCards(s)), ['J-hearts']);
  });

  it('reshuffles the discard pile (except the top card) when the deck runs out', () => {
    let s = table({ hands: [['10-spades'], ['6-clubs']], top: '9-hearts', pile: [] });
    s = { ...s, discardPile: [...s.discardPile.slice(0, 0), ...table({ hands: [[], []], top: '7-clubs' }).discardPile, ...s.discardPile] };
    s = drawCard(s, 'p0');
    assert.equal(s.players[0]?.hand.length, 2);
    assert.equal(topCard(s).id, '9-hearts');
    assert.ok(s.events.some((e) => e.type === 'reshuffle'));
  });
});

describe('round completion', () => {
  it('ends the round when a player empties their hand', () => {
    const s = playCard(table({ hands: [['9-clubs'], ['6-clubs', '7-spades']], top: '9-hearts' }), 'p0', '9-clubs');
    assert.equal(s.phase, 'roundOver');
    assert.equal(s.winnerId, 'p0');
    assert.ok(s.events.some((e) => e.type === 'roundOver'));
    assert.throws(() => playCard(s, 'p1', '6-clubs'), (e: unknown) => e instanceof GameError && e.code === 'ROUND_OVER');
  });

  it('finishing with a 7 still makes the next player draw (classic)', () => {
    const s = playCard(table({ hands: [['7-hearts'], ['6-clubs']], top: '9-hearts' }), 'p0', '7-hearts');
    assert.equal(s.phase, 'roundOver');
    assert.equal(s.players[1]?.hand.length, 3);
  });

  it('after drawing an unplayable card the turn passes automatically', () => {
    const s = drawCard(table({ hands: [['10-spades'], ['6-clubs']], top: '9-hearts', pile: ['J-clubs'] }), 'p0');
    assert.equal(currentPlayer(s).id, 'p1');
    assert.equal(s.players[0]?.hand.length, 2);
  });
});
