import { describe, it, expect } from "vitest";
import { Chess } from "chess.js";
import {
  STARTING_FEN,
  positionAt,
  tryMove,
  uciToSan,
  getResult,
  getMaterial,
} from "./chess";
import type { Ply } from "./types";

describe("positionAt", () => {
  it("returns the start position for an empty history", () => {
    expect(positionAt(STARTING_FEN, [], 0).fen()).toBe(STARTING_FEN);
  });

  it("replays only up to the cursor", () => {
    const e4 = tryMove(new Chess(STARTING_FEN), "e2", "e4")!;
    const after = tryMove(new Chess(e4.after), "e7", "e5")!;
    const history: Ply[] = [e4, after];
    expect(positionAt(STARTING_FEN, history, 1).fen()).toBe(e4.after);
    expect(positionAt(STARTING_FEN, history, 2).fen()).toBe(after.after);
  });
});

describe("tryMove", () => {
  it("accepts a legal move and enriches it", () => {
    const ply = tryMove(new Chess(STARTING_FEN), "e2", "e4");
    expect(ply).not.toBeNull();
    expect(ply!.san).toBe("e4");
    expect(ply!.uci).toBe("e2e4");
    expect(ply!.before).toBe(STARTING_FEN);
    expect(ply!.after.split(" ")[1]).toBe("b"); // black to move next
  });

  it("rejects an illegal move without throwing", () => {
    expect(tryMove(new Chess(STARTING_FEN), "e2", "e5")).toBeNull();
  });

  it("does not mutate the input position", () => {
    const chess = new Chess(STARTING_FEN);
    tryMove(chess, "e2", "e4");
    expect(chess.fen()).toBe(STARTING_FEN);
  });
});

describe("uciToSan", () => {
  it("renders SAN in context", () => {
    expect(uciToSan(STARTING_FEN, "e2e4")).toBe("e4");
    expect(uciToSan(STARTING_FEN, "g1f3")).toBe("Nf3");
  });
  it("falls back to raw uci on garbage", () => {
    expect(uciToSan(STARTING_FEN, "zz")).toBe("zz");
  });
});

describe("getResult", () => {
  it("detects checkmate and the winner (fool's mate)", () => {
    const c = new Chess();
    c.move("f3");
    c.move("e5");
    c.move("g4");
    c.move("Qh4");
    const result = getResult(c);
    expect(result?.kind).toBe("checkmate");
    expect(result?.winner).toBe("b");
  });
  it("returns null for an ongoing game", () => {
    expect(getResult(new Chess())).toBeNull();
  });
});

describe("getMaterial", () => {
  it("tracks captures and the material diff", () => {
    const c = new Chess();
    c.move("e4");
    c.move("d5");
    c.move("exd5"); // white captures a black pawn
    const m = getMaterial(c);
    expect(m.capturedByWhite).toContain("p");
    expect(m.capturedByBlack).toEqual([]);
    expect(m.diff).toBe(1);
  });
});
