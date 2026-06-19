import type {
  Analysis,
  EvalScore,
  MoveAssessment,
  MoveQuality,
  ScoredLine,
} from "../game/types";

/** Large sentinel so mate scores compare sensibly against centipawns. */
export const MATE_VALUE = 100_000;

/** Collapse a score into a single comparable number (centipawn-ish).
 *  Mate-in-N maps near ±MATE_VALUE, sooner mates ranking higher. */
export function evalToNumber(score: EvalScore): number {
  if (score.type === "mate") {
    return score.value > 0
      ? MATE_VALUE - score.value
      : -MATE_VALUE - score.value;
  }
  return score.value;
}

export function lineToEval(line: ScoredLine): EvalScore {
  if (line.mate !== undefined) return { type: "mate", value: line.mate };
  return { type: "cp", value: line.cp ?? 0 };
}

export function negateEval(score: EvalScore): EvalScore {
  return score.type === "mate"
    ? { type: "mate", value: -score.value }
    : { type: "cp", value: -score.value };
}

/** Win probability (0..1) for the given centipawn eval, from the POV of the
 *  side the eval refers to. Used to render the eval bar smoothly. */
export function winProbability(cp: number): number {
  return 1 / (1 + Math.pow(10, -cp / 400));
}

/** Centipawn-loss thresholds for move classification (tunable). */
export const QUALITY_THRESHOLDS = {
  best: 10,
  good: 50,
  inaccuracy: 120,
  mistake: 250,
} as const;

export function classify(
  cpLoss: number,
  playedUci: string,
  bestUci: string | null,
): MoveQuality {
  if (bestUci && playedUci === bestUci) return "best";
  if (cpLoss <= QUALITY_THRESHOLDS.best) return "best";
  if (cpLoss <= QUALITY_THRESHOLDS.good) return "good";
  if (cpLoss <= QUALITY_THRESHOLDS.inaccuracy) return "inaccuracy";
  if (cpLoss <= QUALITY_THRESHOLDS.mistake) return "mistake";
  return "blunder";
}

export interface AssessParams {
  /** Analysis of the position BEFORE the move (mover is to move). */
  parent: Analysis;
  /** Analysis of the position AFTER the move (opponent is to move). */
  child: Analysis;
  playedUci: string;
  /** Optional resolver from UCI -> SAN, given the FEN the move is played in. */
  toSan?: (fen: string, uci: string) => string;
}

/** Grade a played move by comparing the best line before it to what the
 *  position became after it — all normalised to the mover's POV. */
export function assessMove(params: AssessParams): MoveAssessment {
  const { parent, child, playedUci, toSan } = params;

  const evalBefore: EvalScore = parent.lines[0]
    ? lineToEval(parent.lines[0])
    : { type: "cp", value: 0 };

  // child scores are from the opponent's POV; negate to the mover's POV.
  const evalAfter: EvalScore = child.lines[0]
    ? negateEval(lineToEval(child.lines[0]))
    : { type: "cp", value: 0 };

  const cpLoss = Math.max(
    0,
    evalToNumber(evalBefore) - evalToNumber(evalAfter),
  );

  const bestUci = parent.bestMove;
  const quality = classify(cpLoss, playedUci, bestUci);

  const bestSan =
    bestUci && toSan ? toSan(parent.fen, bestUci) : null;

  const alternatives = parent.lines
    .filter((l) => l.pv.length > 0)
    .slice(0, 3)
    .map((l) => {
      const uci = l.pv[0];
      return {
        uci,
        san: toSan ? toSan(parent.fen, uci) : uci,
        eval: lineToEval(l),
      };
    });

  return {
    quality,
    cpLoss,
    playedUci,
    bestUci,
    bestSan,
    evalBefore,
    evalAfter,
    alternatives,
  };
}

/** Human-facing Polish labels and token colors for each quality. */
export const QUALITY_META: Record<
  MoveQuality,
  { label: string; symbol: string; color: string; pill: string }
> = {
  best: { label: "Najlepszy ruch", symbol: "★", color: "#21C7A8", pill: "Brawo!" },
  good: { label: "Dobry ruch", symbol: "✓", color: "#5DBB63", pill: "Dobrze" },
  inaccuracy: {
    label: "Niedokładność",
    symbol: "?!",
    color: "#E0A800",
    pill: "Łagodna sugestia",
  },
  mistake: { label: "Błąd", symbol: "?", color: "#F08C2E", pill: "Do poprawy" },
  blunder: { label: "Gafa", symbol: "??", color: "#E5484D", pill: "Uwaga!" },
};
