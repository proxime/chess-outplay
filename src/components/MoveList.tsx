import { QUALITY_META } from "../engine/evaluate";
import type { Ply } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

function QualityDot({ ply, game }: { ply: Ply; game: ChessVsBot }) {
  const a = game.assessments[ply.after];
  if (!a) return null;
  const meta = QUALITY_META[a.quality];
  return (
    <span
      className="ml-1 text-[0.7rem] font-bold"
      style={{ color: meta.color }}
      title={meta.label}
    >
      {meta.symbol}
    </span>
  );
}

export function MoveList({ game }: { game: ChessVsBot }) {
  const { history, cursor } = game;
  const rows = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({ no: i / 2 + 1, white: history[i], black: history[i + 1] });
  }

  function Cell({ ply, index }: { ply?: Ply; index: number }) {
    if (!ply) return <span className="px-2 py-1 text-muted">…</span>;
    const active = cursor === index + 1;
    return (
      <button
        onClick={() => game.jumpTo(index + 1)}
        className={`flex items-center rounded px-2 py-1 text-left hover:bg-panel-2 ${
          active ? "bg-panel-2 font-semibold text-brand" : ""
        }`}
      >
        {ply.san}
        <QualityDot ply={ply} game={game} />
      </button>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-panel">
      {rows.length === 0 && (
        <p className="p-3 text-sm text-muted">Brak ruchów. Zacznij grę!</p>
      )}
      {rows.map((row, r) => (
        <div
          key={row.no}
          className={`grid grid-cols-[2.2rem_1fr_1fr] items-center gap-1 px-2 py-0.5 text-sm ${
            r % 2 ? "bg-black/10" : ""
          }`}
        >
          <span className="tnum text-muted">{row.no}.</span>
          <Cell ply={row.white} index={r * 2} />
          <Cell ply={row.black} index={r * 2 + 1} />
        </div>
      ))}
    </div>
  );
}
