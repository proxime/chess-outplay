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

  const moverIsPlayer = ply.color === game.playerColor;
  const moveLabel = moverIsPlayer ? "Twój ruch" : "Ruch bota";
  const moveSan = polishSan(ply.san);
  const a = game.tipAssessment;

  if (!a) {
    return (
      <Shell>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Badge glyph="…" color="#9AA3AF" bg="#232833" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }} className="animate-pulse">
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

  return (
    <Shell>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Badge glyph={meta.symbol} color={meta.color} bg={meta.color + "22"} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: meta.color }}>
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
            {formatLoss(lossDisplay)}
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

      {/* alternatives */}
      {a.alternatives.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ ...caption, marginBottom: 8 }}>Alternatywy</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {a.alternatives.map((alt, i) => {
              const ev = formatEval(toWhite(alt.eval));
              const highlight = i === 0;
              return (
                <span
                  key={alt.uci}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: `1px solid ${highlight ? "#21C7A8" : "#232833"}`,
                    background: highlight ? "#21C7A822" : "#0E1116",
                    color: highlight ? "#21C7A8" : "#E8EAED",
                  }}
                >
                  {polishSan(alt.san)}{" "}
                  <span style={{ color: highlight ? "#21C7A8" : "#9AA3AF" }}>{ev}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </Shell>
  );
}
