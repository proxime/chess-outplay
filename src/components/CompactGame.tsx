import type { CSSProperties, ReactNode } from "react";
import { Board } from "./Board";
import { Controls } from "./Controls";
import { MoveList } from "./MoveList";
import { TipCard } from "./TipCard";
import { LEVELS, LEVEL_LIST } from "../engine/levels";
import { GLYPH } from "../format";
import type { Color, LevelId, PieceSymbol } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

function CompactStrip({
  isBot,
  name,
  captured,
  glyphColor,
  active,
  activeText,
  extra,
}: {
  isBot: boolean;
  name: string;
  captured: PieceSymbol[];
  glyphColor: string;
  active: boolean;
  activeText: string;
  extra?: string;
}) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: isBot ? "#6C8CFF" : "#232833",
            color: isBot ? "#0E1116" : "#E8EAED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            flex: "0 0 auto",
          }}
        >
          {isBot ? "AI" : "Ty"}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ fontSize: 14, lineHeight: 1, color: glyphColor, letterSpacing: 1 }}>
          {captured.map((p) => GLYPH[p]).join("")}
        </span>
        {extra && (
          <span
            style={{
              fontSize: 12,
              color: "#21C7A8",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {extra}
          </span>
        )}
      </div>
      {active && (
        <span style={{ fontSize: 11, fontWeight: 600, color: "#6C8CFF", flex: "0 0 auto" }}>
          ● {activeText}
        </span>
      )}
    </div>
  );
}

export function CompactGame({
  game,
  orientation,
  onFlip,
  narrow,
}: {
  game: ChessVsBot;
  orientation: Color;
  onFlip: () => void;
  narrow: boolean;
}) {
  const opponent: Color = game.playerColor === "w" ? "b" : "w";
  const youCaptured =
    game.playerColor === "w" ? game.material.capturedByWhite : game.material.capturedByBlack;
  const botCaptured =
    opponent === "w" ? game.material.capturedByWhite : game.material.capturedByBlack;
  const youDiff = game.playerColor === "w" ? game.material.diff : -game.material.diff;
  const pct = Math.max(6, Math.min(94, 50 + (game.evalWhiteCp / 100) * 7));

  const pillSelect: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "#9AA3AF",
    border: "1px solid #232833",
    borderRadius: 999,
    padding: "3px 9px",
    background: "transparent",
    fontFamily: "inherit",
    cursor: "pointer",
    appearance: "none",
  };

  const evalBar = (height?: string): ReactNode => (
    <div
      style={{
        flex: "0 0 auto",
        width: 10,
        height,
        alignSelf: height ? undefined : "stretch",
        borderRadius: 6,
        overflow: "hidden",
        background: "#2B2F36",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
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
      <div style={{ width: "100%", height: `${pct}%`, background: "#ECEDEF", transition: "height .3s ease" }} />
    </div>
  );

  const boardSquare = "min(100cqw - 18px, 100cqh)";

  const botStrip = (
    <CompactStrip
      isBot
      name={`Bot (${LEVELS[game.level].label})`}
      captured={botCaptured}
      glyphColor="#C7CBD1"
      active={game.thinking}
      activeText="myśli…"
      extra={youDiff < 0 ? `+${-youDiff}` : undefined}
    />
  );
  const youStrip = (
    <CompactStrip
      isBot={false}
      name="Ty"
      captured={youCaptured}
      glyphColor="#737B88"
      active={game.turn === game.playerColor && !game.thinking}
      activeText="Twój ruch"
      extra={youDiff > 0 ? `+${youDiff}` : undefined}
    />
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: narrow ? "auto" : "hidden",
        overflowX: "hidden",
      }}
    >
      {/* title bar */}
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: "1px solid #232833",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "#6C8CFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "#0E1116",
            }}
          >
            ♞
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Chess Outplay
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <select
            value={game.level}
            onChange={(e) => game.setLevel(e.target.value as LevelId)}
            style={pillSelect}
            title="Poziom"
          >
            {LEVEL_LIST.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={onFlip}
            title="Obróć planszę"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: "1px solid #232833",
              background: "#171A21",
              color: "#E8EAED",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ⇅
          </button>
        </div>
      </div>

      {/* content */}
      <div
        style={{
          flex: narrow ? "0 0 auto" : 1,
          minHeight: 0,
          display: "flex",
          flexDirection: narrow ? "column" : "row",
          gap: narrow ? 10 : 12,
          padding: 12,
        }}
      >
        {/* board column */}
        <div
          style={{
            flex: narrow ? "0 0 auto" : "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {botStrip}
          {narrow ? (
            <div style={{ display: "flex", gap: 8, width: "min(100%, 66vh)", margin: "0 auto" }}>
              {evalBar()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Board game={game} orientation={orientation} />
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                containerType: "size",
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {evalBar(boardSquare)}
              <div style={{ flex: "0 0 auto", width: boardSquare, height: boardSquare }}>
                <Board game={game} orientation={orientation} />
              </div>
            </div>
          )}
          {youStrip}
        </div>

        {/* panel */}
        <div
          style={{
            flex: narrow ? "0 0 auto" : "0 0 290px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <TipCard game={game} />
          <div style={{ flex: narrow ? "0 0 auto" : 1, minHeight: 0, height: narrow ? 220 : undefined }}>
            <MoveList game={game} compact />
          </div>
          <Controls game={game} />
        </div>
      </div>
    </div>
  );
}
