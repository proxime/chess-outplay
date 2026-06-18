import { describe, it, expect } from "vitest";
import { gameReducer, initialState } from "./gameReducer";
import type { Ply } from "./types";

function ply(san: string): Ply {
  return {
    color: "w",
    from: "e2",
    to: "e4",
    piece: "p",
    san,
    flags: "b",
    before: "before",
    after: "after",
    uci: "e2e4",
  };
}

describe("gameReducer", () => {
  it("NEW_GAME starts a clean playing state with the chosen config", () => {
    const s = gameReducer(initialState, {
      type: "NEW_GAME",
      config: { playerColor: "b", level: "advanced", showHints: false },
    });
    expect(s.status).toBe("playing");
    expect(s.playerColor).toBe("b");
    expect(s.level).toBe("advanced");
    expect(s.showHints).toBe(false);
    expect(s.history).toEqual([]);
    expect(s.cursor).toBe(0);
  });

  it("APPLY_MOVE appends and advances the cursor", () => {
    let s = gameReducer(initialState, { type: "APPLY_MOVE", ply: ply("a") });
    s = gameReducer(s, { type: "APPLY_MOVE", ply: ply("b") });
    expect(s.history.map((p) => p.san)).toEqual(["a", "b"]);
    expect(s.cursor).toBe(2);
  });

  it("APPLY_MOVE while reviewing the past truncates the future line", () => {
    let s = gameReducer(initialState, { type: "APPLY_MOVE", ply: ply("a") });
    s = gameReducer(s, { type: "APPLY_MOVE", ply: ply("b") });
    s = gameReducer(s, { type: "SET_CURSOR", cursor: 1 }); // step back
    s = gameReducer(s, { type: "APPLY_MOVE", ply: ply("c") });
    expect(s.history.map((p) => p.san)).toEqual(["a", "c"]); // "b" discarded
    expect(s.cursor).toBe(2);
  });

  it("SET_CURSOR clamps to [0, history.length]", () => {
    let s = gameReducer(initialState, { type: "APPLY_MOVE", ply: ply("a") });
    expect(gameReducer(s, { type: "SET_CURSOR", cursor: -5 }).cursor).toBe(0);
    expect(gameReducer(s, { type: "SET_CURSOR", cursor: 99 }).cursor).toBe(1);
  });

  it("SET_HINTS and SET_STATUS update flags", () => {
    let s = gameReducer(initialState, { type: "SET_HINTS", value: false });
    expect(s.showHints).toBe(false);
    s = gameReducer(s, { type: "SET_STATUS", status: "gameover" });
    expect(s.status).toBe("gameover");
  });
});
