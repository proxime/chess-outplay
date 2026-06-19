import { useState } from "react";
import type { CSSProperties } from "react";
import { LEVEL_LIST } from "../engine/levels";
import type { Color, LevelId } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

type SideChoice = Color | "rnd";
const ACCENT = "#6C8CFF";

const caption: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".07em",
  color: "#9AA3AF",
  fontWeight: 600,
  marginBottom: 10,
};

export function SetupScreen({ game }: { game: ChessVsBot }) {
  const [side, setSide] = useState<SideChoice>("w");
  const [level, setLevel] = useState<LevelId>("intermediate");
  const [hints, setHints] = useState(true);

  const canResume = game.history.length > 0 && !game.result;

  function start() {
    const playerColor: Color =
      side === "rnd" ? (Math.random() < 0.5 ? "w" : "b") : side;
    game.newGame({ playerColor, level, showHints: hints });
  }

  const sideDefs: {
    key: SideChoice;
    label: string;
    sub: string;
    glyph?: string;
    glyphColor?: string;
    split?: boolean;
  }[] = [
    { key: "w", label: "Białe", sub: "Ty zaczynasz", glyph: "♚", glyphColor: "#F4F5F0" },
    { key: "b", label: "Czarne", sub: "Bot zaczyna", glyph: "♚", glyphColor: "#5b6470" },
    { key: "rnd", label: "Losowo", sub: "Decyduje los", split: true },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        color: "#E8EAED",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        background: "radial-gradient(120% 80% at 50% 0%, #14181f 0%, #0E1116 60%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          background: "#171A21",
          border: "1px solid #2c3445",
          borderRadius: 16,
          padding: 26,
          boxShadow: "0 30px 70px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em" }}>
              <span style={{ color: ACCENT }}>♞</span> Nowa gra
            </h2>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: "#9AA3AF" }}>
              Ustaw partię i zacznij naukę z botem.
            </p>
          </div>
          {canResume && (
            <button
              onClick={game.resume}
              title="Wróć do gry"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: "1px solid #232833",
                background: "#0E1116",
                color: "#9AA3AF",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* side */}
        <div style={caption}>Grasz jako</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {sideDefs.map((d) => {
            const sel = side === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSide(d.key)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "15px 8px 13px",
                  borderRadius: 12,
                  border: `1px solid ${sel ? ACCENT : "#232833"}`,
                  background: sel ? ACCENT + "14" : "#0E1116",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {d.split ? (
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "conic-gradient(#F4F5F0 0 50%, #5b6470 50% 100%)",
                      border: "1px solid #2c3445",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "#0E1116",
                      border: "1px solid #2c3445",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 30, lineHeight: 1, color: d.glyphColor }}>
                      {d.glyph}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 9, color: "#E8EAED" }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 11, color: "#9AA3AF", marginTop: 2 }}>{d.sub}</div>
              </button>
            );
          })}
        </div>

        {/* level */}
        <div style={caption}>Poziom trudności</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {LEVEL_LIST.map((l, idx) => {
            const sel = level === l.id;
            const filled = idx + 1;
            return (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                style={{
                  textAlign: "left",
                  padding: 13,
                  borderRadius: 11,
                  border: `1px solid ${sel ? ACCENT : "#232833"}`,
                  background: sel ? ACCENT + "14" : "#0E1116",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#E8EAED" }}>
                    {l.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
                    {LEVEL_LIST.map((_, j) => (
                      <div
                        key={j}
                        style={{
                          width: 3,
                          height: 5 + j * 2,
                          borderRadius: 2,
                          background:
                            j < filled ? (sel ? ACCENT : "#7a86a8") : "#2a3140",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    marginTop: 3,
                    color: sel ? ACCENT : "#9AA3AF",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {l.eloLabel}
                </div>
                <div style={{ fontSize: 12, color: "#9AA3AF", lineHeight: 1.4, marginTop: 5 }}>
                  {l.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* hints toggle */}
        <button
          onClick={() => setHints((h) => !h)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            background: "#0E1116",
            border: "1px solid #232833",
            borderRadius: 11,
            padding: "13px 15px",
            marginBottom: 20,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#E8EAED" }}>
              Pokazuj podpowiedzi po ruchu
            </div>
            <div style={{ fontSize: 12, color: "#9AA3AF", marginTop: 2 }}>
              Ocena ruchu i lepsza alternatywa po każdym ruchu.
            </div>
          </div>
          <div
            style={{
              width: 46,
              height: 27,
              borderRadius: 999,
              background: hints ? ACCENT : "#2a3140",
              position: "relative",
              transition: "background .2s",
              flex: "0 0 auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: hints ? 22 : 3,
                width: 21,
                height: 21,
                borderRadius: "50%",
                background: "#fff",
                transition: "left .2s",
                boxShadow: "0 1px 3px rgba(0,0,0,.4)",
              }}
            />
          </div>
        </button>

        <button
          onClick={start}
          disabled={!game.engineReady}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 11,
            border: "none",
            background: "#6C8CFF",
            color: "#0E1116",
            fontSize: 16,
            fontWeight: 700,
            cursor: game.engineReady ? "pointer" : "default",
            fontFamily: "inherit",
            opacity: game.engineReady ? 1 : 0.5,
          }}
        >
          {game.engineReady ? "Zacznij grę" : "Ładowanie silnika…"}
        </button>
      </div>
    </div>
  );
}
