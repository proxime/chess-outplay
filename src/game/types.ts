import type { Color, PieceSymbol, Square } from "chess.js";

export type { Color, PieceSymbol, Square };

/** A single half-move played, enriched with the FENs around it and its UCI form.
 *  We compute `before`/`after`/`uci` ourselves so we never depend on chess.js
 *  internals, and so analysis can be keyed directly by FEN. */
export interface Ply {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  san: string;
  flags: string;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  before: string; // FEN before the move (mover to move)
  after: string; // FEN after the move (opponent to move)
  uci: string; // e.g. "e2e4" or "e7e8q"
}

/** An evaluation score from the perspective of a given side. */
export type EvalScore =
  | { type: "cp"; value: number } // centipawns
  | { type: "mate"; value: number }; // mate in N (signed)

/** One principal variation returned by the engine (multipv). */
export interface ScoredLine {
  multipv: number; // 1-based rank
  cp?: number; // centipawns, side-to-move POV
  mate?: number; // mate in N, side-to-move POV
  pv: string[]; // UCI moves
}

/** Result of analysing a single position. Scores are from the POV of the
 *  side to move in that position. */
export interface Analysis {
  fen: string;
  depth: number;
  bestMove: string | null; // UCI
  lines: ScoredLine[]; // sorted by multipv ascending
}

export type MoveQuality =
  | "best"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

/** Verdict on a move that was actually played, from the mover's POV. */
export interface MoveAssessment {
  quality: MoveQuality;
  cpLoss: number; // centipawns lost vs. the engine's best move (>= 0)
  playedUci: string;
  bestUci: string | null;
  bestSan: string | null; // best move rendered in SAN
  evalBefore: EvalScore; // best achievable before the move (mover POV)
  evalAfter: EvalScore; // what the move actually achieved (mover POV)
  alternatives: { uci: string; san: string; eval: EvalScore }[];
}

export type LevelId = "beginner" | "intermediate" | "advanced" | "master";

export interface Level {
  id: LevelId;
  label: string;
  description: string;
  /** Short ELO label for the UI, e.g. "ok. 1700 ELO". */
  eloLabel: string;
  /** Target Elo via UCI_Elo, or null for full strength. */
  elo: number | null;
  /** How long/deep the bot thinks for its own move. */
  go: { depth?: number; movetime?: number };
}

export type GameStatus = "setup" | "playing" | "gameover";

export interface GameConfig {
  playerColor: Color;
  level: LevelId;
  showHints: boolean;
}

export interface GameState {
  startFen: string;
  history: Ply[];
  cursor: number; // number of plies applied (0..history.length)
  playerColor: Color;
  level: LevelId;
  showHints: boolean;
  status: GameStatus;
}

export type GameResultKind =
  | "checkmate"
  | "stalemate"
  | "draw"
  | "insufficient"
  | "threefold";

export interface GameResult {
  kind: GameResultKind;
  /** Winner color for checkmate, otherwise null (draw-like). */
  winner: Color | null;
}
