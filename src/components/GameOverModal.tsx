import type { CSSProperties } from "react";
import { QUALITY_META } from "../engine/evaluate";
import type { MoveQuality } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const BREAKDOWN: { key: MoveQuality; label: string }[] = [
  { key: "best", label: "Najlepsze" },
  { key: "good", label: "Dobre" },
  { key: "inaccuracy", label: "Niedokładności" },
  { key: "mistake", label: "Błędy" },
  { key: "blunder", label: "Gafy" },
];

const statBox: CSSProperties = {
  flex: 1,
  background: "#0E1116",
  border: "1px solid #232833",
  borderRadius: 11,
  padding: "9px 13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

function accuracyColor(acc: number): string {
  if (acc >= 80) return "#5DBB63";
  if (acc >= 60) return "#E0A800";
  return "#F08C2E";
}

export function GameOverModal({
  game,
  onDismiss,
}: {
  game: ChessVsBot;
  onDismiss: () => void;
}) {
  const result = game.result;
  const moveNo = Math.ceil(game.history.length / 2);

  let kind: "win" | "draw" | "loss";
  if (!result) kind = "loss";
  else if (result.kind === "checkmate")
    kind = result.winner === game.playerColor ? "win" : "loss";
  else kind = "draw";

  const drawSub =
    result?.kind === "stalemate"
      ? "Pat — brak legalnych ruchów"
      : result?.kind === "insufficient"
        ? "Niewystarczający materiał"
        : result?.kind === "threefold"
          ? "Trzykrotne powtórzenie"
          : "Remis";

  const res =
    kind === "win"
      ? { head: "Szach-mat — wygrywasz!", sub: `Mat w ${moveNo}. ruchu`, color: "#21C7A8", icon: "♔" }
      : kind === "loss"
        ? { head: "Przegrana", sub: result ? `Szach-mat w ${moveNo}. ruchu` : "Poddano partię", color: "#E5484D", icon: "♚" }
        : { head: "Remis", sub: drawSub, color: "#9AA3AF", icon: "½" };

  const { accuracy, counts } = game.playerStats;
  const total = BREAKDOWN.reduce((a, b) => a + counts[b.key], 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(10,12,16,.66)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#171A21",
          border: "1px solid #2c3445",
          borderRadius: 16,
          padding: 26,
          boxShadow: "0 30px 70px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: res.color + "22",
              color: res.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              margin: "0 auto 14px",
            }}
          >
            {res.icon}
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            {res.head}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9AA3AF" }}>{res.sub}</p>
        </div>

        {/* accuracy + errors */}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <div
            style={{
              flex: 1.2,
              background: "#0E1116",
              border: "1px solid #232833",
              borderRadius: 11,
              padding: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "#9AA3AF",
                fontWeight: 600,
              }}
            >
              Twoja celność
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: accuracy === null ? "#9AA3AF" : accuracyColor(accuracy),
                lineHeight: 1.1,
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {accuracy === null ? "—" : `${accuracy}%`}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={statBox}>
              <span style={{ fontSize: 13, color: "#C2C7CF" }}>
                <span style={{ color: "#F08C2E", fontWeight: 700 }}>?</span>&nbsp; Błędy
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {counts.mistake}
              </span>
            </div>
            <div style={statBox}>
              <span style={{ fontSize: 13, color: "#C2C7CF" }}>
                <span style={{ color: "#E5484D", fontWeight: 700 }}>??</span>&nbsp; Gafy
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {counts.blunder}
              </span>
            </div>
          </div>
        </div>

        {/* quality breakdown */}
        {total > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                height: 8,
                borderRadius: 999,
                overflow: "hidden",
                background: "#0E1116",
              }}
            >
              {BREAKDOWN.map((b) =>
                counts[b.key] > 0 ? (
                  <div
                    key={b.key}
                    style={{
                      width: `${(counts[b.key] / total) * 100}%`,
                      background: QUALITY_META[b.key].color,
                      height: "100%",
                    }}
                  />
                ) : null,
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", marginTop: 10 }}>
              {BREAKDOWN.map((b) => (
                <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 2,
                      background: QUALITY_META[b.key].color,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#9AA3AF" }}>
                    {b.label}{" "}
                    <b style={{ color: "#E8EAED", fontVariantNumeric: "tabular-nums" }}>
                      {counts[b.key]}
                    </b>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
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
              height: 48,
              borderRadius: 11,
              border: "none",
              background: "#6C8CFF",
              color: "#0E1116",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Zagraj ponownie
          </button>
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 11,
              border: "1px solid #2c3445",
              background: "#171A21",
              color: "#E8EAED",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Analizuj partię
          </button>
        </div>
      </div>
    </div>
  );
}
