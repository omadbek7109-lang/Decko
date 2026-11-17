import type { ReactNode } from 'react';
import { type RoutePath, goBack } from '../../lib/router';
import { t } from '../../i18n/uz';
import { IconButton } from './Button';
import { IconBack } from './icons';

/** Standard scrolling screen with a title bar. */
export function Screen({
  title,
  back = true,
  backTo,
  actions,
  children,
}: {
  title: string;
  back?: boolean;
  backTo?: RoutePath;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-felt/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-sm">
        {back && (
          <IconButton label={t.back} onClick={() => goBack(backTo)}>
            <IconBack />
          </IconButton>
        )}
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
        {actions}
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-[max(24px,env(safe-area-inset-bottom))]">{children}</main>
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface/80 p-4 ${className}`}>{children}</section>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{children}</h2>;
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  const color = tone === 'warn' ? 'border-danger/40 text-danger' : 'border-accent/30 text-muted';
  return (
    <p role="status" className={`rounded-xl border bg-felt-deep/50 px-3.5 py-3 text-[13px] leading-relaxed ${color}`}>
      {children}
    </p>
  );
}

export function Avatar({ name, photoUrl, size = 44, ring = false }: { name: string; photoUrl?: string | null; size?: number; ring?: boolean }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2c4a6b] font-semibold text-white ${ring ? 'ring-2 ring-accent ring-offset-2 ring-offset-felt' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {photoUrl ? <img src={photoUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" /> : initial}
    </div>
  );
}

/** Segmented single-choice control (accessible radio group). */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-1.5 rounded-xl bg-felt-deep/70 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-lg px-2 text-[14px] font-semibold transition-colors ${active ? 'bg-paper text-paper-ink' : 'text-muted hover:text-ink'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
