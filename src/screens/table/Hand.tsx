import { useMemo } from 'react';
import { type Card, type CardId, RANKS, type RuleSet, SUITS, cardPoints } from '../../engine';
import { cardName } from '../../i18n/uz';
import { PlayingCard } from '../../ui/cards/PlayingCard';

const SUIT_ORDER: Record<string, number> = Object.fromEntries(SUITS.map((s, i) => [s, i]));
const RANK_ORDER: Record<string, number> = Object.fromEntries(RANKS.map((r, i) => [r, i]));

function sortHand(hand: readonly Card[]): Card[] {
  return hand
    .slice()
    .sort((a, b) => (SUIT_ORDER[a.suit] ?? 0) - (SUIT_ORDER[b.suit] ?? 0) || (RANK_ORDER[a.rank] ?? 0) - (RANK_ORDER[b.rank] ?? 0));
}

interface HandProps {
  cards: readonly Card[];
  myTurn: boolean;
  width: number;
  /** Visible height; the lower part of the cards tucks under the player panel. */
  height: number;
  rules: RuleSet;
  onPlay: (id: CardId) => void;
}

/** The player's fanned hand. No move hints: every card looks the same; illegal taps are rejected by the engine. */
export function Hand({ cards, myTurn, width, height, rules, onPlay }: HandProps) {
  const sorted = useMemo(() => sortHand(cards), [cards]);
  const n = sorted.length;
  const cardW = Math.round(Math.max(84, Math.min(132, width * 0.31, (height - 20) / 1.05)));
  const step = n > 1 ? Math.min(cardW * 0.62, (width - 48 - cardW) / (n - 1)) : 0;
  const total = cardW + step * Math.max(0, n - 1);
  const spread = Math.min(3, 16 / Math.max(1, n));
  const boxW = Math.min(width, total + 24);
  const offset = (boxW - total) / 2;

  return (
    <div className="relative mx-auto" style={{ width: boxW, height, clipPath: 'inset(-60px -60px 0 -60px)' }} role="group" aria-label="Qo‘lingizdagi kartalar">
      {sorted.map((card, i) => {
        const tt = i - (n - 1) / 2;
        return (
          <PlayingCard
            key={card.id}
            card={card}
            width={cardW}
            points={cardPoints(rules, card)}
            className="animate-deal absolute transition-[top,transform] duration-200"
            style={{
              left: offset + i * step,
              top: 22 + Math.abs(tt) * Math.abs(tt) * 1.1,
              transform: `rotate(${tt * spread}deg)`,
              transformOrigin: '50% 110%',
            }}
            disabled={!myTurn}
            label={cardName(card)}
            onClick={() => onPlay(card.id)}
          />
        );
      })}
    </div>
  );
}
