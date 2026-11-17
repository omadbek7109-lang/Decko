import { useState } from 'react';
import { type CardEffect, RANKS, RULE_SETS, type RuleSet, getRuleSet, hasEffect, makeCard, parseCardId } from '../engine';
import { RANK_NAME, cardName, effectText, t } from '../i18n/uz';
import { useStore } from '../lib/store';
import { services } from '../services';
import { type CardBackId, sessionStore, updateSettings } from '../state/session';
import { CARD_BACKS } from '../ui/cards/CardBack';
import { PlayingCard } from '../ui/cards/PlayingCard';
import { Button } from '../ui/components/Button';
import { Notice, Panel, Screen, SectionTitle, Segmented } from '../ui/components/Layout';

const APP_VERSION = '0.1.0';

export function SettingsScreen() {
  const settings = useStore(sessionStore, (s) => s.settings);
  const user = useStore(sessionStore, (s) => s.user);
  const [cleared, setCleared] = useState(false);

  return (
    <Screen title={t.settings.title}>
      <Panel className="flex flex-col gap-3">
        <SectionTitle>{t.settings.cardBack}</SectionTitle>
        <div role="radiogroup" aria-label={t.settings.cardBack} className="flex gap-3">
          {(Object.keys(CARD_BACKS) as CardBackId[]).map((id) => {
            const active = settings.cardBack === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateSettings({ cardBack: id })}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-2.5 ${active ? 'border-accent bg-surface-2' : 'border-line'}`}
              >
                <PlayingCard faceDown back={id} width={52} />
                <span className="text-[13px] font-medium">{CARD_BACKS[id].name}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.settings.defaultRules}</SectionTitle>
          <Segmented
            label={t.settings.defaultRules}
            value={settings.rulesId}
            options={RULE_SETS.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(v) => updateSettings({ rulesId: v })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <SectionTitle>{t.settings.botSpeed}</SectionTitle>
          <Segmented
            label={t.settings.botSpeed}
            value={settings.botSpeed}
            options={[
              { value: 'slow' as const, label: t.settings.speeds.slow },
              { value: 'normal' as const, label: t.settings.speeds.normal },
              { value: 'fast' as const, label: t.settings.speeds.fast },
            ]}
            onChange={(v) => updateSettings({ botSpeed: v })}
          />
        </div>
        <label className="flex min-h-11 items-center justify-between gap-3 text-[15px] font-medium">
          {t.settings.haptics}
          <input
            type="checkbox"
            checked={settings.haptics}
            onChange={(e) => updateSettings({ haptics: e.target.checked })}
            className="size-5 accent-[#7fd3c3]"
          />
        </label>
      </Panel>

      <Panel className="flex flex-col gap-3">
        <Button
          variant="danger"
          block
          onClick={async () => {
            if (user) await services.players.clearLocalData(user.id);
            setCleared(true);
          }}
        >
          {t.settings.clearData}
        </Button>
        {cleared && <p className="text-center text-[13px] text-accent">{t.settings.clearConfirm}</p>}
        <p className="text-center text-[12px] text-faint">
          DECKO · {t.settings.version} {APP_VERSION}
        </p>
      </Panel>
    </Screen>
  );
}

function EffectRow({ title, effect, cardId }: { title: string; effect: CardEffect; cardId: string }) {
  const card = parseCardId(cardId);
  return (
    <li className="flex items-center gap-3 py-2.5">
      {card && <PlayingCard card={card} width={40} />}
      <div className="flex-1">
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[13px] text-muted">{effectText(effect)}</div>
      </div>
    </li>
  );
}

function RuleSetSection({ rules }: { rules: RuleSet }) {
  const rankRows = RANKS.filter((r) => rules.rankEffects[r] && hasEffect(rules.rankEffects[r] as CardEffect));
  const cardRows = Object.entries(rules.cardEffects).filter((entry): entry is [string, CardEffect] => Boolean(entry[1]));
  return (
    <>
      <Panel>
        <SectionTitle>{t.rulesScreen.effects}</SectionTitle>
        {rankRows.length + cardRows.length === 0 ? (
          <p className="pt-2 text-[14px] text-muted">{rules.description}</p>
        ) : (
          <ul className="divide-y divide-line">
            {rankRows.map((rank) => (
              <EffectRow key={rank} title={RANK_NAME[rank]} effect={rules.rankEffects[rank] as CardEffect} cardId={makeCard(rank, 'hearts').id} />
            ))}
            {cardRows.map(([id, effect]) => {
              const card = parseCardId(id);
              return <EffectRow key={id} title={card ? cardName(card) : id} effect={effect} cardId={id} />;
            })}
          </ul>
        )}
      </Panel>
      <Panel className="flex flex-col gap-2">
        <SectionTitle>{t.rulesScreen.points}</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          {RANKS.map((r) => (
            <div key={r} className="flex items-center justify-between rounded-lg bg-felt-deep/60 px-3 py-2 text-[14px]">
              <span className="font-semibold">{RANK_NAME[r]}</span>
              <span className="tabular-nums text-muted">{rules.cardPoints[r]}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted">
          Ochkosi {rules.eliminationScore} dan oshgan o‘yinchi chiqadi.{' '}
          {Object.entries(rules.scoreResets)
            .map(([from, to]) => `Aynan ${from} → ${to}.`)
            .join(' ')}
        </p>
      </Panel>
      {rules.unconfirmed.length > 0 && (
        <Notice>
          <span className="font-semibold text-ink">{t.rulesScreen.unconfirmed}. </span>
          {t.rulesScreen.unconfirmedText}
          <span className="mt-1.5 block whitespace-pre-line">{rules.unconfirmed.map((u) => `• ${u}`).join('\n')}</span>
        </Notice>
      )}
    </>
  );
}

export function RulesScreen() {
  const defaultId = useStore(sessionStore, (s) => s.settings.rulesId);
  const [rulesId, setRulesId] = useState(defaultId);
  const rules = getRuleSet(rulesId);
  return (
    <Screen title={t.rulesScreen.title}>
      <Panel className="flex flex-col gap-2">
        <SectionTitle>{t.rulesScreen.basics}</SectionTitle>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-ink/90">
          {t.rulesScreen.basicsText.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </Panel>
      <Segmented label={t.play.rules} value={rulesId} options={RULE_SETS.map((r) => ({ value: r.id, label: r.name }))} onChange={setRulesId} />
      <RuleSetSection rules={rules} />
    </Screen>
  );
}
