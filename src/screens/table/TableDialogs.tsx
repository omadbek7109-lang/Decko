import { type MatchState, SUITS, type Suit } from '../../engine';
import { SUIT_NAME, t } from '../../i18n/uz';
import { SuitIcon, suitColor } from '../../ui/cards/suits';
import { Button } from '../../ui/components/Button';
import { Dialog } from '../../ui/components/Dialog';

export function SuitPicker({ open, onPick }: { open: boolean; onPick: (suit: Suit) => void }) {
  return (
    <Dialog open={open} title={t.game.chooseSuit} dismissible={false}>
      <div className="grid grid-cols-2 gap-3">
        {SUITS.map((suit) => (
          <button
            key={suit}
            type="button"
            onClick={() => onPick(suit)}
            className="flex min-h-[72px] items-center justify-center gap-3 rounded-2xl bg-paper text-[16px] font-semibold text-paper-ink transition-colors hover:bg-white"
          >
            <SuitIcon suit={suit} size={26} color={suitColor(suit)} />
            {SUIT_NAME[suit]}
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function Standings({ match }: { match: MatchState }) {
  const last = match.results[match.results.length - 1];
  const rows = match.players
    .map((p) => ({ p, line: last?.lines.find((l) => l.playerId === p.id) }))
    .sort((a, b) => a.p.score - b.p.score);
  return (
    <table className="w-full text-left text-[14px]">
      <thead className="text-[12px] text-muted">
        <tr>
          <th className="py-1.5 font-medium">O‘yinchi</th>
          <th className="py-1.5 text-right font-medium">Raund</th>
          <th className="py-1.5 text-right font-medium">{t.game.points}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ p, line }) => (
          <tr key={p.id} className="border-t border-line">
            <td className="py-2.5">
              <span className="font-semibold">{p.name}</span>
              {p.id === last?.winnerId && <span className="ml-2 text-[12px] text-accent">raund g‘olibi</span>}
              {p.eliminated && <span className="ml-2 text-[12px] text-danger">{t.game.out}</span>}
              {line?.reset && <span className="ml-2 text-[12px] text-accent">{t.game.reset}</span>}
            </td>
            <td className="py-2.5 text-right tabular-nums text-muted">
              {line ? (line.delta > 0 ? `+${line.delta}` : line.delta) : '—'}
            </td>
            <td className="py-2.5 text-right font-semibold tabular-nums">
              {p.score}
              <span className="text-[12px] font-normal text-muted">/{match.rules.eliminationScore}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface ResultProps {
  match: MatchState;
  humanId: string;
  onNext: () => void;
  onAgain: () => void;
  onLobby: () => void;
}

/** Round summary, or the final result when the match is over or the player is out. */
export function ResultDialog({ match, humanId, onNext, onAgain, onLobby }: ResultProps) {
  const me = match.players.find((p) => p.id === humanId);
  const over = match.phase === 'matchOver' || (match.phase === 'roundSummary' && me?.eliminated === true);
  const open = match.phase === 'matchOver' || match.phase === 'roundSummary';
  const last = match.results[match.results.length - 1];
  const nameOf = (id: string | null | undefined) => match.players.find((p) => p.id === id)?.name ?? '';
  const won = match.winnerId === humanId;

  const title = over ? (won ? t.game.matchWon : t.game.matchLost) : t.game.roundOver;
  const subtitle = over && match.winnerId ? t.game.matchWinner(nameOf(match.winnerId)) : last ? t.game.roundWinner(nameOf(last.winnerId)) : '';

  return (
    <Dialog open={open} title={title} dismissible={false}>
      <p className="-mt-2 mb-4 text-center text-[14px] text-muted">{subtitle}</p>
      <Standings match={match} />
      <div className="mt-5 flex flex-col gap-2.5">
        {over ? (
          <>
            <Button block onClick={onAgain}>
              {t.game.playAgain}
            </Button>
            <Button block variant="secondary" onClick={onLobby}>
              {t.game.toLobby}
            </Button>
          </>
        ) : (
          <Button block onClick={onNext}>
            {t.game.nextRound}
          </Button>
        )}
      </div>
    </Dialog>
  );
}

export function ChatDialog({ open, onClose, onSay }: { open: boolean; onClose: () => void; onSay: (text: string) => void }) {
  return (
    <Dialog open={open} title={t.game.chat} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {t.game.phrases.map((phrase) => (
          <Button key={phrase} variant="secondary" block onClick={() => onSay(phrase)}>
            {phrase}
          </Button>
        ))}
      </div>
    </Dialog>
  );
}

export function LeaveDialog({ open, onStay, onLeave }: { open: boolean; onStay: () => void; onLeave: () => void }) {
  return (
    <Dialog open={open} title={t.game.leaveTitle} onClose={onStay}>
      <p className="mb-5 text-center text-[14px] text-muted">{t.game.leaveText}</p>
      <div className="flex flex-col gap-2.5">
        <Button block onClick={onStay}>
          {t.game.stay}
        </Button>
        <Button block variant="danger" onClick={onLeave}>
          {t.game.leave}
        </Button>
      </div>
    </Dialog>
  );
}
