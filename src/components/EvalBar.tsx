import type { ChessVsBot } from "../game/useChessVsBot";

export function EvalBar({ game }: { game: ChessVsBot }) {
  const pawns = game.evalWhiteCp / 100;
  const pct = Math.max(6, Math.min(94, 50 + pawns * 7));
  return (
    <div
      style={{
        width: 16,
        alignSelf: "stretch",
        borderRadius: 8,
        overflow: "hidden",
        background: "#2B2F36",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
      }}
      title={`Ocena: ${game.evalWhiteCp >= 0 ? "+" : ""}${pawns.toFixed(1)}`}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 1,
          background: "rgba(255,255,255,.18)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          width: "100%",
          height: `${pct}%`,
          background: "#ECEDEF",
          transition: "height .3s ease",
        }}
      />
    </div>
  );
}
