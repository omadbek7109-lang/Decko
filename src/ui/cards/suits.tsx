import type { Suit } from '../../engine';

/** Suit outlines drawn in a 100×100 box, original artwork for DECKO. */
const SUIT_PATHS: Record<Suit, string[]> = {
  hearts: [
    'M50 93C22 72 3 54 3 31C3 15 15 4 29 4C39 4 46 10 50 19C54 10 61 4 71 4C85 4 97 15 97 31C97 54 78 72 50 93Z',
  ],
  diamonds: ['M50 2L87 50L50 98L13 50Z'],
  spades: [
    'M50 3C63 22 97 39 97 62C97 77 86 87 72 87C63 87 56 82 53 75C55 85 59 92 67 97L33 97C41 92 45 85 47 75C44 82 37 87 28 87C14 87 3 77 3 62C3 39 37 22 50 3Z',
  ],
  // Clubs: stem only; the three leaves are circles (below).
  clubs: ['M46 55C46 76 41 88 32 97L68 97C59 88 54 76 54 55Z'],
};

const CLUB_CIRCLES = [
  { cx: 50, cy: 28, r: 21 },
  { cx: 27, cy: 60, r: 21 },
  { cx: 73, cy: 60, r: 21 },
];

export const SUIT_COLOR = {
  red: '#B3261E',
  black: '#1B1F24',
} as const;

export function suitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? SUIT_COLOR.red : SUIT_COLOR.black;
}

interface SuitShapeProps {
  suit: Suit;
  /** Centre point and height in the parent SVG's units. */
  x: number;
  y: number;
  size: number;
  rotate?: boolean;
  fill?: string;
}

/** A suit symbol placed inside an SVG. */
export function SuitShape({ suit, x, y, size, rotate = false, fill }: SuitShapeProps) {
  const s = size / 100;
  const transform = `translate(${x} ${y})${rotate ? ' rotate(180)' : ''} scale(${s}) translate(-50 -50)`;
  const color = fill ?? suitColor(suit);
  if (suit === 'clubs') {
    return (
      <g transform={transform} fill={color}>
        {CLUB_CIRCLES.map((c) => (
          <circle key={`${c.cx}-${c.cy}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}
        <path d={SUIT_PATHS.clubs[0]} />
      </g>
    );
  }
  return (
    <g transform={transform} fill={color}>
      {SUIT_PATHS[suit].map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}

/** Stand-alone inline suit icon (for chips, buttons and text). */
export function SuitIcon({ suit, size = 16, className, color }: { suit: Suit; size?: number; className?: string; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <SuitShape suit={suit} x={50} y={50} size={96} fill={color} />
    </svg>
  );
}
