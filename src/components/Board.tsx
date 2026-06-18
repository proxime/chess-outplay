import { useEffect, useMemo, useState } from "react";
import type { Color, PieceSymbol, Square } from "../game/types";
import type { ChessVsBot } from "../game/useChessVsBot";

const GLYPH: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Cell {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  isLight: boolean;
}

function Piece({ type, color }: { type: PieceSymbol; color: Color }) {
  const style =
    color === "w"
      ? {
          color: "#f7f7f7",
          WebkitTextStroke: "1.4px #43484f",
          textShadow: "0 2px 3px rgba(0,0,0,.45)",
        }
      : {
          color: "#2a2d33",
          textShadow: "0 1px 2px rgba(0,0,0,.35)",
        };
  return (
    <span
      className="pointer-events-none select-none leading-none"
      style={{ fontSize: "min(7.5vw, 3.2rem)", ...style }}
    >
      {GLYPH[type]}
    </span>
  );
}

export function Board({ game }: { game: ChessVsBot }) {
  const orientation = game.playerColor;
  const [selected, setSelected] = useState<Square | null>(null);

  // Clear selection whenever the position changes.
  useEffect(() => setSelected(null), [game.fen]);

  const board = game.chess.board();

  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const rank = orientation === "w" ? 8 - r : r + 1;
        const fileIdx = orientation === "w" ? f : 7 - f;
        const square = (FILES[fileIdx] + rank) as Square;
        const raw = board[8 - rank][fileIdx];
        out.push({
          square,
          piece: raw ? { type: raw.type, color: raw.color } : null,
          isLight: (fileIdx + rank) % 2 === 0,
        });
      }
    }
    return out;
  }, [board, orientation]);

  const targets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(
      game.legalMoves.filter((m) => m.from === selected).map((m) => m.to),
    );
  }, [selected, game.legalMoves]);

  const canPlayerPick = (color: Color) =>
    color === game.playerColor && game.turn === game.playerColor;

  function attemptMove(from: Square, to: Square) {
    const needsPromotion = game.legalMoves.some(
      (m) => m.from === from && m.to === to && m.promotion,
    );
    // Auto-queen for now; a promotion picker arrives with the final design.
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
    game.inCheck && game.chess.turn() === game.turn
      ? findKing(cells, game.turn)
      : null;

  return (
    <div className="aspect-square w-full overflow-hidden rounded-xl border border-border shadow-2xl">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {cells.map((cell, i) => {
          const isTarget = targets.has(cell.square);
          const isSelected = selected === cell.square;
          const isLast = cell.square === lastFrom || cell.square === lastTo;
          const isCheck = cell.square === checkSquare;
          const showFile = i >= 56; // bottom row
          const showRank = i % 8 === 0; // left column
          return (
            <div
              key={cell.square}
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
              className={[
                "relative flex items-center justify-center",
                cell.isLight ? "bg-board-light" : "bg-board-dark",
                "cursor-pointer",
              ].join(" ")}
            >
              {isLast && (
                <div className="absolute inset-0 bg-yellow-300/35" />
              )}
              {isCheck && (
                <div className="absolute inset-0 bg-quality-blunder/55" />
              )}
              {isSelected && (
                <div className="absolute inset-0 ring-4 ring-inset ring-brand/70" />
              )}
              {showFile && (
                <span className="absolute bottom-0.5 right-1 text-[0.6rem] font-semibold text-black/40">
                  {cell.square[0]}
                </span>
              )}
              {showRank && (
                <span className="absolute left-1 top-0.5 text-[0.6rem] font-semibold text-black/40">
                  {cell.square[1]}
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
                  className="z-10 flex items-center justify-center"
                >
                  <Piece type={cell.piece.type} color={cell.piece.color} />
                </span>
              )}
              {isTarget && !cell.piece && (
                <div className="absolute h-[28%] w-[28%] rounded-full bg-black/25" />
              )}
              {isTarget && cell.piece && (
                <div className="absolute inset-0 ring-4 ring-inset ring-black/25" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function findKing(cells: Cell[], color: Color): Square | null {
  const k = cells.find((c) => c.piece?.type === "k" && c.piece.color === color);
  return k ? k.square : null;
}
