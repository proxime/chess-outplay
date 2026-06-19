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

// English -> Polish piece letters: kNight→Skoczek, Bishop→Goniec,
// Rook→Wieża, Queen→Hetman, King→Król.
const PL_PIECE: Record<string, string> = {
  N: "S",
  B: "G",
  R: "W",
  Q: "H",
  K: "K",
};

/** Convert SAN like "Nf3" / "exd8=Q" into Polish notation "Sf3" / "exd8=H". */
export function polishSan(san: string): string {
  let s = san;
  if (PL_PIECE[s[0]]) s = PL_PIECE[s[0]] + s.slice(1);
  return s.replace(/=([NBRQ])/, (_, p: string) => "=" + PL_PIECE[p]);
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

/** A short, honest comment for the engine's best move, fitting the format
 *  "SAN (eval) — <comment>". */
export function qualityComment(quality: MoveQuality): string {
  switch (quality) {
    case "best":
      return "Idealnie — najmocniejsza kontynuacja w tej pozycji.";
    case "good":
      return "Solidny wybór, blisko najlepszego ruchu.";
    case "inaccuracy":
      return "Dokładniejsza kontynuacja, utrzymuje inicjatywę.";
    case "mistake":
      return "Zachowuje przewagę — Twój ruch częściowo ją oddał.";
    case "blunder":
      return "Należało to zagrać, aby uniknąć poważnej straty.";
  }
}
