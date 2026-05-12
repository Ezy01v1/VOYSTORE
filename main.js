/* ============================================================
   VOY STORE — main.js
   Módulos:
   1. Partículas de fondo (Canvas)
   2. Cursor personalizado
   3. Navbar: hamburger + sombra al scroll
   4. GSAP: entrada del Hero
   5. GSAP: Scroll Reveal
   6. GSAP: Contadores animados
   7. GSAP: Parallax en hero background
   8. GSAP: Stagger en tarjetas de precio
   9. GSAP: Stagger en tiles de plataformas
   10. Tilt 3D del phone al mover el mouse
============================================================ */

'use strict';

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

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.6 + 0.4,
      dx:    (Math.random() - 0.5) * 0.3,
      dy:    -(Math.random() * 0.6 + 0.2),
      alpha: Math.random() * 0.5 + 0.2,
    };
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

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(29, 185, 84, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // Inicializar
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  draw();
})();


/* ──────────────────────────────────────────
   2. CURSOR PERSONALIZADO
────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return; // no aplica en touch

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
  const interactiveSelectors = 'a, button, .plat-tile, .p-card, .mf-item';
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
   3. NAVBAR: Hamburger + sombra al scroll
────────────────────────────────────────── */
(function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const navbar    = document.getElementById('navbar');

  // Toggle menú mobile
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Cerrar al hacer click en un link
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Añadir clase .scrolled cuando baja de 40px
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
})();


/* ──────────────────────────────────────────
   4–9. GSAP Animaciones
   (requiere GSAP + ScrollTrigger en el HTML)
────────────────────────────────────────── */
(function initGSAP() {
  // Verificar que GSAP esté disponible
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('VOY STORE: GSAP o ScrollTrigger no cargaron.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ── 4. Entrada del Hero ── */
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTimeline
    .to('#heroPill',   { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .to('#heroTitle',  { opacity: 1, y: 0, duration: 1.0, stagger: 0.05 }, 0.3)
    .to('#heroSub',    { opacity: 1, y: 0, duration: 0.8 }, 0.7)
    .to('#heroBtns',   { opacity: 1, y: 0, duration: 0.7 }, 0.9)
    .to('#heroTicker', { opacity: 1, y: 0, duration: 0.6 }, 1.1);

  /* ── 5. Scroll Reveal (clase .reveal) ── */
  document.querySelectorAll('.reveal').forEach((el) => {
    const isLeft  = el.classList.contains('left');
    const isRight = el.classList.contains('right');
    const isScale = el.classList.contains('scale');

    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: (isLeft || isRight) ? 0 : 40,
        x: isLeft ? -50 : isRight ? 50 : 0,
        scale: isScale ? 0.9 : 1,
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
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val) + suffix;
          },
        });
      },
    });
  });

  /* ── 7. Parallax en hero background ── */
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

  /* ── 8. Stagger en tarjetas de precio ── */
  gsap.from('.p-card', {
    opacity: 0,
    y: 50,
    stagger: 0.08,
    duration: 0.7,
    ease: 'back.out(1.2)',
    scrollTrigger: {
      trigger: '.pricing-grid',
      start: 'top 80%',
    },
  });

  /* ── 9. Stagger en tiles de plataformas ── */
  gsap.from('.plat-tile', {
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    duration: 0.7,
    scrollTrigger: {
      trigger: '.plat-img-grid',
      start: 'top 80%',
    },
  });
})();


/* ──────────────────────────────────────────
   10. TILT 3D DEL PHONE AL MOVER EL MOUSE
────────────────────────────────────────── */
(function initPhoneTilt() {
  const phoneFrame = document.querySelector('.phone-frame');
  if (!phoneFrame) return;

  document.addEventListener('mousemove', (e) => {
    const cx  = window.innerWidth  / 2;
    const cy  = window.innerHeight / 2;
    const rotX = ((e.clientY - cy) / cy) * 5;
    const rotY = ((e.clientX - cx) / cx) * -8;

    phoneFrame.style.transform =
      `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY - 6}deg)`;
  });
})();