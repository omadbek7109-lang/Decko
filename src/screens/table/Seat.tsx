import { t } from '../../i18n/uz';
import type { CardBackId } from '../../state/session';
import { PlayingCard } from '../../ui/cards/PlayingCard';
import { AvatarTile } from '../../ui/components/Layout';

interface SeatProps {
  name: string;
  cardCount: number;
  score: number;
  active: boolean;
  back: CardBackId;
  /** Smaller seat for 3–4 player tables. */
  compact?: boolean;
}

/** An opponent: a fan of face-down cards behind a square player tile. */
export function Seat({ name, cardCount, score, active, back, compact = false }: SeatProps) {
  const shown = Math.min(cardCount, compact ? 6 : 9);
  const cardW = compact ? 34 : 48;
  const tile = compact ? 52 : 70;
  const spread = shown > 1 ? Math.min(compact ? 11 : 13, (compact ? 60 : 84) / (shown - 1)) : 0;
  const width = compact ? 110 : 190;
  const height = compact ? 100 : 128;

  return (
    <div
      className="relative"
      style={{ width, height }}
      role="group"
      aria-label={`${name}: ${t.game.cards(cardCount)}, ${t.game.points.toLowerCase()} ${score}${active ? `, ${t.game.waiting(name)}` : ''}`}
    >
      <div aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => {
          const angle = (i - (shown - 1) / 2) * spread;
          return (
            <PlayingCard
              key={i}
              faceDown
              back={back}
              width={cardW}
              className="absolute"
              style={{
                left: width / 2 - cardW / 2,
                top: compact ? 14 : 20,
                transform: `rotate(${angle}deg)`,
                transformOrigin: '50% 160%',
              }}
            />
          );
        })}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: compact ? 6 : 4 }}>
        <AvatarTile name={name} size={tile} badge={score} label={name} active={active} />
      </div>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-muted" aria-hidden="true">
        {t.game.cards(cardCount)}
      </span>
    </div>
  );
}
