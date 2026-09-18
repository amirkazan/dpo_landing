#!/usr/bin/env node
/* Разовый снимок hero через http (type="module" не работает с file://). */
import { createRequire } from 'node:module';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));

function resolvePlaywright() {
  const require = createRequire(import.meta.url);
  for (const name of ['playwright', 'playwright-core']) {
    try { return require.resolve(name); } catch { /* не установлен */ }
  }
  const npx = join(homedir(), '.npm', '_npx');
  for (const dir of readdirSync(npx)) {
    const candidate = join(npx, dir, 'node_modules', 'playwright-core', 'index.mjs');
    if (existsSync(candidate)) return candidate;
  }
  throw new Error('playwright-core не найден');
}
function resolveChrome() {
  const cache = join(homedir(), '.cache', 'ms-playwright');
  const builds = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const build of builds) {
    const bin = join(cache, build, 'chrome-linux64', 'chrome');
    if (existsSync(bin)) return bin;
  }
  throw new Error('Chromium не найден');
}

const server = spawn('python3', ['-m', 'http.server', '8931', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
try {
  const { chromium } = await import(resolvePlaywright());
  const browser = await chromium.launch({ executablePath: resolveChrome(), headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:8931/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const live = await page.evaluate(() => {
    const el = document.querySelector('.hero-3d');
    return { cls: el.className, canvas: !!el.querySelector('canvas') };
  });
  console.log('hero-3d class:', live.cls, '| canvas:', live.canvas, '| pageerrors:', errors.length ? errors.join('; ') : 'нет');
  await page.screenshot({ path: join(root, 'qa', 'hero-http.png') });
  // статичный кадр при reduced motion
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:8931/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(root, 'qa', 'hero-http-reduced.png') });
  const errors2 = [];
  console.log('reduced-motion shot saved');
  await browser.close();
  if (errors.length) process.exit(1);
} finally {
  server.kill();
}
