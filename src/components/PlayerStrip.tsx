import { GLYPH } from "../format";
import type { Color } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

export function PlayerStrip({
  game,
  color,
  label,
  sublabel,
}: {
  game: ChessVsBot;
  color: Color;
  label: string;
  sublabel?: string;
}) {
  const captured =
    color === "w"
      ? game.material.capturedByWhite
      : game.material.capturedByBlack;
  const capturedColor: Color = color === "w" ? "b" : "w";
  const diff = color === "w" ? game.material.diff : -game.material.diff;

  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-lg"
        style={{ background: color === "w" ? "#ededed" : "#2a2d33" }}
      >
        <span style={{ color: color === "w" ? "#2a2d33" : "#ededed" }}>♚</span>
      </div>
      <div className="min-w-0">
        <div className="truncate font-semibold">{label}</div>
        {sublabel && <div className="text-xs text-muted">{sublabel}</div>}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <div
          className="flex text-base leading-none"
          style={{ color: capturedColor === "w" ? "#dcdcdc" : "#3a3d44" }}
        >
          {captured.map((p, i) => (
            <span key={i} className="-ml-1 first:ml-0">
              {GLYPH[p]}
            </span>
          ))}
        </div>
        {diff > 0 && (
          <span className="tnum text-xs font-semibold text-muted">+{diff}</span>
        )}
      </div>
    </div>
  );
}
