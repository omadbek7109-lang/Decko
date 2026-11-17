import { RULE_SETS, getRuleSet } from '../engine';
import { t } from '../i18n/uz';
import { ROUTES, navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { services } from '../services';
import { startPracticeMatch } from '../state/game';
import { sessionStore, updateSettings } from '../state/session';
import { Button } from '../ui/components/Button';
import { Panel, Screen, SectionTitle, Segmented } from '../ui/components/Layout';
import { IconLock, IconPlay } from '../ui/components/icons';

export function PlaySetupScreen() {
  const settings = useStore(sessionStore, (s) => s.settings);
  const online = services.matches.isOnlineAvailable();
  const rules = getRuleSet(settings.rulesId);

  function start() {
    startPracticeMatch(settings.practicePlayers, settings.rulesId);
    navigate(ROUTES.game);
  }

  return (
    <Screen title={t.play.title}>
      <Panel className="flex items-center gap-3 opacity-90">
        <span className="flex size-11 items-center justify-center rounded-full bg-felt-deep text-faint">
          <IconLock />
        </span>
        <div className="flex-1">
          <h2 className="text-[16px] font-semibold">{t.play.online}</h2>
          <p className="text-[13px] text-muted">{online ? t.play.onlineSub : t.coming}</p>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">{t.play.practice}</h2>
          <p className="text-[13px] text-muted">{t.play.practiceSub}</p>
        </div>
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.play.players}</SectionTitle>
          <Segmented
            label={t.play.players}
            value={settings.practicePlayers}
            options={[
              { value: 2 as const, label: '2' },
              { value: 3 as const, label: '3' },
              { value: 4 as const, label: '4' },
            ]}
            onChange={(v) => updateSettings({ practicePlayers: v })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.play.rules}</SectionTitle>
          <Segmented
            label={t.play.rules}
            value={settings.rulesId}
            options={RULE_SETS.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(v) => updateSettings({ rulesId: v })}
          />
          <p className="text-[13px] text-muted">{rules.description}</p>
        </div>
        <Button block icon={<IconPlay size={18} />} onClick={start}>
          {t.play.start}
        </Button>
      </Panel>
    </Screen>
  );
}
