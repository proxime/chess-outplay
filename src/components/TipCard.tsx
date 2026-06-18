import { QUALITY_META } from "../engine/evaluate";
import { formatEval, formatLoss } from "../format";
import type { ChessVsBot } from "../game/useChessVsBot";

export function TipCard({ game }: { game: ChessVsBot }) {
  if (!game.showHints) {
    return (
      <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted">
        Podpowiedzi wyłączone.
      </div>
    );
  }

  if (game.cursor === 0) {
    return (
      <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted">
        Wykonaj ruch, aby zobaczyć jego ocenę.
      </div>
    );
  }

  const a = game.currentAssessment;
  const lastPly = game.history[game.cursor - 1];
  const moverIsPlayer = lastPly.color === game.playerColor;

  if (!a) {
    return (
      <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted">
        <span className="animate-pulse">Analizuję ruch {lastPly.san}…</span>
      </div>
    );
  }

  const meta = QUALITY_META[a.quality];

  return (
    <div
      className="rounded-xl border bg-panel p-4"
      style={{ borderColor: meta.color }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
          style={{ background: meta.color + "22", color: meta.color }}
        >
          {meta.symbol}
        </span>
        <div>
          <div className="font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="text-xs text-muted">
            {moverIsPlayer ? "Twój ruch" : "Ruch bota"}: {lastPly.san}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="tnum text-lg font-semibold">
            {formatEval(a.evalAfter)}
          </div>
          {a.cpLoss > 0 && (
            <div className="tnum text-xs text-quality-mistake">
              {formatLoss(a.cpLoss)}
            </div>
          )}
        </div>
      </div>

      {a.quality !== "best" && a.bestSan && (
        <p className="mt-3 text-sm text-ink">
          Najlepszy był{" "}
          <span className="font-semibold text-quality-best">{a.bestSan}</span>{" "}
          <span className="tnum text-muted">({formatEval(a.evalBefore)})</span>.
        </p>
      )}
      {a.quality === "best" && (
        <p className="mt-3 text-sm text-quality-best">Świetnie — to był najlepszy ruch!</p>
      )}

      {a.alternatives.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {a.alternatives.map((alt) => (
            <span
              key={alt.uci}
              className="tnum rounded-md border border-border bg-panel-2 px-2 py-0.5 text-xs"
            >
              {alt.san}{" "}
              <span className="text-muted">{formatEval(alt.eval)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
