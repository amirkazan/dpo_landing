// QA-скриншоты лендинга: full-page на ширинах 1440 и 390.
const path = require("path");
const fs = require("fs");

const pwDir = fs.existsSync("/home/amir/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core")
  ? "/home/amir/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core"
  : null;
if (!pwDir) throw new Error("playwright-core not found");
const { chromium } = require(pwDir);

const chromeRoot = "/home/amir/.cache/ms-playwright";
const candidates = fs
  .readdirSync(chromeRoot)
  .filter((d) => d.startsWith("chromium-"))
  .sort()
  .reverse();
let executablePath = null;
for (const c of candidates) {
  for (const sub of ["chrome-linux64", "chrome-linux"]) {
    const p = path.join(chromeRoot, c, sub, "chrome");
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }
  if (executablePath) break;
}
if (!executablePath) throw new Error("chromium not found");

(async () => {
  const browser = await chromium.launch({ executablePath });
  const outDir = path.join(__dirname, "qa");
  fs.mkdirSync(outDir, { recursive: true });
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto("http://localhost:3001/", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3500);
    // прокрутка шагами — чтобы сработали whileInView-анимации (once: true)
    await page.evaluate(async () => {
      const step = 600;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(outDir, `page-${width}.png`), fullPage: true });
    await page.close();
    console.log(`saved qa/page-${width}.png`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
