import type { CardBackId } from '../../state/session';
import { PlayingCard } from '../../ui/cards/PlayingCard';
import { Avatar } from '../../ui/components/Layout';
import { t } from '../../i18n/uz';

interface SeatProps {
  name: string;
  cardCount: number;
  score: number;
  limit: number;
  active: boolean;
  back: CardBackId;
  compact?: boolean;
}

/** An opponent: avatar, name, score and a small fan of face-down cards. */
export function Seat({ name, cardCount, score, limit, active, back, compact = false }: SeatProps) {
  const shown = Math.min(cardCount, compact ? 4 : 7);
  const w = compact ? 26 : 34;
  const step = compact ? 9 : 13;
  return (
    <div
      className="flex flex-col items-center gap-1.5"
      aria-label={`${name}: ${t.game.cards(cardCount)}, ${t.game.points.toLowerCase()} ${score}`}
    >
      <div className="relative" style={{ height: Math.round(w * 1.4) + 6, width: w + step * Math.max(0, shown - 1) }} aria-hidden="true">
        {Array.from({ length: shown }, (_, i) => {
          const tilt = (i - (shown - 1) / 2) * (compact ? 5 : 6);
          return (
            <PlayingCard
              key={i}
              faceDown
              back={back}
              width={w}
              className="absolute top-0"
              style={{ left: i * step, transform: `rotate(${tilt}deg)`, transformOrigin: '50% 120%' }}
            />
          );
        })}
        <span className="absolute -right-2 -top-1 flex min-w-6 items-center justify-center rounded-full bg-paper px-1.5 text-[12px] font-bold leading-6 text-paper-ink">
          {cardCount}
        </span>
      </div>
      <div className={`flex items-center gap-2 rounded-full border bg-felt-deep/80 py-1 pl-1 pr-3 ${active ? 'border-accent' : 'border-line'}`}>
        <Avatar name={name} size={compact ? 26 : 30} />
        <div className="flex flex-col leading-tight">
          <span className="max-w-[86px] truncate text-[13px] font-semibold">{name}</span>
          <span className="text-[11px] text-muted">
            {score}/{limit}
          </span>
        </div>
      </div>
      {active && <span className="sr-only">{t.game.waiting(name)}</span>}
    </div>
  );
}
