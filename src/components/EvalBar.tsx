import { formatEval } from "../format";
import type { ChessVsBot } from "../game/useChessVsBot";

export function EvalBar({ game }: { game: ChessVsBot }) {
  const whitePct = Math.round(game.winProb * 100);
  const showWhite = game.evalWhiteCp >= 0;
  return (
    <div className="flex w-7 flex-col items-center gap-1 self-stretch">
      <div className="relative w-full flex-1 overflow-hidden rounded-md bg-[#3a3f47]">
        <div
          className="absolute bottom-0 left-0 w-full bg-[#ededed] transition-[height] duration-300"
          style={{ height: `${whitePct}%` }}
        />
      </div>
      <span
        className={`tnum text-[0.65rem] font-semibold ${
          showWhite ? "text-ink" : "text-muted"
        }`}
      >
        {formatEval(game.evalWhite)}
      </span>
    </div>
  );
}
