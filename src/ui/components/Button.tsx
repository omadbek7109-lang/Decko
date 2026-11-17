import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-paper text-paper-ink hover:bg-white disabled:bg-paper/40 disabled:text-paper-ink/60',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2 disabled:text-faint',
  ghost: 'bg-transparent text-ink hover:bg-white/5 disabled:text-faint',
  danger: 'bg-transparent text-danger border border-danger/50 hover:bg-danger/10',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({ variant = 'primary', icon, block, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className = '', children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-felt-deep/60 text-ink transition-colors hover:bg-surface ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
