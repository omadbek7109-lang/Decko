import type { Card, Suit } from '../../engine';
import { SUIT_NAME, cardName, t } from '../../i18n/uz';
import type { CardBackId } from '../../state/session';
import { PlayingCard } from '../../ui/cards/PlayingCard';
import { SuitIcon } from '../../ui/cards/suits';

/** Stable small tilt per card so the pile looks hand-placed but never jumps. */
function tiltFor(card: Card): number {
  let h = 0;
  for (const ch of card.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % 15) - 7;
}

function DirectionArrow({ flip, reversed }: { flip: boolean; reversed: boolean }) {
  // Top arc points right for clockwise; bottom arc points left.
  const pointsRight = flip ? reversed : !reversed;
  return (
    <svg width="132" height="22" viewBox="0 0 132 22" aria-hidden="true" className="text-accent/60">
      <path d={flip ? 'M10 4C40 20 92 20 122 4' : 'M10 18C40 2 92 2 122 18'} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {pointsRight ? (
        <path d={flip ? 'M114 1L123 4L120 13' : 'M114 21L123 18L120 9'} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={flip ? 'M18 1L9 4L12 13' : 'M18 21L9 18L12 9'} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

interface CenterPileProps {
  top: Card;
  under: Card | null;
  drawCount: number;
  requiredSuit: Suit | null;
  direction: 1 | -1;
  back: CardBackId;
  cardWidth: number;
}

export function CenterPile({ top, under, drawCount, requiredSuit, direction, back, cardWidth }: CenterPileProps) {
  const reversed = direction === -1;
  return (
    <div className="flex flex-col items-center gap-2" aria-label={t.game.direction(direction)}>
      <DirectionArrow flip={false} reversed={reversed} />
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative" style={{ width: cardWidth + 4, height: Math.round(cardWidth * 1.4) + 4 }}>
            {drawCount > 1 && <PlayingCard faceDown back={back} width={cardWidth} className="absolute left-1 top-1" />}
            {drawCount > 0 ? (
              <PlayingCard faceDown back={back} width={cardWidth} className="absolute left-0 top-0" label={`${t.game.deck}: ${drawCount}`} />
            ) : (
              <div className="absolute inset-0 rounded-[7%/5%] border-2 border-dashed border-line" />
            )}
          </div>
          <span className="text-[12px] font-medium text-muted">
            {t.game.deck} · {drawCount}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="relative flex items-center justify-center" style={{ width: cardWidth * 1.25, height: Math.round(cardWidth * 1.4) + 4 }}>
            {under && <PlayingCard card={under} width={cardWidth} className="absolute" style={{ transform: `rotate(${tiltFor(under)}deg)` }} />}
            <PlayingCard
              card={top}
              width={cardWidth}
              className="absolute"
              style={{ transform: `rotate(${tiltFor(top)}deg)` }}
              label={cardName(top)}
            />
          </div>
          <span className="flex h-[18px] items-center gap-1 text-[12px] font-medium text-muted">
            {requiredSuit ? (
              <>
                <SuitIcon suit={requiredSuit} size={13} color={requiredSuit === 'hearts' || requiredSuit === 'diamonds' ? '#F08A80' : '#EAF2F1'} />
                {SUIT_NAME[requiredSuit]}
              </>
            ) : (
              ' '
            )}
          </span>
        </div>
      </div>
      <DirectionArrow flip reversed={reversed} />
    </div>
  );
}
