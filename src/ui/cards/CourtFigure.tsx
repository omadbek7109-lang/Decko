import { type JSX, useId } from 'react';
import type { Rank, Suit } from '../../engine';
import { SuitShape, suitColor } from './suits';

/**
 * Traditional double-headed court cards (J, Q, K) in the classic
 * "bold outline + flat yellow / red / blue" style. Original vector art,
 * drawn for the top half of a 200×280 card and mirrored for the bottom.
 */

const K = '#161616';
const Y = '#E8B52F';
const W = '#FFFFFF';
const SKIN = '#F6D7B6';
const STEEL = '#D7DCE2';
const SW = 1.3;

interface Palette {
  main: string;
  second: string;
}

function palette(suit: Suit): Palette {
  return suit === 'hearts' || suit === 'diamonds' ? { main: '#C8302B', second: '#2C4E9E' } : { main: '#2C4E9E', second: '#C8302B' };
}

const line = { stroke: K, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

const GOWN_DIAMONDS: [number, number][] = [106, 118, 130].flatMap((y) => [82, 92, 102].map((x): [number, number] => [x, y]));
const ERMINE: [number, number][] = [
  [69, 107],
  [80, 112],
  [92, 113.5],
  [104, 112],
  [115, 107],
];

/** Shoulders and gown shared by all three figures. */
function Robe({ p, collar }: { p: Palette; collar: 'ermine' | 'lace' | 'plain' }) {
  return (
    <g>
      <path d="M37 140L39 119C43 105 55 98 71 96L113 96C129 98 141 105 145 119L147 140Z" fill={p.main} {...line} />
      <path d="M43 124C49 112 58 106 72 103M141 124C135 112 126 106 112 103" stroke={p.second} strokeWidth={6} fill="none" />
      <path d="M43 128C49 116 58 110 72 107M141 128C135 116 126 110 112 107" stroke={K} strokeWidth={0.8} fill="none" />
      {[
        [50, 126],
        [58, 120],
        [66, 114],
        [118, 114],
        [126, 120],
        [134, 126],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={1.6} fill={Y} stroke={K} strokeWidth={0.6} />
      ))}
      <path d="M77 96L107 96L115 140L69 140Z" fill={Y} {...line} />
      {GOWN_DIAMONDS.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - 4}L${x + 3.5} ${y}L${x} ${y + 4}L${x - 3.5} ${y}Z`} fill={p.second} stroke={K} strokeWidth={0.6} />
      ))}
      {collar === 'ermine' && (
        <g>
          <path d="M60 98C73 111 111 111 124 98L126 106C111 120 73 120 58 106Z" fill={W} {...line} />
          {ERMINE.map(([x, y]) => (
            <path key={x} d={`M${x} ${y - 2.5}V${y + 1.5}M${x - 1.6} ${y + 2.5}L${x} ${y + 1}L${x + 1.6} ${y + 2.5}`} stroke={K} strokeWidth={1.1} fill="none" />
          ))}
        </g>
      )}
      {collar === 'lace' && (
        <g>
          <path d="M64 98C76 108 108 108 120 98L121 103C108 114 76 114 63 103Z" fill={W} {...line} />
          {[72, 80, 88, 96, 104, 112].map((x) => (
            <circle key={x} cx={x} cy={104 + (x < 92 ? (x - 72) * 0.2 : (112 - x) * 0.2)} r={1.8} fill={W} stroke={K} strokeWidth={0.6} />
          ))}
        </g>
      )}
      {collar === 'plain' && <path d="M66 97C78 106 106 106 118 97" stroke={Y} strokeWidth={4} fill="none" />}
    </g>
  );
}

function Eyes() {
  return (
    <g fill="none" stroke={K} strokeWidth={1.1} strokeLinecap="round">
      <path d="M83.5 62.5Q87 60.5 90 62M94 62Q97 60.5 100.5 62.5" />
      <path d="M84.5 66Q87 64.5 89.5 66M94.5 66Q97 64.5 99.5 66" />
      <circle cx={87} cy={66} r={0.9} fill={K} stroke="none" />
      <circle cx={97} cy={66} r={0.9} fill={K} stroke="none" />
      <path d="M92 66.5L90.8 73.5L93.2 73.5" strokeWidth={0.9} />
    </g>
  );
}

function Neck() {
  return (
    <g>
      <rect x={86.5} y={78} width={11} height={18} fill={SKIN} />
      <path d="M86.5 82V96M97.5 82V96" stroke={K} strokeWidth={SW} />
    </g>
  );
}

function King({ p }: { p: Palette }) {
  return (
    <g>
      {/* sword raised behind the head */}
      <path d="M129 36L134 38L122 99L117 97Z" fill={STEEL} {...line} />
      <path d="M131 40L121 92" stroke="#9AA2AC" strokeWidth={0.8} />
      <Robe p={p} collar="ermine" />
      <path d="M110 99L126 102" stroke={Y} strokeWidth={4} strokeLinecap="round" />
      <path d="M110 99L126 102" stroke={K} strokeWidth={0.8} />
      <ellipse cx={118} cy={106} rx={6} ry={5} fill={SKIN} {...line} />
      <path d="M115 104.5H121M115 107.5H121" stroke={K} strokeWidth={0.7} />
      {/* hair and beard mass */}
      <path d="M76 60C73 75 75 88 81 95L103 95C109 88 111 75 108 60Z" fill={Y} {...line} />
      <rect x={86} y={78} width={12} height={18} fill={SKIN} />
      <ellipse cx={92} cy={68} rx={12.5} ry={14.5} fill={SKIN} {...line} />
      <Eyes />
      <path d="M80 72C81 84 86 93 92 96C98 93 103 84 104 72C100 79 84 79 80 72Z" fill={Y} {...line} />
      <path d="M86 81L88 90M92 82V93M98 81L96 90" stroke={K} strokeWidth={0.7} />
      <path d="M84 76.5C87 73.5 90.5 74 92 76C93.5 74 97 73.5 100 76.5C97 78 94 78 92 77C90 78 87 78 84 76.5Z" fill={Y} {...line} />
      {/* crown */}
      <path d="M82 51C84 44 100 44 102 51Z" fill={p.main} {...line} />
      <path d="M77 51L79 38L85 46L92 33L99 46L105 38L107 51Z" fill={Y} {...line} />
      <circle cx={79} cy={37} r={2} fill={Y} {...line} />
      <circle cx={92} cy={32} r={2.2} fill={Y} {...line} />
      <circle cx={105} cy={37} r={2} fill={Y} {...line} />
      <rect x={77} y={50} width={30} height={7} fill={Y} {...line} />
      {[83, 92, 101].map((x, i) => (
        <circle key={x} cx={x} cy={53.5} r={1.7} fill={i === 1 ? p.second : p.main} stroke={K} strokeWidth={0.6} />
      ))}
    </g>
  );
}

function Queen({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M74 60C69 80 71 98 78 106L106 106C113 98 115 80 110 60C104 49 80 49 74 60Z" fill={Y} {...line} />
      <path d="M78 72C76 84 78 96 82 104M106 72C108 84 106 96 102 104" stroke={K} strokeWidth={0.7} fill="none" />
      <Robe p={{ main: p.second, second: p.main }} collar="lace" />
      {/* flower held in the left hand */}
      <path d="M64 106L70 82" stroke="#2F6B3A" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M67 94C61 92 59 88 60 85C64 86 66 89 67 94Z" fill="#3E8C4B" stroke={K} strokeWidth={0.7} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={70} cy={74} rx={3.4} ry={5.5} fill={p.main} stroke={K} strokeWidth={0.7} transform={`rotate(${a} 70 79)`} />
      ))}
      <circle cx={70} cy={79} r={2.6} fill={Y} stroke={K} strokeWidth={0.7} />
      <ellipse cx={65} cy={106} rx={5.5} ry={4.6} fill={SKIN} {...line} />
      <Neck />
      <ellipse cx={92} cy={68} rx={12} ry={14} fill={SKIN} {...line} />
      <Eyes />
      <path d="M89 77.5Q92 79.5 95 77.5Q92 76.5 89 77.5Z" fill="#C8302B" stroke={K} strokeWidth={0.6} />
      <path d="M80 62C83 54 101 54 104 62C99 58 85 58 80 62Z" fill={Y} {...line} />
      {/* crown */}
      <path d="M80 52L82 42L87 48L92 38L97 48L102 42L104 52Z" fill={Y} {...line} />
      <rect x={80} y={51} width={24} height={5} fill={Y} {...line} />
      <circle cx={92} cy={37} r={2} fill={W} {...line} />
      <circle cx={92} cy={53.5} r={1.5} fill={p.main} stroke={K} strokeWidth={0.6} />
    </g>
  );
}

function Jack({ p }: { p: Palette }) {
  return (
    <g>
      {/* halberd */}
      <path d="M56 140L66 40" stroke="#7A5328" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M66 40L60 30L68 32Z" fill={STEEL} {...line} />
      <path d="M64 50C54 48 50 56 52 64C56 60 60 58 63 58Z" fill={STEEL} {...line} />
      <Robe p={{ main: p.second, second: p.main }} collar="plain" />
      <ellipse cx={64} cy={104} rx={5.5} ry={4.6} fill={SKIN} {...line} />
      {/* curls */}
      <path d="M78 58C71 68 72 82 79 90L84 88C80 80 80 68 83 60Z" fill={Y} {...line} />
      <path d="M106 58C113 68 112 82 105 90L100 88C104 80 104 68 101 60Z" fill={Y} {...line} />
      <Neck />
      <ellipse cx={92} cy={68} rx={12} ry={14} fill={SKIN} {...line} />
      <Eyes />
      <path d="M86 77C89 75 91 75.5 92 77C93 75.5 95 75 98 77" stroke={K} strokeWidth={1} fill="none" />
      {/* cap with feather */}
      <path d="M108 46C118 34 131 31 140 33C130 38 122 45 113 54Z" fill={W} {...line} />
      <path d="M112 48L134 36M116 50L132 40" stroke={K} strokeWidth={0.5} />
      <path d="M73 56C73 44 85 37 97 39C108 41 114 48 114 56Z" fill={p.main} {...line} />
      <rect x={72} y={55} width={42} height={6} rx={1.5} fill={Y} {...line} />
      {[79, 86, 93, 100, 107].map((x) => (
        <circle key={x} cx={x} cy={58} r={1.1} fill={p.second} />
      ))}
    </g>
  );
}

const FIGURES: Record<'J' | 'Q' | 'K', (props: { p: Palette }) => JSX.Element> = { J: Jack, Q: Queen, K: King };

export function CourtFigure({ rank, suit }: { rank: Extract<Rank, 'J' | 'Q' | 'K'>; suit: Suit }) {
  const uid = useId().replace(/:/g, '');
  const Figure = FIGURES[rank];
  const p = palette(suit);
  return (
    <g>
      <defs>
        <clipPath id={`half-${uid}`}>
          <rect x={35} y={37} width={130} height={103} />
        </clipPath>
      </defs>
      <rect x={34} y={36} width={132} height={208} fill="#FFFEFA" stroke={K} strokeWidth={1.2} />
      {[0, 180].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 100 140)`}>
          <g clipPath={`url(#half-${uid})`}>
            <g transform="translate(100 38) scale(1.12) translate(-92 -32)">
              <Figure p={p} />
            </g>
          </g>
          <SuitShape suit={suit} x={rank === 'K' ? 50 : 148} y={52} size={16} fill={suitColor(suit)} />
        </g>
      ))}
      <path d="M34 140H166" stroke={K} strokeWidth={1.2} />
    </g>
  );
}
