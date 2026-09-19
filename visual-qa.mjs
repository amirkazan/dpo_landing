#!/usr/bin/env node
/**
 * Визуальный QA-цикл лендинга: рендер в Chromium на нескольких ширинах,
 * проверки по чек-листу DESIGN.md, скриншоты в qa/.
 *
 * Запуск: node visual-qa.mjs
 * Требования: playwright-core и Chromium. Пути резолвятся так:
 *   - QA_PLAYWRIGHT — путь к модулю playwright(-core);
 *   - QA_CHROME — путь к исполняемому файлу Chromium;
 *   - иначе ищется в ~/.npm/_npx/*\/node_modules и ~/.cache/ms-playwright.
 */
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const pageUrl = 'file://' + join(root, 'index.html');
const outDir = join(root, 'qa');
const widths = [1440, 1024, 768, 390, 320];

function resolvePlaywright() {
  if (process.env.QA_PLAYWRIGHT) return process.env.QA_PLAYWRIGHT;
  const require = createRequire(import.meta.url);
  for (const name of ['playwright', 'playwright-core']) {
    try { return require.resolve(name); } catch { /* не установлен */ }
  }
  const npx = join(homedir(), '.npm', '_npx');
  try {
    for (const dir of readdirSync(npx)) {
      const candidate = join(npx, dir, 'node_modules', 'playwright-core', 'index.mjs');
      if (existsSync(candidate)) return candidate;
    }
  } catch { /* нет кэша npx */ }
  throw new Error('playwright-core не найден. Установите playwright или задайте QA_PLAYWRIGHT.');
}

function resolveChrome() {
  if (process.env.QA_CHROME) return process.env.QA_CHROME;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  try {
    const builds = readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const build of builds) {
      const bin = join(cache, build, 'chrome-linux64', 'chrome');
      if (existsSync(bin)) return bin;
    }
  } catch { /* нет кэша */ }
  throw new Error('Chromium не найден. Установите playwright browsers или задайте QA_CHROME.');
}

const { chromium } = await import(resolvePlaywright());
const browser = await chromium.launch({ executablePath: resolveChrome(), headless: true });
mkdirSync(outDir, { recursive: true });

const failures = [];
const check = (ok, label, width) => {
  if (!ok) failures.push(`[${width}px] ${label}`);
};

try {
  const page = await browser.newPage();
  for (const width of widths) {
    const errors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto(pageUrl, { waitUntil: 'networkidle' });

    // 1. Горизонтальное переполнение
    check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      'горизонтальное переполнение', width);

    // 2. Якорная навигация (инструкция заказчика)
    await page.locator('.hero-actions a[href="#about"]').click();
    check(await page.evaluate(() => location.hash) === '#about', 'кнопка «О курсе» не ведёт к #about', width);
    await page.locator('.hero-actions a[href="#materials"]').click();
    check(await page.evaluate(() => location.hash) === '#materials', 'кнопка «Материалы курса» не ведёт к #materials', width);
    // Дальнейшие шаги чувствительны к позиции скролла: выключаем smooth-scroll
    // и гасим уже идущую анимацию якорного перехода.
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, scrollY);
    });

    // 3. Диалог незаполненной ссылки
    await page.locator('[data-resource="recordings"]').first().click();
    check(await page.locator('dialog#link-notice').evaluate((el) => el.open), 'диалог не открылся', width);
    const dlgTitle = await page.locator('#notice-title').textContent();
    check(dlgTitle.includes('Видеозаписи'), 'диалог без data-label в заголовке', width);
    await page.keyboard.press('Escape');
    check(!(await page.locator('dialog#link-notice').evaluate((el) => el.open)), 'диалог не закрылся по Escape', width);

    // 3.1. Просмотрщик программы: модальное окно с содержанием и кнопкой скачивания
    await page.locator('a[data-syllabus]').first().click();
    const syllabus = page.locator('dialog#syllabus-viewer');
    check(await syllabus.evaluate((el) => el.open), 'диалог программы не открылся', width);
    const modules = await syllabus.locator('.syllabus-module').count();
    check(modules >= 5, 'в диалоге программы меньше 5 модулей', width);
    const scrollBefore = await page.evaluate(() => scrollY);
    await page.mouse.move(200, 450);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(100);
    check(await page.evaluate((y) => scrollY === y, scrollBefore),
      'фон прокручивается колесом мыши при открытом диалоге программы', width);
    const download = syllabus.locator('a[download]');
    check(await download.getAttribute('href') === 'assets/programma-kursa.docx',
      'кнопка скачивания не ведёт на DOCX', width);
    await page.keyboard.press('Escape');
    check(!(await syllabus.evaluate((el) => el.open)), 'диалог программы не закрылся по Escape', width);

    // 4. Мобильное меню
    if (width <= 800) {
      await page.locator('#menu-toggle').click();
      check(await page.locator('#menu-toggle').getAttribute('aria-expanded') === 'true', 'меню не открылось', width);
      await page.locator('#site-nav a').first().click();
      check(await page.locator('#menu-toggle').getAttribute('aria-expanded') === 'false', 'меню не закрылось после ссылки', width);
    }

    // 5. Пауза GIF
    const gifBtn = page.locator('[data-gif-toggle]').first();
    await gifBtn.click();
    const paused = await gifBtn.getAttribute('aria-pressed') === 'true'
      && await page.locator('.gif-poster').first().evaluate((el) => !el.hidden);
    check(paused, 'пауза GIF не показывает постер', width);
    await gifBtn.click();

    // 6. Скролл: reveal, «наверх», догрузка ленивых изображений.
    // Smooth-scroll отключаем на время прогона: иначе анимация скролла
    // отстаёт от цикла и проверка становится недетерминированной.
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 400) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(700);
    await page.locator('img').evaluateAll((imgs) =>
      Promise.all(imgs.map(async (i) => { i.loading = 'eager'; await i.decode(); })));
    const broken = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')));
    check(broken.length === 0, `не загрузились изображения: ${broken.join(', ')}`, width);
    const unrevealed = await page.locator('[data-reveal]:not(.is-visible)').evaluateAll((els) =>
      els.filter((el) => el.offsetParent !== null).length);
    check(unrevealed === 0, `не сработал reveal у ${unrevealed} видимых блоков`, width);
    check(await page.locator('.to-top').evaluate((el) => getComputedStyle(el).opacity === '1'),
      'кнопка «наверх» не появилась после скролла', width);

    // 7. Ошибки JS
    check(errors.length === 0, `JS-ошибки: ${errors.join('; ')}`, width);

    // 8. Скриншот после полного reveal
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = ''; });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `page-${width}.png`), fullPage: true });
    console.log(`[${width}px] ок — qa/page-${width}.png`);
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('\nДефекты:');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log(`\nВизуальный QA пройден: ${widths.length} ширин, дефектов нет.`);
