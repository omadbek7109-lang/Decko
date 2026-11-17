import { useEffect, useState } from 'react';
import { getRuleSet } from '../engine';
import { t } from '../i18n/uz';
import { Link, ROUTES, navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { type MatchRecord, type PlayerProfile, services } from '../services';
import { sessionStore, setUser } from '../state/session';
import { Button } from '../ui/components/Button';
import { Avatar, Notice, Panel, Screen, SectionTitle } from '../ui/components/Layout';

function useProfileData(limit: number) {
  const user = useStore(sessionStore, (s) => s.user);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [history, setHistory] = useState<MatchRecord[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    void Promise.all([services.players.getProfile(user), services.players.getMatchHistory(user.id, limit)]).then(([p, h]) => {
      if (!alive) return;
      setProfile(p);
      setHistory(h);
    });
    return () => {
      alive = false;
    };
  }, [user, limit]);
  return { user, profile, history };
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-felt-deep/60 px-2 py-3">
      <span className="text-[20px] font-bold tabular-nums">{value}</span>
      <span className="text-center text-[12px] text-muted">{label}</span>
    </div>
  );
}

export function MatchList({ items }: { items: MatchRecord[] }) {
  if (items.length === 0) return <p className="py-6 text-center text-[14px] text-muted">{t.history.empty}</p>;
  return (
    <ul className="flex flex-col divide-y divide-line">
      {items.map((m) => (
        <li key={m.id} className="flex items-center gap-3 py-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${m.result === 'win' ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger'}`}
            aria-hidden="true"
          >
            {m.result === 'win' ? 'G' : 'M'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">
              {m.result === 'win' ? t.history.win : t.history.loss} · {m.opponents.join(', ')}
            </div>
            <div className="text-[12px] text-muted">
              {t.history.practice} · {getRuleSet(m.rulesId).name} · {t.history.rounds(m.rounds)}
            </div>
          </div>
          <time className="shrink-0 text-[12px] text-faint" dateTime={m.playedAt}>
            {new Date(m.playedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function ProfileScreen() {
  const { user, profile, history } = useProfileData(5);
  if (!user) return null;
  const winRate = profile && profile.matchesPlayed > 0 ? `${Math.round((profile.wins / profile.matchesPlayed) * 100)}%` : '—';

  return (
    <Screen title={t.profile.title}>
      <Panel className="flex items-center gap-4">
        <Avatar name={user.displayName} photoUrl={user.photoUrl} size={64} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-semibold">{user.displayName}</div>
          <div className="text-[13px] text-muted">
            {user.username ? `@${user.username} · ` : ''}
            {t.profile.source[user.source]}
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <SectionTitle>{t.profile.rating}</SectionTitle>
          <span className="text-[13px] text-muted">{profile?.rating ?? t.profile.ratingNone}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Stat label={t.profile.played} value={profile?.matchesPlayed ?? 0} />
          <Stat label={t.profile.wins} value={profile?.wins ?? 0} />
          <Stat label={t.profile.losses} value={profile?.losses ?? 0} />
          <Stat label={t.profile.winRate} value={winRate} />
        </div>
      </Panel>

      <Panel>
        <div className="mb-1 flex items-center justify-between">
          <SectionTitle>{t.profile.recent}</SectionTitle>
          <Link to={ROUTES.history} className="min-h-11 content-center text-[13px] font-semibold text-accent">
            {t.profile.allHistory}
          </Link>
        </div>
        {history && <MatchList items={history} />}
      </Panel>

      <Notice>{t.profile.localNote}</Notice>
      <Button
        variant="danger"
        block
        onClick={async () => {
          await services.auth.signOut();
          setUser(null);
          navigate(ROUTES.splash, { replace: true });
        }}
      >
        {t.profile.signOut}
      </Button>
    </Screen>
  );
}

export function HistoryScreen() {
  const { history } = useProfileData(100);
  return (
    <Screen title={t.history.title}>
      <Panel>{history && <MatchList items={history} />}</Panel>
    </Screen>
  );
}

export function RankingsScreen() {
  const { user, profile } = useProfileData(1);
  return (
    <Screen title={t.rankings.title}>
      <Panel className="flex flex-col items-center gap-2 py-8 text-center">
        <SectionTitle>{t.rankings.global}</SectionTitle>
        <h2 className="text-[18px] font-semibold">{t.rankings.emptyTitle}</h2>
        <p className="max-w-[300px] text-[14px] leading-relaxed text-muted">{t.rankings.emptyText}</p>
      </Panel>
      {user && (
        <Panel className="flex flex-col gap-3">
          <SectionTitle>{t.rankings.yourStats}</SectionTitle>
          <div className="flex items-center gap-3">
            <Avatar name={user.displayName} photoUrl={user.photoUrl} size={44} />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">{user.displayName}</div>
              <div className="text-[13px] text-muted">
                {profile?.wins ?? 0} {t.profile.wins.toLowerCase()} · {profile?.matchesPlayed ?? 0} {t.profile.played.toLowerCase()}
              </div>
            </div>
            <span className="text-[13px] text-muted">{t.profile.rating}: —</span>
          </div>
        </Panel>
      )}
    </Screen>
  );
}
