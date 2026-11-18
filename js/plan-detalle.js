/**
 * Detalle de plan · interacciones
 * 1) Chispas de forja sobre un canvas fijo (color segun el plan).
 * 2) Aparicion de bloques al hacer scroll.
 * 3) Demo de conversacion en el plan Agentico.
 * Respeta "prefers-reduced-motion".
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('js-reveal');

  /* ---------- chispas ---------- */
  var canvas = document.getElementById('embers');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var tint = canvas.getAttribute('data-tint') || '216,164,74';
    var parts = [];
    var w = 0, h = 0, raf = 0;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make() {
      return {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 60,
        r: Math.random() * 1.6 + 0.5,
        vy: -(0.25 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.2,
        life: 0
      };
    }

    function build() {
      var total = window.innerWidth < 700 ? 26 : 48;
      parts = [];
      for (var i = 0; i < total; i++) parts.push(make());
    }

    function frame() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        var fade = p.life < 40 ? p.life / 40 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + tint + ',' + (p.a * fade).toFixed(3) + ')';
        ctx.fill();
        if (p.y < -20 || p.x < -30 || p.x > window.innerWidth + 30) parts[i] = make();
      }
      raf = window.requestAnimationFrame(frame);
    }

    size();
    build();
    frame();

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { size(); build(); }, 180);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
      } else {
        raf = window.requestAnimationFrame(frame);
      }
    });
  }

  /* ---------- aparicion al hacer scroll ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (targets.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
    } else {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          seen.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      Array.prototype.forEach.call(targets, function (el) { seen.observe(el); });
    }
  }

  /* ---------- demo de conversacion ---------- */
  var chat = document.getElementById('agentChat');
  if (chat) {
    var bubbles = Array.prototype.slice.call(chat.querySelectorAll('.bubble'));
    if (reduce) {
      bubbles.forEach(function (b) { b.classList.add('is-on'); });
    } else {
      var i = 0;
      function next() {
        if (i < bubbles.length) {
          bubbles[i].classList.add('is-on');
          i += 1;
          window.setTimeout(next, 950);
          return;
        }
        window.setTimeout(function () {
          bubbles.forEach(function (b) { b.classList.remove('is-on'); });
          i = 0;
          window.setTimeout(next, 650);
        }, 5200);
      }
      window.setTimeout(next, 800);
    }
  }
})();
