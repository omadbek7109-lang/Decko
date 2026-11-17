import { memo, useId } from 'react';
import type { CardBackId } from '../../state/session';

interface BackStyle {
  name: string;
  /** A woven two-colour tartan on a light ground, or a solid field with a lattice. */
  kind: 'tartan' | 'lattice';
  ground: string;
  a: string;
  b: string;
}

export const CARD_BACKS: Record<CardBackId, BackStyle> = {
  classic: { name: 'Klassik', kind: 'tartan', ground: '#FFFFFF', a: '#3F9A5E', b: '#C9574E' },
  burgundy: { name: 'Bordo', kind: 'lattice', ground: '#6A1E29', a: '#E6CFC0', b: '#8A2E3A' },
  navy: { name: 'Ko‘k', kind: 'lattice', ground: '#1C2C4A', a: '#D3DBE8', b: '#2A3F66' },
};

/** DECKO card backs: a woven two-colour tartan (default) or a solid lattice. */
export const CardBack = memo(function CardBack({ variant }: { variant: CardBackId }) {
  const s = CARD_BACKS[variant] ?? CARD_BACKS.classic;
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 280" className="block h-full w-full" aria-hidden="true">
      <defs>
        {s.kind === 'tartan' ? (
          <pattern id={`p-${id}`} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={18} height={18} fill={s.ground} />
            <g opacity={0.85}>
              <path d="M2 0V18M0 2H18" stroke={s.a} strokeWidth={1.6} />
              <path d="M5 0V18M0 5H18" stroke={s.a} strokeWidth={0.7} />
              <path d="M11 0V18M0 11H18" stroke={s.b} strokeWidth={1.1} />
              <path d="M14.5 0V18M0 14.5H18" stroke={s.a} strokeWidth={0.5} />
            </g>
          </pattern>
        ) : (
          <pattern id={`p-${id}`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={14} height={14} fill={s.b} />
            <path d="M0 0H14M0 0V14" stroke={s.a} strokeOpacity={0.3} strokeWidth={1.4} />
            <circle cx={7} cy={7} r={1.3} fill={s.a} fillOpacity={0.35} />
          </pattern>
        )}
      </defs>
      <rect x={0.5} y={0.5} width={199} height={279} rx={13} fill="#FFFFFF" stroke="#C9CCD1" />
      <rect x={10} y={10} width={180} height={260} rx={7} fill={`url(#p-${id})`} />
      {s.kind === 'lattice' ? (
        <g>
          <rect x={10} y={10} width={180} height={260} rx={7} fill="none" stroke={s.ground} strokeWidth={6} />
          <path d="M100 104L130 140L100 176L70 140Z" fill={s.ground} stroke={s.a} strokeOpacity={0.8} strokeWidth={1.6} />
        </g>
      ) : (
        <rect x={10} y={10} width={180} height={260} rx={7} fill="none" stroke="#D8DCDF" />
      )}
    </svg>
  );
});
