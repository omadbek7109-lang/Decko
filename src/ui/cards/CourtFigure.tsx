import { type JSX, useId } from 'react';
import type { Rank, Suit } from '../../engine';
import { SuitShape, suitColor } from './suits';

/**
 * Traditional double-headed court card artwork (J, Q, K), drawn in a
 * 200×280 card coordinate space. Original, lightweight vector art.
 */

const SKIN = '#EDCCA8';
const SKIN_LINE = '#8A6446';
const GOLD = '#C29A2E';
const GOLD_DARK = '#7E6216';
const INK = '#2A2A2A';

function robeColors(suit: Suit): { robe: string; accent: string } {
  const red = suit === 'hearts' || suit === 'diamonds';
  return red ? { robe: '#B3261E', accent: '#23395B' } : { robe: '#23395B', accent: '#B3261E' };
}

function Face() {
  return (
    <g>
      <rect x={93} y={96} width={14} height={12} fill={SKIN} />
      <ellipse cx={100} cy={84} rx={14.5} ry={17} fill={SKIN} stroke={SKIN_LINE} strokeWidth={0.8} />
      <path d="M91 78.5h6M103 78.5h6" stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
      <ellipse cx={94} cy={82} rx={1.5} ry={1.3} fill={INK} />
      <ellipse cx={106} cy={82} rx={1.5} ry={1.3} fill={INK} />
      <path d="M100 83v6.5l-2 1" stroke={SKIN_LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Robe({ robe, accent, ermine }: { robe: string; accent: string; ermine: boolean }) {
  return (
    <g>
      <path d="M44 140C46 126 52 118 64 114L88 106H112L136 114C148 118 154 126 156 140Z" fill={robe} />
      <path d="M88 106L100 132L112 106Z" fill={accent} />
      <path d="M88 106L100 132L112 106" stroke={GOLD} strokeWidth={1.6} fill="none" />
      {ermine ? (
        <g>
          <rect x={46} y={128} width={108} height={7} fill="#F4ECDA" />
          {[54, 68, 82, 118, 132, 146].map((x) => (
            <path key={x} d={`M${x} 129.5v4`} stroke={INK} strokeWidth={1.4} />
          ))}
        </g>
      ) : (
        <path d="M46 131H154" stroke={GOLD} strokeWidth={2} />
      )}
    </g>
  );
}

function King({ suit }: { suit: Suit }) {
  const { robe, accent } = robeColors(suit);
  return (
    <g>
      <Robe robe={robe} accent={accent} ermine />
      {/* scepter */}
      <path d="M128 140L134 98" stroke={GOLD_DARK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={134.5} cy={95} r={4} fill={GOLD} stroke={GOLD_DARK} strokeWidth={1} />
      <path d="M85 76C84 92 88 100 93 104" stroke="#A9AEB5" strokeWidth={4} fill="none" />
      <path d="M115 76C116 92 112 100 107 104" stroke="#A9AEB5" strokeWidth={4} fill="none" />
      <Face />
      {/* beard and moustache */}
      <path d="M87 89C88 100 93 110 100 112C107 110 112 100 113 89C108 94 92 94 87 89Z" fill="#A9AEB5" />
      <path d="M93 92.5C96 91 99 91.5 100 93C101 91.5 104 91 107 92.5" stroke="#7E848C" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* crown */}
      <path d="M84 71V56L90.5 63L95 51L100 61L105 51L109.5 63L116 56V71Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1} strokeLinejoin="round" />
      <rect x={84} y={67} width={32} height={4.5} fill={accent} />
      <SuitShape suit={suit} x={58} y={56} size={16} fill={suitColor(suit)} />
    </g>
  );
}

function Queen({ suit }: { suit: Suit }) {
  const { robe, accent } = robeColors(suit);
  return (
    <g>
      <path d="M80 86C78 66 89 60 100 60C111 60 122 66 120 86C121 98 118 108 112 112L88 112C82 108 79 98 80 86Z" fill="#6B4226" />
      <Robe robe={robe} accent={accent} ermine />
      {/* flower */}
      <path d="M66 140L70 108" stroke="#3E6B3A" strokeWidth={2} strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={70} cy={102} rx={3} ry={6} fill={accent} transform={`rotate(${a} 70 106)`} />
      ))}
      <circle cx={70} cy={106} r={2.4} fill={GOLD} />
      <Face />
      <path d="M95 93.5C98 95 102 95 105 93.5" stroke="#9C3B32" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {/* pearl necklace */}
      {[90, 94, 98, 102, 106, 110].map((x, i) => (
        <circle key={x} cx={x} cy={109 + (i === 0 || i === 5 ? 0 : i === 1 || i === 4 ? 1.5 : 2.2)} r={1.5} fill="#F7F3E8" stroke="#B9AE95" strokeWidth={0.5} />
      ))}
      {/* tiara */}
      <path d="M88 70C92 64 108 64 112 70" stroke={GOLD} strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={100} cy={64.5} r={2.6} fill={GOLD} stroke={GOLD_DARK} strokeWidth={0.8} />
      <SuitShape suit={suit} x={142} y={56} size={16} fill={suitColor(suit)} />
    </g>
  );
}

function Jack({ suit }: { suit: Suit }) {
  const { robe, accent } = robeColors(suit);
  return (
    <g>
      <Robe robe={accent} accent={robe} ermine={false} />
      {/* staff */}
      <path d="M70 140L64 84" stroke="#6B4A2B" strokeWidth={3} strokeLinecap="round" />
      <path d="M64 84L58 76L64 70L70 76Z" fill="#B8BEC6" stroke="#6E747C" strokeWidth={1} />
      <path d="M86 78C86 70 92 66 100 66C108 66 114 70 114 78C112 74 88 74 86 78Z" fill="#7A5230" />
      <Face />
      <path d="M95 93.5H105" stroke="#9C3B32" strokeWidth={1.3} strokeLinecap="round" />
      {/* cap with feather */}
      <path d="M80 72C82 62 92 57 102 57C112 57 120 62 121 70C111 67 90 67 80 72Z" fill={robe} />
      <path d="M80 72C90 67 111 67 121 70" stroke={GOLD} strokeWidth={1.6} fill="none" />
      <path d="M110 60C118 50 128 46 138 46C130 50 124 56 116 62Z" fill="#E9E1CF" stroke="#A89F8A" strokeWidth={0.8} />
      <SuitShape suit={suit} x={142} y={56} size={16} fill={suitColor(suit)} />
    </g>
  );
}

const FIGURES: Record<'J' | 'Q' | 'K', (p: { suit: Suit }) => JSX.Element> = { J: Jack, Q: Queen, K: King };

export function CourtFigure({ rank, suit }: { rank: Extract<Rank, 'J' | 'Q' | 'K'>; suit: Suit }) {
  const uid = useId().replace(/:/g, '');
  const Figure = FIGURES[rank];
  const frame = suitColor(suit);
  return (
    <g>
      <defs>
        <clipPath id={`top-${uid}`}>
          <rect x={36} y={38} width={128} height={102} />
        </clipPath>
      </defs>
      <rect x={34} y={36} width={132} height={208} rx={4} fill="#FBF6EA" stroke={frame} strokeWidth={1.6} />
      <g clipPath={`url(#top-${uid})`}>
        <Figure suit={suit} />
      </g>
      <g transform="rotate(180 100 140)" clipPath={`url(#top-${uid})`}>
        <Figure suit={suit} />
      </g>
      <path d="M34 140H166" stroke={frame} strokeWidth={1.2} />
    </g>
  );
}
