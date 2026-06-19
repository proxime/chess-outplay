import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { StockfishEngine } from "../engine/engine";
import { LEVELS } from "../engine/levels";
import {
  assessMove,
  evalToNumber,
  lineToEval,
  moveAccuracy,
  negateEval,
  winProbability,
} from "../engine/evaluate";
import {
  getMaterial,
  getResult,
  positionAt,
  tryMove,
  uciToSan,
} from "./chess";
import { gameReducer, initialState } from "./gameReducer";
import type {
  Analysis,
  EvalScore,
  GameConfig,
  LevelId,
  MoveAssessment,
  MoveQuality,
  PieceSymbol,
  Ply,
  Square,
} from "./types";

export interface PlayerStats {
  accuracy: number | null;
  assessed: number;
  counts: Record<MoveQuality, number>;
}

const ANALYSIS_DEPTH = 14;
const ANALYSIS_MULTIPV = 3;

const sideAt = (cursor: number): "w" | "b" => (cursor % 2 === 0 ? "w" : "b");

export function useChessVsBot() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Always-fresh snapshot for use inside async callbacks / stable handlers.
  const stateRef = useRef(state);
  stateRef.current = state;

  const playRef = useRef<StockfishEngine | null>(null);
  const analysisRef = useRef<StockfishEngine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [thinking, setThinking] = useState(false);

  // Analysis cache (ref for logic, state mirror for rendering).
  const analysesRef = useRef<Map<string, Analysis>>(new Map());
  const inflightRef = useRef<Map<string, Promise<Analysis>>>(new Map());
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});

  const assessmentsRef = useRef<Map<string, MoveAssessment>>(new Map());
  const [assessments, setAssessments] = useState<Record<string, MoveAssessment>>(
    {},
  );

  const requestedRef = useRef<string>("");
  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);

  // --- engine lifecycle -----------------------------------------------------
  useEffect(() => {
    const play = new StockfishEngine();
    const analysis = new StockfishEngine();
    playRef.current = play;
    analysisRef.current = analysis;
    let cancelled = false;
    Promise.all([play.init(), analysis.init()]).then(() => {
      if (!cancelled) setEngineReady(true);
    });
    return () => {
      cancelled = true;
      play.terminate();
      analysis.terminate();
      playRef.current = null;
      analysisRef.current = null;
    };
  }, []);

  // --- derived position -----------------------------------------------------
  const chess = useMemo(
    () => positionAt(state.startFen, state.history, state.cursor),
    [state.startFen, state.history, state.cursor],
  );
  const fen = chess.fen();
  const turn = chess.turn();
  const legalMoves = useMemo(() => chess.moves({ verbose: true }), [chess]);
  const inCheck = useMemo(() => chess.inCheck(), [chess]);
  const result = useMemo(() => getResult(chess), [chess]);
  const material = useMemo(() => getMaterial(chess), [chess]);
  const atLiveEdge = state.cursor === state.history.length;
  const lastMove =
    state.cursor > 0
      ? {
          from: state.history[state.cursor - 1].from,
          to: state.history[state.cursor - 1].to,
        }
      : null;

  // Which move the tip card focuses on. At the live edge we prefer the
  // player's most recent move over the bot's instant reply, so you can always
  // read the evaluation of YOUR move. While reviewing, it follows the cursor.
  const tipIndex = (() => {
    if (state.cursor === 0) return -1;
    const lastIdx = state.cursor - 1;
    const last = state.history[lastIdx];
    if (atLiveEdge && last.color !== state.playerColor && lastIdx >= 1) {
      return lastIdx - 1;
    }
    return lastIdx;
  })();
  const tipPly = tipIndex >= 0 ? state.history[tipIndex] : null;

  // --- engine cache helper --------------------------------------------------
  const ensureAnalysis = useCallback(
    (target: string): Promise<Analysis | null> => {
      const cached = analysesRef.current.get(target);
      if (cached) return Promise.resolve(cached);
      const engine = analysisRef.current;
      if (!engine) return Promise.resolve(null);
      const pending = inflightRef.current.get(target);
      if (pending) return pending;
      const p = engine
        .analyze(target, { depth: ANALYSIS_DEPTH, multipv: ANALYSIS_MULTIPV })
        .then((res) => {
          analysesRef.current.set(target, res);
          inflightRef.current.delete(target);
          setAnalyses((prev) => ({ ...prev, [target]: res }));
          return res;
        });
      inflightRef.current.set(target, p);
      return p;
    },
    [],
  );

  // Compute & cache a move's assessment. Idempotent and resilient to effect
  // re-runs (e.g. the bot replying before our move's analysis finishes) — it
  // only bails on unmount, never skipping the write.
  const assessPly = useCallback(
    async (ply: Ply): Promise<void> => {
      if (assessmentsRef.current.has(ply.after)) return;
      const [parent, child] = await Promise.all([
        ensureAnalysis(ply.before),
        ensureAnalysis(ply.after),
      ]);
      if (!parent || !child || assessmentsRef.current.has(ply.after)) return;
      const a = assessMove({
        parent,
        child,
        playedUci: ply.uci,
        toSan: uciToSan,
      });
      assessmentsRef.current.set(ply.after, a);
      if (mountedRef.current) {
        setAssessments((prev) =>
          prev[ply.after] ? prev : { ...prev, [ply.after]: a },
        );
      }
    },
    [ensureAnalysis],
  );

  // Apply a move from the current cursor position (used by both player & bot).
  const applyMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      const s = stateRef.current;
      const pos = positionAt(s.startFen, s.history, s.cursor);
      const ply = tryMove(pos, from, to, promotion);
      if (!ply) return false;
      dispatch({ type: "APPLY_MOVE", ply });
      return true;
    },
    [],
  );

  // --- bot move -------------------------------------------------------------
  useEffect(() => {
    if (!engineReady || state.status !== "playing" || !atLiveEdge) return;
    if (result) {
      dispatch({ type: "SET_STATUS", status: "gameover" });
      return;
    }
    if (turn === state.playerColor) return; // player's turn

    const key = `${fen}@${state.cursor}`;
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    let cancelled = false;
    setThinking(true);
    playRef.current
      ?.bestMove(fen, LEVELS[state.level])
      .then((uci) => {
        if (cancelled) return;
        setThinking(false);
        if (!uci) return;
        applyMove(
          uci.slice(0, 2) as Square,
          uci.slice(2, 4) as Square,
          (uci.slice(4, 5) || undefined) as PieceSymbol | undefined,
        );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineReady, state.status, atLiveEdge, turn, fen, state.playerColor, state.level, result]);

  // --- analysis & move assessment ------------------------------------------
  useEffect(() => {
    if (!engineReady || !state.showHints) return;
    ensureAnalysis(fen); // current position eval (for the bar)
    if (state.cursor > 0) {
      assessPly(state.history[state.cursor - 1]); // latest move (list badge)
    }
    if (tipPly) assessPly(tipPly); // the move shown in the tip card
  }, [
    engineReady,
    state.showHints,
    fen,
    state.cursor,
    state.history,
    tipPly,
    ensureAnalysis,
    assessPly,
  ]);

  // --- actions --------------------------------------------------------------
  const makeUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      const s = stateRef.current;
      if (s.status !== "playing") return false;
      const pos = positionAt(s.startFen, s.history, s.cursor);
      if (pos.turn() !== s.playerColor) return false;
      return applyMove(from, to, promotion);
    },
    [applyMove],
  );

  const newGame = useCallback((config: GameConfig) => {
    analysesRef.current.clear();
    inflightRef.current.clear();
    assessmentsRef.current.clear();
    setAnalyses({});
    setAssessments({});
    requestedRef.current = "";
    setThinking(false);
    playRef.current?.newGame();
    analysisRef.current?.newGame();
    dispatch({ type: "NEW_GAME", config });
  }, []);

  const undo = useCallback(() => {
    const s = stateRef.current;
    const minCursor = s.playerColor === "w" ? 0 : 1;
    let t = s.cursor - 1;
    if (sideAt(t) !== s.playerColor) t -= 1;
    dispatch({ type: "SET_CURSOR", cursor: Math.max(minCursor, t) });
  }, []);

  const redo = useCallback(() => {
    const s = stateRef.current;
    let t = s.cursor + 1;
    if (t < s.history.length && sideAt(t) !== s.playerColor) t += 1;
    dispatch({ type: "SET_CURSOR", cursor: Math.min(s.history.length, t) });
  }, []);

  const jumpTo = useCallback(
    (cursor: number) => dispatch({ type: "SET_CURSOR", cursor }),
    [],
  );

  const setHints = useCallback(
    (value: boolean) => dispatch({ type: "SET_HINTS", value }),
    [],
  );

  const setLevel = useCallback(
    (level: LevelId) => dispatch({ type: "SET_LEVEL", level }),
    [],
  );

  const resign = useCallback(
    () => dispatch({ type: "SET_STATUS", status: "gameover" }),
    [],
  );

  const backToSetup = useCallback(
    () => dispatch({ type: "SET_STATUS", status: "setup" }),
    [],
  );

  const resume = useCallback(
    () => dispatch({ type: "SET_STATUS", status: "playing" }),
    [],
  );

  // --- evaluation for the bar ----------------------------------------------
  const currentAnalysis = analyses[fen];
  const { evalWhite, evalWhiteCp, winProb } = useMemo(() => {
    if (!currentAnalysis?.lines[0]) {
      return {
        evalWhite: { type: "cp", value: 0 } as EvalScore,
        evalWhiteCp: 0,
        winProb: 0.5,
      };
    }
    const stm = lineToEval(currentAnalysis.lines[0]);
    const white = turn === "w" ? stm : negateEval(stm);
    const cp = evalToNumber(white);
    return {
      evalWhite: white,
      evalWhiteCp: cp,
      winProb: winProbability(Math.max(-2000, Math.min(2000, cp))),
    };
  }, [currentAnalysis, turn]);

  const tipAssessment = tipPly ? assessments[tipPly.after] ?? null : null;

  // Aggregate stats over the player's own moves (for the end-game summary).
  const playerStats = useMemo<PlayerStats>(() => {
    const counts: Record<MoveQuality, number> = {
      best: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    };
    let sum = 0;
    let n = 0;
    for (const ply of state.history) {
      if (ply.color !== state.playerColor) continue;
      const a = assessments[ply.after];
      if (!a) continue;
      counts[a.quality] += 1;
      const wb = winProbability(evalToNumber(a.evalBefore)) * 100;
      const wa = winProbability(evalToNumber(a.evalAfter)) * 100;
      sum += moveAccuracy(wb, wa);
      n += 1;
    }
    return { accuracy: n ? Math.round(sum / n) : null, assessed: n, counts };
  }, [state.history, state.playerColor, assessments]);

  const minPlayerCursor = state.playerColor === "w" ? 0 : 1;

  return {
    // config / status
    status: state.status,
    playerColor: state.playerColor,
    level: state.level,
    showHints: state.showHints,
    // position
    chess,
    fen,
    turn,
    legalMoves,
    inCheck,
    lastMove,
    result,
    material,
    // engine
    engineReady,
    thinking,
    evalWhite,
    evalWhiteCp,
    winProb,
    // analysis / tips
    analyses,
    assessments,
    tipPly,
    tipAssessment,
    playerStats,
    // history
    history: state.history,
    cursor: state.cursor,
    atLiveEdge,
    canUndo: state.cursor > minPlayerCursor && state.history.length > 0,
    canRedo: state.cursor < state.history.length,
    // actions
    newGame,
    makeUserMove,
    undo,
    redo,
    jumpTo,
    setHints,
    setLevel,
    resign,
    backToSetup,
    resume,
  };
}

export type ChessVsBot = ReturnType<typeof useChessVsBot>;
