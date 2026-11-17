import type { ReactNode } from 'react';
import { makeCard } from '../engine';
import { t } from '../i18n/uz';
import { Link, ROUTES, type RoutePath } from '../lib/router';
import { useStore } from '../lib/store';
import { sessionStore } from '../state/session';
import { PlayingCard } from '../ui/cards/PlayingCard';
import { AvatarTile } from '../ui/components/Layout';
import { LogoMark, Wordmark } from '../ui/components/Logo';
import {
  IconBook,
  IconCoin,
  IconDoor,
  IconHistory,
  IconPlay,
  IconPlus,
  IconSettings,
  IconTrophy,
  IconUser,
  IconUsers,
} from '../ui/components/icons';

const HERO = [makeCard('Q', 'hearts'), makeCard('A', 'spades'), makeCard('K', 'diamonds')];

const circleLink =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 text-ink transition-colors hover:bg-white/10';

function ModeCard({ to, icon, title, sub }: { to: RoutePath; icon: ReactNode; title: string; sub: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-[112px] flex-col justify-between rounded-3xl border border-white/10 bg-surface p-4 shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-surface-2"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">{icon}</span>
      <span>
        <span className="block text-[16px] font-bold">{title}</span>
        <span className="block text-[12px] leading-snug text-muted">{sub}</span>
      </span>
    </Link>
  );
}

function NavItem({ to, icon, label, active = false }: { to: RoutePath; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold ${active ? 'text-accent' : 'text-muted hover:text-ink'}`}
    >
      {icon}
      {label}
    </Link>
  );
}

export function LobbyScreen() {
  const user = useStore(sessionStore, (s) => s.user);
  const name = user?.displayName ?? 'O‘yinchi';

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col">
      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-[max(14px,env(safe-area-inset-top))]">
        <header className="flex items-center gap-3">
          <Link to={ROUTES.profile} className="flex min-w-0 flex-1 items-center gap-3" aria-label={t.lobby.profile}>
            <AvatarTile name={name} photoUrl={user?.photoUrl} size={48} />
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-bold">{name}</span>
              <span className="block text-[12px] text-muted">{t.lobby.hello}!</span>
            </span>
          </Link>
          <div
            className="flex h-11 items-center gap-1.5 rounded-full border border-white/15 bg-black/20 pl-2 pr-3.5 text-[15px] font-bold"
            title={t.lobby.balanceHint}
            aria-label={`${t.lobby.balance}: ${t.lobby.balanceHint}`}
          >
            <IconCoin size={22} className="text-[#F2C94C]" />
            <span className="text-muted">—</span>
          </div>
          <Link to={ROUTES.settings} aria-label={t.lobby.settings} className={circleLink}>
            <IconSettings />
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0e2a36] px-5 pb-5 pt-4 shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoMark size={28} />
              <Wordmark className="text-[18px] text-ink" />
            </div>
            <Link to={ROUTES.rules} className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-ink">
              <IconBook size={18} />
              {t.lobby.rules}
            </Link>
          </div>
          <div className="relative mx-auto my-3 h-[150px] w-[250px]" aria-hidden="true">
            {HERO.map((card, i) => (
              <PlayingCard
                key={card.id}
                card={card}
                width={96}
                className="absolute"
                style={{ left: 24 + i * 56, top: i === 1 ? 0 : 12, transform: `rotate(${(i - 1) * 13}deg)`, zIndex: i === 1 ? 2 : 1 }}
              />
            ))}
          </div>
          <Link
            to={ROUTES.play}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-paper text-[18px] font-extrabold uppercase tracking-wide text-paper-ink shadow-[0_4px_0_#b9c4cc] transition-transform active:translate-y-0.5 active:shadow-none"
          >
            <IconPlay size={20} />
            {t.lobby.quickPlay}
          </Link>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <ModeCard to={ROUTES.friends} icon={<IconUsers />} title={t.lobby.friends} sub={t.lobby.friendsSub} />
          <ModeCard to={ROUTES.play} icon={<IconPlay />} title="Kompyuter bilan" sub="Mashq o‘yini, 2–4 o‘yinchi" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to={ROUTES.createRoom} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface/70 text-[14px] font-semibold hover:bg-surface-2">
            <IconPlus size={20} className="text-accent" />
            {t.lobby.createRoom}
          </Link>
          <Link to={ROUTES.joinRoom} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-surface/70 text-[14px] font-semibold hover:bg-surface-2">
            <IconDoor size={20} className="text-accent" />
            {t.lobby.joinRoom}
          </Link>
        </div>
      </div>

      <nav
        aria-label="Asosiy menyu"
        className="sticky bottom-0 flex gap-1 border-t border-white/10 bg-[#0d2633]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur"
      >
        <NavItem to={ROUTES.lobby} icon={<IconPlay size={20} />} label="O‘yin" active />
        <NavItem to={ROUTES.rankings} icon={<IconTrophy size={20} />} label={t.lobby.rankings} />
        <NavItem to={ROUTES.history} icon={<IconHistory size={20} />} label="Tarix" />
        <NavItem to={ROUTES.profile} icon={<IconUser size={20} />} label={t.lobby.profile} />
      </nav>
    </div>
  );
}
