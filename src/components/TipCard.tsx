import type { CSSProperties } from "react";
import { QUALITY_META, negateEval } from "../engine/evaluate";
import { figurine, formatEval, formatLoss, qualityComment } from "../format";
import type { EvalScore } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const card: CSSProperties = {
  background: "#171A21",
  border: "1px solid #232833",
  borderRadius: 12,
  padding: 18,
};
const header: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".09em",
  color: "#9AA3AF",
  fontWeight: 600,
  marginBottom: 14,
};
const innerBox: CSSProperties = {
  flex: 1,
  background: "#0E1116",
  border: "1px solid #232833",
  borderRadius: 10,
  padding: "10px 13px",
};
const boxLabel: CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: ".07em",
  color: "#9AA3AF",
  fontWeight: 600,
};

function Badge({ glyph, color, bg }: { glyph: string; color: string; bg: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 21,
        fontWeight: 700,
        background: bg,
        color,
        fontVariantNumeric: "tabular-nums",
        flex: "0 0 auto",
      }}
    >
      {glyph}
    </div>
  );
}

export function TipCard({ game }: { game: ChessVsBot }) {
  if (!game.showHints) {
    return (
      <div style={card}>
        <div style={header}>Ocena ostatniego ruchu</div>
        <div style={{ fontSize: 13.5, color: "#9AA3AF" }}>
          Podpowiedzi są wyłączone.
        </div>
      </div>
    );
  }

  // No moves yet → start position.
  if (game.cursor === 0) {
    return (
      <div style={card}>
        <div style={header}>Ocena ostatniego ruchu</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Badge glyph="•" color="#9AA3AF" bg="#232833" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#E8EAED" }}>
              Pozycja startowa
            </div>
            <div style={{ fontSize: 13, color: "#9AA3AF", marginTop: 2 }}>—</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.55, color: "#9AA3AF" }}>
          Wykonaj ruch, aby zobaczyć jego ocenę.
        </div>
      </div>
    );
  }

  const lastPly = game.history[game.cursor - 1];
  const moverIsPlayer = lastPly.color === game.playerColor;
  const moveNo = Math.ceil(game.cursor / 2);
  const moveText = `${moveNo}${lastPly.color === "w" ? ". " : "… "}${figurine(
    lastPly.san,
    lastPly.color,
  )}`;

  const a = game.currentAssessment;

  // Analysis still running.
  if (!a) {
    return (
      <div style={card}>
        <div style={header}>Ocena ostatniego ruchu</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Badge glyph="…" color="#9AA3AF" bg="#232833" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontSize: 16, fontWeight: 600, color: "#E8EAED" }}
              className="animate-pulse"
            >
              Analizuję…
            </div>
            <div style={{ fontSize: 13, color: "#9AA3AF", marginTop: 2 }}>
              {moverIsPlayer ? "Twój ruch" : "Ruch bota"}: {moveText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = QUALITY_META[a.quality];
  const bad =
    a.quality === "inaccuracy" || a.quality === "mistake" || a.quality === "blunder";

  // best move eval, converted to White's POV for consistency with the bar.
  const bestEvalWhite: EvalScore =
    lastPly.color === "w" ? a.evalBefore : negateEval(a.evalBefore);

  return (
    <div style={card}>
      <div style={header}>Ocena ostatniego ruchu</div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Badge glyph={meta.symbol} color={meta.color} bg={meta.color + "22"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: meta.color }}>
            {meta.label}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#9AA3AF",
              marginTop: 2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {moverIsPlayer ? "Twój ruch" : "Ruch bota"}: {moveText}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <div style={innerBox}>
          <div style={boxLabel}>Ocena pozycji</div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              marginTop: 3,
              color: "#E8EAED",
            }}
          >
            {formatEval(game.evalWhite)}
          </div>
        </div>
        {bad && a.cpLoss > 0 && (
          <div style={innerBox}>
            <div style={boxLabel}>Strata</div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                marginTop: 3,
                color: meta.color,
              }}
            >
              {formatLoss(a.cpLoss)}
            </div>
          </div>
        )}
      </div>

      {bad && a.bestSan ? (
        <div
          style={{
            marginTop: 14,
            background: "#0E1116",
            border: "1px solid #232833",
            borderRadius: 10,
            padding: "13px 14px",
            lineHeight: 1.55,
          }}
        >
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#6C8CFF" }}>
            Lepszy był {a.bestSan} ({formatEval(bestEvalWhite)}).
          </span>{" "}
          <span style={{ fontSize: 13.5, color: "#C2C7CF" }}>
            {qualityComment(a.quality)}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.55, color: "#9AA3AF" }}>
          {qualityComment(a.quality)}
        </div>
      )}
    </div>
  );
}
