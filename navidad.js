/* ============================================================
   VOY STORE — navidad.js
   Temática de Navidad. Solo corre si el <head> puso la clase
   .theme-navidad en <html>. Se carga ANTES de main.js.

   1. Intro: puerta navideña con el logo
   2. Textos de temporada (data-xm)
   3. Banner superior (se puede cerrar)
   4. Cuenta regresiva a Navidad
   5. Guirnalda sobre el logo del navbar
   6. Hilo de luces en el hero
   7. Franjas de íconos geométricos
   8. Moño en la tarjeta destacada
============================================================ */

'use strict';

(function initNavidad() {
  const root = document.documentElement;
  if (!root.classList.contains('theme-navidad')) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const C = {
    cream: '#f3ead8',
    pine:  '#0f4a2c',
    pine2: '#1d6b3c',
    red:   '#c8283a',
    gold:  '#f2c46d',
    white: '#fbf7ef',
  };


  /* ── 1. INTRO: PUERTA NAVIDEÑA ── */
  (function intro() {
    const el = document.getElementById('xmIntro');
    if (!el) return;

    if (!root.classList.contains('xm-intro-on')) {
      el.remove();
      return;
    }

    try { sessionStorage.setItem('voystore:xm-intro', 'seen'); } catch (e) {}

    let done = false;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const announce = () => document.dispatchEvent(new CustomEvent('vs:intro-open'));

    function finish() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      root.classList.remove('xm-intro-on');
      el.remove();
    }

    function leave(fast) {
      el.classList.add('is-leaving');
      announce();
      setTimeout(finish, fast ? 300 : 400);
    }

    const skip = el.querySelector('.xm-intro-skip');
    if (skip) skip.addEventListener('click', () => leave(true));
    el.addEventListener('click', (e) => { if (e.target !== skip) leave(true); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        document.removeEventListener('keydown', onKey);
        leave(true);
      }
    });

    if (reduced) {
      later(() => leave(false), 900);
      return;
    }

    // 0–0.7s entra la corona · 1.3s se abren las puertas · 2.1s se desvanece
    later(() => el.classList.add('is-opening'), 1300);
    later(announce, 1700);
    later(() => leave(false), 2200);
  })();


  /* ── 2. TEXTOS DE TEMPORADA ── */
  document.querySelectorAll('[data-xm]').forEach((el) => {
    el.textContent = el.dataset.xm;
  });


  /* ── 3. BANNER ── */
  const close = document.getElementById('xmBannerClose');
  if (close) {
    close.addEventListener('click', () => {
      root.classList.add('xm-banner-closed');
      try {
        localStorage.setItem('voystore:xm-banner:' + new Date().getFullYear(), 'closed');
      } catch (e) {}
    });
  }


  /* ── 4. CUENTA REGRESIVA ── */
  (function countdown() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const xmas  = new Date(today.getFullYear(), 11, 25);
    const days  = Math.round((xmas - start) / 86400000);

    let num, text, short;
    if (days > 1) {
      num = String(days);
      text = 'días para Navidad<br><small>Regala entretenimiento a quien quieres</small>';
      short = 'Faltan ' + days + ' días';
    } else if (days === 1) {
      num = '1';
      text = 'día para Navidad<br><small>¡Mañana es Nochebuena… casi!</small>';
      short = '¡Mañana es Navidad!';
    } else if (days === 0) {
      num = '🎄';
      text = '¡Feliz Navidad!<br><small>Gracias por estar con VOY STORE</small>';
      short = '¡Feliz Navidad!';
    } else {
      num = '★';
      text = '¡Felices fiestas!<br><small>Gracias por estar con VOY STORE</small>';
      short = '¡Felices fiestas!';
    }

    document.querySelectorAll('[data-xm-countdown]').forEach((box) => {
      const n = box.querySelector('.xm-countdown-num');
      const t = box.querySelector('.xm-countdown-text');
      if (n) n.textContent = num;
      if (t) t.innerHTML = text;
    });
    document.querySelectorAll('[data-xm-countdown-short]').forEach((el) => {
      el.textContent = short;
    });
  })();


  /* ── 5. GUIRNALDA SOBRE EL LOGO ── */
  (function garland() {
    const wrap = document.querySelector('#navbar .logo-wrap');
    if (!wrap) return;

    const q = (t) => {
      // Curva: (4,6) → control (100,26) → (196,6)
      const x = (1 - t) * (1 - t) * 4 + 2 * t * (1 - t) * 100 + t * t * 196;
      const y = (1 - t) * (1 - t) * 6 + 2 * t * (1 - t) * 26 + t * t * 6;
      return [x, y];
    };

    let lights = '';
    const colors = [C.gold, C.red, C.white, C.gold, '#4fd18b'];
    for (let i = 1; i < 12; i++) {
      const [x, y] = q(i / 12);
      lights += `<circle class="xm-light" cx="${x.toFixed(1)}" cy="${(y + 2.5).toFixed(1)}" r="2.2" fill="${colors[i % colors.length]}"/>`;
    }

    const orn = (t, cls) => {
      const [x, y] = q(t);
      return `<g class="xm-ornament ${cls}">
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 9}" stroke="${C.gold}" stroke-width="0.8"/>
        <rect x="${x - 2}" y="${y + 8}" width="4" height="2.5" rx="0.6" fill="#d9d2c0"/>
        <circle cx="${x}" cy="${y + 15}" r="5" fill="${C.gold}"/>
        <circle cx="${x - 1.6}" cy="${y + 13.4}" r="1.4" fill="#fff6dc" opacity=".8"/>
      </g>`;
    };

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'xm-garland');
    svg.setAttribute('viewBox', '0 0 200 34');
    svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <path d="M4 6 Q100 26 196 6" fill="none" stroke="#123f25" stroke-width="7" stroke-linecap="round"/>
      <path d="M4 6 Q100 26 196 6" fill="none" stroke="${C.pine2}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 3"/>
      <path d="M4 6 Q100 26 196 6" fill="none" stroke="#2f8a4f" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 4"/>
      ${lights}
      ${orn(0.1, 'xm-ornament-a')}
      ${orn(0.9, 'xm-ornament-b')}`;
    wrap.appendChild(svg);
  })();


  /* ── 6. HILO DE LUCES EN EL HERO ── */
  (function heroLights() {
    const box = document.querySelector('.xm-lights');
    if (!box) return;

    const SCALLOPS = window.innerWidth < 680 ? 3 : 6;
    const W = 1000;
    const w = W / SCALLOPS;
    const H = 48;

    let d = 'M0 4';
    for (let i = 0; i < SCALLOPS; i++) d += ` Q${w * i + w / 2} 40 ${w * (i + 1)} 4`;

    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
      <path d="${d}" fill="none" stroke="rgba(242,196,109,.35)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    </svg>`;

    const colors = [C.red, C.gold, '#4fd18b', C.white];
    let k = 0;
    for (let i = 0; i < SCALLOPS; i++) {
      [0.2, 0.4, 0.6, 0.8].forEach((t) => {
        const x = (i + t) * w;
        const y = (1 - t) * (1 - t) * 4 + 2 * t * (1 - t) * 40 + t * t * 4;
        const b = document.createElement('span');
        b.className = 'xm-bulb xm-light';
        b.style.left = (x / W * 100) + '%';
        b.style.top = (y / H * 100) + '%';
        b.style.setProperty('--c', colors[k % colors.length]);
        b.style.animationDelay = (k % 3) * 0.5 + 's';
        box.appendChild(b);
        k++;
      });
    }
  })();


  /* ── 7. FRANJAS DE ÍCONOS GEOMÉTRICOS ── */
  (function patterns() {
    const strips = document.querySelectorAll('.xm-pattern');
    if (!strips.length) return;

    const t = (bg, body) => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="${bg}"/>${body}</svg>`;

    const tiles = [
      // Esfera rayada con moño
      t(C.cream, `<circle cx="50" cy="56" r="24" fill="none" stroke="${C.pine}" stroke-width="10" stroke-dasharray="5 4"/>
        <path d="M50 30 l-9 -7 v12 z M50 30 l9 -7 v12 z" fill="${C.red}"/>`),
      // Santa
      t(C.pine, `<path d="M30 50 L50 20 L70 50 Z" fill="${C.red}"/><circle cx="50" cy="19" r="6" fill="${C.white}"/>
        <rect x="28" y="47" width="44" height="9" rx="4.5" fill="${C.white}"/>
        <rect x="41" y="56" width="18" height="7" fill="#f1c9a5"/>
        <path d="M30 60 q20 34 40 0 z" fill="${C.white}"/>`),
      // Destello
      t(C.red, `<g stroke="${C.white}" stroke-width="6" stroke-linecap="round">
        <path d="M50 20v60M20 50h60M29 29l42 42M71 29L29 71"/></g>`),
      // Árbol
      t(C.pine, `<path d="M50 30 l10 12 h-5 l12 14 h-6 l14 16 h-50 l14 -16 h-6 l12 -14 h-5 z" fill="${C.red}"/>
        <path d="M50 18 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 z" fill="${C.gold}"/>`),
      // Corona
      t(C.red, Array.from({ length: 8 }, (_, i) => {
        const a = i / 8 * Math.PI * 2;
        return `<circle cx="${(50 + Math.cos(a) * 22).toFixed(1)}" cy="${(50 + Math.sin(a) * 22).toFixed(1)}" r="11" fill="${C.pine}"/>`;
      }).join('') + `<circle cx="50" cy="50" r="12" fill="${C.red}"/>`),
      // Franjas
      t(C.cream, [24, 36, 48, 60, 72].map((y, i) =>
        `<rect x="20" y="${y}" width="60" height="6" fill="${i % 2 ? C.red : C.pine}"/>`).join('')),
      // Flor de pascua
      t(C.cream, [0, 90, 180, 270].map((r) =>
        `<ellipse cx="50" cy="34" rx="11" ry="16" fill="${C.red}" transform="rotate(${r + 45} 50 50)"/>`).join('')),
      // Muñeco de nieve
      t(C.pine, `<circle cx="50" cy="44" r="20" fill="${C.white}"/>
        <path d="M30 62 h40 v8 h-10 v14 h-9 v-14 h-21 z" fill="${C.red}"/>`),
      // Copo con puntas
      t(C.red, `<g stroke="${C.white}" stroke-width="3">${[0, 60, 120].map((r) =>
        `<line x1="50" y1="22" x2="50" y2="78" transform="rotate(${r} 50 50)"/>`).join('')}</g>` +
        Array.from({ length: 6 }, (_, i) => {
          const a = i / 6 * Math.PI * 2 - Math.PI / 2;
          return `<circle cx="${(50 + Math.cos(a) * 28).toFixed(1)}" cy="${(50 + Math.sin(a) * 28).toFixed(1)}" r="5" fill="${C.white}"/>`;
        }).join('') + `<circle cx="50" cy="50" r="5" fill="${C.white}"/>`),
      // Regalo
      t(C.pine, `<rect x="28" y="38" width="44" height="40" fill="${C.red}"/>
        <path d="M50 38 c-14 -16 -26 -2 0 0 c26 -2 14 -16 0 0" fill="none" stroke="${C.white}" stroke-width="5"/>`),
      // Estrellas de cuatro puntas
      t(C.cream, [[32, 32], [68, 32], [32, 68], [68, 68]].map(([x, y]) =>
        `<path d="M${x} ${y - 16} Q${x} ${y} ${x + 16} ${y} Q${x} ${y} ${x} ${y + 16} Q${x} ${y} ${x - 16} ${y} Q${x} ${y} ${x} ${y - 16}Z" fill="${C.pine}"/>`).join('')),
      // Bastón de caramelo
      t(C.pine, `<path d="M42 84 V40 a12 12 0 0 1 24 0 v4" fill="none" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/>
        <path d="M42 84 V40 a12 12 0 0 1 24 0 v4" fill="none" stroke="${C.red}" stroke-width="10" stroke-dasharray="5 6"/>`),
      // Triángulos
      t(C.cream, [30, 52, 74].map((y) => [26, 50, 74].map((x) =>
        `<path d="M${x - 10} ${y} l10 -12 l10 12z" fill="${C.pine}"/>`).join('')).join('')),
      // Campana
      t(C.pine, `<path d="M50 22 c-14 0 -18 14 -18 28 c0 10 -6 14 -8 18 h52 c-2 -4 -8 -8 -8 -18 c0 -14 -4 -28 -18 -28z" fill="${C.red}"/>
        <circle cx="50" cy="74" r="6" fill="${C.white}"/><rect x="46" y="16" width="8" height="8" rx="3" fill="${C.red}"/>`),
      // Puntos
      t(C.cream, [25, 42, 58, 75].map((y) => [25, 42, 58, 75].map((x) =>
        `<circle cx="${x}" cy="${y}" r="4" fill="${C.red}"/>`).join('')).join('')),
    ];

    strips.forEach((strip, s) => {
      // Cada franja empieza en un ícono distinto
      const order = tiles.slice(s * 5).concat(tiles.slice(0, s * 5));
      const html = order.map((svg) => `<div class="xm-tile">${svg}</div>`).join('');
      const track = document.createElement('div');
      track.className = 'xm-pattern-track';
      // Se repite para llenar pantallas anchas y hacer el loop continuo
      track.innerHTML = html + html + html + html;
      strip.appendChild(track);
    });
  })();


  /* ── 8. MOÑO EN LA TARJETA DESTACADA ── */
  (function bow() {
    const card = document.querySelector('.p-card.featured');
    if (!card) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'xm-bow');
    svg.setAttribute('viewBox', '0 0 70 40');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
      <path d="M35 14 C20 -2 4 6 14 18 C20 24 30 18 35 14Z" fill="${C.red}"/>
      <path d="M35 14 C50 -2 66 6 56 18 C50 24 40 18 35 14Z" fill="${C.red}"/>
      <path d="M33 16 L24 38 L30 34 L34 18Z M37 16 L46 38 L40 34 L36 18Z" fill="#a3182b"/>
      <circle cx="35" cy="15" r="5" fill="#a3182b"/>`;
    card.appendChild(svg);
  })();
})();
