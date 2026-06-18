import type { GameConfig, GameState, LevelId, Ply } from "./types";
import { STARTING_FEN } from "./chess";

export const initialState: GameState = {
  startFen: STARTING_FEN,
  history: [],
  cursor: 0,
  playerColor: "w",
  level: "intermediate",
  showHints: true,
  status: "setup",
};

export type GameAction =
  | { type: "NEW_GAME"; config: GameConfig }
  | { type: "APPLY_MOVE"; ply: Ply }
  | { type: "SET_CURSOR"; cursor: number }
  | { type: "SET_STATUS"; status: GameState["status"] }
  | { type: "SET_HINTS"; value: boolean }
  | { type: "SET_LEVEL"; level: LevelId }
  | { type: "RESET" };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return {
        startFen: STARTING_FEN,
        history: [],
        cursor: 0,
        playerColor: action.config.playerColor,
        level: action.config.level,
        showHints: action.config.showHints,
        status: "playing",
      };

    case "APPLY_MOVE": {
      // Playing a move while reviewing the past discards the future line.
      const history = state.history.slice(0, state.cursor);
      history.push(action.ply);
      return { ...state, history, cursor: history.length };
    }

    case "SET_CURSOR":
      return {
        ...state,
        cursor: clamp(action.cursor, 0, state.history.length),
      };

    case "SET_STATUS":
      return { ...state, status: action.status };

    case "SET_HINTS":
      return { ...state, showHints: action.value };

    case "SET_LEVEL":
      return { ...state, level: action.level };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
