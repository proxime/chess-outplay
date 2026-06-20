// Assembles the unpacked browser extension into dist-extension/:
// the web build (dist/) + manifest, content/background scripts and icons.
// Run via: npm run build:extension  (then "Load unpacked" dist-extension/)
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const out = join(root, "dist-extension");

if (!existsSync(dist)) {
  console.error("dist/ not found — run `vite build` first.");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(dist, out, { recursive: true });

for (const f of ["manifest.json", "content.js", "background.js"]) {
  cpSync(join(root, "extension", f), join(out, f));
}
cpSync(join(root, "extension/icons"), join(out, "icons"), { recursive: true });

console.log("✓ Extension built → dist-extension/");
console.log("  Chrome/Edge: chrome://extensions → Tryb dewelopera → Wczytaj rozpakowane → wskaż dist-extension/");
