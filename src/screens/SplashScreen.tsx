import { type FormEvent, useState } from 'react';
import { makeCard } from '../engine';
import { t } from '../i18n/uz';
import { ROUTES, navigate } from '../lib/router';
import { services } from '../services';
import { setUser } from '../state/session';
import { PlayingCard } from '../ui/cards/PlayingCard';
import { Button } from '../ui/components/Button';
import { IconTelegram } from '../ui/components/icons';
import { LogoMark, Wordmark } from '../ui/components/Logo';
import { Notice } from '../ui/components/Layout';

const HERO = [makeCard('K', 'hearts'), makeCard('A', 'spades'), makeCard('Q', 'diamonds')];

export function SplashScreen() {
  const telegram = services.auth.isTelegramAvailable();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function enterTelegram() {
    setBusy(true);
    setError(null);
    try {
      setUser(await services.auth.signInWithTelegram());
      navigate(ROUTES.lobby, { replace: true });
    } catch {
      setError('Telegram ma’lumotlarini olib bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setBusy(false);
    }
  }

  async function enterGuest(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      setUser(await services.auth.continueAsGuest(name));
      navigate(ROUTES.lobby, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(40px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <div className="relative h-[150px] w-[230px]" aria-hidden="true">
          {HERO.map((card, i) => (
            <PlayingCard
              key={card.id}
              card={card}
              width={92}
              className="absolute top-2"
              style={{ left: 18 + i * 52, transform: `rotate(${(i - 1) * 11}deg) translateY(${i === 1 ? -8 : 4}px)` }}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <LogoMark size={40} />
            <Wordmark className="text-[34px] text-ink" />
          </div>
          <p className="text-[15px] text-muted">{t.tagline}</p>
        </div>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Imkoniyatlar">
          {t.splash.features.map((f) => (
            <li key={f} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-muted">
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        {error && <Notice tone="warn">{error}</Notice>}
        {telegram ? (
          <Button block icon={<IconTelegram />} onClick={enterTelegram} disabled={busy}>
            {t.splash.telegram}
          </Button>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={enterGuest}>
            <p className="text-[13px] leading-relaxed text-faint">{t.splash.guestHint}</p>
            <label className="flex flex-col gap-1.5 text-left text-[13px] font-medium text-muted">
              {t.splash.guestName}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                autoComplete="nickname"
                placeholder={t.splash.guestPlaceholder}
                className="min-h-12 rounded-xl border border-line bg-felt-deep/70 px-4 text-[16px] text-ink placeholder:text-faint"
              />
            </label>
            <Button block type="submit" disabled={busy}>
              {t.splash.guest}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
