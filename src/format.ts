import type { EvalScore, PieceSymbol } from "./game/types";

export const GLYPH: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

/** Format an eval (White's POV) like "+1.2", "-0.4" or "#3" / "-#2". */
export function formatEval(score: EvalScore): string {
  if (score.type === "mate") {
    if (score.value === 0) return "#";
    return (score.value > 0 ? "#" : "-#") + Math.abs(score.value);
  }
  const v = score.value / 100;
  return (v > 0 ? "+" : "") + v.toFixed(1);
}

/** Format centipawn loss as a readable pawn delta, e.g. "-1.2". */
export function formatLoss(cpLoss: number): string {
  if (cpLoss <= 0) return "0.0";
  return "-" + (cpLoss / 100).toFixed(1);
}
