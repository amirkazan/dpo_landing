/*
 * Поведение лендинга (classic script, подключается после links.js).
 *
 * Прогрессивное улучшение: без JS страница полностью читается, якоря
 * #about/#materials работают нативно, секции JS никогда не скрывает.
 */
(function () {
  'use strict';

  var LINK_NOTICE_ID = 'link-notice';
  var NOTICE_TITLE_ID = 'notice-title';
  var MENU_TOGGLE_ID = 'menu-toggle';
  var NAV_ID = 'site-nav';
  var EXTERNAL_TARGET = '_blank';
  var EXTERNAL_REL = 'noopener noreferrer';
  var HTTP_URL_RE = /^https?:\/\//i;

  function getConfig() {
    if (typeof window === 'undefined' || !window.COURSE_LINKS) {
      return {};
    }
    return window.COURSE_LINKS;
  }

  // Из конфига берём только реальные http/https-ссылки; null, незаполненный
  // ключ или чужая схема означают «материал пока не доступен».
  function resolveResourceUrl(resource) {
    var config = getConfig();
    if (!resource || !Object.prototype.hasOwnProperty.call(config, resource)) {
      return null;
    }
    var url = config[resource];
    if (typeof url !== 'string' || !HTTP_URL_RE.test(url)) {
      return null;
    }
    try {
      var parsed = new URL(url);
      if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname) {
        return url;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function applyResourceLinks(doc) {
    var links = doc.querySelectorAll('a[data-resource]');
    Array.prototype.forEach.call(links, function (link) {
      var url = resolveResourceUrl(link.getAttribute('data-resource'));
      if (url) {
        link.setAttribute('href', url);
        link.setAttribute('target', EXTERNAL_TARGET);
        link.setAttribute('rel', EXTERNAL_REL);
        return;
      }
      link.setAttribute('href', '#' + LINK_NOTICE_ID);
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.addEventListener('click', function (event) {
        if (openLinkNotice(link)) {
          event.preventDefault();
        }
      });
    });
  }

  function openLinkNotice(link) {
    var dialog = document.getElementById(LINK_NOTICE_ID);
    if (!dialog || typeof dialog.showModal !== 'function') {
      return false;
    }

    var title = document.getElementById(NOTICE_TITLE_ID);
    if (title) {
      var label = (link.getAttribute('data-label') || '').trim() || (link.textContent || '').trim();
      title.textContent = label || 'Материал курса';
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    return true;
  }

  function applyDialogControls(doc) {
    var dialog = doc.getElementById(LINK_NOTICE_ID);
    if (!dialog) {
      return;
    }

    Array.prototype.forEach.call(doc.querySelectorAll('[data-close-dialog]'), function (button) {
      button.addEventListener('click', function () {
        if (typeof dialog.close === 'function') {
          dialog.close();
        }
      });
    });

    // Необязательное удобство: клик по подложке (backdrop) закрывает диалог.
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog || !dialog.open || typeof dialog.close !== 'function') {
        return;
      }
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close();
      }
    });
  }

  function applyMenu(doc) {
    var toggle = doc.getElementById(MENU_TOGGLE_ID);
    var nav = doc.getElementById(NAV_ID);
    if (!toggle || !nav) {
      return;
    }

    function setMenuOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    setMenuOpen(false);

    toggle.addEventListener('click', function () {
      setMenuOpen(!nav.classList.contains('is-open'));
    });

    // Любая ссылка в меню (включая якоря #about/#materials) закрывает его;
    // preventDefault не вызываем — переход по якорю остаётся нативным.
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      });
    });

    doc.addEventListener('keydown', function (event) {
      if (event && event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenuOpen(false);
      }
    });
  }

  // Отмечаем наличие JS: CSS-фичи вроде reveal-анимаций включаются только под .js,
  // чтобы без скриптов контент оставался полностью видимым.
  function markJs(doc) {
    var root = doc.documentElement;
    if (root && root.classList && typeof root.classList.toggle === 'function') {
      root.classList.toggle('js', true);
    }
  }

  function prefersReducedMotion() {
    return typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Плавное появление блоков при скролле.
  function applyReveal(doc) {
    if (typeof IntersectionObserver !== 'function') {
      return;
    }
    var items = doc.querySelectorAll('[data-reveal]');
    if (!items.length) {
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(items, function (item) {
      observer.observe(item);
    });
  }

  // Тень шапки при скролле и плавающая кнопка «наверх».
  function applyScrollUI(doc) {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function' ||
        typeof doc.querySelector !== 'function') {
      return;
    }
    var header = doc.querySelector('.site-header');
    var toTop = doc.querySelector('.to-top');
    function onScroll() {
      var y = typeof window.scrollY === 'number' ? window.scrollY : 0;
      if (header) {
        header.classList.toggle('is-scrolled', y > 10);
      }
      if (toTop) {
        toTop.classList.toggle('is-visible', y > 600);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Пауза/запуск зацикленных GIF через подмену на статичный постер.
  function setGifPaused(figure, button, paused) {
    var anim = figure.querySelector('.gif-anim');
    var poster = figure.querySelector('.gif-poster');
    if (anim) {
      anim.hidden = paused;
    }
    if (poster) {
      poster.hidden = !paused;
    }
    button.classList.toggle('is-paused', paused);
    button.setAttribute('aria-pressed', paused ? 'true' : 'false');
    button.setAttribute('aria-label', paused ? 'Запустить анимацию' : 'Поставить анимацию на паузу');
  }

  function applyGifToggles(doc) {
    var buttons = doc.querySelectorAll('[data-gif-toggle]');
    var pausedByDefault = prefersReducedMotion();
    Array.prototype.forEach.call(buttons, function (button) {
      var figure = typeof button.closest === 'function' ? button.closest('figure') : null;
      if (!figure) {
        return;
      }
      if (pausedByDefault) {
        setGifPaused(figure, button, true);
      }
      button.addEventListener('click', function () {
        setGifPaused(figure, button, !button.classList.contains('is-paused'));
      });
    });
  }

  // Подсветка активного раздела в меню.
  function applyNavSpy(doc) {
    if (typeof IntersectionObserver !== 'function') {
      return;
    }
    var nav = doc.getElementById(NAV_ID);
    if (!nav) {
      return;
    }
    var byHash = {};
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        byHash[href.slice(1)] = link;
      }
    });
    var sections = doc.querySelectorAll('main section[id]');
    if (!sections.length) {
      return;
    }
    var spy = new IntersectionObserver(function (entries) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var active = byHash[entry.target.getAttribute('id')];
        if (!active) {
          return;
        }
        Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
          if (link === active) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Array.prototype.forEach.call(sections, function (section) {
      spy.observe(section);
    });
  }

  function init(doc) {
    markJs(doc);
    applyResourceLinks(doc);
    applyDialogControls(doc);
    applyMenu(doc);
    applyReveal(doc);
    applyScrollUI(doc);
    applyGifToggles(doc);
    applyNavSpy(doc);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        init(document);
      });
    } else {
      init(document);
    }
  }
})();
