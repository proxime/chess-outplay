import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { GLYPH } from "../format";
import type { Color, PieceSymbol, Square } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ACCENT = "#6C8CFF";
const LIGHT = "#EBECD0";
const DARK = "#739552";

interface Cell {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  isLight: boolean;
  fileLabel: string;
  rankLabel: string;
}

const whitePieceStyle: CSSProperties = {
  color: "#FCFCFD",
  WebkitTextStroke: "1.2px #3c424c",
  textShadow: "0 2px 3px rgba(0,0,0,.45)",
};
const blackPieceStyle: CSSProperties = {
  color: "#23262C",
  WebkitTextStroke: "1px #0c0e12",
  textShadow: "0 1px 2px rgba(255,255,255,.12)",
};

export function Board({
  game,
  orientation,
}: {
  game: ChessVsBot;
  orientation: Color;
}) {
  const [selected, setSelected] = useState<Square | null>(null);
  useEffect(() => setSelected(null), [game.fen]);

  const board = game.chess.board();

  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    for (let dr = 0; dr < 8; dr++) {
      for (let dc = 0; dc < 8; dc++) {
        const rank = orientation === "w" ? 8 - dr : dr + 1;
        const fileIdx = orientation === "w" ? dc : 7 - dc;
        const square = (FILES[fileIdx] + rank) as Square;
        const raw = board[8 - rank][fileIdx];
        out.push({
          square,
          piece: raw ? { type: raw.type, color: raw.color } : null,
          isLight: (fileIdx + rank) % 2 === 0,
          fileLabel: dr === 7 ? FILES[fileIdx] : "",
          rankLabel: dc === 0 ? String(rank) : "",
        });
      }
    }
    return out;
  }, [board, orientation]);

  const targets = useMemo(() => {
    if (!selected) return new Map<string, boolean>(); // square -> isCapture
    const m = new Map<string, boolean>();
    for (const mv of game.legalMoves) {
      if (mv.from === selected) m.set(mv.to, !!mv.captured || mv.flags.includes("e"));
    }
    return m;
  }, [selected, game.legalMoves]);

  const canPlayerPick = (color: Color) =>
    color === game.playerColor && game.turn === game.playerColor;

  function attemptMove(from: Square, to: Square) {
    const needsPromotion = game.legalMoves.some(
      (m) => m.from === from && m.to === to && m.promotion,
    );
    game.makeUserMove(from, to, needsPromotion ? "q" : undefined);
  }

  function handleClick(cell: Cell) {
    if (selected && targets.has(cell.square)) {
      attemptMove(selected, cell.square);
      setSelected(null);
      return;
    }
    if (cell.piece && canPlayerPick(cell.piece.color)) {
      setSelected(cell.square);
      return;
    }
    setSelected(null);
  }

  const lastFrom = game.lastMove?.from;
  const lastTo = game.lastMove?.to;
  const checkSquare =
    game.inCheck ? findKing(cells, game.turn) : null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8,1fr)",
        gridTemplateRows: "repeat(8,1fr)",
        aspectRatio: "1 / 1",
        width: "100%",
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 16px 50px rgba(0,0,0,.5)",
      }}
    >
      {cells.map((cell) => {
        const target = targets.get(cell.square);
        const isTarget = target !== undefined;
        const labelColor = cell.isLight ? DARK : LIGHT;
        return (
          <div
            key={cell.square}
            data-square={cell.square}
            onClick={() => handleClick(cell)}
            onDragOver={(e) => {
              if (selected) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (selected) {
                attemptMove(selected, cell.square);
                setSelected(null);
              }
            }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: cell.isLight ? LIGHT : DARK,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {(cell.square === lastFrom || cell.square === lastTo) && (
              <div style={{ position: "absolute", inset: 0, background: "#F6F36955", zIndex: 1 }} />
            )}
            {cell.square === checkSquare && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle, rgba(229,72,77,.85) 0%, rgba(229,72,77,0) 72%)",
                  zIndex: 1,
                }}
              />
            )}
            {selected === cell.square && (
              <div style={{ position: "absolute", inset: 0, background: ACCENT + "55", zIndex: 1 }} />
            )}
            {cell.rankLabel && (
              <span
                style={{
                  position: "absolute",
                  left: 5,
                  top: 3,
                  fontSize: 11,
                  fontWeight: 700,
                  color: labelColor,
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                {cell.rankLabel}
              </span>
            )}
            {cell.fileLabel && (
              <span
                style={{
                  position: "absolute",
                  right: 5,
                  bottom: 3,
                  fontSize: 11,
                  fontWeight: 700,
                  color: labelColor,
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              >
                {cell.fileLabel}
              </span>
            )}
            {cell.piece && (
              <span
                draggable={canPlayerPick(cell.piece.color)}
                onDragStart={(e) => {
                  if (cell.piece && canPlayerPick(cell.piece.color)) {
                    setSelected(cell.square);
                  } else {
                    e.preventDefault();
                  }
                }}
                style={{
                  position: "relative",
                  zIndex: 2,
                  lineHeight: 1,
                  fontSize: "min(3rem, 8.2vw)",
                  ...(cell.piece.color === "w" ? whitePieceStyle : blackPieceStyle),
                }}
              >
                {GLYPH[cell.piece.type]}
              </span>
            )}
            {isTarget && !target && (
              <div
                style={{
                  width: "30%",
                  height: "30%",
                  borderRadius: "50%",
                  background: "rgba(20,22,26,.30)",
                  position: "relative",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            )}
            {isTarget && target && (
              <div
                style={{
                  position: "absolute",
                  inset: 4,
                  border: `5px solid ${ACCENT}cc`,
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function findKing(cells: Cell[], color: Color): Square | null {
  const k = cells.find((c) => c.piece?.type === "k" && c.piece.color === color);
  return k ? k.square : null;
}
