/** Pure parsers for the UCI text protocol. Kept separate from the Worker so
 *  they can be unit-tested without a browser. */

export interface InfoLine {
  depth: number;
  multipv: number;
  cp?: number; // side-to-move POV
  mate?: number; // side-to-move POV
  pv: string[];
}

/** Parse an `info ...` line. Returns null for lines without a score (e.g.
 *  "info string ...", or low-value currmove lines). */
export function parseInfo(line: string): InfoLine | null {
  if (!line.startsWith("info ")) return null;
  const t = line.trim().split(/\s+/);
  let depth = 0;
  let multipv = 1;
  let cp: number | undefined;
  let mate: number | undefined;
  let pv: string[] = [];

  for (let i = 1; i < t.length; i++) {
    switch (t[i]) {
      case "depth":
        depth = parseInt(t[++i], 10);
        break;
      case "multipv":
        multipv = parseInt(t[++i], 10);
        break;
      case "score": {
        const kind = t[++i];
        const val = parseInt(t[++i], 10);
        if (kind === "cp") cp = val;
        else if (kind === "mate") mate = val;
        break;
      }
      case "pv":
        pv = t.slice(i + 1);
        i = t.length;
        break;
    }
  }

  if (cp === undefined && mate === undefined) return null;
  if (!Number.isFinite(depth)) return null;
  return { depth, multipv, cp, mate, pv };
}

/** Is this a terminal `bestmove` line? */
export function isBestMoveLine(line: string): boolean {
  return /^bestmove\b/.test(line.trim());
}

/** Extract the move from a `bestmove` line. Returns null for "(none)". */
export function parseBestMove(line: string): string | null {
  const m = line.trim().match(/^bestmove\s+(\S+)/);
  if (!m) return null;
  return m[1] === "(none)" ? null : m[1];
}

/** Split a raw worker message (which may contain several lines) into trimmed,
 *  non-empty lines. */
export function splitLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
}
