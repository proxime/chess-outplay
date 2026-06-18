// Headless smoke test: proves the Stockfish lite-single engine actually boots
// and returns a bestmove. Run with: node scripts/engine-smoke-test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const initEngine = require("stockfish");

const lines = [];
let resolved = false;

const timeout = setTimeout(() => {
  console.error("TIMEOUT: engine did not return bestmove in time");
  process.exit(1);
}, 30000);

initEngine("lite-single").then((engine) => {
  // Emscripten routes engine output through print -> console.log by default.
  // Patch console.log to capture UCI lines while still echoing them.
  const origLog = console.log.bind(console);
  console.log = (...args) => {
    const line = args.join(" ");
    lines.push(line);
    origLog(line);
    if (!resolved && /^bestmove\s+(\S+)/.test(line)) {
      resolved = true;
      const move = line.match(/^bestmove\s+(\S+)/)[1];
      const sawUci = lines.some((l) => l.includes("Stockfish") || l === "uciok");
      clearTimeout(timeout);
      console.log = origLog;
      console.log("\n--- SMOKE TEST RESULT ---");
      console.log("uci handshake:", sawUci ? "OK" : "MISSING");
      console.log("bestmove:", move);
      console.log(move && move !== "(none)" ? "PASS ✅" : "FAIL ❌");
      process.exit(move && move !== "(none)" ? 0 : 1);
    }
  };

  engine.sendCommand("uci");
  engine.sendCommand("isready");
  engine.sendCommand("position startpos");
  engine.sendCommand("go depth 10");
});
