/* ============================================================
   VOY STORE — main.js
   Módulos:
   1. Partículas de fondo (Canvas)
   2. Cursor personalizado
   3. Navbar: hamburger + sombra al scroll + sección activa
   4. GSAP: entrada del Hero
   5. GSAP: Scroll Reveal
   6. GSAP: Contadores animados
   7. GSAP: Parallax en hero background
   8. GSAP: Stagger en tarjetas de precio
   9. GSAP: Stagger en tiles de plataformas
   10. Tilt 3D del phone al mover el mouse
   11. Demo animada dentro del phone
   12. Fichas de plataforma → tarjeta de precio
   13. Confirmación en botones "Comprar"
   14. Armador de combos
   15. Botón flotante de WhatsApp
   16. Temporada: Halloween (textos + banner)
============================================================ */

'use strict';

// Preferencias del usuario / dispositivo
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer       = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Temática de temporada (la decide el script del <head>)
const isHalloween = document.documentElement.classList.contains('theme-halloween');


/* ──────────────────────────────────────────
   16. TEMPORADA: HALLOWEEN (textos + banner)
   Va primero para que los demás módulos lean ya
   los textos de temporada.
────────────────────────────────────────── */
(function initHalloween() {
  if (!isHalloween) return;

  // Textos alternativos: <el data-hw="texto de temporada">
  // Con data-hw-icon se antepone la calabaza.
  document.querySelectorAll('[data-hw]').forEach((el) => {
    el.textContent = el.dataset.hw;
    if (el.hasAttribute('data-hw-icon')) {
      const icon = document.createElement('img');
      icon.src = 'img/calabaza-sm.png';
      icon.alt = '';
      icon.className = 'hw-icon';
      el.prepend(icon, ' ');
    }
  });

  // Imágenes alternativas: <el data-hw-img="ruta">
  document.querySelectorAll('[data-hw-img]').forEach((el) => {
    const img = document.createElement('img');
    img.src = el.dataset.hwImg;
    img.alt = '';
    el.replaceChildren(img);
    el.classList.add('has-hw-img');
  });

  // Cerrar el banner (se recuerda durante el año en curso)
  const close = document.getElementById('hwBannerClose');
  if (close) {
    close.addEventListener('click', () => {
      document.documentElement.classList.add('hw-banner-closed');
      try {
        localStorage.setItem('voystore:hw-banner:' + new Date().getFullYear(), 'closed');
      } catch (e) {}
    });
  }
})();


/* ──────────────────────────────────────────
   1. PARTÍCULAS DE FONDO (Canvas)
────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const PARTICLE_COUNT = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Halloween: algunas partículas en naranja calabaza y murciélagos volando
  const bats = [];
  const BAT_COUNT = isHalloween ? (window.innerWidth < 680 ? 5 : 10) : 0;

  function createParticle() {
    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      Math.random() * 1.6 + 0.4,
      dx:     (Math.random() - 0.5) * 0.3,
      dy:     -(Math.random() * 0.6 + 0.2),
      alpha:  Math.random() * 0.5 + 0.2,
      orange: isHalloween && Math.random() < 0.22,
    };
  }

  function createBat(fromEdge) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    return {
      x:     fromEdge ? (dir > 0 ? -30 : W + 30) : Math.random() * W,
      y:     Math.random() * H * 0.85,
      size:  Math.random() * 10 + 10,
      vx:    dir * (Math.random() * 0.5 + 0.35),
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.08 + 0.14, // aleteo
      drift: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.25 + 0.45,
    };
  }

  function paint(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.orange
      ? `rgba(255, 138, 31, ${p.alpha})`
      : `rgba(29, 185, 84, ${p.alpha})`;
    ctx.fill();
  }

  // Silueta de murciélago; f = posición de las alas (aleteo)
  function paintBat(b) {
    const f = Math.sin(b.phase) * 6;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale((b.size / 14) * Math.sign(b.vx), b.size / 14);
    ctx.fillStyle = `rgba(34, 230, 100, ${b.alpha})`;

    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(6, -6 - f, 14, -4 - f);
    ctx.quadraticCurveTo(11, 0, 12, 3);
    ctx.quadraticCurveTo(8, 1, 6, 4);
    ctx.quadraticCurveTo(3, 2, 0, 5);
    ctx.quadraticCurveTo(-3, 2, -6, 4);
    ctx.quadraticCurveTo(-8, 1, -12, 3);
    ctx.quadraticCurveTo(-11, 0, -14, -4 - f);
    ctx.quadraticCurveTo(-6, -6 - f, 0, -2);
    ctx.fill();

    // Cabeza con orejitas
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(-2.2, -5);
    ctx.lineTo(-0.8, -3.2);
    ctx.lineTo(0.8, -3.2);
    ctx.lineTo(2.2, -5);
    ctx.lineTo(2, -2);
    ctx.arc(0, -1, 2.2, 0, Math.PI);
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;

      // Reiniciar si sale por arriba
      if (p.y < -5) {
        particles[i]   = createParticle();
        particles[i].y = H + 5;
        return;
      }

      paint(p);
    });

    bats.forEach((b, i) => {
      b.x     += b.vx;
      b.drift += 0.012;
      b.y     += Math.sin(b.drift) * 0.35;
      b.phase += b.speed;

      // Reaparecer por un costado al salir de la pantalla
      if (b.x < -40 || b.x > W + 40) {
        bats[i] = createBat(true);
        return;
      }

      paintBat(b);
    });

    requestAnimationFrame(draw);
  }

  // Inicializar
  resize();
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  for (let i = 0; i < BAT_COUNT; i++) bats.push(createBat(false));

  // Con movimiento reducido: partículas quietas
  if (prefersReducedMotion) {
    const paintStatic = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(paint);
      bats.forEach(paintBat);
    };
    paintStatic();
    window.addEventListener('resize', () => { resize(); paintStatic(); });
    return;
  }

  window.addEventListener('resize', resize);
  draw();
})();


/* ──────────────────────────────────────────
   2. CURSOR PERSONALIZADO
────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring || !hasFinePointer) return; // no aplica en touch

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  // Seguir el mouse exactamente (dot)
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Animar el ring con lag suave
  function animateCursor() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;

    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Agrandar ring al hover en elementos interactivos
  const interactiveSelectors = 'a, button, [data-plan], .p-card, .mf-item';
  document.querySelectorAll(interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.style.width       = '56px';
      ring.style.height      = '56px';
      ring.style.borderColor = 'rgba(29, 185, 84, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width       = '36px';
      ring.style.height      = '36px';
      ring.style.borderColor = 'rgba(29, 185, 84, 0.5)';
    });
  });
})();


/* ──────────────────────────────────────────
   3. NAVBAR: Hamburger + sombra al scroll + sección activa
────────────────────────────────────────── */
(function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const navbar    = document.getElementById('navbar');

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  // Toggle menú mobile
  hamburger.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  // Cerrar al hacer click en un link o con Escape
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Añadir clase .scrolled cuando baja de 40px
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Resaltar en el menú la sección que se está viendo
  const links = [...navLinks.querySelectorAll('a[href^="#"]:not(.nav-cta)')];
  const byId  = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      const link = byId.get(entry.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));
})();


/* ──────────────────────────────────────────
   4–9. GSAP Animaciones
   (requiere GSAP + ScrollTrigger en el HTML)
────────────────────────────────────────── */
(function initGSAP() {
  // Verificar que GSAP esté disponible
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('VOY STORE: GSAP o ScrollTrigger no cargaron.');
    document.querySelectorAll('.reveal, #heroPill, #heroTitle, #heroSub, #heroBtns, #heroTicker')
      .forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Con movimiento reducido solo se conservan los fundidos
  const m = prefersReducedMotion ? 0 : 1;

  /* ── 4. Entrada del Hero ── */
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTimeline
    .fromTo('#heroPill',   { y: 16 * m }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .fromTo('#heroTitle',  { y: 24 * m }, { opacity: 1, y: 0, duration: 1.0 }, 0.3)
    .fromTo('#heroSub',    { y: 16 * m }, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
    .fromTo('#heroBtns',   { y: 16 * m }, { opacity: 1, y: 0, duration: 0.7 }, 0.9)
    .fromTo('#heroTicker', { y: 16 * m }, { opacity: 1, y: 0, duration: 0.6 }, 1.1);

  /* ── 5. Scroll Reveal (clase .reveal) ── */
  document.querySelectorAll('.reveal').forEach((el) => {
    const isLeft  = el.classList.contains('left');
    const isRight = el.classList.contains('right');
    const isScale = el.classList.contains('scale');

    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: (isLeft || isRight) ? 0 : 40 * m,
        x: (isLeft ? -50 : isRight ? 50 : 0) * m,
        scale: isScale && m ? 0.9 : 1,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* ── 6. Contadores animados ── */
  document.querySelectorAll('.counter').forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = target === 100 ? '' : '+';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: prefersReducedMotion ? 0 : 1.8,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val) + suffix;
          },
        });
      },
    });
  });

  /* ── 7. Parallax en hero background ── */
  if (!prefersReducedMotion) {
    gsap.to('.hero-bg-img', {
      y: '25%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#inicio',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ── 8. Stagger en tarjetas de precio ──
     Sin rebote: son precios que el cliente está leyendo. */
  gsap.from('.p-card', {
    opacity: 0,
    y: 16 * m,
    stagger: 0.05,
    duration: 0.5,
    ease: 'power3.out',
    clearProps: 'transform',
    scrollTrigger: {
      trigger: '.pricing-grid',
      start: 'top 80%',
    },
  });

  /* ── 9. Stagger en tiles de plataformas ── */
  gsap.from('.plat-tile', {
    opacity: 0,
    scale: m ? 0.96 : 1,
    stagger: 0.06,
    duration: 0.6,
    ease: 'power3.out',
    clearProps: 'transform',
    scrollTrigger: {
      trigger: '.plat-img-grid',
      start: 'top 80%',
    },
  });
})();


/* ──────────────────────────────────────────
   10. TILT 3D DEL PHONE AL MOVER EL MOUSE
   Solo reacciona con el mouse sobre la escena y vuelve
   a su pose original al salir.
────────────────────────────────────────── */
(function initPhoneTilt() {
  const scene      = document.querySelector('.phone-scene');
  const phoneFrame = document.querySelector('.phone-frame');
  if (!scene || !phoneFrame || !hasFinePointer || prefersReducedMotion) return;

  let frame = 0;

  scene.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r  = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5; // -0.5 … 0.5
      const py = (e.clientY - r.top)  / r.height - 0.5;

      scene.classList.add('is-tilting');
      phoneFrame.style.transform =
        `perspective(1000px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 16 - 4).toFixed(2)}deg)`;
    });
  });

  scene.addEventListener('mouseleave', () => {
    cancelAnimationFrame(frame);
    scene.classList.remove('is-tilting');
    phoneFrame.style.transform = ''; // vuelve a la pose del CSS con transición suave
  });
})();


/* ──────────────────────────────────────────
   11. DEMO ANIMADA DENTRO DEL PHONE
   Explica el flujo de compra: buscar → elegir → acceso enviado.
   Solo corre mientras el phone está en pantalla.
────────────────────────────────────────── */
(function initPhoneDemo() {
  const scene      = document.querySelector('.phone-scene');
  const greeting   = document.getElementById('phoneGreeting');
  const search     = document.querySelector('.phone-search');
  const searchText = document.getElementById('phoneSearchText');
  const toast      = document.getElementById('phoneToast');
  const toastName  = document.getElementById('phoneToastName');
  const cards      = [...document.querySelectorAll('.phone-card')];
  if (!scene || !search || !toast || !cards.length) return;

  // Saludo según la hora
  const h = new Date().getHours();
  greeting.textContent = h < 12 ? 'Buenos días 👋' : h < 19 ? 'Buenas tardes 👋' : 'Buenas noches 👋';

  if (prefersReducedMotion) return;

  const PLACEHOLDER = searchText.textContent;
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  let running = false;
  let paused  = false;   // mouse encima: el cliente está mirando/interactuando
  let index   = 0;

  // Espera mientras la demo esté en pausa o fuera de pantalla
  async function idle() {
    while (paused || !running) await wait(200);
  }

  async function typeText(text) {
    search.classList.add('is-typing');
    searchText.textContent = '';
    for (const ch of text) {
      await idle();
      searchText.textContent += ch;
      await wait(85);
    }
  }

  async function eraseText() {
    while (searchText.textContent.length) {
      await idle();
      searchText.textContent = searchText.textContent.slice(0, -1);
      await wait(35);
    }
    search.classList.remove('is-typing');
    searchText.textContent = PLACEHOLDER;
  }

  function filterCards(card) {
    cards.forEach((c) => {
      c.classList.toggle('is-match', c === card);
      c.classList.toggle('is-dim', card !== null && c !== card);
    });
  }

  async function loop() {
    while (true) {
      await idle();
      const card = cards[index % cards.length];
      const name = card.dataset.name;

      await wait(900);
      await typeText(name);
      filterCards(card);
      await wait(600);

      // "Toque" sobre la tarjeta
      await idle();
      card.classList.add('is-tap');
      await wait(160);
      card.classList.remove('is-tap');
      await wait(250);

      // Notificación de acceso enviado
      toastName.textContent = name;
      toast.classList.add('is-visible');
      await wait(2200);
      await idle();
      toast.classList.remove('is-visible');
      await wait(300);

      filterCards(null);
      cards.forEach((c) => c.classList.remove('is-match'));
      await eraseText();
      index++;
    }
  }

  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
  }, { threshold: 0.35 }).observe(scene);

  scene.addEventListener('mouseenter', () => { paused = true; });
  scene.addEventListener('mouseleave', () => { paused = false; });

  loop();
})();


/* ──────────────────────────────────────────
   12. FICHAS DE PLATAFORMA → TARJETA DE PRECIO
   Cualquier elemento con data-plan lleva a su precio
   y lo resalta una vez al llegar.
────────────────────────────────────────── */
(function initPlanLinks() {
  function highlight(card) {
    card.classList.remove('is-highlight');
    void card.offsetWidth; // reinicia la animación si se repite
    card.classList.add('is-highlight');
  }

  function goToPlan(plan) {
    const card = document.getElementById('plan-' + plan);
    if (!card) return;

    card.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });

    // Resaltar al terminar el scroll (o enseguida si no hubo scroll)
    let done = false;
    const fire = () => { if (!done) { done = true; highlight(card); } };
    if ('onscrollend' in window) window.addEventListener('scrollend', fire, { once: true });
    setTimeout(fire, 700);
  }

  document.querySelectorAll('[data-plan]').forEach((el) => {
    el.addEventListener('click', () => goToPlan(el.dataset.plan));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToPlan(el.dataset.plan);
      }
    });
  });
})();


/* ──────────────────────────────────────────
   13. CONFIRMACIÓN EN BOTONES "COMPRAR"
   WhatsApp se abre en otra pestaña; el botón confirma
   que el clic funcionó.
────────────────────────────────────────── */
(function initBuyFeedback() {
  document.querySelectorAll('.pricing-grid .p-btn').forEach((btn) => {
    // Envolver el texto para poder cambiarlo sin tocar el ícono
    const textNode = [...btn.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!textNode) return;

    const label = document.createElement('span');
    label.className   = 'btn-label';
    label.textContent = textNode.textContent.trim();
    btn.replaceChild(label, textNode);

    const original = label.textContent;
    let timer;

    function swap(text) {
      label.textContent = text;
      label.classList.remove('is-swapping');
      void label.offsetWidth;
      label.classList.add('is-swapping');
    }

    btn.addEventListener('click', () => {
      clearTimeout(timer);
      btn.classList.add('is-sent');
      swap('✓ Abriendo WhatsApp…');

      timer = setTimeout(() => {
        btn.classList.remove('is-sent');
        swap(original);
      }, 1600);
    });
  });
})();


/* ──────────────────────────────────────────
   14. ARMADOR DE COMBOS
   Descuento según la tabla "Descuento por múltiples perfiles".
────────────────────────────────────────── */
(function initCombo() {
  const chips    = [...document.querySelectorAll('.combo-chip')];
  const tiers    = [...document.querySelectorAll('#promoTiers .promo-chip')];
  const subEl    = document.getElementById('comboSubtotal');
  const discEl   = document.getElementById('comboDiscount');
  const totalEl  = document.getElementById('comboTotal');
  const btn      = document.getElementById('comboBtn');
  if (!chips.length || !btn) return;

  const WA_NUMBER = '50495437730';

  // perfiles → rebaja en Lempiras (7 o más = L.80)
  const DISCOUNTS = { 2: 10, 3: 30, 4: 40, 5: 50, 6: 70, 7: 80 };
  const discountFor = (n) => (n >= 7 ? DISCOUNTS[7] : DISCOUNTS[n] || 0);

  let lastTotal = 0;

  function render() {
    const selected = chips.filter((c) => c.getAttribute('aria-pressed') === 'true');
    const count    = selected.length;
    const subtotal = selected.reduce((sum, c) => sum + Number(c.dataset.price), 0);
    const discount = discountFor(count);
    const total    = subtotal - discount;

    subEl.textContent   = `L. ${subtotal}`;
    discEl.textContent  = `– L. ${discount}`;
    totalEl.textContent = `L. ${total}`;

    if (total !== lastTotal) {
      totalEl.classList.remove('is-bump');
      void totalEl.offsetWidth;
      totalEl.classList.add('is-bump');
      lastTotal = total;
    }

    // Nivel de descuento activo
    const tierCount = count >= 7 ? 7 : count;
    tiers.forEach((t) => t.classList.toggle('is-active', Number(t.dataset.count) === tierCount));

    // Botón y mensaje de WhatsApp
    if (count === 0) {
      btn.classList.add('is-disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.textContent = 'Elige al menos una plataforma';
      btn.href = `https://wa.me/${WA_NUMBER}`;
      return;
    }

    const names = selected.map((c) => c.dataset.name).join(', ');
    const msg =
      `Hola! Quiero armar este combo en VOY STORE: ${names} ` +
      `(${count} ${count === 1 ? 'perfil' : 'perfiles'}). Total: L.${total}`;

    btn.classList.remove('is-disabled');
    btn.removeAttribute('aria-disabled');
    btn.textContent = discount
      ? `Pedir combo · ahorras L.${discount}`
      : 'Pedir por WhatsApp';
    btn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const on = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!on));
      render();
    });
  });

  render();
})();


/* ──────────────────────────────────────────
   15. BOTÓN FLOTANTE DE WHATSAPP
   Aparece al pasar el hero y se oculta donde ya hay un
   botón de WhatsApp propio (combo y contacto).
────────────────────────────────────────── */
(function initFloatingWA() {
  const fab = document.getElementById('waFloat');
  const zones = ['inicio', 'combo', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!fab || !zones.length) return;

  const visible = new Set();
  const update  = () => fab.classList.toggle('is-visible', visible.size === 0);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) visible.add(e.target);
      else visible.delete(e.target);
    });
    update();
  }, { threshold: 0.2 });

  zones.forEach((z) => io.observe(z));
})();
