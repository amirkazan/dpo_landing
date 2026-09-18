/*
 * Hero-сцена (ES-модуль): порт HeroScene.tsx из эталонного Next.js-проекта
 * «TRAJ/STORE» на vanilla Three.js (assets/vendor/three.module.js).
 *
 * Прогрессивное улучшение: при любой ошибке (нет WebGL, file:// без сервера,
 * отключённые модули) слой blueprint-grid под canvas остаётся видимым —
 * hero оформлен и без 3D. Ошибки проглатываются, pageerror не создаём.
 * prefers-reduced-motion: один статичный кадр без animation loop.
 */
(function () {
  'use strict';

  var container = document.querySelector('.hero-3d');
  if (!container) {
    return;
  }
  var canvas = container.querySelector('canvas');
  if (!canvas) {
    return;
  }

  function reducedMotion() {
    return typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function seededRandom(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Призрачная орбитальная дуга (как proceduralArc в источнике).
  function proceduralArc(seed, displayRadius, samples) {
    var rnd = seededRandom(seed);
    var r = displayRadius * (0.92 + rnd() * 0.62);
    var incl = (10 + rnd() * 70) * (Math.PI / 180);
    var phase = rnd() * Math.PI * 2;
    var span = (80 + rnd() * 160) * (Math.PI / 180);
    var wobble = r * 0.03 * rnd();
    var cosI = Math.cos(incl);
    var sinI = Math.sin(incl);
    var pts = [];
    for (var i = 0; i < samples; i += 1) {
      var th = phase + (i / (samples - 1) - 0.5) * span;
      var rr = r + wobble * Math.sin(3 * th + phase);
      pts.push([rr * Math.cos(th), rr * Math.sin(th) * sinI * 0.9, rr * Math.sin(th) * cosI]);
    }
    return pts;
  }

  function boot(THREE) {
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#04070d', 20, 46);
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    camera.position.set(0, 4.4, 17.5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight('#ffffff', 0.4));

    var group = new THREE.Group();
    scene.add(group);

    // Планета: почти чёрное ядро + wireframe + дымка.
    var planet = new THREE.Mesh(
      new THREE.SphereGeometry(4.1, 48, 48),
      new THREE.MeshStandardMaterial({
        color: '#060b14', roughness: 0.95, metalness: 0.1,
        emissive: '#0a1826', emissiveIntensity: 0.55
      })
    );
    group.add(planet);
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(4.16, 24, 24),
      new THREE.MeshBasicMaterial({ color: '#45d8ff', wireframe: true, transparent: true, opacity: 0.075 })
    ));
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(4.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#45d8ff', transparent: true, opacity: 0.035 })
    ));

    // Пять призрачных орбитальных дуг.
    for (var i = 0; i < 5; i += 1) {
      var pts = proceduralArc(1000 + i * 77, 8.6, 260).map(function (p) {
        return new THREE.Vector3(p[0], p[1], p[2]);
      });
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: '#24405f', transparent: true, opacity: 0.85
      })));
    }

    // Кометы-спутники: яркое ядро + прозрачная оболочка.
    function makeComet(radius, speed, offset, color, tilt) {
      var holder = new THREE.Group();
      var core = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshBasicMaterial({ color: color })
      );
      var halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.18 })
      );
      holder.add(core, halo);
      group.add(holder);
      return { holder: holder, radius: radius, speed: speed, offset: offset, tilt: tilt };
    }
    var comets = [
      makeComet(9.6, 0.11, 0, '#3df5a6', 0.32),
      makeComet(11.4, 0.07, 2.4, '#45d8ff', -0.18),
      makeComet(10.3, 0.09, 4.6, '#ffb454', 0.55)
    ];

    // Сетка-планшет под сценой (замена drei Grid).
    var grid = new THREE.GridHelper(60, 50, '#1e3a5c', '#14243c');
    grid.position.y = -9.5;
    if (grid.material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.6;
    }
    scene.add(grid);

    // Звёздное поле (замена drei Stars).
    var starCount = 2000;
    var positions = new Float32Array(starCount * 3);
    var srnd = seededRandom(20260918);
    for (var s = 0; s < starCount; s += 1) {
      // Случайная точка в шаровом слое radius 70, depth 40 (как в drei Stars).
      var theta = srnd() * Math.PI * 2;
      var phi = Math.acos(2 * srnd() - 1);
      var rad = 30 + srnd() * 70;
      positions[s * 3] = rad * Math.sin(phi) * Math.cos(theta);
      positions[s * 3 + 1] = rad * Math.cos(phi) * 0.7;
      positions[s * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: '#cdd8ea', size: 0.16, sizeAttenuation: true,
      transparent: true, opacity: 0.75, fog: false
    }));
    scene.add(stars);

    function resize() {
      var w = container.clientWidth || 1;
      var h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function moveComets(time) {
      for (var c = 0; c < comets.length; c += 1) {
        var comet = comets[c];
        var t = time * comet.speed + comet.offset;
        comet.holder.position.set(
          Math.cos(t) * comet.radius,
          Math.sin(t) * comet.radius * Math.sin(comet.tilt),
          Math.sin(t) * comet.radius
        );
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    container.classList.add('is-live');

    if (reducedMotion()) {
      // Один статичный кадр, без animation loop.
      moveComets(12);
      group.rotation.y = 0.6;
      renderer.render(scene, camera);
      return;
    }

    var clock = new THREE.Clock();
    var rafId = 0;
    var running = true;

    function frame() {
      if (!running) {
        return;
      }
      var delta = clock.getDelta();
      group.rotation.y += delta * 0.045;
      moveComets(clock.elapsedTime);
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(frame);
    }
    rafId = window.requestAnimationFrame(frame);

    // Не жечь GPU, когда hero вне вьюпорта или вкладка скрыта.
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function (entries) {
        var visible = entries[0] && entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          clock.getDelta();
          rafId = window.requestAnimationFrame(frame);
        } else if (!visible && running) {
          running = false;
          window.cancelAnimationFrame(rafId);
        }
      }, { threshold: 0.02 }).observe(container);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && running) {
        running = false;
        window.cancelAnimationFrame(rafId);
      } else if (!document.hidden && !running) {
        running = true;
        clock.getDelta();
        rafId = window.requestAnimationFrame(frame);
      }
    });
  }

  import('./assets/vendor/three.module.js')
    .then(boot)
    .catch(function () {
      // Нет WebGL/модулей/file:// — остаётся blueprint-grid fallback.
      container.classList.add('is-fallback');
    });
})();
