import type { Level, LevelId } from "../game/types";

/** Four difficulty presets, mapped to Stockfish UCI options.
 *  Engine min Elo is 1320, max 3190 (verified against the lite build). */
export const LEVELS: Record<LevelId, Level> = {
  beginner: {
    id: "beginner",
    label: "Początkujący",
    description: "Gra spokojnie i wybacza błędy. Dobry na start (~1320 Elo).",
    elo: 1320,
    go: { movetime: 300 },
  },
  intermediate: {
    id: "intermediate",
    label: "Średniozaawansowany",
    description: "Solidny klubowy przeciwnik (~1700 Elo).",
    elo: 1700,
    go: { movetime: 500 },
  },
  advanced: {
    id: "advanced",
    label: "Zaawansowany",
    description: "Mocny gracz, karze nieścisłości (~2200 Elo).",
    elo: 2200,
    go: { movetime: 800 },
  },
  master: {
    id: "master",
    label: "Mistrz",
    description: "Pełna siła silnika. Bezlitosny.",
    elo: null,
    go: { depth: 16 },
  },
};

export const LEVEL_LIST: Level[] = [
  LEVELS.beginner,
  LEVELS.intermediate,
  LEVELS.advanced,
  LEVELS.master,
];
