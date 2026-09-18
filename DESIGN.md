# Дизайн-система лендинга ДПО — «инженерная консоль»

Источник истины для любых правок UI. Система портирована из эталонного
Next.js-проекта «TRAJ/STORE» (`async-trajectory-batch-saving/src/app/globals.css`,
`src/components/ui.tsx`, `src/components/nav.tsx`, `src/components/three/HeroScene.tsx`)
и зафиксирована как сознательное решение. Макеты Canva больше не являются
источником дизайна.

Перед изменением интерфейса прочитай этот файл целиком и переиспользуй токены.
Не вводи одноразовые цвета, размеры, радиусы, тени и отступы вне системы.

## Направление

Тёмная «инженерная консоль»: почти чёрный фон, острые панели с тонкими
1px-рамками, blueprint-сетка, scanlines и film grain, моноширинные кикеры
формата `// ТЕКСТ`, крупные uppercase display-заголовки, акценты mint/cyan,
табличные цифры. Эстетика пульта/телеметрии, а не маркетингового SaaS.

Приоритет UX: читаемость, сканируемость, понятная навигация, доступность,
работа без JS и при `prefers-reduced-motion`.

## Цвета (`:root` в `styles.css`)

| Токен | Значение | Роль |
| --- | --- | --- |
| `--abyss` | `#04070d` | фон страницы |
| `--hull` | `#080d16` | фон карточек pipeline |
| `--panel` | `#0a1120` | фон hover-состояний, диалог |
| `--edge` | `#16233a` | рамки 1px, разделители |
| `--mist` | `#8fa3bf` | вторичный текст |
| `--ghost` | `#cdd8ea` | основной текст |
| `--ice` | `#eef4ff` | заголовки, акцентный текст |
| `--mint` | `#3df5a6` | primary-акцент: кнопки, кикеры, уголки |
| `--cyan-glow` | `#45d8ff` | secondary-акцент: ссылки, wireframe |
| `--amber-hot` | `#ffb454` | редкий тёплый акцент (комета, осторожно) |
| `--rose-alert` | `#ff5c7a` | только ошибки/алерты |

Прозрачные производные: рамки панелей `rgba(140,200,255,.1)`, кикер
`rgba(61,245,166,.8)`, уголки `rgba(61,245,166,.6)`, разделители
`rgba(22,35,58,.5–.6)`.

Фон `body`: два радиальных свечения (cyan сверху справа, mint снизу слева,
opacity .07/.05) поверх `--abyss`. Других градиентных заливок секций нет —
секции отличаются только `.section-hull` (`rgba(8,13,22,.55)` + hairline
сверху/снизу).

## Типографика

Локальные self-hosted шрифты (`assets/fonts/`, woff2, `font-display:swap`,
URL внутри `fonts.css` относительные к самому `fonts.css`). Внешние CDN
запрещены.

- Display (заголовки, цифры stats): **Space Grotesk** (variable 400–700,
  ТОЛЬКО латиница — кириллицы в шрифте нет) → **Manrope** (variable 200–800,
  кириллица+латиница) → system sans. Кириллица рендерится Manrope — это
  осознанный fallback, шрифты близки по духу.
- Mono (кикеры, кнопки, навигация, строки материалов): **JetBrains Mono**
  (400, 700) → monospace.

Шкала:

| Элемент | Параметры |
| --- | --- |
| `.hero-title` | 700, `clamp(30px,5.4vw,72px)`, lh 1.02, ls −.03em, uppercase |
| `.display` (H2 секций) | 700, `clamp(30px,4.4vw,58px)`, lh 1.04, ls −.03em, uppercase |
| `.kicker` | mono 10px, uppercase, ls .32em, `rgba(61,245,166,.8)`, формат `// ТЕКСТ` |
| `.section-lead` | 15px, lh 1.7, `--mist`, max-width 640px |
| Кнопки `.btn` | 600 mono 12px, uppercase, ls .18em |
| Навигация | mono 11px, uppercase, ls .18em, `--mist` → `--ice`/`--mint` |
| `.panel-tag` (H3 панелей) | 700 mono 11px, uppercase, ls .2em, `--mint` |
| Тело панелей | 14–14.5px, lh 1.65–1.7, `--ghost`/`--mist`, обычный регистр |
| `.stat-value` | display 600, `clamp(28px,3vw,40px)`, tabular-nums |
| Футер/тикер/подписи | mono 10px, uppercase, ls .2–.24em, mist с прозрачностью |
| `.mono-link` | mono 11px, uppercase, ls .18em, `--cyan-glow`, нижняя hairline |

Цифры всегда `tabular-nums`. Uppercase mono — только для коротких подписей;
длинные тексты — обычный регистр.

## Отступы и сетка

- Контейнер: `min(1240px, 100% − 96px)`; ≤800px: `100% − 40px`; ≤560px: `100% − 36px`.
- Паддинги секций: 96px desktop → 76px (≤1023px) → 64px (≤560px).
- Шапка: `--header-h: 64px`, `scroll-padding-top: header + 24px`.
- Сетки: карточки через `gap:1px` по фону `edge` (тонкие разделители),
  панели — `gap:18px`, секции-заголовки → контент: `margin-top:44px`.

## Формы

- Радиусов нет. Все панели, кнопки, диалог, «наверх» — острые углы.
- Единственные «круги»: `.status-dot`, `.blink-dot` (точки статуса).
- Рамки 1px предпочтительнее теней; тень только у mint-кнопки
  (`box-shadow: 0 0 36px rgba(61,245,166,.5)` на hover).

## Компоненты

- `.btn-primary` — заливка `--mint`, текст `--abyss`, hover — mint-свечение.
  Одно primary-действие на экран.
- `.btn-ghost` — рамка `--edge`, полупрозрачный `--hull`, hover — рамка и
  текст cyan.
- `.header-cta` — контурная mint-кнопка в шапке; ≤800px скрыта (есть в меню
  и hero).
- `.panel-line` — полупрозрачная панель: `border:1px solid rgba(140,200,255,.1)`,
  градиент hull→abyss, `backdrop-filter: blur(10px)`.
- `.corner-ticks` — уголки 14×14px по диагонали (top-left + bottom-right),
  `rgba(61,245,166,.6)`. Ставятся поверх `.panel-line`.
- `.pipeline-card` — карточка в grid `gap:1px`: фон `--hull`, hover `--panel`;
  `.pipeline-num` — призрачный номер 46px справа сверху (`--edge`, hover →
  `rgba(61,245,166,.25)`).
- `.stats-band` — лента 2→4 колонки, `gap:1px` по `edge`, числа count-up
  (JS только анимирует; финальные значения отрендерены в HTML).
- `.edu-strip` — узкая цитатная лента с маркером `//`.
- `.mat-row` — строка материала: mono uppercase, номер `--mist`, стрелка `↗`
  справа, hover `translateX(10px)` + текст mint.
- `.faq-item` — `details/summary`, hairline-панель, маркер `+`/`−` на CSS
  (`summary::after`); работает без JS.
- `.gif-toggle` — квадрат 42px поверх GIF, иконки пауза/play на чистом CSS,
  `aria-pressed`; логика подмены на постер в `app.js`.
- `.ticker` — бегущая строка внизу hero: две одинаковые `.ticker-group`,
  `animation: ticker 36s linear infinite`, `mask-image` по краям, разделитель
  `▚` цвета `rgba(61,245,166,.5)`. `aria-hidden="true"`.
- `.blink-dot` — мигающая точка статуса (`@keyframes blink`).
- `dialog#link-notice` — уведомление о незаполненной ссылке; закрытие кнопкой,
  Escape, кликом по подложке.
- `.to-top` — квадратная кнопка «наверх» после 600px скролла (только под `.js`).

## Текстуры и декор (только эти приёмы)

- `.blueprint-grid` — инженерная сетка 36px (`rgba(140,200,255,.055)` линии):
  fallback-слой hero и фон contact-панели.
- `.scanlines::after` — CRT-полосы (`repeating-linear-gradient` +
  `mix-blend-mode: overlay`), только hero.
- `body::before` — film grain (SVG feTurbulence data-URI, opacity .05,
  `animation: grain 7s steps(8)`), поверх всего, `pointer-events:none`.
- `.text-glow-mint` — mint-текст со свечением
  (`text-shadow: 0 0 18px …, 0 0 60px …`).
- Весь декор — `aria-hidden="true"`, без пересечения с текстом.

## Hero с Three.js (vendored)

- `hero-scene.js` — ES-модуль, vanilla-порт `HeroScene.tsx`: тёмная сфера
  (r≈4.1, `#060b14`, emissive `#0a1826`), wireframe-сфера cyan (opacity .075),
  дымка (opacity .035), 5 процедурных призрачных дуг (`#24405f`, seededRandom),
  3 кометы (mint/cyan/amber), `GridHelper` (`#1e3a5c`/`#14243c`, y=−9.5),
  ~2000 звёзд (Points), fog `#04070d` 20→46, вращение группы `delta*0.045`.
- Three.js vendored: `assets/vendor/three.module.js` + обязательный
  `assets/vendor/three.core.js` (модуль импортирует его). Загрузка через
  dynamic `import()` в try/catch: любая ошибка (нет WebGL, file://) →
  класс `is-fallback`, виден blueprint-grid. Pageerror недопустим.
- `.hero-3d` и `.hero-vignette` — `aria-hidden`; затемнение по краям —
  `radial-gradient(transparent 38%, rgba(4,7,13,.72))`.
- `prefers-reduced-motion`: один статичный кадр, без animation loop.
- С паузой вне вьюпорта/скрытой вкладкой (IntersectionObserver +
  visibilitychange).

## Состояния (обязательны)

- hover: primary — свечение; ghost — cyan; mat-row — сдвиг; pipeline-card —
  смена фона и подсветка номера.
- focus-visible: `outline: 2px solid var(--mint); outline-offset: 3px` у всех
  интерактивных (включая `summary`).
- `prefers-reduced-motion`: глобально без анимаций и smooth-scroll; reveal
  отключён; тикер и grain остановлены; 3D — статичный кадр; GIF на паузе.
- Без JS: весь контент виден (reveal только под `html.js`), якоря нативные,
  финальные значения stats в HTML, есть `<noscript>`-предупреждение,
  blueprint-grid в hero.
- Незаполненные ссылки (`links.js` = `null`) открывают диалог, а не фиктивные
  страницы.

## Анти-паттерны (запрещено)

- Пилюли (`border-radius: 999px`), градиентные кнопки и глассморфизм из
  старой Canva-системы, «блобы», SVG-орбиты на CSS — это прошлая тема.
- Новые цвета/тени/радиусы вне токенов; одноразовые значения «под глаз».
- Внешние шрифты, CDN-библиотеки, трекеры, аналитика (three.js — только
  vendored локальный).
- Эмодзи как иконки интерфейса; иконки без `aria-label`.
- Выдуманные URL и QR-коды; фиктивная регистрация; «lorem ipsum».
- Скрытие контента средствами только JS; горизонтальный скролл на любой ширине.

## Медиа

- Фото/GIF — только локальные из `assets/`; источники — `originals/`
  (не публикуются).
- GIF зациклены, у каждого постер `*-poster.webp` (`hidden`) и кнопка паузы.
  Важно: правило `[hidden]{display:none !important}` в `styles.css` обязательно
  — авторский `img{display:block}` иначе перебивает UA-стиль `hidden`.
- Логотипы: `logo-kadry.webp`, `logo-fakt.webp` — белые на прозрачном; не
  перекрашивать.
- `assets/vendor/three.module.js` + `three.core.js` — vendored Three.js;
  не обновлять без необходимости, держать парой.

## Проверка перед завершением работы

1. `node --test tests.mjs` — контракт ссылок/диалога/меню/hero/stats/GIF.
2. `node visual-qa.mjs` — рендер в Chromium на 1440/1024/768/390/320:
   переполнение, загрузка изображений, якоря, диалог, меню, пауза GIF,
   reveal, «наверх», ошибки JS; скриншоты в `qa/`. type="module" на file://
   не грузится — 3D там не живёт, но pageerror быть не должно.
3. `node qa-hero-http.mjs` — hero через локальный http-сервер: сцена
   `is-live`, статичный кадр при reduced-motion, скриншоты
   `qa/hero-http.png` и `qa/hero-http-reduced.png`.
4. Сверить скриншоты с этим файлом; перечислить конкретные дефекты,
   исправить, прогнать заново. Не отчитываться «выглядит хорошо» без
   скриншотов.
