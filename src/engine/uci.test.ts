import { describe, it, expect } from "vitest";
import { parseInfo, parseBestMove, isBestMoveLine, splitLines } from "./uci";

describe("parseInfo", () => {
  it("parses a centipawn info line with pv", () => {
    const line =
      "info depth 10 seldepth 11 multipv 1 score cp 32 nodes 6168 nps 324631 time 19 pv e2e4 e7e6 d2d4";
    expect(parseInfo(line)).toEqual({
      depth: 10,
      multipv: 1,
      cp: 32,
      mate: undefined,
      pv: ["e2e4", "e7e6", "d2d4"],
    });
  });

  it("parses a mate score and multipv index", () => {
    const line = "info depth 20 multipv 2 score mate 3 pv h5f7 e8f7";
    const info = parseInfo(line);
    expect(info?.mate).toBe(3);
    expect(info?.multipv).toBe(2);
    expect(info?.cp).toBeUndefined();
    expect(info?.pv).toEqual(["h5f7", "e8f7"]);
  });

  it("parses negative mate", () => {
    expect(parseInfo("info depth 5 score mate -2 pv a b")?.mate).toBe(-2);
  });

  it("ignores lines without a score", () => {
    expect(parseInfo("info string NNUE evaluation using nn-xyz.nnue")).toBeNull();
    expect(parseInfo("info depth 1 currmove e2e4 currmovenumber 1")).toBeNull();
  });

  it("ignores non-info lines", () => {
    expect(parseInfo("bestmove e2e4 ponder e7e6")).toBeNull();
  });
});

describe("parseBestMove / isBestMoveLine", () => {
  it("extracts the best move", () => {
    expect(parseBestMove("bestmove e2e4 ponder e7e6")).toBe("e2e4");
    expect(parseBestMove("bestmove e7e8q")).toBe("e7e8q");
  });

  it("returns null for (none)", () => {
    expect(parseBestMove("bestmove (none)")).toBeNull();
  });

  it("detects bestmove lines", () => {
    expect(isBestMoveLine("bestmove e2e4")).toBe(true);
    expect(isBestMoveLine("info depth 1 score cp 0")).toBe(false);
  });
});

describe("splitLines", () => {
  it("splits and trims, dropping blanks", () => {
    expect(splitLines("uciok\n\nreadyok\n")).toEqual(["uciok", "readyok"]);
  });
});
