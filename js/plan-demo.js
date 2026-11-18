/**
 * Demo del agente (plan Agentico): la conversacion se escribe sola, llega una
 * foto, tres propuestas, un PDF, una cita y al final se mueven las metricas.
 * Se repite en bucle y se detiene cuando la seccion sale de pantalla.
 */
(function () {
  'use strict';

  var chat = document.getElementById('chatDemo');
  if (!chat) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bubbles = Array.prototype.slice.call(chat.querySelectorAll('.bubble'));
  var agenda = chat.querySelector('.mc-agenda');
  var typing = chat.querySelector('.mc-typing');
  var counters = Array.prototype.slice.call(chat.querySelectorAll('[data-count]'));
  var timers = [];
  var running = false;
  var visible = true;

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function reset() {
    bubbles.forEach(function (b) { b.classList.remove('is-on'); });
    if (agenda) agenda.classList.remove('is-on');
    if (typing) typing.classList.remove('is-on');
    counters.forEach(function (c) { c.textContent = '0'; });
  }

  function countUp() {
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var start = Date.now();
      function tick() {
        var p = Math.min(1, (Date.now() - start) / 900);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1 && running) window.requestAnimationFrame(tick);
      }
      tick();
    });
  }

  function play() {
    if (!visible) return;
    running = true;
    clearTimers();
    reset();

    if (reduce) {
      bubbles.forEach(function (b) { b.classList.add('is-on'); });
      if (agenda) agenda.classList.add('is-on');
      countUp();
      return;
    }

    var t = 500;
    bubbles.forEach(function (b) {
      var isBot = b.classList.contains('bot');
      if (isBot && typing) {
        later(function () { typing.classList.add('is-on'); }, t);
        t += 620;
        later(function () { typing.classList.remove('is-on'); }, t);
      }
      later(function () { b.classList.add('is-on'); }, t);
      t += isBot ? 1150 : 850;
    });

    later(function () {
      if (agenda) agenda.classList.add('is-on');
      countUp();
    }, t);

    later(function () {
      running = false;
      play();
    }, t + 5200);
  }

  if ('IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !running) play();
        if (!visible) { running = false; clearTimers(); }
      });
    }, { threshold: 0.25 });
    seen.observe(chat);
  } else {
    play();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; clearTimers(); }
    else if (visible) play();
  });
})();
