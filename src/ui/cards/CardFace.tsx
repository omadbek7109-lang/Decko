import { memo } from 'react';
import { type Card, type Rank, isCourtRank } from '../../engine';
import { CourtFigure } from './CourtFigure';
import { SuitShape, suitColor } from './suits';

/** Pip positions on a 200×280 card for the number ranks. */
const L = 60;
const M = 100;
const R = 140;
const PIPS: Partial<Record<Rank, [number, number][]>> = {
  '6': [[L, 58], [L, 140], [L, 222], [R, 58], [R, 140], [R, 222]],
  '7': [[L, 58], [L, 140], [L, 222], [R, 58], [R, 140], [R, 222], [M, 99]],
  '8': [[L, 58], [L, 140], [L, 222], [R, 58], [R, 140], [R, 222], [M, 99], [M, 181]],
  '9': [[L, 58], [L, 113], [L, 167], [L, 222], [R, 58], [R, 113], [R, 167], [R, 222], [M, 140]],
  '10': [[L, 58], [L, 113], [L, 167], [L, 222], [R, 58], [R, 113], [R, 167], [R, 222], [M, 86], [M, 194]],
};

export const CARD_RATIO = 1.4;

function Corner({ card, color, points }: { card: Card; color: string; points?: number }) {
  const ten = card.rank === '10';
  return (
    <g>
      <text
        x={ten ? 24 : 22}
        y={44}
        textAnchor="middle"
        fontFamily="'Libre Baskerville', Georgia, 'Times New Roman', serif"
        fontWeight={700}
        fontSize={ten ? 31 : 38}
        letterSpacing={ten ? -3 : 0}
        fill={color}
      >
        {card.rank}
      </text>
      {(card.rank === '6' || card.rank === '9') && <path d="M13 50H31" stroke={color} strokeWidth={2.4} strokeLinecap="round" />}
      {points !== undefined && (
        <text x={ten ? 46 : 42} y={24} fontFamily="Inter, system-ui, sans-serif" fontWeight={700} fontSize={17} fill="#8E949C">
          {points}
        </text>
      )}
      <SuitShape suit={card.suit} x={22} y={68} size={22} />
    </g>
  );
}

/** The full face of a traditional playing card as one scalable SVG. */
export const CardFace = memo(function CardFace({ card, points }: { card: Card; points?: number }) {
  const color = suitColor(card.suit);
  const pips = PIPS[card.rank];
  return (
    <svg viewBox="0 0 200 280" className="block h-full w-full" aria-hidden="true">
      <rect x={0.5} y={0.5} width={199} height={279} rx={13} fill="#FFFFFF" stroke="#C9CCD1" />
      <Corner card={card} color={color} points={points} />
      <g transform="rotate(180 100 140)">
        <Corner card={card} color={color} />
      </g>
      {pips?.map(([x, y]) => (
        <SuitShape key={`${x}-${y}`} suit={card.suit} x={x} y={y} size={36} rotate={y > 140} />
      ))}
      {card.rank === 'A' && (
        <g>
          {card.suit === 'spades' && <circle cx={100} cy={140} r={58} fill="none" stroke={color} strokeWidth={1.2} />}
          <SuitShape suit={card.suit} x={100} y={140} size={card.suit === 'spades' ? 84 : 76} />
        </g>
      )}
      {isCourtRank(card.rank) && <CourtFigure rank={card.rank as 'J' | 'Q' | 'K'} suit={card.suit} />}
    </svg>
  );
});
