import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DECK_SIZE, RANKS, SUITS, parseCardId } from '../cards';
import { createDeck, deal, shuffle } from '../deck';
import { createRng } from '../random';

describe('deck', () => {
  it('has exactly 36 unique traditional cards (6–A, four suits)', () => {
    const deck = createDeck();
    assert.equal(deck.length, 36);
    assert.equal(DECK_SIZE, 36);
    assert.equal(new Set(deck.map((c) => c.id)).size, 36);
    for (const suit of SUITS) {
      assert.deepEqual(
        deck.filter((c) => c.suit === suit).map((c) => c.rank),
        [...RANKS],
      );
    }
    assert.ok(!deck.some((c) => ['2', '3', '4', '5'].includes(c.rank)));
  });

  it('parses card ids and rejects invalid ones', () => {
    assert.deepEqual(parseCardId('10-hearts'), { id: '10-hearts', rank: '10', suit: 'hearts' });
    assert.equal(parseCardId('5-hearts'), null);
    assert.equal(parseCardId('Q-stars'), null);
    assert.equal(parseCardId('nonsense'), null);
  });
});

describe('shuffle', () => {
  it('keeps every card and does not mutate the input', () => {
    const deck = createDeck();
    const before = deck.map((c) => c.id);
    const out = shuffle(deck, createRng(7));
    assert.deepEqual(
      deck.map((c) => c.id),
      before,
    );
    assert.deepEqual(out.map((c) => c.id).sort(), [...before].sort());
  });

  it('is deterministic for a seed and differs between seeds', () => {
    const a = shuffle(createDeck(), createRng(123)).map((c) => c.id);
    const b = shuffle(createDeck(), createRng(123)).map((c) => c.id);
    const d = shuffle(createDeck(), createRng(124)).map((c) => c.id);
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, d);
  });

  it('spreads cards roughly evenly over many shuffles', () => {
    // Count how often the ace of spades lands in each of 36 positions.
    const counts = new Array<number>(36).fill(0);
    const rng = createRng(99);
    const trials = 36_000;
    for (let i = 0; i < trials; i++) {
      const pos = shuffle(createDeck(), rng).findIndex((c) => c.id === 'A-spades');
      counts[pos] = (counts[pos] ?? 0) + 1;
    }
    for (const n of counts) {
      assert.ok(n > 800 && n < 1200, `position count ${n} is outside the expected range`);
    }
  });
});

describe('deal', () => {
  it('deals round-robin and leaves the rest as the pile', () => {
    const deck = createDeck();
    const { hands, rest } = deal(deck, 3, 5);
    assert.equal(hands.length, 3);
    for (const h of hands) assert.equal(h.length, 5);
    assert.equal(rest.length, 36 - 15);
    assert.equal(hands[0]?.[0]?.id, deck[0]?.id);
    assert.equal(hands[1]?.[0]?.id, deck[1]?.id);
    assert.equal(hands[0]?.[1]?.id, deck[3]?.id);
    const all = [...hands.flat(), ...rest].map((c) => c.id);
    assert.equal(new Set(all).size, 36);
  });

  it('rejects impossible deals', () => {
    assert.throws(() => deal(createDeck(), 1, 5), RangeError);
    assert.throws(() => deal(createDeck(), 4, 9), RangeError);
    assert.throws(() => deal(createDeck(), 2, 0), RangeError);
  });
});
