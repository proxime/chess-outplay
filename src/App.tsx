import { useState } from "react";
import type { CSSProperties } from "react";
import { Board } from "./components/Board";
import { Controls } from "./components/Controls";
import { EvalBar } from "./components/EvalBar";
import { MoveList } from "./components/MoveList";
import { PlayerStrip } from "./components/PlayerStrip";
import { SetupScreen } from "./components/SetupScreen";
import { TipCard } from "./components/TipCard";
import { LEVEL_LIST, LEVELS } from "./engine/levels";
import { GLYPH } from "./format";
import type { Color, LevelId } from "./game/types";
import { useChessVsBot } from "./game/useChessVsBot";
import type { ChessVsBot } from "./game/useChessVsBot";

export default function App() {
  const game = useChessVsBot();
  if (game.status === "setup") return <SetupScreen game={game} />;
  return <GameScreen game={game} />;
}

const sideCard: CSSProperties = {
  background: "#171A21",
  border: "1px solid #232833",
  borderRadius: 12,
};
const cardCaption: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  color: "#9AA3AF",
  fontWeight: 600,
};

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
  const [flipped, setFlipped] = useState(false);
  const orientation: Color = flipped
    ? game.playerColor === "w"
      ? "b"
      : "w"
    : game.playerColor;
  const opponent: Color = game.playerColor === "w" ? "b" : "w";
  const diff = game.material.diff;
  const matBig = diff > 0 ? `+${diff}` : diff < 0 ? `−${-diff}` : "0";
  const matSide =
    diff > 0 ? "materialna (białe)" : diff < 0 ? "materialna (czarne)" : "równy materiał";
  const youCaptured =
    game.playerColor === "w"
      ? game.material.capturedByWhite
      : game.material.capturedByBlack;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0E1116",
        color: "#E8EAED",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: "1px solid #232833",
          flex: "0 0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "#6C8CFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              color: "#0E1116",
            }}
          >
            ♞
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Chess Outplay
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#9AA3AF", fontWeight: 500 }}>Poziom</span>
            <select
              value={game.level}
              onChange={(e) => game.setLevel(e.target.value as LevelId)}
              style={{
                height: 38,
                padding: "0 13px",
                borderRadius: 8,
                border: "1px solid #232833",
                background: "#171A21",
                color: "#E8EAED",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {LEVEL_LIST.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setFlipped((f) => !f)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 38,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid #232833",
              background: "#171A21",
              color: "#E8EAED",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ⇅ Obróć planszę
          </button>
        </div>
      </header>

      {!game.engineReady && (
        <div
          style={{
            background: "rgba(108,140,255,.15)",
            color: "#6C8CFF",
            textAlign: "center",
            fontSize: 13,
            padding: "8px 0",
          }}
        >
          Ładowanie silnika szachowego…
        </div>
      )}

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 24,
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "26px 28px 40px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: material */}
        <div
          style={{
            width: 140,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            paddingTop: 54,
          }}
        >
          <div style={{ ...sideCard, padding: "16px 14px", textAlign: "center" }}>
            <div style={cardCaption}>Przewaga</div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: diff === 0 ? "#9AA3AF" : "#21C7A8",
                lineHeight: 1.1,
                margin: "6px 0 2px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {matBig}
            </div>
            <div style={{ fontSize: 12, color: "#9AA3AF" }}>{matSide}</div>
          </div>
          <div style={{ ...sideCard, padding: 14 }}>
            <div style={{ ...cardCaption, marginBottom: 10 }}>Zdobyte bierki</div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.25,
                color: game.playerColor === "w" ? "#5b6470" : "#C7CBD1",
                wordBreak: "break-all",
                letterSpacing: 2,
              }}
            >
              {youCaptured.map((p) => GLYPH[p]).join("")}
            </div>
            {youCaptured.length === 0 && (
              <div style={{ fontSize: 12, color: "#5b6470" }}>brak</div>
            )}
          </div>
        </div>

        {/* CENTER: players + eval + board */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "min(560px, 92vw)",
          }}
        >
          <PlayerStrip
            game={game}
            color={opponent}
            role="bot"
            name={`Bot (${LEVELS[game.level].label})`}
          />
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <EvalBar game={game} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Board game={game} orientation={orientation} />
            </div>
          </div>
          <PlayerStrip game={game} color={game.playerColor} role="you" name="Ty" />
        </div>

        {/* RIGHT: side panel */}
        <div style={{ width: 372, maxWidth: "92vw", display: "flex", flexDirection: "column", gap: 16 }}>
          <TipCard game={game} />
          <Controls game={game} />
          <MoveList game={game} />
        </div>
      </div>

      {game.status === "gameover" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,.6)",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              ...sideCard,
              padding: 24,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{resultText(game)}</h2>
            <p style={{ marginTop: 8, fontSize: 13, color: "#9AA3AF" }}>
              {game.history.length} półruchów rozegranych.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button
                onClick={() =>
                  game.newGame({
                    playerColor: game.playerColor,
                    level: game.level,
                    showHints: game.showHints,
                  })
                }
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  background: "#6C8CFF",
                  color: "#0E1116",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Zagraj ponownie
              </button>
              <button
                onClick={game.backToSetup}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  border: "1px solid #232833",
                  background: "#171A21",
                  color: "#E8EAED",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
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
