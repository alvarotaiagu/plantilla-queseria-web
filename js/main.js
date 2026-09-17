/* ============================================================
   Queixería Bardanca — main.js
   Concepto «Corteza»: mueve el tiempo y mira lo que le pasa.
   Sin framework. GSAP + ScrollTrigger + Lenis por CDN.

   Trampas ya pagadas que se respetan aquí:
   · Lo de «una sola vez» va con IntersectionObserver.
   · El char-reveal parte de un translateY en %, y GSAP lo lee en
     píxeles: se anima `y: 0`.
   · Nada de tweens de GSAP sobre el transform de un <g> de SVG:
     la cuña del hero y las líneas del gráfico se mueven con una
     clase y una transición CSS.
   ============================================================ */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapListo = !!(window.gsap && window.ScrollTrigger);
  var movimiento = gsapListo && !reduce;

  if (gsapListo) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out' });
  }
  if (movimiento) raiz.classList.add('has-motion');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Lenis ---------- */

  var lenis = null;
  if (movimiento && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      if (lenis) lenis.scrollTo(destino, { offset: -70 });
      else destino.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    });
  });

  /* ---------- 2. Cabecera y menú ---------- */

  var cabecera = $('#cabecera');
  var nav = $('#nav');
  var boton = $('#hamburguesa');

  function alScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    cabecera.classList.toggle('cabecera--posada', y > 120);
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  function cerrarMenu() {
    if (!nav.classList.contains('nav--abierto')) return;
    nav.classList.remove('nav--abierto');
    boton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-abierto');
    if (lenis) lenis.start();
  }

  boton.addEventListener('click', function () {
    var abierto = nav.classList.toggle('nav--abierto');
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    document.body.classList.toggle('menu-abierto', abierto);
    if (lenis) { abierto ? lenis.stop() : lenis.start(); }
    if (abierto) { var primero = nav.querySelector('a'); if (primero) primero.focus(); }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });

  /* ---------- 3. Cookies ---------- */

  var banner = $('#cookieBanner');
  var CLAVE = 'bardanca-cookies-v1';
  try { if (!localStorage.getItem(CLAVE)) banner.hidden = false; }
  catch (e) { banner.hidden = false; }

  $('#cookieAceptar').addEventListener('click', function () {
    banner.hidden = true;
    try { localStorage.setItem(CLAVE, 'visto'); } catch (e) {}
  });

  /* ---------- 4. Mapa solo bajo clic ---------- */

  var mapaBoton = $('#mapaBoton');
  if (mapaBoton) {
    mapaBoton.addEventListener('click', function () {
      var caja = $('.contacto__mapa');
      var marco = document.createElement('iframe');
      marco.src = 'https://www.google.com/maps?q=Palas%20de%20Rei%2C%20Lugo&output=embed';
      marco.title = 'Mapa de Palas de Rei (Lugo)';
      marco.loading = 'lazy';
      marco.referrerPolicy = 'no-referrer-when-downgrade';
      marco.setAttribute('allowfullscreen', '');
      caja.innerHTML = '';
      caja.appendChild(marco);
      var pie = document.createElement('p');
      pie.className = 'contacto__nota';
      pie.style.marginTop = '.6rem';
      pie.textContent = 'El mapa apunta al municipio, no a una finca concreta: el obrador es ficticio.';
      caja.appendChild(pie);
      if (gsapListo) ScrollTrigger.refresh();
    });
  }

  /* ---------- 5. Una sola vez ---------- */

  function alEntrar(el, fn, margen) {
    if (!('IntersectionObserver' in window)) { fn(el); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        io.unobserve(entrada.target);
        fn(entrada.target);
      });
    }, { rootMargin: margen || '0px 0px -10% 0px', threshold: 0.01 });
    io.observe(el);
  }

  /* ---------- 6. Char-reveal ---------- */

  function partirTitular(el) {
    var texto = el.textContent.trim();
    el.setAttribute('aria-label', texto);
    var palabras = texto.split(/\s+/);
    el.textContent = '';
    palabras.forEach(function (palabra, i) {
      var caja = document.createElement('span');
      caja.className = 'palabra';
      caja.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (letra) {
        var s = document.createElement('span');
        s.className = 'letra';
        s.textContent = letra;
        caja.appendChild(s);
      });
      el.appendChild(caja);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.letra', el);
  }

  var letrasHero = [];
  if (movimiento) {
    $$('[data-reveal]').forEach(function (el) {
      var letras = partirTitular(el);
      if (el.classList.contains('hero__titular')) { letrasHero = letras; return; }
      alEntrar(el, function () {
        gsap.to(letras, { y: 0, duration: .9, ease: 'power4.out', stagger: .013 });
      });
    });
  }

  /* ---------- 7. Apariciones y máscaras ---------- */

  if (movimiento) {
    $$('.queso, .leche__claves li, .cava__cifras, .mercados__lista li, .envios, .tienda, .visitas__lista, .voces, .contacto__datos, .cura__datos, .hero__datos')
      .forEach(function (el) {
        el.classList.add('aparece');
        alEntrar(el, function (t) { t.classList.add('visible'); });
      });

    $$('[data-mascara]').forEach(function (fig) {
      alEntrar(fig, function (t) { t.classList.add('visible'); });
    });
  }

  /* ---------- 8. Contadores ---------- */

  $$('.contador').forEach(function (el) {
    var hasta = parseFloat(el.dataset.hasta);
    el.textContent = hasta.toLocaleString('es-ES');
    if (!movimiento) return;
    alEntrar(el, function (t) {
      var obj = { v: 0 };
      gsap.to(obj, {
        v: hasta, duration: 1.4, ease: 'power2.out',
        onUpdate: function () { t.textContent = Math.round(obj.v).toLocaleString('es-ES'); }
      });
    });
  });

  /* ---------- 9. La cura (protagonista) ---------- */

  var CURAS = [
    {
      n: 'Tierno · 20 días',
      corteza: 'Fina, casi lisa, de color hueso',
      pasta: 'Blanca, elástica, con ojos de aguja',
      sabor: 'Leche, mantequilla y un final ácido',
      marida: 'Pan de maíz, membrillo y un blanco joven',
      precio: '9,90 €', peso: 'pieza de 900 g',
      pie: 'A las tres semanas la corteza todavía no se ha formado del todo.'
    },
    {
      n: 'De cava · 90 días',
      corteza: 'Gris de moho natural, cepillada cada semana',
      pasta: 'Marfil, más firme, con ojos redondos',
      sabor: 'Nuez, hierba seca y un fondo de seta',
      marida: 'Pan de centeno, uvas y un tinto ligero',
      precio: '12,50 €', peso: 'pieza de 850 g',
      pie: 'A los tres meses el moho gris cubre ya la pieza entera.'
    },
    {
      n: 'Curado · 180 días',
      corteza: 'Parda y dura, con la marca del cepillo',
      pasta: 'Amarilla, quebradiza, con los primeros cristales',
      sabor: 'Caldo, avellana tostada y un punto picante',
      marida: 'Membrillo, nueces y un tinto con cuerpo',
      precio: '16,00 €', peso: 'pieza de 800 g',
      pie: 'A los seis meses aparecen los cristales que crujen al morder.'
    },
    {
      n: 'De invierno · 400 días',
      corteza: 'Oscura, lavada, casi negra en el canto',
      pasta: 'Ámbar, seca, llena de cristales',
      sabor: 'Caramelo salado, cuero y mantequilla vieja',
      marida: 'Solo, en lasca fina, y un vino de postre',
      precio: '23,00 €', peso: 'pieza de 750 g',
      pie: 'Más de un año en la cava: la pieza ha perdido 150 g de agua.'
    }
  ];

  function iniciarCura() {
    var caja = $('#cura');
    var pasos = $$('.cura__paso');
    var riel = $('#curaRiel');
    var panel = $('#curaPanel');
    if (!caja || !pasos.length) return;

    var campos = {
      nombre: $('#curaNombre'), corteza: $('#curaCorteza'), pasta: $('#curaPasta'),
      sabor: $('#curaSabor'), marida: $('#curaMarida'),
      precio: $('#curaPrecio'), peso: $('#curaPeso'), pie: $('#curaPie')
    };

    function pinta(i, conFoco) {
      var c = CURAS[i];
      if (!c) return;
      caja.className = 'cura cura--' + i;
      pasos.forEach(function (p, n) {
        var activo = n === i;
        p.setAttribute('aria-selected', activo ? 'true' : 'false');
        p.tabIndex = activo ? 0 : -1;
        if (activo && conFoco) p.focus();
      });
      if (riel) riel.style.transform = 'translateX(' + (i * 100) + '%)';
      campos.nombre.textContent = c.n;
      campos.corteza.textContent = c.corteza;
      campos.pasta.textContent = c.pasta;
      campos.sabor.textContent = c.sabor;
      campos.marida.textContent = c.marida;
      campos.precio.textContent = c.precio;
      campos.peso.textContent = c.peso;
      campos.pie.textContent = c.pie;
      if (panel) panel.setAttribute('aria-labelledby', 'cura-' + i);
    }

    pasos.forEach(function (p, i) {
      p.addEventListener('click', function () { pinta(i); });
      p.addEventListener('keydown', function (e) {
        var salto = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!salto) return;
        e.preventDefault();
        pinta((i + salto + CURAS.length) % CURAS.length, true);
      });
    });

    pinta(0);
  }

  /* ---------- 10. Horario en vivo ---------- */

  var HORARIO = [
    [],                          // domingo
    [],                          // lunes
    [],                          // martes (estamos en la feira)
    [[600, 840], [990, 1170]],   // miércoles
    [[600, 840], [990, 1170]],
    [[600, 840], [990, 1170]],
    [[600, 840]]                 // sábado
  ];
  var NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function reloj(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return h + ':' + (mm < 10 ? '0' + mm : mm);
  }

  function pintaEstado() {
    var caja = $('#estado'), texto = $('#estadoTexto');
    if (!caja || !texto) return;
    var ahora = new Date();
    var dia = ahora.getDay();
    var minuto = ahora.getHours() * 60 + ahora.getMinutes();
    var tramos = HORARIO[dia];
    var abierto = false, cierre = 0, proximo = null;

    tramos.forEach(function (t) {
      if (minuto >= t[0] && minuto < t[1]) { abierto = true; cierre = t[1]; }
      if (!abierto && minuto < t[0] && proximo === null) proximo = t[0];
    });

    caja.classList.toggle('estado--abierto', abierto);
    caja.classList.toggle('estado--cerrado', !abierto);

    if (abierto) texto.textContent = 'La tienda está abierta · cerramos a las ' + reloj(cierre);
    else if (proximo !== null) texto.textContent = 'Cerrado ahora · abrimos hoy a las ' + reloj(proximo);
    else {
      var d = dia, vueltas = 0;
      do { d = (d + 1) % 7; vueltas++; } while (HORARIO[d].length === 0 && vueltas < 7);
      texto.textContent = 'Cerrado · abrimos el ' + NOMBRES[d] + ' a las ' + reloj(HORARIO[d][0][0]);
    }

    var filas = $$('#horarioCuerpo tr');
    var indice = (dia + 6) % 7;
    filas.forEach(function (fila, i) { fila.classList.toggle('hoy', i === indice); });
  }

  /* ---------- 11. El gráfico de la leche ---------- */

  function iniciarGrafico() {
    var svg = $('.leche__grafico svg');
    if (!svg) return;
    if (!movimiento) { svg.classList.add('dibujado'); return; }
    alEntrar(svg, function (t) { t.classList.add('dibujado'); });
  }

  /* ---------- 12. Cinta ---------- */

  function iniciarCinta() {
    var cinta = $('#cintaPista');
    if (!cinta || !movimiento) return;
    cinta.innerHTML = cinta.innerHTML + cinta.innerHTML;
    var mitad = cinta.scrollWidth / 2;
    var giro = gsap.to(cinta, {
      x: -mitad, duration: 26, ease: 'none', repeat: -1,
      modifiers: { x: function (x) { return (parseFloat(x) % mitad) + 'px'; } }
    });
    ScrollTrigger.create({
      trigger: '.cinta', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = Math.abs(self.getVelocity());
        gsap.to(giro, { timeScale: 1 + Math.min(v / 290, 6), duration: .4, overwrite: true });
        gsap.to(giro, { timeScale: 1, duration: 1.4, delay: .35, overwrite: false });
      }
    });
  }

  /* ---------- 13. Imán y cursor ---------- */

  function iniciarPuntero() {
    if (!movimiento || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('.magnetico').forEach(function (el) {
      var x = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
      var y = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) {
        var c = el.getBoundingClientRect();
        x((e.clientX - (c.left + c.width / 2)) * 0.3);
        y((e.clientY - (c.top + c.height / 2)) * 0.4);
      });
      el.addEventListener('mouseleave', function () { x(0); y(0); });
      el.addEventListener('blur', function () { x(0); y(0); });
    });

    var cursor = $('#cursor'), texto = $('#cursorTexto');
    if (!cursor) return;
    var cx = gsap.quickTo(cursor, 'x', { duration: .32, ease: 'power3.out' });
    var cy = gsap.quickTo(cursor, 'y', { duration: .32, ease: 'power3.out' });
    window.addEventListener('mousemove', function (e) { cx(e.clientX); cy(e.clientY); });

    [
      { sel: '.queso figure, .cava__foto, .visitas__lado figure', t: 'mirar' },
      { sel: '.rueda--cura', t: 'la cura' },
      { sel: '.rueda--hero', t: 'la pieza' },
      { sel: '.mapa-consent', t: 'mapa' }
    ].forEach(function (z) {
      $$(z.sel).forEach(function (el) {
        el.addEventListener('mouseenter', function () { cursor.classList.add('cursor--grande'); texto.textContent = z.t; });
        el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor--grande'); texto.textContent = ''; });
      });
    });
  }

  /* ---------- 14. Preloader e intro ---------- */

  function cortarLaPieza() {
    var rueda = $('.rueda--hero');
    if (rueda) rueda.classList.add('cortada');
  }

  function intro() {
    var preloader = $('#preloader');

    if (!movimiento) {
      if (preloader) preloader.remove();
      cortarLaPieza();
      return;
    }

    var tl = gsap.timeline();
    if (preloader) {
      tl.to('.preloader__rueda', { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' })
        .to('.preloader__cuna', { scale: 1, duration: .5, ease: 'back.out(2)' }, '-=.3')
        .to('.preloader__palabra', { opacity: 1, duration: .45 }, '-=.3')
        .to(preloader, {
          yPercent: -100, duration: .85, ease: 'power3.inOut',
          onComplete: function () { preloader.remove(); if (gsapListo) ScrollTrigger.refresh(); }
        }, '+=.15');
    }

    tl.add(cortarLaPieza, '-=.5')
      .to(letrasHero, { y: 0, duration: 1, ease: 'power4.out', stagger: .012 }, '-=.9')
      .to('.hero__sobre', { opacity: 1, duration: .5 }, '-=.9')
      .to('.hero__entrada', { opacity: 1, duration: .6 }, '-=.6')
      .to('.hero__acciones', { opacity: 1, duration: .6 }, '-=.45')
      .to('.hero__datos', { opacity: 1, duration: .6 }, '-=.4');

    setTimeout(function () {
      var p = $('#preloader');
      if (p) p.remove();
      cortarLaPieza();
      gsap.set([letrasHero, '.hero__sobre', '.hero__entrada', '.hero__acciones', '.hero__datos'], { opacity: 1, y: 0 });
    }, 4600);
  }

  /* ---------- 15. Tareas largas (§7 del pliego) ---------- */

  (function medirTareasLargas() {
    if (!('PerformanceObserver' in window)) return;
    var largas = [];
    try {
      var po = new PerformanceObserver(function (lista) {
        lista.getEntries().forEach(function (e) { largas.push(Math.round(e.duration)); });
      });
      po.observe({ type: 'longtask', buffered: true });
      window.__tareasLargas = largas;
      setTimeout(function () {
        console.info('[Bardanca] tareas largas en los primeros 10 s: ' +
          (largas.length ? largas.join(' ms, ') + ' ms' : 'ninguna'));
      }, 10000);
    } catch (e) { /* sin soporte */ }
  })();

  /* ---------- 16. Arranque ---------- */

  iniciarCura();
  pintaEstado();
  setInterval(pintaEstado, 60000);
  iniciarGrafico();
  iniciarCinta();
  iniciarPuntero();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      intro();
      if (gsapListo) ScrollTrigger.refresh();
    });
  } else {
    intro();
  }

  window.addEventListener('load', function () { if (gsapListo) ScrollTrigger.refresh(); });

})();
