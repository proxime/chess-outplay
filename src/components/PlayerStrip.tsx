import { GLYPH } from "../format";
import type { Color } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

export function PlayerStrip({
  game,
  color,
  role,
  name,
}: {
  game: ChessVsBot;
  color: Color;
  role: "bot" | "you";
  name: string;
}) {
  // Pieces THIS side has captured (i.e. opponent's pieces).
  const captured =
    color === "w" ? game.material.capturedByWhite : game.material.capturedByBlack;
  const capturedAreWhite = color === "b"; // captured pieces belong to the other color
  const glyphColor = capturedAreWhite ? "#C7CBD1" : "#5b6470";

  const isBot = role === "bot";
  const active = isBot
    ? game.thinking
    : game.turn === game.playerColor && !game.thinking;
  const activeText = isBot ? "● myśli…" : "● Twój ruch";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: isBot ? "#6C8CFF" : "#232833",
            color: isBot ? "#0E1116" : "#E8EAED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {isBot ? "AI" : "Ty"}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>{name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 3, minHeight: 18 }}>
            <span style={{ fontSize: 18, lineHeight: 1, color: glyphColor, letterSpacing: 1 }}>
              {captured.map((p) => GLYPH[p]).join("")}
            </span>
            {active && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#6C8CFF" }}>
                {activeText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
