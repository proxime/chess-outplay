import type { ChessVsBot } from "../game/useChessVsBot";

export function Controls({ game }: { game: ChessVsBot }) {
  const btn =
    "flex-1 rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm font-medium hover:bg-border disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex gap-2">
      <button className={btn} onClick={game.undo} disabled={!game.canUndo}>
        ↶ Cofnij
      </button>
      <button className={btn} onClick={game.redo} disabled={!game.canRedo}>
        Ponów ↷
      </button>
      <button
        className={btn}
        onClick={() => {
          if (game.status === "playing") game.resign();
        }}
        disabled={game.status !== "playing"}
      >
        Poddaj
      </button>
    </div>
  );
}
