import { useEffect, useMemo, useState } from 'react';
import {
  type CardId,
  canDraw,
  canPass,
  currentPlayer,
  legalCards,
  topCard,
} from '../../engine';
import { eventText, t } from '../../i18n/uz';
import { ROUTES, navigate } from '../../lib/router';
import { useStore } from '../../lib/store';
import { hapticTap } from '../../services/local/telegram';
import { abandonMatch, gameStore, humanActions, nextRound, sayPhrase, startPracticeMatch } from '../../state/game';
import { sessionStore } from '../../state/session';
import { Button, IconButton } from '../../ui/components/Button';
import { Avatar } from '../../ui/components/Layout';
import { IconBack, IconBook, IconChat, IconDraw, IconSkip } from '../../ui/components/icons';
import { useViewport } from '../../ui/hooks';
import { CenterPile } from './CenterPile';
import { Hand } from './Hand';
import { Seat } from './Seat';
import { ChatDialog, LeaveDialog, ResultDialog, SuitPicker } from './TableDialogs';

export function GameTableScreen() {
  const match = useStore(gameStore, (s) => s.match);
  const humanId = useStore(gameStore, (s) => s.humanId);
  const notice = useStore(gameStore, (s) => s.notice);
  const bubble = useStore(gameStore, (s) => s.bubble);
  const settings = useStore(sessionStore, (s) => s.settings);
  const { width, height } = useViewport();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!match) navigate(ROUTES.play, { replace: true });
  }, [match]);

  const round = match?.round ?? null;
  const playable = useMemo(() => new Set<CardId>(round && humanId ? legalCards(round, humanId).map((c) => c.id) : []), [round, humanId]);

  if (!match || !round || !humanId) return null;

  const meIndex = round.players.findIndex((p) => p.id === humanId);
  const me = meIndex >= 0 ? round.players[meIndex] : undefined;
  const meMatch = match.players.find((p) => p.id === humanId);
  const n = round.players.length;
  const opponents = Array.from({ length: n - 1 }, (_, i) => round.players[(Math.max(0, meIndex) + i + 1) % n]).filter(
    (p): p is NonNullable<typeof p> => Boolean(p) && p?.id !== humanId,
  );
  const scoreOf = (id: string) => match.players.find((p) => p.id === id)?.score ?? 0;
  const nameOf = (id: string) => match.players.find((p) => p.id === id)?.name ?? '';
  const turnPlayer = currentPlayer(round);
  const myTurn = round.phase !== 'roundOver' && turnPlayer.id === humanId;
  const top = topCard(round);
  const under = round.discardPile.length > 1 ? (round.discardPile[round.discardPile.length - 2] ?? null) : null;
  const limit = match.rules.eliminationScore;
  const compactHeight = height < 680;
  const pileWidth = Math.round(Math.max(60, Math.min(compactHeight ? 70 : 86, width * 0.21)));

  const events = round.events.map((e) => eventText(e, nameOf)).filter((x): x is string => Boolean(x));
  let status: string;
  if (round.phase === 'roundOver') status = t.game.roundOver;
  else if (!myTurn) status = t.game.waiting(turnPlayer.name);
  else if (round.phase === 'choosingSuit') status = t.game.chooseSuit;
  else if (round.mustCover && playable.size === 0) status = t.game.cover;
  else if (round.requiredSuit) status = t.game.mustFollow(round.requiredSuit);
  else status = t.game.follow(top.suit, top.rank);

  const showPass = myTurn && canPass(round, humanId);
  const drawEnabled = myTurn && canDraw(round, humanId);

  function act(fn: () => void) {
    if (settings.haptics) hapticTap();
    fn();
  }

  // 3 opponents: left / top / right. 1–2 opponents sit in the top row.
  const sideLeft = opponents.length === 3 ? opponents[0] : undefined;
  const sideRight = opponents.length === 3 ? opponents[2] : undefined;
  const topRow = opponents.length === 3 ? [opponents[1]] : opponents;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-3 pb-1 pt-[max(10px,env(safe-area-inset-top))]">
        <IconButton label={t.back} onClick={() => setLeaveOpen(true)}>
          <IconBack />
        </IconButton>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[15px] font-semibold">
            {t.game.practice} · {match.rules.name}
          </div>
          <div className="text-[12px] text-muted">{t.game.round(match.roundNumber)}</div>
        </div>
        <IconButton label={t.lobby.rules} onClick={() => navigate(ROUTES.rules)}>
          <IconBook />
        </IconButton>
        <IconButton label={t.game.chat} onClick={() => setChatOpen(true)}>
          <IconChat />
        </IconButton>
      </header>

      <section className={`flex justify-around px-3 ${compactHeight ? 'pt-1' : 'pt-3'}`} aria-label="Raqiblar">
        {topRow.map(
          (p) =>
            p && (
              <Seat
                key={p.id}
                name={p.name}
                cardCount={p.hand.length}
                score={scoreOf(p.id)}
                limit={limit}
                active={turnPlayer.id === p.id && round.phase !== 'roundOver'}
                back={settings.cardBack}
                compact={opponents.length > 1}
              />
            ),
        )}
      </section>

      <section className="relative flex min-h-0 flex-1 items-center justify-center" aria-label="Stol">
        {sideLeft && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Seat
              name={sideLeft.name}
              cardCount={sideLeft.hand.length}
              score={scoreOf(sideLeft.id)}
              limit={limit}
              active={turnPlayer.id === sideLeft.id}
              back={settings.cardBack}
              compact
            />
          </div>
        )}
        <CenterPile
          top={top}
          under={under}
          drawCount={round.drawPile.length}
          requiredSuit={round.requiredSuit}
          direction={round.direction}
          back={settings.cardBack}
          cardWidth={sideLeft ? Math.min(pileWidth, 66) : pileWidth}
        />
        {sideRight && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Seat
              name={sideRight.name}
              cardCount={sideRight.hand.length}
              score={scoreOf(sideRight.id)}
              limit={limit}
              active={turnPlayer.id === sideRight.id}
              back={settings.cardBack}
              compact
            />
          </div>
        )}
      </section>

      <div className="flex min-h-[44px] flex-col items-center justify-center px-4 text-center" aria-live="polite">
        <p className={`text-[14px] font-semibold ${myTurn ? 'text-accent' : 'text-ink'}`}>{notice ?? status}</p>
        {events.length > 0 && <p className="truncate text-[12px] text-muted">{events.slice(-2).join(' · ')}</p>}
      </div>

      <section className="px-3" aria-label="Sizning kartalaringiz">
        {me && <Hand cards={me.hand} playable={playable} myTurn={myTurn && round.phase === 'playing'} width={width - 24} onPlay={(id) => act(() => humanActions.play(id))} />}
      </section>

      <footer className="relative mx-3 mb-[max(10px,env(safe-area-inset-bottom))] mt-1 flex items-center gap-3 rounded-2xl border border-line bg-felt-deep/80 p-2.5">
        {bubble && (
          <div role="status" className="absolute -top-11 left-3 rounded-xl bg-paper px-3 py-2 text-[13px] font-semibold text-paper-ink shadow">
            {bubble}
          </div>
        )}
        <Avatar name={meMatch?.name ?? t.game.you} size={42} ring={myTurn} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">{meMatch?.name ?? t.game.you}</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, ((meMatch?.score ?? 0) / limit) * 100))}%` }} />
            </div>
            <span className="text-[12px] tabular-nums text-muted">
              {meMatch?.score ?? 0}/{limit}
            </span>
          </div>
        </div>
        {showPass ? (
          <Button className="min-w-[132px]" icon={<IconSkip size={18} />} onClick={() => act(humanActions.pass)}>
            {t.game.pass}
          </Button>
        ) : (
          <Button className="min-w-[132px]" icon={<IconDraw size={18} />} disabled={!drawEnabled} onClick={() => act(humanActions.draw)}>
            {t.game.draw}
          </Button>
        )}
      </footer>

      <SuitPicker open={myTurn && round.phase === 'choosingSuit'} onPick={(s) => act(() => humanActions.chooseSuit(s))} />
      <ResultDialog
        match={match}
        humanId={humanId}
        onNext={nextRound}
        onAgain={() => startPracticeMatch(match.players.length as 2 | 3 | 4, match.rules.id)}
        onLobby={() => {
          abandonMatch();
          navigate(ROUTES.lobby, { replace: true });
        }}
      />
      <ChatDialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onSay={(text) => {
          sayPhrase(text);
          setChatOpen(false);
        }}
      />
      <LeaveDialog
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onLeave={() => {
          setLeaveOpen(false);
          abandonMatch();
          navigate(ROUTES.lobby, { replace: true });
        }}
      />
    </div>
  );
}
