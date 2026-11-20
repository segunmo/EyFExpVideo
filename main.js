/* ==========================================================================
   main.js — motor de la presentación por pasos.

   Modelo:
   - Cada paso de content.js apunta a una diapositiva (`escena`) y a un `beat` dentro de ella.
   - escenas.js construye el DOM de cada diapositiva una vez. Los elementos animables llevan:
       data-b="n"      aparece en el beat n (por defecto 0)
       data-out="n"    desaparece en el beat n
       data-dim="n"    se atenúa desde el beat n
       data-st="n:clase n2:clase2"   desde el beat n tiene esa clase (transición por CSS)
       data-a="tipo"   animación de entrada: fade up down left right pop draw growx growy drop fly path count none
       data-d="s"      demora (s) dentro del beat;  data-dur="s" duración
   - El estado final de un beat se calcula SOLO a partir de esos atributos (applyState).
     Avanzar anima; al terminar (o al apretar → de nuevo) se fuerza applyState del paso destino.
     Retroceder, saltar o cargar ?step=N llaman directamente applyState. Por eso cada paso termina
     siempre igual, se llegue como se llegue.
   ========================================================================== */
(() => {
  'use strict';
  const C = window.CONTENIDO, ESC = window.ESCENAS;
  const PASOS = C.pasos, N = PASOS.length;
  const $ = (s, r = document) => r.querySelector(s);
  const stage = $('#stage'), slidesEl = $('#slides'), hud = $('#hud'), gotoEl = $('#goto');
  const DIM = 0.22;
  const SPEED = 1.5;      // las transiciones corren 1,5× más rápido que las demoras/duraciones escritas en escenas
  const OUT = 0.3;        // dentro de una diapositiva: lo que se va se desvanece primero (0,3 s), después entra lo nuevo

  /* ------------------------------------------------------------ Chrome */
  const secbar = $('#secbar');
  C.secciones.forEach(s => { const d = document.createElement('div'); d.className = 'seg'; d.dataset.id = s.id; d.textContent = s.id + ' ' + s.corto; secbar.appendChild(d); });
  function setChrome(i) {
    const p = PASOS[i], idx = C.secciones.findIndex(s => s.id === p.seccion);
    secbar.querySelectorAll('.seg').forEach((d, k) => { d.classList.toggle('on', k === idx); d.classList.toggle('done', idx >= 0 && k < idx); });
    const s = C.secciones[idx];
    $('#sec-label').textContent = s ? s.id + ' · ' + s.nombre : (p.seccion === 'cierre' ? '' : '');
    secbar.style.opacity = p.seccion === 'portada' ? 0.0 : 1;
  }

  /* ------------------------------------------------------------ Escenas */
  const built = {};   // id → { root, els }
  function parseEl(e) {
    const st = (e.dataset.st || '').trim();
    e._b = e.dataset.b != null ? +e.dataset.b : 0;
    e._out = e.dataset.out != null ? +e.dataset.out : Infinity;
    e._dim = e.dataset.dim != null ? +e.dataset.dim : Infinity;
    e._st = st ? st.split(/\s+/).map(t => { const [b, c] = t.split(':'); return [+b, c]; }) : [];
    e._a = e.dataset.a || 'fade';
    e._d = +(e.dataset.d || 0);
    e._dur = +(e.dataset.dur || 0.7);
  }
  function getSlide(id) {
    if (built[id]) return built[id];
    if (!ESC[id]) throw new Error('Escena desconocida: ' + id);
    const root = document.createElement('section');
    root.className = 'slide'; root.dataset.id = id;
    slidesEl.appendChild(root);
    ESC[id](root);
    const els = Array.from(root.querySelectorAll('[data-b],[data-out],[data-dim],[data-st],[data-a]'));
    els.forEach(parseEl);
    built[id] = { root, els };
    return built[id];
  }
  const vis = (e, B) => e._b <= B && B < e._out;
  const stClasses = e => e._st.map(s => s[1]);
  function applyClasses(e, B) {
    let pick = null;
    e._st.forEach(([b, c]) => { if (b <= B) pick = c; });
    stClasses(e).forEach(c => e.classList.toggle(c, c === pick));
  }
  function finalText(e) { if (e._a === 'count') e.textContent = ESC.fmt(e.dataset.fmt, +e.dataset.to); }
  function applyEl(e, B) {
    gsap.killTweensOf(e);
    if (vis(e, B)) {
      gsap.set(e, { clearProps: 'opacity,visibility,transform,strokeDasharray,strokeDashoffset' });
      if (e._dim <= B) gsap.set(e, { opacity: DIM });
      finalText(e);
    } else gsap.set(e, { opacity: 0, visibility: 'hidden' });
    applyClasses(e, B);
  }

  let cur = -1, curSlide = null, tl = null;
  function showSlide(id) {
    Object.values(built).forEach(s => { gsap.killTweensOf(s.root); s.root.classList.toggle('show', s.root.dataset.id === id); gsap.set(s.root, { clearProps: 'opacity' }); });
    curSlide = id;
  }
  function applyState(i) {
    const p = PASOS[i], s = getSlide(p.escena);
    stage.classList.add('instant');
    showSlide(p.escena);
    s.els.forEach(e => applyEl(e, p.beat));
    setChrome(i);
    void stage.offsetWidth;           // aplica sin transiciones CSS
    stage.classList.remove('instant');
  }
  function killTl() { if (tl) { tl.kill(); tl = null; } }
  function renderInstant(i) { killTl(); cur = i; applyState(i); updateHud(); }

  /* ------------------------------------------------------------ Animación de entrada */
  function animIn(t, e, at, beat) {
    const d = e._dur, a = e._a;
    t.set(e, { visibility: 'visible' }, at);
    const op = e._dim <= beat ? DIM : 1;
    switch (a) {
      case 'none': t.set(e, { opacity: op }, at); break;
      case 'up': t.fromTo(e, { opacity: 0, y: 26 }, { opacity: op, y: 0, duration: d, ease: 'power2.out' }, at); break;
      case 'down': t.fromTo(e, { opacity: 0, y: -26 }, { opacity: op, y: 0, duration: d, ease: 'power2.out' }, at); break;
      case 'left': t.fromTo(e, { opacity: 0, x: -50 }, { opacity: op, x: 0, duration: d, ease: 'power2.out' }, at); break;
      case 'right': t.fromTo(e, { opacity: 0, x: 50 }, { opacity: op, x: 0, duration: d, ease: 'power2.out' }, at); break;
      case 'pop': t.fromTo(e, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: op, scale: 1, duration: d, ease: 'back.out(1.6)' }, at); break;
      case 'drop': t.fromTo(e, { opacity: 0, y: -70 }, { opacity: op, y: 0, duration: d, ease: 'bounce.out' }, at); break;
      case 'growx': t.fromTo(e, { opacity: op, scaleX: 0, transformOrigin: e.dataset.origin || '0% 50%' }, { scaleX: 1, duration: d, ease: 'power3.out' }, at); break;
      case 'growy': t.fromTo(e, { opacity: op, scaleY: 0, transformOrigin: e.dataset.origin || '50% 100%' }, { scaleY: 1, duration: d, ease: 'power3.out' }, at); break;
      case 'fly': t.fromTo(e, { opacity: 0, x: +(e.dataset.fx || 0), y: +(e.dataset.fy || 0), scale: +(e.dataset.fs || 1) }, { opacity: op, x: 0, y: 0, scale: 1, duration: d, ease: 'power3.inOut' }, at); break;
      case 'draw': {
        const L = e.getTotalLength ? Math.ceil(e.getTotalLength()) + 2 : 1000;
        t.fromTo(e, { opacity: op, strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: 'power1.inOut' }, at);
        break;
      }
      case 'path': {   // recorre puntos (dx,dy relativos a la posición final) y termina en 0,0
        const pts = e.dataset.path.split(';').map(s => s.split(',').map(Number));
        t.set(e, { x: pts[0][0], y: pts[0][1] }, at);
        t.to(e, { opacity: op, duration: 0.25 }, at);
        const seg = d / pts.length;
        pts.slice(1).concat([[0, 0]]).forEach((p, k) => t.to(e, { x: p[0], y: p[1], duration: seg, ease: 'power1.inOut' }, at + 0.25 + k * seg));
        break;
      }
      case 'count': {
        const o = { v: +(e.dataset.from || 0) }, to = +e.dataset.to, f = e.dataset.fmt;
        t.set(e, { opacity: op }, at);
        t.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: () => { e.textContent = ESC.fmt(f, o.v); } }, at);
        break;
      }
      default: t.fromTo(e, { opacity: 0 }, { opacity: op, duration: d, ease: 'power1.out' }, at);
    }
  }

  function buildTransition(from, to) {
    const A = PASOS[from], B = PASOS[to];
    const t = gsap.timeline({ onComplete: () => { if (tl === t) { tl = null; applyState(to); } } });
    const sB = getSlide(B.escena);
    let t0 = 0;
    if (A.escena !== B.escena) {
      // salida de la diapositiva anterior, entrada de la nueva
      const sA = built[A.escena];
      t.to(sA.root, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0);
      t.add(() => {
        stage.classList.add('instant');
        sA.root.classList.remove('show'); gsap.set(sA.root, { clearProps: 'opacity' });
        sB.root.classList.add('show'); curSlide = B.escena;
        // estado previo: lo que ya estaba visible antes del beat de llegada
        sB.els.forEach(e => {
          if (vis(e, B.beat) && e._b < B.beat) applyEl(e, B.beat);
          else {
            // OJO: no usar killTweensOf acá, mataría las animaciones de entrada que ya están en esta línea de tiempo
            if (e._b !== B.beat) gsap.killTweensOf(e);
            gsap.set(e, { opacity: 0, visibility: 'hidden' }); applyClasses(e, B.beat - 1);
          }
        });
        void stage.offsetWidth; stage.classList.remove('instant');
        setChrome(to);
      }, 0.26);
      t0 = 0.28;
      sB.els.forEach(e => { if (e._b === B.beat) animIn(t, e, t0 + e._d, B.beat); });
      t.add(() => sB.els.forEach(e => applyClasses(e, B.beat)), t0 + 0.05);
    } else {
      setChrome(to);
      const pb = A.beat, nb = B.beat;
      // Primero sale lo que deja de verse (todo junto, al principio del beat); lo que entra espera
      // a que termine, para que el texto nuevo nunca aparezca encima de lo viejo.
      const sale = sB.els.filter(e => vis(e, pb) && !vis(e, nb));
      const t1 = sale.length ? OUT : 0;
      sale.forEach(e => { t.to(e, { opacity: 0, duration: OUT, ease: 'power1.in' }, 0); t.set(e, { visibility: 'hidden' }, OUT); });
      sB.els.forEach(e => {
        const wasV = vis(e, pb), isV = vis(e, nb);
        if (!wasV && isV) animIn(t, e, t1 + e._d, nb);
        else if (isV && wasV && (e._dim <= nb) !== (e._dim <= pb)) t.to(e, { opacity: e._dim <= nb ? DIM : 1, duration: 0.4 }, 0);
        if (e._st.length) t.add(() => applyClasses(e, nb), t1 + e._d);   // recorridos (árbol) usan la demora
      });
    }
    // duración mínima para que el onComplete no sea inmediato
    t.to({}, { duration: 0.01 }, Math.max(t.duration(), 0.05));
    t.timeScale(SPEED);
    return t;
  }

  /* ------------------------------------------------------------ Navegación */
  function go(n, animate) {
    n = Math.max(0, Math.min(N - 1, n));
    if (animate && n === cur + 1 && cur >= 0) {
      renderInstant(cur);           // completa cualquier transición en curso
      const from = cur; cur = n;
      tl = buildTransition(from, n);
      updateHud();
    } else renderInstant(n);
  }
  const next = () => go(cur + 1, true);
  const prev = () => go(cur - 1, false);

  /* ------------------------------------------------------------ Modo desarrollo / HUD */
  const isDev = () => document.body.classList.contains('dev');
  function setDev(on) { document.body.classList.toggle('dev', on); document.body.classList.toggle('rec', !on); updateHud(); }
  function esc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
  function updateHud() {
    if (cur < 0) return;
    const p = PASOS[cur], s = C.secciones.find(x => x.id === p.seccion);
    const pres = (C.presentadores[p.seccion] || '').trim();
    hud.innerHTML = `<div class="top">Paso ${cur} / ${N - 1} · id <b>${esc(p.id)}</b> · escena ${esc(p.escena)} · beat ${p.beat}</div>
      <div class="tit">${s ? s.id + ' ' + esc(s.nombre) + ' — ' : ''}${esc(p.titulo)}</div>
      <div>${(p.datos || []).map(d => `<span class="st ${d.split(':')[0]}">${esc(d)}</span>`).join('')}</div>
      <div class="notas">${esc(p.notas)}</div>
      ${pres ? `<div>Presenta: <b>${esc(pres)}</b></div>` : ''}
      <div class="keys">→/espacio sigue · ← vuelve · R reinicia · G+n+Enter salta · F pantalla completa · D modo grabación</div>`;
  }

  /* ------------------------------------------------------------ Teclado */
  let gotoBuf = null;
  function showGoto() { gotoEl.hidden = gotoBuf === null; gotoEl.textContent = 'Ir al paso: ' + (gotoBuf || '') + '▌'; }
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (gotoBuf !== null) {
      e.preventDefault();
      if (/^\d$/.test(k)) gotoBuf += k;
      else if (k === 'Backspace') gotoBuf = gotoBuf.slice(0, -1);
      else if (k === 'Enter') { const n = parseInt(gotoBuf, 10); gotoBuf = null; if (!isNaN(n)) go(n, false); }
      else if (k === 'Escape' || k === 'g' || k === 'G') gotoBuf = null;
      showGoto(); return;
    }
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'd' || k === 'D') setDev(!isDev());
    else if (k === 'r' || k === 'R') go(0, false);
    else if (k === 'g' || k === 'G') { gotoBuf = ''; showGoto(); }
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
  });

  /* ------------------------------------------------------------ Escalado */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  addEventListener('resize', fit); fit();

  /* ------------------------------------------------------------ Verificación */
  // Huella del estado visible (para comparar → contra ?step=N y contra ←).
  function snapshot() {
    const s = built[curSlide], out = { slide: curSlide, sec: $('#sec-label').textContent, bar: Array.from(secbar.children).map(d => d.className).join('|') };
    s.els.forEach((e, k) => {
      const cs = getComputedStyle(e);
      out[k] = [(+cs.opacity).toFixed(2), cs.visibility, (e.getAttribute('class') || ''), e.style.transform || '', e._a === 'count' ? e.textContent : ''].join('·');
    });
    return out;
  }
  const busy = () => !!tl;
  window.__app = { go, next, prev, renderInstant, snapshot, busy, setDev, get cur() { return cur; }, N, pasos: PASOS };

  /* ------------------------------------------------------------ Inicio */
  const q = new URLSearchParams(location.search);
  setDev(q.get('dev') === '1' || !!C.config.devPorDefecto);
  const start = q.get('step') != null ? +q.get('step') : 0;
  // Esperar las tipografías para que las medidas (texto en SVG) sean las finales
  const fuentes = document.fonts ? Promise.all(['400', '500', '600', '700', '800'].map(w => document.fonts.load(w + ' 30px Inter', 'AáΔ')).concat(
    ['400', '500', '700'].map(w => document.fonts.load(w + ' 30px "JetBrains Mono"')))).catch(() => {}) : Promise.resolve();
  fuentes.then(() => { renderInstant(start); document.body.dataset.ready = '1'; });
})();
