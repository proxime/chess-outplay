import type { CSSProperties } from "react";
import type { ChessVsBot } from "../game/useChessVsBot";

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
  height: 44,
  borderRadius: 8,
  background: "#171A21",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
};

function navStyle(enabled: boolean): CSSProperties {
  return {
    ...base,
    border: `1px solid ${enabled ? "#232833" : "#1b1f27"}`,
    color: enabled ? "#E8EAED" : "#5b6470",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.55,
  };
}

export function Controls({ game }: { game: ChessVsBot }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        style={navStyle(game.canUndo)}
        onClick={game.undo}
        disabled={!game.canUndo}
      >
        ↰ Cofnij
      </button>
      <button
        style={navStyle(game.canRedo)}
        onClick={game.redo}
        disabled={!game.canRedo}
      >
        Ponów ↱
      </button>
      <button
        onClick={game.backToSetup}
        style={{
          ...base,
          flex: 1.1,
          border: "none",
          background: "#6C8CFF",
          color: "#0E1116",
          cursor: "pointer",
        }}
      >
        Nowa gra
      </button>
    </div>
  );
}
