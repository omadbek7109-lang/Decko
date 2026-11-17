import { memo, useId } from 'react';
import type { CardBackId } from '../../state/session';

interface BackPalette {
  base: string;
  field: string;
  line: string;
}

export const CARD_BACKS: Record<CardBackId, BackPalette & { name: string }> = {
  burgundy: { name: 'Bordo', base: '#5E1A24', field: '#7A2532', line: '#E6CFC0' },
  teal: { name: 'Zumrad', base: '#0F3F3B', field: '#17564F', line: '#CDE3DD' },
  navy: { name: 'To‘q ko‘k', base: '#1A2740', field: '#253858', line: '#D3DBE8' },
};

/** Custom DECKO card back: fine lattice field with a centred diamond monogram. */
export const CardBack = memo(function CardBack({ variant }: { variant: CardBackId }) {
  const p = CARD_BACKS[variant];
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 280" className="block h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`lat-${id}`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={14} height={14} fill={p.field} />
          <path d="M0 0H14M0 0V14" stroke={p.line} strokeOpacity={0.28} strokeWidth={1.4} />
          <circle cx={7} cy={7} r={1.3} fill={p.line} fillOpacity={0.35} />
        </pattern>
      </defs>
      <rect x={0.5} y={0.5} width={199} height={279} rx={14} fill="#FDFCF8" stroke="#D9D6CC" />
      <rect x={10} y={10} width={180} height={260} rx={8} fill={p.base} />
      <rect x={16} y={16} width={168} height={248} rx={5} fill={`url(#lat-${id})`} stroke={p.line} strokeOpacity={0.55} strokeWidth={1.2} />
      <path d="M100 98L134 140L100 182L66 140Z" fill={p.base} stroke={p.line} strokeOpacity={0.8} strokeWidth={1.6} />
      <path d="M100 110L124 140L100 170L76 140Z" fill="none" stroke={p.line} strokeOpacity={0.45} strokeWidth={1} />
      <text
        x={100}
        y={148}
        textAnchor="middle"
        fontFamily="'Libre Baskerville', Georgia, serif"
        fontWeight={700}
        fontSize={22}
        fill={p.line}
      >
        D
      </text>
    </svg>
  );
});
