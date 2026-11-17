import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Catches render errors so a bug never leaves the player on a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('DECKO crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[17px] font-semibold">Kutilmagan xatolik yuz berdi</p>
        <p className="max-w-[300px] text-[14px] text-muted">Ilovani qayta yuklab ko‘ring. Muammo takrorlansa, bizga xabar bering.</p>
        <button
          type="button"
          className="min-h-12 rounded-xl bg-paper px-6 font-semibold text-paper-ink"
          onClick={() => {
            window.location.hash = '#/lobby';
            window.location.reload();
          }}
        >
          Qayta yuklash
        </button>
      </div>
    );
  }
}
