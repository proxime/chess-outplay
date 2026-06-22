import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { QUALITY_META } from "../engine/evaluate";
import { figurine } from "../format";
import type { Ply } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const ACCENT = "#6C8CFF";

function MoveButton({
  ply,
  index,
  game,
}: {
  ply: Ply | undefined;
  index: number;
  game: ChessVsBot;
}) {
  if (!ply) return <span />;
  const selected = game.cursor === index + 1;
  const assessment = game.assessments[ply.after];
  const meta = assessment ? QUALITY_META[assessment.quality] : null;
  const btn: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 7,
    width: "100%",
    border: "none",
    background: selected ? ACCENT + "22" : "transparent",
    color: "#E8EAED",
    font: "500 14px Inter, system-ui, sans-serif",
    padding: "9px 12px",
    borderRadius: 7,
    cursor: "pointer",
    textAlign: "left",
  };
  return (
    <button data-testid={`move-${index}`} style={btn} onClick={() => game.selectMove(index)}>
      <span
        title={ply.color === "w" ? "Białe" : "Czarne"}
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          flex: "0 0 auto",
          background: ply.color === "w" ? "#EDEDED" : "#454b56",
          border: `1px solid ${ply.color === "w" ? "#c4c8cd" : "#20242b"}`,
        }}
      />
      <span>{figurine(ply.san, ply.color)}</span>
      {meta && (
        <span
          style={{
            color: meta.color,
            fontWeight: 700,
            fontSize: 12,
            marginLeft: 7,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {meta.symbol}
        </span>
      )}
    </button>
  );
}

export function MoveList({
  game,
  compact = false,
}: {
  game: ChessVsBot;
  compact?: boolean;
}) {
  const { history } = game;
  const rows: { no: number; white: number; black: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({ no: i / 2 + 1, white: i, black: i + 1 });
  }

  // Keep the latest move in view after each move is played.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!compact && el) el.scrollTop = el.scrollHeight;
  }, [history.length, compact]);

  return (
    <div
      style={{
        background: "#171A21",
        border: "1px solid #232833",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "9px 13px" : "13px 16px",
          borderBottom: "1px solid #232833",
        }}
      >
        <span style={{ fontSize: compact ? 12 : 13, fontWeight: 600 }}>Lista ruchów</span>
        {compact ? (
          <div style={{ display: "flex", gap: 9 }}>
            {Object.values(QUALITY_META).map((q) => (
              <span
                key={q.label}
                title={q.label}
                style={{ color: q.color, fontWeight: 700, fontSize: 12, fontVariantNumeric: "tabular-nums" }}
              >
                {q.symbol}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: "#9AA3AF" }}>kliknij, by zobaczyć ocenę</span>
        )}
      </div>

      <div
        ref={scrollRef}
        data-testid="ml-scroll"
        style={compact ? {} : { maxHeight: 300, overflowY: "auto" }}
      >
        {rows.length === 0 && (
          <div style={{ padding: 16, fontSize: 13, color: "#9AA3AF" }}>
            Brak ruchów — zacznij grę!
          </div>
        )}
        {rows.map((row) => (
          <div
            key={row.no}
            style={{
              display: "grid",
              gridTemplateColumns: compact ? "32px 1fr 1fr" : "38px 1fr 1fr",
              alignItems: "center",
              borderBottom: "1px solid #1b1f27",
            }}
          >
            <span
              style={{
                fontSize: compact ? 11 : 12,
                color: "#5b6470",
                fontWeight: 600,
                paddingLeft: compact ? 13 : 15,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.no}.
            </span>
            <MoveButton ply={history[row.white]} index={row.white} game={game} />
            <MoveButton ply={history[row.black]} index={row.black} game={game} />
          </div>
        ))}
      </div>

      {!compact && (
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            padding: "11px 16px",
            borderTop: "1px solid #232833",
          }}
        >
          {Object.values(QUALITY_META).map((q) => (
            <div key={q.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  color: q.color,
                  fontWeight: 700,
                  fontSize: 13,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {q.symbol}
              </span>
              <span style={{ fontSize: 11, color: "#9AA3AF" }}>{q.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
