import { useEffect, useState } from 'react';
import { canDraw, canPass, cardPoints, currentPlayer, topCard } from '../../engine';
import { eventText, t } from '../../i18n/uz';
import { ROUTES, navigate } from '../../lib/router';
import { useStore } from '../../lib/store';
import { hapticTap } from '../../services/local/telegram';
import { abandonMatch, gameStore, humanActions, nextRound, sayPhrase, startPracticeMatch } from '../../state/game';
import { sessionStore } from '../../state/session';
import { IconButton } from '../../ui/components/Button';
import { AvatarTile } from '../../ui/components/Layout';
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
  const user = useStore(sessionStore, (s) => s.user);
  const { width, height } = useViewport();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!match) navigate(ROUTES.play, { replace: true });
  }, [match]);

  const round = match?.round ?? null;

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
  const live = round.phase !== 'roundOver';
  const myTurn = live && turnPlayer.id === humanId;
  const top = topCard(round);
  const under = round.discardPile.slice(-3, -1);
  const short = height < 700;
  const sides = opponents.length === 3;
  const pileWidth = Math.round(Math.max(72, Math.min(short ? 88 : 112, width * 0.27, height * (sides ? 0.11 : 0.13))));
  const deckWidth = Math.round(pileWidth * 0.78);
  const handHeight = Math.round(Math.max(128, Math.min(196, height * 0.23)));

  const events = round.events.map((e) => eventText(e, nameOf)).filter((x): x is string => Boolean(x));
  let status: string;
  if (!live) status = t.game.roundOver;
  else if (!myTurn) status = t.game.waiting(turnPlayer.name);
  else if (round.phase === 'choosingSuit') status = t.game.chooseSuit;
  else if (round.pending) status = t.game.penalty(round.pending.draws);
  else if (round.mustCover) status = t.game.coverAgain;
  else status = t.game.yourTurn;

  const showPass = myTurn && canPass(round, humanId);
  const drawEnabled = myTurn && canDraw(round, humanId);

  function act(fn: () => void) {
    if (settings.haptics) hapticTap();
    fn();
  }

  const seat = (p: (typeof opponents)[number], compact: boolean) => (
    <Seat
      name={p.name}
      cardCount={p.hand.length}
      score={scoreOf(p.id)}
      active={live && turnPlayer.id === p.id}
      back={settings.cardBack}
      compact={compact}
    />
  );
  // 3 opponents sit in the top row (left and right a little lower); 1–2 sit side by side.
  const topRow = opponents;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-3 pb-1 pt-[max(10px,env(safe-area-inset-top))]">
        <IconButton label={t.back} onClick={() => setLeaveOpen(true)}>
          <IconBack />
        </IconButton>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-bold leading-tight">{match.rules.name}</div>
          <div className="text-[12px] text-muted">
            {t.game.practice} · {t.game.round(match.roundNumber)}
          </div>
        </div>
        <IconButton label={t.lobby.rules} onClick={() => navigate(ROUTES.rules)}>
          <IconBook />
        </IconButton>
        <IconButton label={t.game.chat} onClick={() => setChatOpen(true)}>
          <IconChat />
        </IconButton>
      </header>

      <section className={`flex items-start justify-around px-1 ${short ? 'pt-0' : 'pt-2'}`} aria-label="Raqiblar">
        {topRow.map((p, i) => (
          <div key={p.id} className={sides && i !== 1 ? 'mt-10' : ''}>
            {seat(p, opponents.length > 1)}
          </div>
        ))}
      </section>

      <section className="relative flex min-h-0 flex-1 items-center justify-center" aria-label="Stol">
        <CenterPile
          top={top}
          under={under}
          drawCount={round.drawPile.length}
          requiredSuit={round.requiredSuit}
          direction={round.direction}
          back={settings.cardBack}
          deckWidth={deckWidth}
          pileWidth={pileWidth}
          topPoints={cardPoints(match.rules, top)}
        />
      </section>

      <div className="flex min-h-[46px] flex-col items-center justify-end gap-0.5 px-4 text-center" aria-live="polite">
        <p
          className={`rounded-full px-4 py-1 text-[14px] font-semibold ${notice ? 'bg-danger/20 text-danger' : myTurn ? 'bg-accent/15 text-accent' : 'bg-black/20 text-ink'}`}
        >
          {notice ?? status}
        </p>
        {events.length > 0 && <p className="max-w-full truncate text-[12px] text-muted">{events.slice(-2).join(' · ')}</p>}
      </div>

      <section aria-label="Sizning kartalaringiz" className="relative z-0">
        {me && (
          <Hand
            cards={me.hand}
            myTurn={myTurn && round.phase === 'playing'}
            width={width - 16}
            height={handHeight}
            rules={match.rules}
            onPlay={(id) => act(() => humanActions.play(id))}
          />
        )}
      </section>

      <footer className="relative z-10 -mt-2 rounded-t-[26px] bg-paper px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 text-paper-ink shadow-[0_-6px_18px_rgba(0,0,0,0.3)]">
        {bubble && (
          <div role="status" className="absolute -top-12 left-4 rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-[13px] font-semibold text-paper-ink shadow-lg">
            {bubble}
          </div>
        )}
        <div className="flex items-center gap-3">
          <AvatarTile name={meMatch?.name ?? t.game.you} photoUrl={user?.photoUrl} size={54} active={myTurn} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold">{meMatch?.name ?? t.game.you}</div>
            <div className="text-[12px] text-paper-ink/60">{t.game.cards(me?.hand.length ?? 0)}</div>
          </div>
          <div className="flex flex-col items-center border-l border-paper-ink/10 pl-3 pr-1">
            <span className="text-[26px] font-bold tabular-nums leading-none">{meMatch?.score ?? 0}</span>
            <span className="text-[11px] text-paper-ink/60">/ {match.rules.eliminationScore}</span>
          </div>
          {showPass ? (
            <button
              type="button"
              onClick={() => act(humanActions.pass)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#14384a] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#1b475d]"
            >
              <IconSkip size={18} />
              {t.game.pass}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => act(humanActions.draw)}
              disabled={!drawEnabled}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#14384a] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#1b475d] disabled:bg-paper-ink/15 disabled:text-paper-ink/45"
            >
              <IconDraw size={18} />
              {myTurn && round.pending ? t.game.takePenalty(round.pending.draws) : t.game.draw}
            </button>
          )}
        </div>
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
