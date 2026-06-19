import type { CSSProperties, ReactNode } from "react";
import { QUALITY_META, negateEval } from "../engine/evaluate";
import { formatEval, formatLoss, polishSan, qualityComment } from "../format";
import type { EvalScore } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const card: CSSProperties = {
  background: "#171A21",
  border: "1px solid #232833",
  borderRadius: 12,
  padding: 18,
};
const caption: CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: ".07em",
  color: "#9AA3AF",
  fontWeight: 600,
};
const innerBox: CSSProperties = {
  flex: 1,
  background: "#0E1116",
  border: "1px solid #232833",
  borderRadius: 10,
  padding: "10px 13px",
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

function Shell({ children }: { children: ReactNode }) {
  return <div style={card}>{children}</div>;
}

export function TipCard({ game }: { game: ChessVsBot }) {
  if (!game.showHints) {
    return (
      <Shell>
        <div style={{ fontSize: 13.5, color: "#9AA3AF" }}>
          Podpowiedzi są wyłączone.
        </div>
      </Shell>
    );
  }

  const ply = game.tipPly;
  if (!ply) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Badge glyph="•" color="#9AA3AF" bg="#232833" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Pozycja startowa</div>
            <div style={{ fontSize: 13, color: "#9AA3AF", marginTop: 2 }}>
              Wykonaj ruch, aby zobaczyć jego ocenę.
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const moveLabel = game.isPreviewing
    ? "Podgląd"
    : ply.color === game.playerColor
      ? "Twój ruch"
      : "Ruch bota";
  const moveSan = polishSan(game.tipSan ?? ply.san);
  const a = game.tipAssessment;

  if (!a) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Badge glyph="…" color="#9AA3AF" bg="#232833" />
          <div>
            <div
              style={{ fontSize: 16, fontWeight: 600 }}
              className="animate-pulse"
              data-testid="tip-analyzing"
            >
              Analizuję…
            </div>
            <div style={{ fontSize: 13, color: "#9AA3AF", marginTop: 2 }}>
              {moveLabel}: {moveSan}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const meta = QUALITY_META[a.quality];
  const toWhite = (e: EvalScore): EvalScore =>
    ply.color === "w" ? e : negateEval(e);
  const posEval = toWhite(a.evalAfter);
  const bestEval = toWhite(a.evalBefore);
  const bestSan = a.bestSan ? polishSan(a.bestSan) : "—";
  // A "best" move's residual loss is just eval noise between two searches.
  const lossDisplay = a.quality === "best" ? 0 : a.cpLoss;
  // Mate swings produce a huge sentinel loss — show "−∞" instead of "−999.3".
  const lossText = lossDisplay >= 5000 ? "−∞" : formatLoss(lossDisplay);

  return (
    <Shell>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Badge glyph={meta.symbol} color={meta.color} bg={meta.color + "22"} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ fontSize: 16, fontWeight: 700, color: meta.color }}
              data-testid="tip-quality"
            >
              {meta.label}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: meta.color,
                background: meta.color + "22",
                borderRadius: 999,
                padding: "2px 9px",
              }}
            >
              {meta.pill}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#9AA3AF", marginTop: 3 }}>
            {moveLabel}: <span style={{ color: "#E8EAED", fontWeight: 600 }}>{moveSan}</span>
          </div>
        </div>
      </div>

      {/* eval + loss */}
      <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <div style={innerBox}>
          <div style={caption}>Ocena</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              marginTop: 3,
              color: "#E8EAED",
            }}
          >
            {formatEval(posEval)}
          </div>
        </div>
        <div style={innerBox}>
          <div style={caption}>Strata</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              marginTop: 3,
              color: lossDisplay > 0 ? meta.color : "#5DBB63",
            }}
          >
            {lossText}
          </div>
        </div>
      </div>

      {/* engine best move */}
      <div
        style={{
          marginTop: 14,
          background: "#0E1116",
          border: "1px solid #232833",
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <div style={{ ...caption, marginBottom: 6 }}>Najlepszy ruch wg silnika</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
          <span style={{ color: "#21C7A8", fontWeight: 700 }}>
            {bestSan} ({formatEval(bestEval)})
          </span>
          <span style={{ color: "#C2C7CF" }}> — {qualityComment(a.quality)}</span>
        </div>
      </div>

      {/* alternatives — click to explore that line */}
      {a.alternatives.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              ...caption,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Alternatywy</span>
            <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
              najedź = podgląd · klik = rozegraj
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {a.alternatives.map((alt, i) => {
              const ev = formatEval(toWhite(alt.eval));
              const highlight = i === 0;
              const played = alt.uci === ply.uci;
              return (
                <button
                  key={alt.uci}
                  data-testid={`alt-${i}`}
                  onClick={() => game.playAlternative(game.tipIndex, alt.uci)}
                  onMouseEnter={() => game.setPreview(alt.uci)}
                  onMouseLeave={() => game.setPreview(null)}
                  title={played ? "Zagrany ruch — kliknij, aby powtórzyć" : "Najedź, by podejrzeć · kliknij, by rozegrać"}
                  className="hover:brightness-125"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "inherit",
                    padding: "5px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: `1px solid ${highlight ? "#21C7A8" : "#2c3445"}`,
                    background: highlight ? "#21C7A822" : "#0E1116",
                    color: highlight ? "#21C7A8" : "#E8EAED",
                    boxShadow: played ? "inset 0 0 0 1px #6C8CFF" : "none",
                  }}
                >
                  {polishSan(alt.san)}{" "}
                  <span style={{ color: highlight ? "#21C7A8" : "#9AA3AF" }}>{ev}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Shell>
  );
}
