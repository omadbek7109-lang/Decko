import type { ReactNode } from 'react';
import { makeCard } from '../engine';
import { t } from '../i18n/uz';
import { Link, ROUTES, type RoutePath } from '../lib/router';
import { useStore } from '../lib/store';
import { sessionStore } from '../state/session';
import { PlayingCard } from '../ui/cards/PlayingCard';
import { Avatar } from '../ui/components/Layout';
import { LogoMark, Wordmark } from '../ui/components/Logo';
import {
  IconBook,
  IconChevron,
  IconCoin,
  IconDoor,
  IconHistory,
  IconPlay,
  IconPlus,
  IconSettings,
  IconTrophy,
  IconUsers,
} from '../ui/components/icons';

const FAN = [makeCard('10', 'clubs'), makeCard('J', 'hearts'), makeCard('A', 'diamonds')];

function Tile({ to, icon, title }: { to: RoutePath; icon: ReactNode; title: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-[84px] flex-col justify-between rounded-2xl border border-line bg-surface/80 p-3.5 transition-colors hover:bg-surface-2"
    >
      <span className="text-accent">{icon}</span>
      <span className="text-[14px] font-semibold">{title}</span>
    </Link>
  );
}

export function LobbyScreen() {
  const user = useStore(sessionStore, (s) => s.user);
  const name = user?.displayName ?? 'O‘yinchi';

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col gap-4 px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(14px,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        <Link to={ROUTES.profile} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl" aria-label={t.lobby.profile}>
          <Avatar name={name} photoUrl={user?.photoUrl} size={46} />
          <span className="min-w-0">
            <span className="block text-[12px] text-muted">{t.lobby.hello}</span>
            <span className="block truncate text-[16px] font-semibold">{name}</span>
          </span>
        </Link>
        <div
          className="flex h-11 items-center gap-1.5 rounded-full border border-line bg-felt-deep/60 px-3 text-[15px] font-semibold"
          title={t.lobby.balanceHint}
          aria-label={`${t.lobby.balance}: ${t.lobby.balanceHint}`}
        >
          <IconCoin size={20} className="text-[#E2C46B]" />
          <span className="text-muted">—</span>
        </div>
        <Link
          to={ROUTES.settings}
          aria-label={t.lobby.settings}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-felt-deep/60 text-ink transition-colors hover:bg-surface"
        >
          <IconSettings />
        </Link>
      </header>

      <div className="flex items-center justify-center gap-2 pt-2" aria-hidden="true">
        <LogoMark size={30} />
        <Wordmark className="text-[20px] text-ink/90" />
      </div>

      <Link
        to={ROUTES.play}
        className="relative flex min-h-[150px] overflow-hidden rounded-3xl bg-paper p-5 text-paper-ink transition-colors hover:bg-white"
      >
        <span className="relative z-10 flex flex-col justify-between">
          <span>
            <span className="block text-[24px] font-bold">{t.lobby.quickPlay}</span>
            <span className="mt-1 block max-w-[160px] text-[14px] text-paper-ink/75">{t.lobby.quickPlaySub}</span>
          </span>
          <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-paper-ink px-4 py-2 text-[14px] font-semibold text-paper">
            <IconPlay size={16} /> O‘ynash
          </span>
        </span>
        <span className="pointer-events-none absolute -right-2 top-4 h-[140px] w-[170px]" aria-hidden="true">
          {FAN.map((card, i) => (
            <PlayingCard
              key={card.id}
              card={card}
              width={70}
              className="absolute"
              style={{ left: 10 + i * 40, top: 6, transform: `rotate(${(i - 1) * 12}deg)` }}
            />
          ))}
        </span>
      </Link>

      <Link to={ROUTES.friends} className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-line bg-surface/80 px-4 transition-colors hover:bg-surface-2">
        <span className="flex size-11 items-center justify-center rounded-full bg-felt-deep text-accent">
          <IconUsers />
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-semibold">{t.lobby.friends}</span>
          <span className="block text-[13px] text-muted">{t.lobby.friendsSub}</span>
        </span>
        <IconChevron className="text-muted" />
      </Link>

      <nav className="grid grid-cols-2 gap-3" aria-label="Bo‘limlar">
        <Tile to={ROUTES.createRoom} icon={<IconPlus />} title={t.lobby.createRoom} />
        <Tile to={ROUTES.joinRoom} icon={<IconDoor />} title={t.lobby.joinRoom} />
        <Tile to={ROUTES.rankings} icon={<IconTrophy />} title={t.lobby.rankings} />
        <Tile to={ROUTES.history} icon={<IconHistory />} title={t.lobby.history} />
        <Tile to={ROUTES.rules} icon={<IconBook />} title={t.lobby.rules} />
        <Tile to={ROUTES.settings} icon={<IconSettings />} title={t.lobby.settings} />
      </nav>
    </div>
  );
}
