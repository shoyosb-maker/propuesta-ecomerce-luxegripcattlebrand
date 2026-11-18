/**
 * Cotizador · Propuesta E-commerce 3D LuxeGrip Cattle Brand
 * Precio = plan base + sedes extra + configuradores 3D extra + módulo de IA.
 * Sin dependencias.
 */
(function () {
  'use strict';

  var PLANES = {
    esencial:   { n: 'Esencial',   base: 3900000, incluye: 1, mkt: [18000000, 26000000], mensual: 390000 },
    intermedio: { n: 'Intermedio', base: 6400000, incluye: 3, mkt: [28000000, 39000000], mensual: 690000 },
    elite:      { n: 'Élite',      base: 9900000, incluye: 5, mkt: [42000000, 58000000], mensual: 690000 }
  };
  var SEDE = 1400000;              // cada sede después de la primera
  var CONFIG = 1900000;            // configurador 3D fuera de los incluidos en el plan
  var IA_LISTA = 7200000;          // valor real del módulo de IA
  var PILOTOS = {
    a: { pct: 10, precio: 6480000 },
    b: { pct: 12, precio: 6336000 },
    c: { pct: 15, precio: 6120000 }
  };
  var PILOTO_TEXTO = {
    a: 'Descuento por venir referido por una persona de confianza · caso de estudio con métricas publicables · 3 sesiones de feedback · garantía de 90 días · firma dentro de la vigencia.',
    b: 'Todo lo del Piloto A · pago 40% al inicio, 30% en la revisión de mitad de proyecto y 30% contra entrega.',
    c: 'Todo lo del Piloto B · pago 50% al inicio y 50% contra entrega · calendario de insumos y validaciones en 48 h. Si el proyecto se retrasa por falta de insumos, el descuento vuelve a −10%.'
  };
  var MKT_IA = [12000000, 20000000];
  var SEDE_PCT = [0.45, 0.75];     // el mercado cobra +45% a +75% por sede
  var INFRA_SEDE = 190000;         // Vercel + Neon + dominio año 1, por sede
  var MENSUAL_IA = 1190000;
  var WA = '573177366474';
  var MAX_SEDES = 6;
  var MAX_CONFIG = 5;
  /* tasa de referencia para la conversion que acompana al total */
  var USD_RATE = 4000;

  var root = document.getElementById('pickPlan');
  var pilotRoot = document.getElementById('pickPiloto');
  var pilotHint = document.getElementById('pilotHint');
  var selSedes = document.getElementById('calcSedes');
  var selConfig = document.getElementById('calcConfig');
  var cfgHint = document.getElementById('cfgHint');
  var cfgMinus = document.getElementById('cfgMinus');
  var cfgPlus = document.getElementById('cfgPlus');
  var btnIa = document.getElementById('calcIa');
  var title = document.getElementById('crTitle');
  var totalEl = document.getElementById('crTotal');
  var usdEl = document.getElementById('crUsd');
  var linesEl = document.getElementById('crLines');
  var monthlyEl = document.getElementById('crMonthly');
  var infraEl = document.getElementById('crInfra');
  var marketEl = document.getElementById('crMarket');
  var ctaEl = document.getElementById('crCta');
  if (!root || !selSedes || !btnIa || !totalEl) return;

  var sedeSteps = selSedes.closest('.sedes-row').querySelectorAll('.step');
  var state = { plan: 'esencial', sedes: 1, config: 1, ia: false, piloto: 'a' };

  var nf = new Intl.NumberFormat('es-CO');
  var nfUsd = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function money(value) {
    return '$' + nf.format(Math.round(value / 1000) * 1000);
  }

  function usdNum(value) {
    var v = value / USD_RATE;
    if (Math.abs(v - Math.round(v)) < 0.005) return nf.format(Math.round(v));
    return nfUsd.format(v);
  }

  function usd(value) {
    return '/ US$ ' + usdNum(value);
  }

  /* pesos con su equivalente en dólares, como en el resto de la propuesta */
  function withUsd(value, negative) {
    var sign = negative ? '−' : '';
    return sign + money(value) + ' <span class="usd-inline">/ US$ ' + sign + usdNum(value) + '</span>';
  }

  function plural(count, one, many) {
    return count === 1 ? one : many;
  }

  function configLabel(count) {
    var names = ['Ganado', 'Caballos', 'Hebillas', 'Cachas', 'Accesorios'];
    return names.slice(0, count).join(' · ');
  }

  function render() {
    var plan = PLANES[state.plan];
    var piloto = PILOTOS[state.piloto];
    var extraSedes = state.sedes - 1;
    var extraCfg = Math.max(0, state.config - plan.incluye);
    var iaFinal = piloto.precio;
    var total = plan.base + extraSedes * SEDE + extraCfg * CONFIG + (state.ia ? iaFinal : 0);
    var nombre = state.plan === 'elite' && state.ia ? 'Agéntico' : plan.n;

    title.textContent = 'Plan ' + nombre + ' · ' + state.sedes + ' ' + plural(state.sedes, 'sede', 'sedes') +
      ' · ' + state.config + ' ' + plural(state.config, 'configurador', 'configuradores') + ' 3D';
    totalEl.textContent = nf.format(total);
    if (usdEl) usdEl.textContent = usd(total);

    var lines = '<li><span>Plan ' + plan.n + ' (incluye ' + plan.incluye + ' ' +
      plural(plan.incluye, 'configurador', 'configuradores') + ')</span><b>' + withUsd(plan.base) + '</b></li>';
    lines += '<li><span>Configuradores: ' + configLabel(state.config) + '</span><b>incluidos</b></li>';
    if (extraSedes > 0) {
      lines += '<li><span>' + extraSedes + ' ' + plural(extraSedes, 'sede adicional', 'sedes adicionales') +
        '</span><b>' + withUsd(extraSedes * SEDE) + '</b></li>';
    }
    if (extraCfg > 0) {
      lines += '<li><span>' + extraCfg + ' ' + plural(extraCfg, 'configurador adicional', 'configuradores adicionales') +
        '</span><b>' + withUsd(extraCfg * CONFIG) + '</b></li>';
    }
    if (state.ia) {
      lines += '<li><span>Módulo de IA (valor real)</span><b>' + withUsd(IA_LISTA) + '</b></li>';
      lines += '<li class="discount"><span>Piloto ' + state.piloto.toUpperCase() + ' · −' + piloto.pct +
        '% de implementación' + (state.piloto === 'a' ? ' · por referido' : '') + '</span><b>' + withUsd(IA_LISTA - piloto.precio, true) + '</b></li>';
    }
    linesEl.innerHTML = lines;

    monthlyEl.innerHTML = state.ia ? withUsd(MENSUAL_IA) + ' / mes' : withUsd(plan.mensual) + ' / mes';

    var infra = Math.round((state.sedes * INFRA_SEDE) / 1000) * 1000;
    infraEl.innerHTML = '≈ ' + withUsd(infra) + ' / mes';

    var mktMin = plan.mkt[0] * (1 + extraSedes * SEDE_PCT[0]) + (state.ia ? MKT_IA[0] : 0);
    var mktMax = plan.mkt[1] * (1 + extraSedes * SEDE_PCT[1]) + (state.ia ? MKT_IA[1] : 0);
    var ahorro = Math.round((1 - total / mktMax) * 100);
    marketEl.innerHTML = 'Equivale a <strong>' + withUsd(mktMin) + ' – ' + withUsd(mktMax) +
      '</strong> en el mercado <span>(−' + ahorro + '%)</span>';

    var texto = 'Hola, quiero cotizar el Plan ' + nombre + ' con ' + state.sedes + ' ' +
      plural(state.sedes, 'sede', 'sedes') + ', ' + state.config + ' ' +
      plural(state.config, 'configurador', 'configuradores') + ' 3D' +
      (state.ia ? ' y módulo de IA (Piloto ' + state.piloto.toUpperCase() + ')' : '') +
      '. Total estimado: ' + money(total) + '.';
    ctaEl.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto);

    Array.prototype.forEach.call(root.querySelectorAll('.pick'), function (btn) {
      var on = btn.getAttribute('data-plan') === state.plan;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    selSedes.value = String(state.sedes);
    selConfig.value = String(state.config);
    if (state.config <= plan.incluye) {
      cfgHint.innerHTML = 'El plan incluye <strong>' + plan.incluye + ' ' +
        plural(plan.incluye, 'configurador', 'configuradores') + '</strong>' +
        (plan.incluye < MAX_CONFIG ? ' · cada uno adicional suma <strong>' + withUsd(CONFIG) + '</strong>' : '');
    } else {
      cfgHint.innerHTML = 'Incluye ' + plan.incluye + ' · los ' + extraCfg + ' adicionales suman <strong>' +
        withUsd(extraCfg * CONFIG) + '</strong>';
    }
    btnIa.setAttribute('aria-checked', state.ia ? 'true' : 'false');
    btnIa.classList.toggle('is-on', state.ia);

    if (pilotRoot) {
      Array.prototype.forEach.call(pilotRoot.querySelectorAll('.pick'), function (btn) {
        var on = btn.getAttribute('data-piloto') === state.piloto;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      pilotRoot.classList.toggle('is-muted', !state.ia);
      if (pilotHint) {
        pilotHint.innerHTML = state.ia
          ? '<strong>Piloto ' + state.piloto.toUpperCase() + '</strong> · ' + PILOTO_TEXTO[state.piloto]
          : 'Aplica solo si activas el módulo de IA. El −10% del Piloto A se otorga porque la propuesta llegó referida por una persona de confianza; el B y el C suman condiciones de pago y de velocidad.';
      }
    }
  }

  function setPlan(name) {
    state.plan = name;
    var incluye = PLANES[name].incluye;
    if (state.config < incluye) state.config = incluye;
    render();
  }

  function setSedes(value) {
    state.sedes = Math.min(MAX_SEDES, Math.max(1, value));
    render();
  }

  function setConfig(value) {
    state.config = Math.min(MAX_CONFIG, Math.max(1, value));
    render();
  }

  root.addEventListener('click', function (event) {
    var btn = event.target.closest('.pick');
    if (!btn) return;
    setPlan(btn.getAttribute('data-plan'));
  });

  selSedes.addEventListener('change', function () {
    setSedes(parseInt(selSedes.value, 10) || 1);
  });

  selConfig.addEventListener('change', function () {
    setConfig(parseInt(selConfig.value, 10) || 1);
  });

  Array.prototype.forEach.call(sedeSteps, function (btn) {
    btn.addEventListener('click', function () {
      setSedes(state.sedes + parseInt(btn.getAttribute('data-step'), 10));
    });
  });

  if (cfgMinus) cfgMinus.addEventListener('click', function () { setConfig(state.config - 1); });
  if (cfgPlus) cfgPlus.addEventListener('click', function () { setConfig(state.config + 1); });

  btnIa.addEventListener('click', function () {
    state.ia = !state.ia;
    render();
  });

  if (pilotRoot) {
    pilotRoot.addEventListener('click', function (event) {
      var btn = event.target.closest('.pick');
      if (!btn) return;
      state.piloto = btn.getAttribute('data-piloto');
      render();
    });
  }

  /* el plan Esencial no puede ofrecer menos de un configurador */
  state.config = PLANES[state.plan].incluye;
  render();
})();
