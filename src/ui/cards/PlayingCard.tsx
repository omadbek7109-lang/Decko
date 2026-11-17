import type { CSSProperties } from 'react';
import type { Card } from '../../engine';
import { cardName } from '../../i18n/uz';
import type { CardBackId } from '../../state/session';
import { CardBack } from './CardBack';
import { CARD_RATIO, CardFace } from './CardFace';

interface PlayingCardProps {
  card?: Card;
  /** Show the back instead of the face. */
  faceDown?: boolean;
  back?: CardBackId;
  width: number;
  className?: string;
  style?: CSSProperties;
  /** Renders as a button when provided. */
  onClick?: () => void;
  disabled?: boolean;
  dimmed?: boolean;
  label?: string;
}

const SHADOW = 'shadow-[0_2px_6px_rgba(0,0,0,0.28)]';

export function PlayingCard({
  card,
  faceDown = false,
  back = 'burgundy',
  width,
  className = '',
  style,
  onClick,
  disabled,
  dimmed,
  label,
}: PlayingCardProps) {
  const size: CSSProperties = { width, height: Math.round(width * CARD_RATIO), ...style };
  const art = faceDown || !card ? <CardBack variant={back} /> : <CardFace card={card} />;
  const tone = dimmed ? 'brightness-[0.72] saturate-[0.7]' : '';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-disabled={disabled || undefined}
        aria-label={label ?? (card ? cardName(card) : 'Karta')}
        className={`shrink-0 rounded-[7%/5%] ${SHADOW} ${tone} transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3E7C7] ${className}`}
        style={size}
      >
        {art}
      </button>
    );
  }
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`shrink-0 rounded-[7%/5%] ${SHADOW} ${tone} ${className}`}
      style={size}
    >
      {art}
    </div>
  );
}
