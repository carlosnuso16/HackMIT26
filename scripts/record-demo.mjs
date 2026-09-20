/**
 * Records the Cyto product demo reel to public/demos/cyto-demo.webm
 *
 * Usage: npm run record-demo
 * Requires: local dev server on :3000
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "demos");
const DEST = path.join(OUT_DIR, "cyto-demo.webm");
const URL = process.env.DEMO_URL || "http://localhost:3000/demo?export=1";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
    args: [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  await page.addStyleTag({
    content: `
      .demo-page-bar { display: none !important; }
      .demo-root { min-height: 100vh; padding: 0 !important; }
      .demo-frame {
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        aspect-ratio: auto !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
    `,
  });

  await page.waitForFunction(
    () => document.documentElement.dataset.demoDone === "1",
    null,
    { timeout: 90000 },
  );
  await page.waitForTimeout(1200);

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const tmp = await video.path();
    if (fs.existsSync(DEST)) fs.unlinkSync(DEST);
    fs.renameSync(tmp, DEST);
    console.log("Wrote", DEST);
  } else {
    console.error("No video recorded");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
