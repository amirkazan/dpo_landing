import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const app = read('app.js');
const configSource = read('links.js');
const keys = ['registration', 'recordings', 'assignments', 'guides', 'syllabus',
  'presentation', 'assessment', 'integral'];

// Только селекторы, используемые приложением; неизвестные не игнорируются.
function matches(element, selector) {
  switch (selector) {
    case 'a': return element.tag === 'a';
    case 'a[data-resource]':
      return element.tag === 'a' && element.getAttribute('data-resource') !== null;
    case '[data-close-dialog]': return element.getAttribute('data-close-dialog') !== null;
    case 'a[data-syllabus]': return element.tag === 'a' && element.getAttribute('data-syllabus') !== null;
    case 'a[data-assessment]': return element.tag === 'a' && element.getAttribute('data-assessment') !== null;
    case 'a[data-labs]': return element.tag === 'a' && element.getAttribute('data-labs') !== null;
    default: return false; // неизвестные селекторы (новые фичи) — пустая выборка
  }
}

class Element {
  constructor(tag, attrs = {}, text = '') {
    this.tag = tag;
    this.attrs = { ...attrs };
    this.textContent = text;
    this.children = [];
    this.listeners = new Map();
    const classes = new Set();
    this.classList = {
      contains: (name) => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      }
    };
  }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  removeAttribute(name) { delete this.attrs[name]; }
  append(...elements) { this.children.push(...elements); }
  querySelectorAll(selector) {
    return this.children.flatMap((child) => [
      ...(matches(child, selector) ? [child] : []), ...child.querySelectorAll(selector)
    ]);
  }
  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }
  dispatch(type, props = {}) {
    const event = {
      target: this, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...props
    };
    for (const handler of this.listeners.get(type) || []) handler(event);
    return event;
  }
}

class Document extends Element {
  constructor(readyState) { super('document'); this.readyState = readyState; }
  getElementById(id) {
    function find(node) {
      if (node.getAttribute('id') === id) return node;
      for (const child of node.children) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    }
    return find(this);
  }
}

function setup({ links = {}, readyState = 'complete', withDialog = true,
  withMenu = true, prepare = () => {} } = {}) {
  const doc = new Document(readyState);
  const nav = new Element('nav', { id: 'site-nav' });
  const toggle = new Element('button', { id: 'menu-toggle', 'aria-expanded': 'false' });
  const about = new Element('a', { href: '#about' });
  const materials = new Element('a', { href: '#materials' });
  nav.append(about, materials);
  if (withMenu) doc.append(toggle, nav);
  const resources = Object.fromEntries(keys.map((key) => [key, new Element('a', {
    'data-resource': key, 'data-label': `Метка ${key}`, href: '#link-notice'
  }, `Текст ${key}`)]));
  doc.append(...Object.values(resources));
  const section = new Element('section', { id: 'about' }, 'Описание курса');
  doc.append(section);
  const dialog = new Element('dialog', { id: 'link-notice' });
  const title = new Element('h2', { id: 'notice-title' });
  const close = new Element('button', { 'data-close-dialog': '' });
  dialog.open = false;
  dialog.showModalCalls = 0;
  dialog.showModal = () => { dialog.open = true; dialog.showModalCalls += 1; };
  dialog.close = () => { dialog.open = false; };
  dialog.getBoundingClientRect = () => ({ left: 100, right: 400, top: 100, bottom: 300 });
  dialog.append(title, close);
  if (withDialog) doc.append(dialog);
  const fixture = { doc, nav, toggle, about, materials, resources, dialog, title, close, section };
  prepare(fixture);
  vm.runInNewContext(app, { document: doc, window: { COURSE_LINKS: links }, URL },
    { filename: 'app.js', timeout: 1000 });
  return fixture;
}

test('classic links.js: ровно восемь ключей; каждое значение — null или https-URL', () => {
  const context = { window: {} };
  vm.runInNewContext(configSource, context, { timeout: 1000 });
  assert.deepEqual(Object.keys(context.window.COURSE_LINKS).sort(), [...keys].sort());
  for (const key of keys) {
    const value = context.window.COURSE_LINKS[key];
    if (value === null) continue; // ссылка ещё не предоставлена — показываем диалог
    assert.match(value, /^https:\/\//, `${key}: допустимы только https-URL или null`);
  }
  assert.match(context.window.COURSE_LINKS.registration, /^https:\/\//,
    'registration обязана быть заполненным https-URL');
});

test('HTTP(S) URL получают href, _blank и безопасный rel; клик не перехвачен', () => {
  const links = { recordings: 'https://example.org/lectures', assignments: 'http://example.org/tasks' };
  const { resources, dialog } = setup({ links });
  for (const [key, url] of Object.entries(links)) {
    assert.equal(resources[key].getAttribute('href'), url);
    assert.equal(resources[key].getAttribute('target'), '_blank');
    assert.equal(resources[key].getAttribute('rel'), 'noopener noreferrer');
    assert.equal(resources[key].dispatch('click').defaultPrevented, false);
  }
  assert.equal(dialog.open, false);
});

test('null, отсутствующий и некорректный URL оставляют уведомление', () => {
  for (const value of [null, undefined, '', 42, 'not-a-url', 'https://',
    'https://bad host/', 'javascript:void(0)', 'ftp://example.org', '//example.org']) {
    const { resources, dialog } = setup({
      links: { recordings: value },
      prepare({ resources }) {
        resources.recordings.setAttribute('target', '_blank');
        resources.recordings.setAttribute('rel', 'opener');
      }
    });
    const link = resources.recordings;
    assert.equal(link.getAttribute('href'), '#link-notice', String(value));
    assert.equal(link.getAttribute('target'), null);
    assert.equal(link.getAttribute('rel'), null);
    assert.equal(link.dispatch('click').defaultPrevented, true);
    assert.equal(dialog.showModalCalls, 1);
  }
});

test('отсутствующий конфиг и унаследованные ключи не используются', () => {
  for (const links of [null, Object.create({ recordings: 'https://example.org' })]) {
    const { resources } = setup({ links });
    for (const link of Object.values(resources)) assert.equal(link.getAttribute('href'), '#link-notice');
  }
});

test('диалог получает data-label, не вызывая showModal повторно для открытого диалога', () => {
  const { resources, dialog, title } = setup();
  resources.recordings.dispatch('click');
  assert.equal(dialog.open, true);
  assert.equal(title.textContent, 'Метка recordings');
  resources.assignments.dispatch('click');
  assert.equal(title.textContent, 'Метка assignments');
  assert.equal(dialog.showModalCalls, 1);
});

test('без непустого data-label заголовок берётся из textContent', () => {
  const { resources, title } = setup();
  resources.integral.removeAttribute('data-label');
  resources.integral.textContent = '  Программа «Интеграл»  ';
  resources.integral.dispatch('click');
  assert.equal(title.textContent, 'Программа «Интеграл»');
  resources.integral.setAttribute('data-label', '  ');
  resources.integral.dispatch('click');
  assert.equal(title.textContent, 'Программа «Интеграл»');
});

test('[data-close-dialog] закрывает диалог', () => {
  const { resources, dialog, close } = setup();
  resources.guides.dispatch('click');
  close.dispatch('click');
  assert.equal(dialog.open, false);
});

test('backdrop закрывает диалог, контент и внутренние отступы — нет', () => {
  const { resources, dialog, title } = setup();
  resources.presentation.dispatch('click');
  dialog.dispatch('click', { target: title, clientX: 150, clientY: 150 });
  assert.equal(dialog.open, true);
  dialog.dispatch('click', { clientX: 110, clientY: 110 });
  assert.equal(dialog.open, true);
  dialog.dispatch('click', { clientX: 20, clientY: 20 });
  assert.equal(dialog.open, false);
});

test('отсутствие диалога или showModal не ломает страницу и оставляет якорь', () => {
  for (const options of [{ withDialog: false }, { prepare({ dialog }) { dialog.showModal = undefined; } }]) {
    const { resources } = setup(options);
    assert.equal(resources.recordings.dispatch('click').defaultPrevented, false);
  }
  assert.doesNotThrow(() => setup({ withMenu: false }));
});

test('меню переключает класс и aria-expanded, закрывается по Esc', () => {
  const { nav, toggle, doc } = setup();
  function check(open) {
    assert.equal(nav.classList.contains('is-open'), open);
    assert.equal(toggle.getAttribute('aria-expanded'), String(open));
  }
  check(false);
  toggle.dispatch('click'); check(true);
  toggle.dispatch('click'); check(false);
  toggle.dispatch('click'); check(true);
  doc.dispatch('keydown', { key: 'Enter' }); check(true);
  doc.dispatch('keydown', { key: 'Escape' }); check(false);
});

test('якоря about/materials закрывают меню без перехвата перехода; секции не скрыты', () => {
  const { nav, toggle, about, materials, section } = setup();
  for (const [link, href] of [[about, '#about'], [materials, '#materials']]) {
    toggle.dispatch('click');
    assert.equal(link.dispatch('click').defaultPrevented, false);
    assert.equal(link.getAttribute('href'), href);
    assert.equal(nav.classList.contains('is-open'), false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  }
  assert.deepEqual(section.attrs, { id: 'about' });
  assert.equal(section.textContent, 'Описание курса');
  assert.equal(section.hidden, undefined);
});

test('инициализация откладывается до DOMContentLoaded', () => {
  const { doc, resources, dialog } = setup({ readyState: 'loading' });
  resources.recordings.dispatch('click');
  assert.equal(dialog.open, false);
  doc.readyState = 'interactive';
  doc.dispatch('DOMContentLoaded');
  resources.recordings.dispatch('click');
  assert.equal(dialog.open, true);
});

test('вьювер аттестации: data-assessment открывает dialog и блокирует скролл', () => {
  const { doc } = setup({
    prepare({ doc }) {
      const viewer = new Element('dialog', { id: 'assessment-viewer' });
      viewer.open = false;
      viewer.showModal = () => { viewer.open = true; };
      viewer.close = () => { viewer.open = false; };
      viewer.getBoundingClientRect = () => ({ left: 0, right: 500, top: 0, bottom: 500 });
      const opener = new Element('a', { href: '#assessment-viewer', 'data-assessment': '' });
      doc.append(viewer, opener);
      doc.documentElement = new Element('html');
      doc.viewer = viewer;
      doc.opener = opener;
    }
  });
  const viewer = doc.getElementById('assessment-viewer');
  const event = doc.opener.dispatch('click');
  assert.equal(event.defaultPrevented, true);
  assert.equal(viewer.open, true);
});

let html;
try {
  html = read('index.html');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const htmlOptions = { skip: html === undefined ? 'index.html пока не создан' : false };
// Минимальная статическая проверка тегов, не полноценный HTML-парсер.
const tags = [...(html || '').replace(/<!--[\s\S]*?-->/g, '').matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)]
  .map(([, tag, raw]) => {
    const attrs = {};
    for (const [, key, double, single, bare] of raw.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[key.toLowerCase()] = double ?? single ?? bare ?? '';
    }
    return { tag: tag.toLowerCase(), attrs };
  });
const byId = (id) => tags.find(({ attrs }) => attrs.id === id);

test('HTML: диалог, меню, секции и обычные якоря соответствуют контракту', htmlOptions, () => {
  assert.equal(byId('link-notice')?.tag, 'dialog');
  assert.ok(byId('notice-title'));
  assert.ok(tags.some(({ attrs }) => Object.hasOwn(attrs, 'data-close-dialog')));
  assert.equal(byId('menu-toggle')?.tag, 'button');
  assert.equal(byId('menu-toggle')?.attrs['aria-expanded'], 'false');
  assert.ok(byId('site-nav'));
  for (const id of ['about', 'materials']) {
    assert.ok(byId(id), `нет секции ${id}`);
    assert.ok(tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === `#${id}` &&
      !Object.hasOwn(attrs, 'data-resource')), `нет обычной ссылки #${id}`);
  }
  for (const { attrs } of tags.filter(({ tag, attrs }) => tag === 'a' && Object.hasOwn(attrs, 'data-resource'))) {
    assert.ok(keys.includes(attrs['data-resource']), 'неизвестный data-resource');
    assert.equal(attrs.href, '#link-notice');
  }
});

test('HTML: links.js перед app.js, classic scripts без async; hero — module', htmlOptions, () => {
  const scripts = tags.filter(({ tag }) => tag === 'script');
  const index = (name) => scripts.findIndex(({ attrs }) => attrs.src === name || attrs.src === `./${name}`);
  assert.ok(index('links.js') >= 0);
  assert.ok(index('app.js') > index('links.js'));
  for (const name of ['links.js', 'app.js']) {
    const { attrs } = scripts[index(name)];
    assert.ok([undefined, '', 'text/javascript', 'application/javascript'].includes(attrs.type));
    assert.equal(Object.hasOwn(attrs, 'async'), false);
  }
  const hero = scripts[index('hero-scene.js')];
  assert.ok(hero, 'нет hero-scene.js');
  assert.equal(hero.attrs.type, 'module', 'hero-scene.js должен быть type="module"');
});

test('HTML: непустое noscript-предупреждение', htmlOptions, () => {
  const notice = html.replace(/<!--[\s\S]*?-->/g, '').match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript\s*>/i);
  assert.ok(notice, 'добавьте noscript в HTML');
  assert.ok(notice[1].replace(/<[^>]*>/g, '').trim(), 'noscript не должен быть пустым');
});

test('HTML: секция FAQ с details/summary и пункт меню «Вопросы»', htmlOptions, () => {
  assert.equal(byId('faq')?.tag, 'section');
  const faqItems = tags.filter(({ tag, attrs }) => tag === 'details' && (attrs.class || '').includes('faq-item'));
  assert.ok(faqItems.length >= 5, 'должно быть минимум 5 вопросов');
  assert.ok(tags.filter(({ tag }) => tag === 'summary').length >= faqItems.length,
    'у каждого details должен быть summary');
  assert.ok(tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === '#faq' &&
    !Object.hasOwn(attrs, 'data-resource')), 'в меню нет обычной ссылки #faq');
});

test('HTML: декоративные слои hero aria-hidden, canvas и fallback на месте', htmlOptions, () => {
  const hero3d = tags.find(({ attrs }) => (attrs.class || '').split(' ').includes('hero-3d'));
  assert.ok(hero3d, 'нет .hero-3d');
  assert.equal(hero3d.attrs['aria-hidden'], 'true');
  assert.ok(tags.some(({ tag, attrs }) => tag === 'canvas' && (attrs.class || '').includes('hero-canvas')),
    'нет canvas hero-сцены');
  assert.ok(tags.some(({ attrs }) => (attrs.class || '').includes('hero-fallback')),
    'нет blueprint-grid fallback под canvas');
  const ticker = tags.find(({ attrs }) => (attrs.class || '').split(' ').includes('ticker'));
  assert.ok(ticker && ticker.attrs['aria-hidden'] === 'true', 'тикер должен быть aria-hidden');
  for (const { attrs } of tags.filter(({ attrs }) => (attrs.class || '').includes('hero-vignette'))) {
    assert.equal(attrs['aria-hidden'], 'true', 'hero-vignette без aria-hidden');
  }
});

test('HTML: stats-лента рендерит финальные значения (count-up — только анимация)', htmlOptions, () => {
  const nums = tags.filter(({ attrs }) => Object.hasOwn(attrs, 'data-countup'));
  assert.ok(nums.length >= 4, 'ожидаются минимум 4 счётчика stats-ленты');
  for (const { attrs } of nums) {
    assert.match(attrs['data-countup'], /^\d+$/, 'data-countup должен быть целым числом');
  }
  // финальные значения видны в разметке без JS
  const plain = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const value of ['144', '22']) {
    const re = new RegExp(`data-countup="${value}"[^>]*>\\s*${value}\\s*<`, 'i');
    assert.ok(re.test(plain), `финальное значение ${value} не отрендерено в HTML`);
  }
});

test('HTML: просмотрщик программы — контент в диалоге и кнопка скачивания', htmlOptions, () => {
  assert.equal(byId('syllabus-viewer')?.tag, 'dialog');
  assert.ok(byId('syllabus-title'), 'нет заголовка диалога программы');
  const modules = tags.filter(({ tag, attrs }) => tag === 'section' && (attrs.class || '').includes('syllabus-module'));
  assert.ok(modules.length >= 5, 'в диалоге программы должно быть минимум 5 модулей');
  const topics = tags.filter(({ tag, attrs }) => tag === 'li' && !attrs.class);
  assert.ok(topics.length >= 25, 'в диалоге программы должны быть темы занятий');
  const openers = tags.filter(({ tag, attrs }) => tag === 'a' && Object.hasOwn(attrs, 'data-syllabus'));
  assert.ok(openers.length >= 2, 'должно быть минимум 2 ссылки на программу');
  for (const { attrs } of openers) {
    assert.equal(attrs.href, 'assets/programma-kursa.pdf', 'ссылка программы ведёт на локальный PDF (работает без JS)');
    assert.ok(!Object.hasOwn(attrs, 'data-resource'), 'ссылка программы — не внешний ресурс');
  }
  const download = tags.find(({ tag, attrs }) => tag === 'a' && Object.hasOwn(attrs, 'download'));
  assert.ok(download, 'нет кнопки скачивания файла программы');
  assert.equal(download.attrs.href, 'assets/programma-kursa.docx');
});

test('HTML: правила итоговой аттестации — диалог-вьювер из материалов 06', htmlOptions, () => {
  assert.equal(byId('assessment-viewer')?.tag, 'dialog');
  assert.ok(byId('assessment-title'), 'нет заголовка диалога аттестации');
  const plain = html.replace(/<!--[\s\S]*?-->/g, '');
  const dialogHtml = plain.match(/<dialog\b[^>]*id="assessment-viewer"[^>]*>([\s\S]*?)<\/dialog\s*>/i);
  assert.ok(dialogHtml, 'диалог аттестации не найден в разметке');
  for (const marker of ['30% лабораторных', 'итоговое тестирование', 'НОРАД', 'экспертным жюри']) {
    assert.ok(dialogHtml[1].includes(marker), `в диалоге аттестации нет «${marker}»`);
  }
  const openers = tags.filter(({ tag, attrs }) => tag === 'a' && Object.hasOwn(attrs, 'data-assessment'));
  assert.ok(openers.length >= 1, 'строка 06 в материалах должна открывать диалог аттестации');
  for (const { attrs } of openers) {
    assert.equal(attrs.href, '#assessment-viewer');
    assert.ok(!Object.hasOwn(attrs, 'data-resource'), 'вьювер аттестации — не внешний ресурс');
  }
});

test('HTML: лабораторные работы — диалог-вьювер со списком из 14 работ', htmlOptions, () => {
  assert.equal(byId('labs-viewer')?.tag, 'dialog');
  assert.ok(byId('labs-title'), 'нет заголовка диалога лабораторных');
  const plain = html.replace(/<!--[\s\S]*?-->/g, '');
  const dialogHtml = plain.match(/<dialog\b[^>]*id="labs-viewer"[^>]*>([\s\S]*?)<\/dialog\s*>/i);
  assert.ok(dialogHtml, 'диалог лабораторных не найден в разметке');
  const items = dialogHtml[1].match(/<li>/g) || [];
  assert.equal(items.length, 14, 'в диалоге должно быть ровно 14 лабораторных работ');
  const openers = tags.filter(({ tag, attrs }) => tag === 'a' && Object.hasOwn(attrs, 'data-labs'));
  assert.ok(openers.length >= 1, 'строка 03 в материалах должна открывать диалог лабораторных');
  for (const { attrs } of openers) {
    assert.equal(attrs.href, '#labs-viewer');
    assert.ok(!Object.hasOwn(attrs, 'data-resource'), 'вьювер лабораторных — не внешний ресурс');
  }
});

test('HTML: GIF-панели сохраняют контракт паузы (постер + кнопка)', htmlOptions, () => {
  const toggles = tags.filter(({ tag, attrs }) => tag === 'button' && Object.hasOwn(attrs, 'data-gif-toggle'));
  assert.ok(toggles.length >= 3, 'должно быть минимум 3 кнопки паузы GIF');
  for (const { attrs } of toggles) {
    assert.equal(attrs['aria-pressed'], 'false');
    assert.ok(attrs['aria-label'], 'кнопка паузы без aria-label');
  }
  const posters = tags.filter(({ tag, attrs }) => tag === 'img' && (attrs.class || '').includes('gif-poster'));
  assert.equal(posters.length, toggles.length, 'у каждого GIF должен быть постер');
  for (const { attrs } of posters) {
    assert.ok(Object.hasOwn(attrs, 'hidden'), 'постер должен стартовать скрытым');
  }
});
