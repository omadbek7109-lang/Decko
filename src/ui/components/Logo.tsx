import { SuitShape } from '../cards/suits';

/** DECKO mark: two fanned cards with a spade and a heart. */
export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(-12 32 34)">
        <rect x={12} y={12} width={26} height={38} rx={4} fill="#FDFCF8" stroke="#D9D6CC" />
        <SuitShape suit="spades" x={25} y={31} size={14} />
      </g>
      <g transform="rotate(10 32 34)">
        <rect x={27} y={13} width={26} height={38} rx={4} fill="#FDFCF8" stroke="#D9D6CC" />
        <SuitShape suit="hearts" x={40} y={32} size={14} />
      </g>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-serif font-bold tracking-[0.18em] ${className}`}>DECKO</span>;
}
