import { useState } from "react";
import { LEVEL_LIST } from "../engine/levels";
import type { Color, LevelId } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

type ColorChoice = Color | "random";

export function SetupScreen({ game }: { game: ChessVsBot }) {
  const [color, setColor] = useState<ColorChoice>("w");
  const [level, setLevel] = useState<LevelId>("intermediate");
  const [hints, setHints] = useState(true);

  function start() {
    const playerColor: Color =
      color === "random" ? (Math.random() < 0.5 ? "w" : "b") : color;
    game.newGame({ playerColor, level, showHints: hints });
  }

  const colorOptions: { id: ColorChoice; label: string }[] = [
    { id: "w", label: "Białe" },
    { id: "b", label: "Czarne" },
    { id: "random", label: "Losowo" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-brand">♞</span> Chess Outplay
        </h1>
        <p className="mt-1 text-muted">Graj z AI i ucz się na każdym ruchu.</p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Grasz jako</h2>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((o) => (
            <button
              key={o.id}
              onClick={() => setColor(o.id)}
              className={`rounded-lg border px-3 py-3 font-medium ${
                color === o.id
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-border bg-panel hover:bg-panel-2"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          Poziom trudności
        </h2>
        <div className="grid gap-2">
          {LEVEL_LIST.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`rounded-lg border px-4 py-3 text-left ${
                level === l.id
                  ? "border-brand bg-brand/15"
                  : "border-border bg-panel hover:bg-panel-2"
              }`}
            >
              <div className="font-semibold">{l.label}</div>
              <div className="text-xs text-muted">{l.description}</div>
            </button>
          ))}
        </div>
      </section>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-panel px-4 py-3">
        <input
          type="checkbox"
          checked={hints}
          onChange={(e) => setHints(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        <div>
          <div className="font-medium">Podpowiedzi po ruchu</div>
          <div className="text-xs text-muted">
            Ocena ruchu i najlepsza alternatywa po każdym posunięciu.
          </div>
        </div>
      </label>

      <button
        onClick={start}
        disabled={!game.engineReady}
        className="rounded-xl bg-brand px-4 py-3 text-lg font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {game.engineReady ? "Zacznij grę" : "Ładowanie silnika…"}
      </button>
    </div>
  );
}
