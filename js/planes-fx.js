/**
 * Humo de pantalla del capitulo de planes.
 * La capa (.plans-fog) vive fuera de las tarjetas: es una niebla fija al pie
 * de la ventana que se enciende cuando el cursor entra en un plan y toma el
 * color de ese plan. Sin dependencias.
 */
(function () {
  'use strict';

  var section = document.getElementById('planes');
  if (!section) return;
  var fog = section.querySelector('.plans-fog');
  if (!fog) return;

  /* el plan de papel no lleva humo: es una tarjeta clara y el velo la ensucia */
  var TONES = {
    'plan-inter': 'rgba(255,180,116,.92)',
    'plan-elite': 'rgba(255,214,152,.98)',
    'plan-agentic': 'rgba(126,240,216,.90)'
  };

  function planKey(card) {
    var keys = Object.keys(TONES);
    for (var i = 0; i < keys.length; i++) {
      if (card.classList.contains(keys[i])) return keys[i];
    }
    return null;
  }

  function turnOn(card) {
    var key = planKey(card);
    if (!key) return;
    fog.style.setProperty('--fog', TONES[key]);
    fog.classList.add('is-on');
  }

  function turnOff() {
    fog.classList.remove('is-on');
  }

  Array.prototype.forEach.call(section.querySelectorAll('.plan'), function (card) {
    card.addEventListener('mouseenter', function () { turnOn(card); });
    card.addEventListener('mouseleave', turnOff);
    card.addEventListener('focusin', function () { turnOn(card); });
    card.addEventListener('focusout', turnOff);
  });

  /* al cambiar de capitulo el puntero ya no esta sobre el plan */
  document.addEventListener('seqarrive', turnOff);
  window.addEventListener('wheel', turnOff, { passive: true });
  window.addEventListener('touchstart', turnOff, { passive: true });
})();
