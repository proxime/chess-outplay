import type { Color, EvalScore, MoveQuality, PieceSymbol } from "./game/types";

/** Filled glyphs for both colors (color is applied via CSS), matching the
 *  design's board rendering. */
export const GLYPH: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const FIG_WHITE: Record<string, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
};
const FIG_BLACK: Record<string, string> = {
  K: "♚",
  Q: "♛",
  R: "♜",
  B: "♝",
  N: "♞",
};

/** Convert SAN like "Nf3" into figurine notation "♘f3" for the mover's color. */
export function figurine(san: string, color: Color): string {
  const first = san[0];
  const map = color === "w" ? FIG_WHITE : FIG_BLACK;
  if (map[first]) return map[first] + san.slice(1);
  return san;
}

/** Format an eval (White's POV) like "+1.2", "−0.4" or "#3" / "−#2". */
export function formatEval(score: EvalScore): string {
  if (score.type === "mate") {
    if (score.value === 0) return "#";
    return (score.value > 0 ? "#" : "−#") + Math.abs(score.value);
  }
  const v = score.value / 100;
  if (v > 0) return "+" + v.toFixed(1);
  if (v < 0) return "−" + Math.abs(v).toFixed(1);
  return "+0.0";
}

/** Format centipawn loss as a readable pawn delta, e.g. "−1.2". */
export function formatLoss(cpLoss: number): string {
  if (cpLoss <= 0) return "0.0";
  return "−" + (cpLoss / 100).toFixed(1);
}

/** A short, honest, generic Polish comment for a move quality. */
export function qualityComment(quality: MoveQuality): string {
  switch (quality) {
    case "best":
      return "Najlepszy ruch w tej pozycji.";
    case "good":
      return "Dobry, naturalny ruch — zgodny z planem.";
    case "inaccuracy":
      return "Niewielka strata — była dokładniejsza kontynuacja.";
    case "mistake":
      return "Ten ruch oddaje część przewagi.";
    case "blunder":
      return "Poważny błąd — pozycja znacząco się pogorszyła.";
  }
}
