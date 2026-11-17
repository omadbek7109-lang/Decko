import { useMemo } from 'react';
import { type Card, type CardId, RANKS, SUITS } from '../../engine';
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
  playable: ReadonlySet<CardId>;
  myTurn: boolean;
  width: number;
  onPlay: (id: CardId) => void;
}

/** The player's fanned hand. Cards that can be played now are raised; others are dimmed. */
export function Hand({ cards, playable, myTurn, width, onPlay }: HandProps) {
  const sorted = useMemo(() => sortHand(cards), [cards]);
  const n = sorted.length;
  const cardW = Math.round(Math.max(62, Math.min(88, width * 0.21)));
  const cardH = Math.round(cardW * 1.4);
  const step = n > 1 ? Math.min(cardW * 0.7, (width - cardW) / (n - 1)) : 0;
  const total = cardW + step * Math.max(0, n - 1);
  const spread = Math.min(3.5, 22 / Math.max(1, n));

  return (
    <div className="relative mx-auto" style={{ width: total, height: cardH + 26 }} role="group" aria-label="Qo‘lingizdagi kartalar">
      {sorted.map((card, i) => {
        const t = i - (n - 1) / 2;
        const canPlay = myTurn && playable.has(card.id);
        const lift = canPlay ? 16 : 0;
        const y = 12 + t * t * 0.9 - lift;
        return (
          <PlayingCard
            key={card.id}
            card={card}
            width={cardW}
            className="absolute"
            style={{ left: i * step, top: y, transform: `rotate(${t * spread}deg)`, transformOrigin: '50% 130%' }}
            dimmed={myTurn && !canPlay}
            disabled={!canPlay}
            label={`${cardName(card)}${canPlay ? '' : ' (hozir tashlab bo‘lmaydi)'}`}
            onClick={() => onPlay(card.id)}
          />
        );
      })}
    </div>
  );
}
