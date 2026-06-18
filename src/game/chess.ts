import { Chess } from "chess.js";
import type { Color, GameResult, PieceSymbol, Ply, Square } from "./types";

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Rebuild the position after applying the first `cursor` plies of history. */
export function positionAt(
  startFen: string,
  history: Ply[],
  cursor: number,
): Chess {
  const chess = new Chess(startFen);
  const n = Math.min(cursor, history.length);
  for (let i = 0; i < n; i++) {
    const ply = history[i];
    chess.move({ from: ply.from, to: ply.to, promotion: ply.promotion });
  }
  return chess;
}

/** Try to play a move on a copy of `chess`; return the enriched Ply or null
 *  if the move is illegal. Does not mutate the input. */
export function tryMove(
  chess: Chess,
  from: Square,
  to: Square,
  promotion?: PieceSymbol,
): Ply | null {
  const work = new Chess(chess.fen());
  const before = work.fen();
  let result;
  try {
    result = work.move({ from, to, promotion });
  } catch {
    return null; // chess.js throws on illegal moves
  }
  if (!result) return null;
  return {
    color: result.color,
    from: result.from,
    to: result.to,
    piece: result.piece,
    san: result.san,
    flags: result.flags,
    captured: result.captured,
    promotion: result.promotion,
    before,
    after: work.fen(),
    uci: from + to + (promotion ?? ""),
  };
}

/** Render a UCI move as SAN, in the context of `fen`. Falls back to the raw
 *  UCI string if the move can't be parsed. */
export function uciToSan(fen: string, uci: string): string {
  if (!uci || uci.length < 4) return uci;
  const chess = new Chess(fen);
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = (uci.slice(4, 5) || undefined) as PieceSymbol | undefined;
  try {
    const move = chess.move({ from, to, promotion });
    return move ? move.san : uci;
  } catch {
    return uci;
  }
}

export function getResult(chess: Chess): GameResult | null {
  if (chess.isCheckmate()) {
    // The side to move is checkmated, so the other side won.
    const winner: Color = chess.turn() === "w" ? "b" : "w";
    return { kind: "checkmate", winner };
  }
  if (chess.isStalemate()) return { kind: "stalemate", winner: null };
  if (chess.isInsufficientMaterial())
    return { kind: "insufficient", winner: null };
  if (chess.isThreefoldRepetition())
    return { kind: "threefold", winner: null };
  if (chess.isDraw()) return { kind: "draw", winner: null };
  return null;
}

const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const FULL_SET: Record<PieceSymbol, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

export interface MaterialInfo {
  /** Black pieces that White has captured. */
  capturedByWhite: PieceSymbol[];
  /** White pieces that Black has captured. */
  capturedByBlack: PieceSymbol[];
  /** Positive => White is ahead in material. */
  diff: number;
}

/** Captured pieces and material difference, derived from the board. */
export function getMaterial(chess: Chess): MaterialInfo {
  const onBoard: Record<Color, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  for (const row of chess.board()) {
    for (const sq of row) {
      if (sq) onBoard[sq.color][sq.type] += 1;
    }
  }

  const pieces: PieceSymbol[] = ["q", "r", "b", "n", "p"];
  const capturedByWhite: PieceSymbol[] = [];
  const capturedByBlack: PieceSymbol[] = [];
  let whiteValue = 0;
  let blackValue = 0;

  for (const piece of pieces) {
    const missingBlack = FULL_SET[piece] - onBoard.b[piece];
    const missingWhite = FULL_SET[piece] - onBoard.w[piece];
    for (let i = 0; i < missingBlack; i++) capturedByWhite.push(piece);
    for (let i = 0; i < missingWhite; i++) capturedByBlack.push(piece);
    whiteValue += onBoard.w[piece] * PIECE_VALUE[piece];
    blackValue += onBoard.b[piece] * PIECE_VALUE[piece];
  }

  return { capturedByWhite, capturedByBlack, diff: whiteValue - blackValue };
}
