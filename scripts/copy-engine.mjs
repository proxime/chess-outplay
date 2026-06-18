// Refreshes the bundled Stockfish engine files from node_modules into public/.
// We commit these into public/engine so the static build (e.g. on Vercel) has
// them without a fragile copy step. Run after upgrading the `stockfish` package:
//   npm run engine:copy
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/stockfish/bin");
const dest = join(root, "public/engine");

mkdirSync(dest, { recursive: true });

const files = [
  "stockfish-18-lite-single.js",
  "stockfish-18-lite-single.wasm",
];

for (const f of files) {
  copyFileSync(join(src, f), join(dest, f));
  console.log("copied", f);
}
