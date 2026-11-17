import { type FormEvent, useState } from 'react';
import { RULE_SETS } from '../engine';
import { t } from '../i18n/uz';
import { Link, ROUTES } from '../lib/router';
import { useStore } from '../lib/store';
import { BackendNotConnectedError, ROOM_CODE_PATTERN, normalizeRoomCode, services } from '../services';
import { sessionStore } from '../state/session';
import { Button } from '../ui/components/Button';
import { Notice, Panel, Screen, SectionTitle, Segmented } from '../ui/components/Layout';
import { IconChevron, IconCopy, IconDoor, IconPlus } from '../ui/components/icons';

function errorText(err: unknown): string {
  if (err instanceof BackendNotConnectedError) return t.offlineNotice;
  return 'Xatolik yuz berdi. Qayta urinib ko‘ring.';
}

export function FriendsScreen() {
  return (
    <Screen title={t.friends.title}>
      <p className="text-[14px] leading-relaxed text-muted">{t.friends.intro}</p>
      {[
        { to: ROUTES.createRoom, icon: <IconPlus />, title: t.friends.createTitle },
        { to: ROUTES.joinRoom, icon: <IconDoor />, title: t.friends.joinTitle },
      ].map((item) => (
        <Link key={item.to} to={item.to} className="flex min-h-[68px] items-center gap-4 rounded-2xl border border-line bg-surface/80 px-4 hover:bg-surface-2">
          <span className="flex size-11 items-center justify-center rounded-full bg-felt-deep text-accent">{item.icon}</span>
          <span className="flex-1 text-[16px] font-semibold">{item.title}</span>
          <IconChevron className="text-muted" />
        </Link>
      ))}
      {!services.rooms.isAvailable() && <Notice>{t.offlineNotice}</Notice>}
    </Screen>
  );
}

/** Invitation link preview; shows how the deep link will look once rooms work. */
function InvitePreview({ code }: { code: string | null }) {
  const [copied, setCopied] = useState(false);
  const link = services.rooms.buildInviteLink(code ?? 'XXXXXX');
  return (
    <Panel className="flex flex-col gap-2">
      <SectionTitle>{t.friends.invite}</SectionTitle>
      {link ? (
        <>
          <p className="text-[13px] text-muted">{t.friends.invitePreview}</p>
          <div className="flex items-center gap-2 rounded-xl bg-felt-deep/70 px-3 py-2.5">
            <code className="min-w-0 flex-1 truncate text-[13px] text-ink">{link}</code>
            {code && (
              <button
                type="button"
                aria-label="Nusxalash"
                className="flex size-10 items-center justify-center rounded-lg text-muted hover:text-ink"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                <IconCopy size={18} />
              </button>
            )}
          </div>
          {copied && <p className="text-[12px] text-accent">Nusxalandi</p>}
        </>
      ) : (
        <p className="text-[13px] text-muted">{t.friends.noBot}</p>
      )}
    </Panel>
  );
}

export function CreateRoomScreen() {
  const rulesId = useStore(sessionStore, (s) => s.settings.rulesId);
  const [players, setPlayers] = useState<2 | 3 | 4>(2);
  const [rules, setRules] = useState(rulesId);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const available = services.rooms.isAvailable();

  async function create() {
    setBusy(true);
    setError(null);
    try {
      await services.rooms.createRoom({ rulesId: rules, maxPlayers: players });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title={t.friends.createTitle}>
      <Panel className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.friends.maxPlayers}</SectionTitle>
          <Segmented
            label={t.friends.maxPlayers}
            value={players}
            options={[
              { value: 2 as const, label: '2' },
              { value: 3 as const, label: '3' },
              { value: 4 as const, label: '4' },
            ]}
            onChange={setPlayers}
          />
        </div>
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.play.rules}</SectionTitle>
          <Segmented label={t.play.rules} value={rules} options={RULE_SETS.map((r) => ({ value: r.id, label: r.name }))} onChange={setRules} />
        </div>
        <Button block onClick={create} disabled={busy || !available} aria-describedby="room-offline">
          {t.friends.create}
        </Button>
        {!available && (
          <p id="room-offline" className="text-center text-[13px] text-muted">
            {t.coming}
          </p>
        )}
      </Panel>
      {error && <Notice tone="warn">{error}</Notice>}
      <InvitePreview code={null} />
    </Screen>
  );
}

export function JoinRoomScreen() {
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const valid = ROOM_CODE_PATTERN.test(code);
  const available = services.rooms.isAvailable();

  async function join(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await services.rooms.joinRoom(code);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title={t.friends.joinTitle}>
      <Panel>
        <form className="flex flex-col gap-3" onSubmit={join} noValidate>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-muted">
            {t.friends.code}
            <input
              value={code}
              onChange={(e) => setCode(normalizeRoomCode(e.target.value).slice(0, 6))}
              onBlur={() => setTouched(true)}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABC123"
              aria-invalid={touched && !valid}
              aria-describedby="code-hint"
              className="min-h-14 rounded-xl border border-line bg-felt-deep/70 px-4 text-center font-mono text-[22px] tracking-[0.35em] text-ink placeholder:text-faint"
            />
          </label>
          <p id="code-hint" className={`text-[12px] ${touched && !valid ? 'text-danger' : 'text-faint'}`}>
            {touched && !valid ? t.friends.codeInvalid : t.friends.codeHint}
          </p>
          <Button block type="submit" disabled={busy || !available}>
            {t.friends.join}
          </Button>
          {!available && <p className="text-center text-[13px] text-muted">{t.coming}</p>}
        </form>
      </Panel>
      {error && <Notice tone="warn">{error}</Notice>}
    </Screen>
  );
}
