import type { Level, LevelId } from "../game/types";

/** Four difficulty presets, mapped to Stockfish UCI options.
 *  Engine min Elo is 1320, max 3190 (verified against the lite build). */
export const LEVELS: Record<LevelId, Level> = {
  beginner: {
    id: "beginner",
    label: "Początkujący",
    description: "Łagodny rywal, wybacza błędy.",
    eloLabel: "ok. 1300 ELO",
    elo: 1320,
    go: { movetime: 300 },
  },
  intermediate: {
    id: "intermediate",
    label: "Średniozaawansowany",
    description: "Solidna gra pozycyjna.",
    eloLabel: "ok. 1700 ELO",
    elo: 1700,
    go: { movetime: 500 },
  },
  advanced: {
    id: "advanced",
    label: "Zaawansowany",
    description: "Karze niedokładności.",
    eloLabel: "ok. 2200 ELO",
    elo: 2200,
    go: { movetime: 800 },
  },
  master: {
    id: "master",
    label: "Mistrz",
    description: "Bezlitosna precyzja silnika.",
    eloLabel: "pełna siła",
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
