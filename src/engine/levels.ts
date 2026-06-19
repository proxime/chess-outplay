import type { Level, LevelId } from "../game/types";

/** Four difficulty presets, mapped to Stockfish UCI options.
 *  Engine min Elo is 1320, max 3190 (verified against the lite build). */
export const LEVELS: Record<LevelId, Level> = {
  beginner: {
    id: "beginner",
    label: "Początkujący",
    description: "Łagodny rywal, wybacza błędy.",
    eloLabel: "ok. 1320 ELO",
    elo: 1320,
    go: { movetime: 300 },
  },
  intermediate: {
    id: "intermediate",
    label: "Średniozaawansowany",
    description: "Solidne podstawy gry.",
    eloLabel: "ok. 1600 ELO",
    elo: 1600,
    go: { movetime: 400 },
  },
  advanced: {
    id: "advanced",
    label: "Zaawansowany",
    description: "Pewna gra pozycyjna.",
    eloLabel: "ok. 1900 ELO",
    elo: 1900,
    go: { movetime: 500 },
  },
  expert: {
    id: "expert",
    label: "Ekspert",
    description: "Karze niedokładności.",
    eloLabel: "ok. 2200 ELO",
    elo: 2200,
    go: { movetime: 650 },
  },
  master: {
    id: "master",
    label: "Mistrz",
    description: "Bardzo mocny rywal.",
    eloLabel: "ok. 2600 ELO",
    elo: 2600,
    go: { movetime: 850 },
  },
  grandmaster: {
    id: "grandmaster",
    label: "Arcymistrz",
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
  LEVELS.expert,
  LEVELS.master,
  LEVELS.grandmaster,
];
