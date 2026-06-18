import type { Analysis, Level } from "../game/types";
import { isBestMoveLine, parseBestMove, parseInfo, splitLines } from "./uci";
import type { InfoLine } from "./uci";

export const DEFAULT_ENGINE_URL = "/engine/stockfish-18-lite-single.js";

export interface AnalyzeOptions {
  depth?: number;
  movetime?: number;
  multipv?: number;
}

type LineListener = (line: string) => void;

/** Thin Promise-based wrapper around a Stockfish Web Worker.
 *  Commands that run a search are serialized so the engine only ever processes
 *  one `go` at a time. */
export class StockfishEngine {
  private worker: Worker;
  private listeners = new Set<LineListener>();
  private chain: Promise<unknown> = Promise.resolve();
  private currentMultipv = 1;
  private limitStrength: boolean | null = null;
  private currentElo: number | null = null;

  constructor(url: string = DEFAULT_ENGINE_URL) {
    this.worker = new Worker(url);
    this.worker.onmessage = (ev: MessageEvent) => {
      const data = ev.data;
      const text =
        typeof data === "string"
          ? data
          : data && typeof data.data === "string"
            ? data.data
            : String(data ?? "");
      for (const line of splitLines(text)) {
        for (const l of [...this.listeners]) l(line);
      }
    };
  }

  private send(cmd: string): void {
    this.worker.postMessage(cmd);
  }

  private onLine(cb: LineListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private waitFor(predicate: (line: string) => boolean): Promise<void> {
    return new Promise((resolve) => {
      const off = this.onLine((line) => {
        if (predicate(line)) {
          off();
          resolve();
        }
      });
    });
  }

  /** Run `fn` after any in-flight engine work finishes. */
  private run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  async init(): Promise<void> {
    await this.run(async () => {
      this.send("uci");
      await this.waitFor((l) => l === "uciok");
      this.send("isready");
      await this.waitFor((l) => l === "readyok");
    });
  }

  async newGame(): Promise<void> {
    await this.run(async () => {
      this.send("ucinewgame");
      this.send("isready");
      await this.waitFor((l) => l === "readyok");
    });
  }

  private setMultiPv(value: number): void {
    if (this.currentMultipv !== value) {
      this.currentMultipv = value;
      this.send(`setoption name MultiPV value ${value}`);
    }
  }

  private setStrength(elo: number | null): void {
    const limit = elo !== null;
    if (this.limitStrength !== limit) {
      this.limitStrength = limit;
      this.send(`setoption name UCI_LimitStrength value ${limit}`);
    }
    if (limit && this.currentElo !== elo) {
      this.currentElo = elo;
      this.send(`setoption name UCI_Elo value ${elo}`);
    }
  }

  /** Full-strength analysis of a position. Scores are from the POV of the side
   *  to move in `fen`. */
  analyze(fen: string, opts: AnalyzeOptions = {}): Promise<Analysis> {
    return this.run(
      () =>
        new Promise<Analysis>((resolve) => {
          const multipv = opts.multipv ?? 1;
          const best = new Map<number, InfoLine>();
          let maxDepth = 0;

          const off = this.onLine((line) => {
            const info = parseInfo(line);
            if (info) {
              const prev = best.get(info.multipv);
              if (!prev || info.depth >= prev.depth) best.set(info.multipv, info);
              if (info.depth > maxDepth) maxDepth = info.depth;
              return;
            }
            if (isBestMoveLine(line)) {
              off();
              const lines = [...best.values()]
                .sort((a, b) => a.multipv - b.multipv)
                .map((l) => ({
                  multipv: l.multipv,
                  cp: l.cp,
                  mate: l.mate,
                  pv: l.pv,
                }));
              resolve({
                fen,
                depth: maxDepth,
                bestMove: parseBestMove(line),
                lines,
              });
            }
          });

          this.setStrength(null);
          this.setMultiPv(multipv);
          this.send(`position fen ${fen}`);
          if (opts.movetime) this.send(`go movetime ${opts.movetime}`);
          else this.send(`go depth ${opts.depth ?? 15}`);
        }),
    );
  }

  /** Ask the engine for a move at a given playing strength. */
  bestMove(fen: string, level: Level): Promise<string | null> {
    return this.run(
      () =>
        new Promise<string | null>((resolve) => {
          const off = this.onLine((line) => {
            if (isBestMoveLine(line)) {
              off();
              resolve(parseBestMove(line));
            }
          });
          this.setMultiPv(1);
          this.setStrength(level.elo);
          this.send(`position fen ${fen}`);
          if (level.go.movetime) this.send(`go movetime ${level.go.movetime}`);
          else this.send(`go depth ${level.go.depth ?? 12}`);
        }),
    );
  }

  stop(): void {
    this.send("stop");
  }

  terminate(): void {
    this.listeners.clear();
    this.worker.terminate();
  }
}
