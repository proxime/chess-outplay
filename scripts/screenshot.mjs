// Visual check: builds are served by `vite preview`, then Playwright captures
// the game screen before and after a move. Requires the browser once:
//   npx playwright install chromium
// Usage:
//   npm run build && npm run screenshot
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PORT = 4174;
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const server = spawn("npx", ["vite", "preview", "--port", String(PORT)], {
  stdio: "ignore",
});

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("preview server did not start");
}

try {
  const base = `http://localhost:${PORT}/`;
  await waitForServer(base);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base, { waitUntil: "networkidle" });

  await page.waitForSelector('button:has-text("Zacznij grę"):not([disabled])', {
    timeout: 60000,
  });
  await page.click('button:has-text("Zacznij grę")');
  await page.waitForSelector('[data-square="e2"]', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/game-initial.png` });

  await page.click('[data-square="e2"]');
  await page.click('[data-square="e4"]');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/game-after-move.png` });

  console.log(`Saved screenshots to ./${OUT}/`);
  await browser.close();
} finally {
  server.kill();
}
