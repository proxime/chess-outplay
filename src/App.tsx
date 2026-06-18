import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { EvalBar } from "./components/EvalBar";
import { MoveList } from "./components/MoveList";
import { PlayerStrip } from "./components/PlayerStrip";
import { SetupScreen } from "./components/SetupScreen";
import { TipCard } from "./components/TipCard";
import { LEVELS } from "./engine/levels";
import { useChessVsBot } from "./game/useChessVsBot";
import type { ChessVsBot } from "./game/useChessVsBot";

export default function App() {
  const game = useChessVsBot();
  if (game.status === "setup") return <SetupScreen game={game} />;
  return <GameScreen game={game} />;
}

function resultText(game: ChessVsBot): string {
  if (game.result) {
    if (game.result.kind === "checkmate") {
      return game.result.winner === game.playerColor
        ? "Szach-mat — wygrywasz! 🎉"
        : "Szach-mat — przegrywasz.";
    }
    return "Remis.";
  }
  return "Poddano partię.";
}

function GameScreen({ game }: { game: ChessVsBot }) {
  const opponent = game.playerColor === "w" ? "b" : "w";
  const levelLabel = LEVELS[game.level].label;
  const turnInfo = game.thinking
    ? "Bot myśli…"
    : game.turn === game.playerColor
      ? "Twój ruch"
      : "Ruch bota";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">
          <span className="text-brand">♞</span> Chess Outplay
        </h1>
        <span className="rounded-md bg-panel-2 px-2 py-1 text-xs text-muted">
          {levelLabel}
        </span>
        <span className="ml-auto text-sm text-muted">{turnInfo}</span>
        <button
          onClick={game.backToSetup}
          className="rounded-lg border border-border bg-panel-2 px-3 py-1.5 text-sm font-medium hover:bg-border"
        >
          Nowa gra
        </button>
      </header>

      {!game.engineReady && (
        <div className="bg-brand/15 px-4 py-2 text-center text-sm text-brand">
          Ładowanie silnika szachowego…
        </div>
      )}

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="mx-auto w-full max-w-[640px]">
          <PlayerStrip
            game={game}
            color={opponent}
            label={`Bot`}
            sublabel={levelLabel}
          />
          <div className="flex items-stretch gap-2">
            <EvalBar game={game} />
            <div className="min-w-0 flex-1">
              <Board game={game} />
            </div>
          </div>
          <PlayerStrip game={game} color={game.playerColor} label="Ty" />
        </section>

        <aside className="flex flex-col gap-4">
          <TipCard game={game} />
          <MoveList game={game} />
          <Controls game={game} />
        </aside>
      </main>

      {game.status === "gameover" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-panel p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-bold">{resultText(game)}</h2>
            <p className="mt-2 text-sm text-muted">
              {game.history.length} półruchów rozegranych.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() =>
                  game.newGame({
                    playerColor: game.playerColor,
                    level: game.level,
                    showHints: game.showHints,
                  })
                }
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 font-semibold text-white hover:brightness-110"
              >
                Zagraj ponownie
              </button>
              <button
                onClick={game.backToSetup}
                className="flex-1 rounded-lg border border-border bg-panel-2 px-4 py-2.5 font-medium hover:bg-border"
              >
                Zmień ustawienia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
