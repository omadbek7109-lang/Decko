import type { Card, Suit } from '../../engine';
import { SUIT_NAME, cardName, t } from '../../i18n/uz';
import type { CardBackId } from '../../state/session';
import { PlayingCard } from '../../ui/cards/PlayingCard';
import { SuitIcon, suitColor } from '../../ui/cards/suits';

/** Stable tilt per card so the pile looks hand-placed but never jumps. */
function tiltFor(card: Card, range = 22): number {
  let h = 0;
  for (const ch of card.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (Math.abs(h) % (range + 1)) - range / 2;
}

/** Long curved arrow showing the turn direction (clockwise = top arrow points right). */
function DirectionArrow({ position, clockwise, width }: { position: 'top' | 'bottom'; clockwise: boolean; width: number }) {
  const top = position === 'top';
  const right = top ? clockwise : !clockwise;
  const w = width;
  const arc = top ? `M12 26C${w * 0.3} 4 ${w * 0.7} 4 ${w - 12} 26` : `M12 6C${w * 0.3} 28 ${w * 0.7} 28 ${w - 12} 6`;
  const head = right
    ? top
      ? `M${w - 30} 15L${w - 10} 27L${w - 30} 33`
      : `M${w - 30} 2L${w - 10} 5L${w - 24} 19`
    : top
      ? `M30 15L10 27L30 33`
      : `M30 2L10 5L24 19`;
  return (
    <svg width={w} height={34} viewBox={`0 0 ${w} 34`} aria-hidden="true" className="text-accent/55">
      <path d={arc} stroke="currentColor" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={head} fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

interface CenterPileProps {
  top: Card;
  under: readonly Card[];
  drawCount: number;
  requiredSuit: Suit | null;
  direction: 1 | -1;
  back: CardBackId;
  deckWidth: number;
  pileWidth: number;
  topPoints: number;
}

export function CenterPile({ top, under, drawCount, requiredSuit, direction, back, deckWidth, pileWidth, topPoints }: CenterPileProps) {
  const pileH = Math.round(pileWidth * 1.4);
  const deckH = Math.round(deckWidth * 1.4);
  const arrowW = Math.round(pileWidth * 1.9);
  return (
    <div className="flex w-full items-center justify-center gap-5 px-4" aria-label={t.game.direction(direction)}>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[26px] font-semibold tabular-nums leading-none text-white" aria-label={`${t.game.deck}: ${drawCount}`}>
          {drawCount}
        </span>
        <div className="relative" style={{ width: deckWidth + 6, height: deckH + 6 }}>
          {drawCount > 2 && <PlayingCard faceDown back={back} width={deckWidth} className="absolute left-1.5 top-1.5" />}
          {drawCount > 1 && <PlayingCard faceDown back={back} width={deckWidth} className="absolute left-[3px] top-[3px]" />}
          {drawCount > 0 ? (
            <PlayingCard faceDown back={back} width={deckWidth} className="absolute left-0 top-0" />
          ) : (
            <div className="absolute inset-0 rounded-[6.5%/4.6%] border-2 border-dashed border-white/20" />
          )}
        </div>
        <span className="text-[12px] font-medium text-muted">{t.game.deck}</span>
      </div>

      <div className="flex flex-col items-center">
        <DirectionArrow position="top" clockwise={direction === 1} width={arrowW} />
        <div className="relative my-1 flex items-center justify-center" style={{ width: pileWidth * 1.35, height: pileH * 1.05 }}>
          {under.map((card) => (
            <PlayingCard key={card.id} card={card} width={pileWidth} className="absolute" style={{ transform: `rotate(${tiltFor(card)}deg)` }} />
          ))}
          <PlayingCard
            key={top.id}
            card={top}
            width={pileWidth}
            points={topPoints}
            className="animate-deal absolute"
            style={{ transform: `rotate(${tiltFor(top, 30)}deg)` }}
            label={cardName(top)}
          />
          {requiredSuit && (
            <span
              className="absolute -right-3 -top-2 flex size-11 items-center justify-center rounded-full border-2 border-white bg-paper shadow-lg"
              role="img"
              aria-label={`Mast: ${SUIT_NAME[requiredSuit]}`}
            >
              <SuitIcon suit={requiredSuit} size={24} color={suitColor(requiredSuit)} />
            </span>
          )}
        </div>
        <DirectionArrow position="bottom" clockwise={direction === 1} width={arrowW} />
      </div>
    </div>
  );
}
