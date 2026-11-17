import { type ReactNode, useEffect, useId, useRef } from 'react';

/** Bottom sheet / centred dialog with focus handling and Escape to close. */
export function Dialog({
  open,
  title,
  onClose,
  children,
  dismissible = true,
}: {
  open: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 sm:items-center" onClick={dismissible ? onClose : undefined}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-t-3xl border border-line bg-felt-deep px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:rounded-3xl"
      >
        <h2 id={titleId} className="mb-4 text-center text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
