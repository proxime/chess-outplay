import { describe, it, expect } from "vitest";
import {
  assessMove,
  classify,
  evalToNumber,
  lineToEval,
  negateEval,
  winProbability,
  MATE_VALUE,
} from "./evaluate";
import type { Analysis } from "../game/types";

describe("evalToNumber", () => {
  it("passes through centipawns", () => {
    expect(evalToNumber({ type: "cp", value: 30 })).toBe(30);
  });
  it("maps mates near the sentinel, sooner mates higher", () => {
    expect(evalToNumber({ type: "mate", value: 1 })).toBe(MATE_VALUE - 1);
    expect(evalToNumber({ type: "mate", value: 3 })).toBe(MATE_VALUE - 3);
    expect(evalToNumber({ type: "mate", value: 1 })).toBeGreaterThan(
      evalToNumber({ type: "mate", value: 3 }),
    );
    expect(evalToNumber({ type: "mate", value: -2 })).toBe(-(MATE_VALUE - 2));
  });
});

describe("negateEval / lineToEval", () => {
  it("negates both kinds", () => {
    expect(negateEval({ type: "cp", value: 30 })).toEqual({
      type: "cp",
      value: -30,
    });
    expect(negateEval({ type: "mate", value: 3 })).toEqual({
      type: "mate",
      value: -3,
    });
  });
  it("prefers mate over cp when present", () => {
    expect(lineToEval({ multipv: 1, cp: 10, mate: 2, pv: [] })).toEqual({
      type: "mate",
      value: 2,
    });
  });
});

describe("winProbability", () => {
  it("is 0.5 at equality and monotonic", () => {
    expect(winProbability(0)).toBeCloseTo(0.5, 5);
    expect(winProbability(400)).toBeGreaterThan(0.7);
    expect(winProbability(-400)).toBeLessThan(0.3);
  });
});

describe("classify", () => {
  it("calls the engine's move best", () => {
    expect(classify(0, "e2e4", "e2e4")).toBe("best");
    expect(classify(200, "e2e4", "e2e4")).toBe("best"); // played == best wins
  });
  it("buckets by centipawn loss", () => {
    expect(classify(5, "a", "b")).toBe("best");
    expect(classify(40, "a", "b")).toBe("good");
    expect(classify(100, "a", "b")).toBe("inaccuracy");
    expect(classify(200, "a", "b")).toBe("mistake");
    expect(classify(400, "a", "b")).toBe("blunder");
  });
});

function analysis(fen: string, bestMove: string | null, lines: Analysis["lines"]): Analysis {
  return { fen, depth: 15, bestMove, lines };
}

describe("assessMove", () => {
  it("grades the best move as best with ~0 loss", () => {
    const parent = analysis("FEN_BEFORE", "e2e4", [
      { multipv: 1, cp: 30, pv: ["e2e4", "e7e5"] },
    ]);
    const child = analysis("FEN_AFTER", "e7e5", [
      { multipv: 1, cp: -28, pv: ["e7e5"] }, // opponent POV
    ]);
    const a = assessMove({ parent, child, playedUci: "e2e4" });
    expect(a.quality).toBe("best");
    expect(a.cpLoss).toBeLessThanOrEqual(10);
    expect(a.evalAfter).toEqual({ type: "cp", value: 28 }); // negated to mover POV
  });

  it("grades a large drop as a blunder", () => {
    const parent = analysis("FEN_BEFORE", "d2d4", [
      { multipv: 1, cp: 50, pv: ["d2d4"] },
    ]);
    const child = analysis("FEN_AFTER", "x", [
      { multipv: 1, cp: 300, pv: ["x"] }, // opponent is now +300
    ]);
    const a = assessMove({ parent, child, playedUci: "b1a3" });
    expect(a.cpLoss).toBe(350);
    expect(a.quality).toBe("blunder");
    expect(a.bestUci).toBe("d2d4");
  });

  it("collects up to three alternatives and resolves SAN", () => {
    const parent = analysis("FEN_BEFORE", "e2e4", [
      { multipv: 1, cp: 30, pv: ["e2e4"] },
      { multipv: 2, cp: 20, pv: ["d2d4"] },
      { multipv: 3, cp: 10, pv: ["g1f3"] },
    ]);
    const child = analysis("FEN_AFTER", "x", [{ multipv: 1, cp: -25, pv: [] }]);
    const a = assessMove({
      parent,
      child,
      playedUci: "e2e4",
      toSan: (_fen, uci) => uci.toUpperCase(),
    });
    expect(a.alternatives).toHaveLength(3);
    expect(a.alternatives[0].san).toBe("E2E4");
    expect(a.bestSan).toBe("E2E4");
  });
});
