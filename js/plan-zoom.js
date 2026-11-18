/**
 * Visor de la tarjeta de plan.
 * Al hacer clic en una card del capitulo de planes, la card sale de la grilla,
 * se centra en pantalla con todo su contenido visible y el resto queda
 * desenfocado. Al hacer clic fuera (o Esc) vuelve a su sitio, con la misma
 * animacion de entrada y salida (FLIP). Sin dependencias.
 */
(function () {
  'use strict';

  var section = document.getElementById('planes');
  if (!section) return;

  var overlay = document.createElement('div');
  overlay.className = 'plan-zoom';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="pz-backdrop" data-pz-close></div>' +
    '<button type="button" class="pz-close" data-pz-close aria-label="Cerrar la tarjeta">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '</button>' +
    '<div class="pz-stage">' +
      '<div class="pz-holder" role="dialog" aria-modal="true" aria-label="Detalle del plan"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var holder = overlay.querySelector('.pz-holder');
  var stage = overlay.querySelector('.pz-stage');
  var closeBtn = overlay.querySelector('.pz-close');
  var card = null;
  var opening = false;
  var EASE_IN = 'cubic-bezier(.22,.8,.3,1)';
  var EASE_OUT = 'cubic-bezier(.4,0,.75,1)';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function lock(on) {
    document.documentElement.classList.toggle('plan-zoom-open', on);
    document.documentElement.classList.toggle('seq-locked', on);
  }

  function flipFrom(from, to, node, duration) {
    var dx = from.left + from.width / 2 - (to.left + to.width / 2);
    var dy = from.top + from.height / 2 - (to.top + to.height / 2);
    var sx = from.width / to.width;
    var sy = from.height / to.height;
    return node.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: .55 },
      { transform: 'none', opacity: 1 }
    ], { duration: reduce ? 1 : duration, easing: EASE_IN, fill: 'both' });
  }

  /*
   * Las calaveras del visor se miden contra la banda de arte, que cambia de alto
   * según la proporción de cada arte (900x334 en Élite, 1200x188 en Agéntico).
   * Se deja el alto en una variable CSS para que siempre queden dentro del marco.
   */
  function sizeSkulls(node) {
    var art = node.querySelector('.plan-art');
    if (!art) return;
    var apply = function () {
      var h = art.offsetHeight;   /* alto de layout: no lo afecta la animación FLIP */
      if (h > 20) node.style.setProperty('--pz-art-h', Math.round(h) + 'px');
    };
    apply();
    var img = art.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', apply, { once: true });
    window.requestAnimationFrame(apply);
  }

  function open(planCard) {
    if (card || opening) return;
    opening = true;
    card = planCard;
    var origin = planCard.getBoundingClientRect();

    var clone = planCard.cloneNode(true);
    clone.classList.add('plan-zoom-card');
    clone.removeAttribute('id');
    Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (el) {
      el.removeAttribute('id');
    });
    holder.innerHTML = '';
    holder.appendChild(clone);

    overlay.hidden = false;
    lock(true);
    stage.scrollTop = 0;
    sizeSkulls(clone);

    var target = clone.getBoundingClientRect();
    if (!reduce) flipFrom(origin, target, clone, 440);
    closeBtn.focus({ preventScroll: true });
    opening = false;
  }

  function close() {
    if (!card) return;
    var planCard = card;
    var clone = holder.firstElementChild;
    var origin = planCard.getBoundingClientRect();
    var anim = clone && !reduce ? flipFrom(origin, clone.getBoundingClientRect(), clone, 320) : null;

    function finish() {
      holder.innerHTML = '';
      overlay.hidden = true;
      lock(false);
      card = null;
      if (planCard && planCard.focus) {
        planCard.setAttribute('tabindex', '-1');
        planCard.focus({ preventScroll: true });
        planCard.removeAttribute('tabindex');
      }
    }

    if (anim) {
      anim.reverse();
      var done = false;
      var finishOnce = function () {
        if (done) return;
        done = true;
        finish();
      };
      anim.finished.then(finishOnce, finishOnce);
      /* por si la pestaña queda en segundo plano y la animacion no avanza */
      setTimeout(finishOnce, 460);
    } else {
      finish();
    }
  }

  section.addEventListener('click', function (event) {
    if (event.target.closest('a,button')) return;
    var planCard = event.target.closest('.plan');
    if (planCard) open(planCard);
  });

  section.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('a,button')) return;
    var planCard = event.target.closest('.plan');
    if (!planCard) return;
    event.preventDefault();
    open(planCard);
  });

  overlay.addEventListener('click', function (event) {
    if (event.target.closest('[data-pz-close]')) {
      close();
      return;
    }
    /* clic en el fondo: fuera de la card */
    if (!event.target.closest('.pz-holder')) close();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && card) close();
  });

  /* al cambiar de capitulo con la card abierta, se cierra sola */
  document.addEventListener('seqarrive', function () {
    if (card) close();
  });
})();
