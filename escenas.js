/* ==========================================================================
   escenas.js — construye cada diapositiva (DOM + SVG) a partir de content.js y data/datos.js.

   Convención de animación (ver main.js): cada elemento animable lleva data-b (beat en que aparece),
   data-a (tipo de animación), data-d (demora), data-out / data-dim / data-st.
   Regla: los elementos animados se posicionan con left/top o atributos SVG, NUNCA con un
   transform inline propio (el motor usa transform para animar y lo limpia al final).
   ========================================================================== */
(() => {
  'use strict';
  const C = window.CONTENIDO, T = C.textos, D = window.DATOS, UI = C.ui;
  const NS = 'http://www.w3.org/2000/svg';
  const ESC = {};
  window.ESCENAS = ESC;

  /* ------------------------------------------------------------ Formatos (es-AR) */
  const nf = (a, b) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: a, maximumFractionDigits: b, useGrouping: 'always' });
  const NF0 = nf(0, 0), NF1 = nf(1, 1), NF2 = nf(2, 2), NF3 = nf(3, 3), NF4 = nf(4, 4);
  const minus = s => s.replace(/^-/, '−');
  const sgn = v => (v > 0 ? '+' : v < 0 ? '−' : '±');
  const F = {
    int: v => NF0.format(Math.round(v)),
    M: v => '$ ' + minus(NF2.format(v / 1e6)) + ' M',          // $ 288,57 M
    m2: v => minus(NF2.format(v / 1e6)),                        // 288,57 (eje, millones)
    m0: v => minus(NF0.format(v / 1e6)),
    m1: v => minus(NF1.format(v / 1e6)),
    dM: v => sgn(v) + NF2.format(Math.abs(v) / 1e6) + ' M',     // +4,77 M
    pct: v => sgn(v) + NF2.format(Math.abs(v)) + ' %',          // +1,65 %
    pct1: v => NF1.format(v) + ' %',
    p2: v => NF2.format(v),
    auc: v => NF4.format(v),
    d2: v => NF2.format(v),
    d1: v => NF1.format(v),
    x1: v => NF1.format(v) + '×',
    C: v => (v >= 1 ? NF0.format(v) : v >= 0.01 ? String(v).replace('.', ',') : String(v).replace('.', ','))
  };
  ESC.fmt = (k, v) => (F[k] || F.int)(v);
  ESC.F = F;
  const tpl = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : '{' + k + '}'));

  /* ------------------------------------------------------------ Cálculos desde los datos */
  const corte = C.config.corteComun;
  const at = (envios, vals, k) => { const i = envios.indexOf(k); return i < 0 ? null : vals[i]; };
  const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;

  // Matriz común: ganancia media al corte y Δ contra el baseline. Todo sale de DATOS.
  function calcularMatriz() {
    const bc = D.baseline.curva, base = at(bc.envios, bc.promedio, corte);
    const v = {
      base: { g: base, estado: D.baseline.estado },
      v1: D.v1Final ? { g: at(D.v1Final.curva.envios, D.v1Final.curva.promedio, corte), estado: D.v1Final.estado } : { g: null, estado: 'pendiente' },
      media: { g: at(D.probRF.envios, D.probRF.B, corte), estado: D.probRF.estado },
      disp: { g: at(D.probRF.envios, D.probRF.C, corte), estado: D.probRF.estado },
      v2: { g: at(D.perfilesV2.curva.envios, D.perfilesV2.curva.promedio, corte), estado: D.perfilesV2.estado },
      v21: { g: at(D.perfilesV21.curva.envios, D.perfilesV21.curva.promedio, corte), estado: D.perfilesV21.estado }
    };
    Object.values(v).forEach(r => { if (r.g != null) { r.d = r.g - base; r.p = 100 * (r.g - base) / base; } });
    return v;
  }
  const MATRIZ = calcularMatriz();
  ESC.calcularMatriz = calcularMatriz;

  // Variante 1: mejor C por generador (regla de selección: AUC en 201908)
  const GENS = ['RF-12', 'RF-32', 'RF-109', 'LGBM-12'];
  const GCOL = { 'RF-12': 'var(--c-rf12)', 'RF-32': 'var(--c-rf32)', 'RF-109': 'var(--c-rf109)', 'LGBM-12': 'var(--c-lgbm12)' };
  function mejorC(reparto, gen) {
    const rows = D.v1Dev.metricas.filter(r => r.reparto === reparto && r.generador === gen && r.C != null);
    return rows.reduce((a, b) => (b.auc > a.auc ? b : a));
  }
  const solo = (reparto, gen) => D.v1Dev.metricas.find(r => r.reparto === reparto && r.generador === gen && r.C == null);
  ESC.mejorC = mejorC;

  /* ------------------------------------------------------------ DOM helpers */
  function h(tag, attrs = {}, html) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'cls') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'anim') setAnim(e, v);
      else e.setAttribute(k, v);
    }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function s(tag, attrs = {}, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'cls') e.setAttribute('class', v);
      else if (k === 'anim') setAnim(e, v);
      else e.setAttribute(k, v);
    }
    if (text != null) e.textContent = text;
    return e;
  }
  // anim: [beat, tipo, demora, extra]  ó  { b, a, d, out, dim, st, dur, ... }
  function setAnim(e, v) {
    if (Array.isArray(v)) v = { b: v[0], a: v[1], d: v[2], ...(v[3] || {}) };
    const map = { b: 'b', a: 'a', d: 'd', out: 'out', dim: 'dim', st: 'st', dur: 'dur', fx: 'fx', fy: 'fy', fs: 'fs', path: 'path', from: 'from', to: 'to', fmt: 'fmt', origin: 'origin' };
    for (const [k, attr] of Object.entries(map)) if (v[k] != null) e.dataset[attr] = typeof v[k] === 'number' ? +v[k].toFixed(3) : v[k];
  }
  const box = (x, y, w, hgt) => `left:${x}px;top:${y}px;${w != null ? 'width:' + w + 'px;' : ''}${hgt != null ? 'height:' + hgt + 'px;' : ''}`;
  function title(root, t, anim = [0, 'up', 0]) {
    root.appendChild(h('h1', { cls: 't', anim }, `<span class="k">${t.kicker}</span>${t.titulo}`));
  }
  function ilus(root) { root.appendChild(h('div', { cls: 'tag-ilus' }, UI.ilustrativo)); }
  function svgAt(root, x, y, w, hgt, anim) {
    const v = s('svg', { width: w, height: hgt, viewBox: `0 0 ${w} ${hgt}`, style: `position:absolute;left:${x}px;top:${y}px;overflow:visible`, anim });
    root.appendChild(v); return v;
  }
  const P = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  /* ------------------------------------------------------------ Gráficos */
  // Devuelve { svg, X, Y } con márgenes internos; ejes, grilla y etiquetas en español.
  function plot(root, o) {
    const m = Object.assign({ l: 96, r: 24, t: 20, b: 78 }, o.m || {});
    const svg = svgAt(root, o.x, o.y, o.w, o.h, o.anim);
    const iw = o.w - m.l - m.r, ih = o.h - m.t - m.b;
    const lin = (d, r) => v => r[0] + (v - d[0]) / (d[1] - d[0]) * (r[1] - r[0]);
    const lg = (d, r) => v => r[0] + (Math.log10(v) - Math.log10(d[0])) / (Math.log10(d[1]) - Math.log10(d[0])) * (r[1] - r[0]);
    const X = (o.xlog ? lg : lin)(o.xd, [m.l, m.l + iw]), Y = lin(o.yd, [m.t + ih, m.t]);
    const g = s('g'); svg.appendChild(g);
    (o.yt || []).forEach(v => {
      g.appendChild(s('line', { cls: 'gr', x1: m.l, x2: m.l + iw, y1: Y(v), y2: Y(v) }));
      g.appendChild(s('text', { cls: 'tick', x: m.l - 14, y: Y(v) + 7, 'text-anchor': 'end' }, o.yf ? o.yf(v) : v));
    });
    (o.xt || []).forEach(v => {
      g.appendChild(s('line', { cls: 'ax', x1: X(v), x2: X(v), y1: m.t + ih, y2: m.t + ih + 8 }));
      g.appendChild(s('text', { cls: 'tick', x: X(v), y: m.t + ih + 34, 'text-anchor': 'middle' }, o.xf ? o.xf(v) : v));
    });
    g.appendChild(s('line', { cls: 'ax', x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih }));
    g.appendChild(s('line', { cls: 'ax', x1: m.l, x2: m.l, y1: m.t, y2: m.t + ih }));
    if (o.xl) g.appendChild(s('text', { cls: 'alab', x: m.l + iw / 2, y: m.t + ih + 72, 'text-anchor': 'middle' }, o.xl));
    if (o.yl) g.appendChild(s('text', { cls: 'alab', x: 0, y: 0, transform: `translate(${m.l - 72} ${m.t + ih / 2}) rotate(-90)`, 'text-anchor': 'middle' }, o.yl));
    if (o.tt) g.appendChild(s('text', { cls: 'lbl', x: m.l, y: m.t - 18, fill: 'var(--ink)' }, o.tt));
    return { svg, X, Y, m, iw, ih, x0: m.l, x1: m.l + iw, y0: m.t + ih, y1: m.t };
  }
  function line(p, xs, ys, color, anim, extra = {}) {
    const pts = xs.map((x, i) => [p.X(x), p.Y(ys[i])]).filter((q, i) => ys[i] != null);
    const e = s('path', { cls: 'ln', d: P(pts), stroke: color, anim, ...extra });
    p.svg.appendChild(e); return e;
  }
  function cutLine(p, k, anim, label) {
    p.svg.appendChild(s('line', { cls: 'cut', x1: p.X(k), x2: p.X(k), y1: p.y0, y2: p.y1, anim }));
    if (label) p.svg.appendChild(s('text', { cls: 'tick', x: p.X(k) + 10, y: p.y1 + 24, anim }, label));
  }
  const kTicks = (a, b, st) => { const r = []; for (let v = a; v <= b; v += st) r.push(v); return r; };
  function legend(root, x, y, items, anim) {
    const d = h('div', { cls: 'legend abs', style: box(x, y), anim });
    items.forEach(it => d.appendChild(h('span', {}, `<i class="${it.dash ? 'dash' : ''}${it.dot ? ' dot' : ''}" style="background:${it.c};color:${it.c}"></i>${it.t}`)));
    root.appendChild(d); return d;
  }
  // etiqueta directa con un pequeño fondo para que no choque con las líneas
  function dlabel(p, x, y, text, color, anim, anchor = 'start') {
    const t = s('text', { cls: 'lbl', x, y, fill: 'var(--ink)', 'text-anchor': anchor, anim });
    t.textContent = text; p.svg.appendChild(t);
    const dot = s('circle', { cx: anchor === 'start' ? x - 14 : x + 14, cy: y - 8, r: 6, fill: color, anim }); p.svg.appendChild(dot);
    return t;
  }

  /* ------------------------------------------------------------ Árboles ilustrativos */
  // spec: { t: 'texto', l: spec, r: spec }  |  { leaf: 'texto', id }
  function tree(svg, spec, o) {
    const g = s('g', { cls: 'tree' }); svg.appendChild(g);
    let leaves = 0; const nodes = [];
    (function count(n) { if (n.leaf != null) leaves++; else { count(n.l); count(n.r); } })(spec);
    let li = 0, depth = 0;
    (function lay(n, d) { depth = Math.max(depth, d); if (n.leaf != null) { n.x = li++; } else { lay(n.l, d + 1); lay(n.r, d + 1); n.x = (n.l.x + n.r.x) / 2; } n.d = d; })(spec, 0);
    const sx = leaves > 1 ? o.w / (leaves - 1) : 0, sy = depth ? o.h / depth : 0;
    const pos = n => [o.x + n.x * sx, o.y + n.d * sy];
    (function draw(n, parent) {
      const [x, y] = pos(n); n.px = x; n.py = y; n.parent = parent;
      if (parent) {
        const e = s('path', { cls: 'edge', d: `M${parent.px} ${parent.py + (o.nh || 40) / 2} L${x} ${y - (n.leaf != null ? (o.lr || 22) : (o.nh || 40) / 2)}` });
        g.appendChild(e); n.edge = e;
      }
      if (n.leaf == null) { draw(n.l, n); draw(n.r, n); }
      nodes.push(n);
    })(spec, null);
    nodes.forEach(n => {
      if (n.leaf != null) {
        const lg = s('g', { cls: 'leaf' });
        lg.appendChild(s('circle', { cx: n.px, cy: n.py, r: o.lr || 22 }));
        if (o.leafText !== false) lg.appendChild(s('text', { cls: 'id', x: n.px, y: n.py + 7, 'text-anchor': 'middle' }, n.leaf));
        g.appendChild(lg); n.el = lg;
      } else {
        const ng = s('g', { cls: 'node' });
        const fs = o.fs || 22, w = o.nw || Math.max(60, n.t.length * fs * 0.62 + 28), hh = o.nh || 40;
        ng.appendChild(s('rect', { x: n.px - w / 2, y: n.py - hh / 2, width: w, height: hh, rx: 8 }));
        if (n.t) ng.appendChild(s('text', { x: n.px, y: n.py + fs * 0.35, 'text-anchor': 'middle', style: `font-size:${fs}px` }, n.t));
        g.appendChild(ng); n.el = ng;
      }
    });
    return { g, nodes, root: spec };
  }
  // camino desde la raíz siguiendo 'l'/'r'
  function walk(spec, dirs) { const out = [spec]; let n = spec; for (const c of dirs) { n = n[c]; out.push(n); } return out; }

  /* ================================================================== ESCENAS */

  /* ---------------------------------------------------------------- Portada */
  ESC.portada = root => {
    const t = T.portada;
    // Bosque de árboles de decisión (motivo animado)
    const v = svgAt(root, 1040, 120, 860, 840);
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const trees = [[160, 120, 1.0], [470, 60, 1.25], [720, 200, 0.9], [300, 430, 0.85], [600, 470, 1.1], [130, 640, 0.7], [760, 620, 0.75]];
    trees.forEach(([cx, cy, sc], k) => {
      const g = s('g', { opacity: 0.85 - k * 0.07 }); v.appendChild(g);
      const lv = [[0, 0]], segs = [];
      for (let d = 0; d < 3; d++) {
        const span = 150 * sc / (d + 1);
        lv.splice(0).forEach(([x, y]) => [-1, 1].forEach(sgn => { const nx = x + sgn * span / 2, ny = y + 70 * sc; segs.push([x, y, nx, ny, d]); if (rnd() > 0.18 || d === 0) lv.push([nx, ny]); }));
      }
      segs.forEach(([x0, y0, x1, y1, d], i) => g.appendChild(s('path', { d: `M${cx + x0} ${cy + y0} L${cx + x1} ${cy + y1}`, stroke: d === 2 && i % 3 === 0 ? 'var(--accent)' : '#3A424E', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', anim: [0, 'draw', 0.3 + k * 0.12 + d * 0.18, { dur: 0.5 }] })));
      segs.filter(q => q[4] === 2).forEach(([, , x1, y1], i) => g.appendChild(s('circle', { cx: cx + x1, cy: cy + y1, r: 7 * sc, fill: i % 3 === 0 ? 'var(--accent)' : '#4A525E', anim: [0, 'pop', 0.9 + k * 0.12 + i * 0.03, { dur: 0.4 }] })));
      g.appendChild(s('rect', { x: cx - 26 * sc, y: cy - 16 * sc, width: 52 * sc, height: 32 * sc, rx: 7, fill: '#1C222C', stroke: '#4A525E', 'stroke-width': 2, anim: [0, 'pop', 0.2 + k * 0.12, { dur: 0.4 }] }));
    });
    root.appendChild(h('div', { cls: 'abs kicker', style: box(96, 250), anim: [0, 'up', 0] }, t.materia));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 300, 1000) + 'font-size:100px;font-weight:800;letter-spacing:-.03em;line-height:1.02', anim: [0, 'up', 0.1] }, t.titulo.replace(' Features', '<br>Features')));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 540, 940) + 'border-left:6px solid var(--accent);padding:8px 0 8px 28px;font-size:36px;font-weight:600;line-height:1.3;color:var(--ink)', anim: [0, 'up', 0.35] }, t.pregunta));
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 800, 960) + 'color:var(--ink)', anim: [0, 'up', 0.6] }, t.integrantes));
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 850, 960) + 'font-size:26px', anim: [0, 'up', 0.7] }, t.programa));
  };

  /* ---------------------------------------------------------------- 01 · problema */
  ESC.problema = root => {
    const t = T.problema; title(root, t);
    const m = D.clases.meses['201910'], filas = m.BAJA_1 + m.BAJA_2 + m.CONTINUA;
    const tasa = 100 * (m.BAJA_1 + m.BAJA_2) / filas;
    const cols = 40, rows = 25, sp = 22, x0 = 96, y0 = 300;
    const v = svgAt(root, x0, y0, cols * sp, rows * sp);
    const grid = s('g', { anim: [0, 'fade', 0.2, { dur: 0.9 }] }); v.appendChild(grid);
    const nLit = Math.round(cols * rows * (m.BAJA_1 + m.BAJA_2) / filas);           // ≈ 9 de 1.000
    const nB2 = Math.round(nLit * m.BAJA_2 / (m.BAJA_1 + m.BAJA_2));
    let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const lit = new Set(); while (lit.size < nLit) lit.add(Math.floor(rnd() * cols * rows));
    for (let i = 0; i < cols * rows; i++) if (!lit.has(i)) grid.appendChild(s('circle', { cx: (i % cols) * sp + sp / 2, cy: Math.floor(i / cols) * sp + sp / 2, r: 6, fill: '#2A313C' }));
    [...lit].forEach((i, k) => {
      const isB2 = k < nB2;
      v.appendChild(s('circle', { cx: (i % cols) * sp + sp / 2, cy: Math.floor(i / cols) * sp + sp / 2, r: 9, fill: isB2 ? 'var(--accent)' : '#7FA7E8', cls: 'litdot', anim: { b: 0, a: 'pop', d: 1.0 + k * 0.08, st: '0:pre 1:post' } }));
    });
    // los puntos encendidos empiezan blancos y en el beat 1 toman el color de su clase
    const st = h('style', {}, '.litdot.pre{fill:#ECEEF1}.litdot{transition:fill .6s}'); root.appendChild(st);
    root.appendChild(h('div', { cls: 'abs small', style: box(x0, y0 + rows * sp + 20, cols * sp), anim: [0, 'fade', 0.4] }, t.unidad + ' · ' + tpl(t.fuente, { filas: F.int(filas), b1: F.int(m.BAJA_1), b2: F.int(m.BAJA_2) })));
    const R = 1100;
    root.appendChild(h('div', { cls: 'abs', style: box(R, 290, 720) + 'font-size:84px;font-weight:800;letter-spacing:-.02em;line-height:1', anim: [0, 'up', 0.6] }, F.int(filas)));
    root.appendChild(h('div', { cls: 'abs sub', style: box(R, 390, 720) + 'line-height:1.35', anim: [0, 'up', 0.8] }, `${t.escala}<br>${t.tasa} <span class="mono" style="color:var(--ink)">(${F.d2(tasa)} %)</span>`));
    const items = [[t.b2, t.b2d, 'var(--accent)', m.BAJA_2], [t.b1, t.b1d, '#7FA7E8', m.BAJA_1], [t.cont, '', '#2A313C', m.CONTINUA]];
    items.forEach(([k, d, c, n], i) => root.appendChild(h('div', { cls: 'abs', style: box(R, 500 + i * 96, 720) + 'display:flex;gap:20px;align-items:flex-start', anim: [1, 'left', 0.2 + i * 0.15] },
      `<span style="width:22px;height:22px;border-radius:50%;background:${c};margin-top:8px;flex:none"></span><div><div style="font-size:30px;font-weight:700" class="mono">${k} <span style="font-weight:400;color:var(--ink2);font-size:26px">· ${F.int(n)}</span></div><div class="small" style="font-size:24px">${d}</div></div>`)));
    root.appendChild(h('div', { cls: 'abs pill acc', style: box(R, 800) + 'font-size:26px', anim: [1, 'up', 0.8] }, t.entrena));
  };

  /* ---------------------------------------------------------------- 01 · ganancia */
  ESC.ganancia = root => {
    const t = T.ganancia; title(root, t);
    const row = (y, big, d, c, k) => root.appendChild(h('div', { cls: 'abs', style: box(96, y, 680), anim: [0, 'left', 0.3 + k * 0.25] },
      `<div class="mono" style="font-size:54px;font-weight:700;color:${c}">${big}</div><div class="sub" style="font-size:28px">${d}</div>`));
    row(290, t.gana, t.ganaD, 'var(--accent)', 0);
    row(450, t.pierde, t.pierdeD, 'var(--ink2)', 1);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 640, 680), anim: [0, 'up', 0.9] }, `<h3 style="font-size:30px">${t.equilibrio}</h3><p>${t.equilibrioD}</p>`));
    const bc = D.baseline.curva, ys = bc.promedio;
    const p = plot(root, { x: 860, y: 300, w: 964, h: 600, xd: [0, 15000], yd: [0, 320e6], xt: kTicks(0, 15000, 3000), yt: kTicks(0, 300e6, 50e6), xf: F.int, yf: F.m0, xl: UI.envios, yl: UI.ganancia, anim: [1, 'fade', 0] });
    root.appendChild(h('div', { cls: 'abs', style: box(956, 252, 860) + 'font-size:26px;font-weight:600', anim: [1, 'fade', 0] }, t.curvaTit));
    line(p, bc.envios, ys, 'var(--c-base)', [1, 'draw', 0.3, { dur: 1.6 }], { 'stroke-width': 4 });
    const im = ys.indexOf(Math.max(...ys)), kx = bc.envios[im];
    p.svg.appendChild(s('circle', { cx: p.X(kx), cy: p.Y(ys[im]), r: 9, fill: 'var(--ink)', anim: [1, 'pop', 1.6] }));
    p.svg.appendChild(s('text', { cls: 'lbl', x: p.X(kx) + 18, y: p.Y(ys[im]) - 18, fill: 'var(--ink)', anim: [1, 'fade', 1.7] }, `${t.maxLbl}: ${F.M(ys[im])} · ${F.int(kx)} envíos`));
    p.svg.appendChild(s('text', { cls: 'tick', x: p.x1, y: p.y0 - 16, 'text-anchor': 'end', anim: [1, 'fade', 1.8] }, t.curvaNota));
  };

  /* ---------------------------------------------------------------- 01 · hipótesis */
  ESC.hipotesis = root => {
    const t = T.hipotesis; title(root, t);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 280, 1728) + 'border-left:6px solid var(--accent);padding:36px 44px', anim: [0, 'up', 0.2] },
      `<span class="num">${t.h1k}</span><p style="font-size:40px;line-height:1.35;color:var(--ink);font-weight:600">${t.h1}</p>`));
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 560, 1728) + 'padding:30px 44px', anim: [0, 'up', 0.6] },
      `<span class="num" style="color:var(--ink2)">${t.h0k}</span><p style="font-size:32px">${t.h0}</p>`));
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 790, 1728) + 'font-size:32px', anim: [1, 'up', 0.1] }, `<span class="hl">→</span> ${t.porque}`));
  };

  /* ---------------------------------------------------------------- 02 · bibliografía */
  function refRows(root, refs, y0, rh, b, outB) {
    refs.forEach((r, i) => {
      root.appendChild(h('div', { cls: 'abs', style: box(96, y0 + i * rh, 1728, rh - 16) + 'display:grid;grid-template-columns:640px 1fr;gap:48px;border-top:1px solid var(--line);padding-top:16px', anim: { b, a: 'up', d: 0.15 + i * 0.12, out: outB } },
        `<div><div style="font-size:28px;font-weight:700">${r.cita}${r.verificar ? '<span class="dev-only badge-ver">verificar</span>' : ''}</div><div class="small" style="font-style:italic">${r.obra}</div></div>
         <div style="font-size:26px;line-height:1.4;color:var(--ink2)">${r.tomamos}</div>`));
    });
  }
  ESC.biblio1 = root => { const t = T.biblio1; title(root, t); refRows(root, t.refs, 262, 136, 0); };

  /* ---------------------------------------------------------------- 03 · sesgos */
  ESC.sesgos = root => {
    const t = T.sesgos; title(root, t);
    root.appendChild(h('div', { cls: 'abs', style: box(96, 250, 1728) + 'font-size:28px;line-height:1.48;color:var(--ink2);border-left:4px solid var(--line);padding-left:28px', anim: [0, 'fade', 0.2, { dim: 1 }] }, '“' + t.cita + '”'));
    const col = (x, k, d, c, dl) => root.appendChild(h('div', { cls: 'abs card', style: box(x, 540, 780, 170) + `border-top:4px solid ${c}`, anim: [0, 'up', dl] }, `<span class="num" style="color:${c}">${k}</span><p style="font-size:28px;color:var(--ink)">${d}</p>`));
    col(96, t.expK, t.exp, 'var(--ink2)', 0.8);
    root.appendChild(h('div', { cls: 'abs', style: box(900, 590) + 'font-size:56px;color:var(--accent)', anim: [0, 'left', 1.1] }, '→'));
    col(1044, t.demK, t.dem, 'var(--accent)', 1.3);
    root.appendChild(h('div', { cls: 'abs kicker', style: box(96, 750), anim: [1, 'up', 0] }, t.borradorK));
    const nb = t.borrador.length, bw = nb > 1 ? 844 : 1728;
    t.borrador.forEach((b, i) => root.appendChild(h('div', { cls: 'abs card', style: box(96 + i * 884, 792, bw) + 'padding:20px 28px', anim: [1, 'up', 0.2 + i * 0.2] }, `<h3 style="font-size:28px;margin-bottom:6px">${b.t}</h3><p style="font-size:24px">${b.d}</p>`)));
  };

  /* ---------------------------------------------------------------- 04 · diseño */
  ESC.diseno = root => {
    const t = T.diseno; title(root, t);
    t.variantes.forEach((v, i) => {
      const x = 96 + i * 588;
      const steps = v.pasos.map((p, k) => `<div style="font-size:28px;color:var(--ink);padding:10px 0">${p}</div>${k < v.pasos.length - 1 ? '<div style="color:var(--accent);font-size:26px">↓</div>' : ''}`).join('');
      root.appendChild(h('div', { cls: 'abs card', style: box(x, 270, 552, 520), anim: [0, 'up', 0.2 + i * 0.25] },
        `<span class="num">${v.n}</span><h3 style="font-size:36px">${v.t}</h3><div style="margin-top:18px">${steps}</div><div style="position:absolute;left:32px;bottom:28px"><span class="pill ${i === 0 ? 'acc' : ''}">${v.nota}</span></div>`));
    });
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 830, 1728) + 'font-size:24px', anim: [0, 'fade', 1.1] }, t.control));
  };

  /* ---------------------------------------------------------------- 04 · dataset */
  ESC.dataset = root => {
    const t = T.dataset; title(root, t);
    const x0 = 96, y0 = 270, cw = 196, rh = 52;
    t.versiones.forEach((v, j) => root.appendChild(h('div', { cls: 'abs mono', style: box(x0 + 250 + j * cw, y0, cw) + 'font-size:22px;color:var(--muted)', anim: [0, 'fade', 0.1] }, v)));
    t.variables.forEach((v, i) => {
      const y = y0 + 44 + i * rh;
      root.appendChild(h('div', { cls: 'abs mono', style: box(x0, y + 10, 240) + 'font-size:24px;color:var(--ink)', anim: [0, 'left', 0.2 + i * 0.08] }, v));
      t.versiones.forEach((vv, j) => root.appendChild(h('div', { cls: 'abs', style: box(x0 + 250 + j * cw, y + 6, cw - 12, rh - 12) + `border-radius:6px;background:${j ? '#1C222C' : '#252C37'};border:1px solid #2A313C`, anim: [0, 'growx', 0.3 + i * 0.08 + j * 0.05, { dur: 0.4 }] })));
    });
    const yb = y0 + 44 + t.variables.length * rh + 6;
    root.appendChild(h('div', { cls: 'abs small', style: box(x0, yb, 1230) + 'font-size:24px', anim: [0, 'fade', 0.9] }, '⋮ ' + t.cols));
    root.appendChild(h('div', { cls: 'abs sub', style: box(x0, yb + 80, 1230) + 'font-size:28px', anim: [0, 'fade', 1.0] }, t.filas));
    root.appendChild(h('div', { cls: 'abs small', style: box(x0, yb + 150, 1230) + 'font-size:22px', anim: [0, 'fade', 1.1] }, t.nota));
    // columna de clase → binaria
    const X = 1400;
    root.appendChild(h('div', { cls: 'abs mono', style: box(X, y0, 400) + 'font-size:22px;color:var(--muted)', anim: [0, 'fade', 1.3] }, t.target));
    const cls = [['CONTINUA', '0', 'var(--ink2)'], ['BAJA_1', '1', '#7FA7E8'], ['BAJA_2', '1', 'var(--accent)'], ['CONTINUA', '0', 'var(--ink2)'], ['CONTINUA', '0', 'var(--ink2)']];
    cls.forEach(([c, b, col], i) => {
      const y = y0 + 50 + i * rh;
      root.appendChild(h('div', { cls: 'abs mono', style: box(X, y, 200, rh - 12) + `font-size:24px;color:${col};border:1px solid #2A313C;border-radius:6px;padding:6px 10px`, anim: [0, 'fade', 1.4 + i * 0.06] }, c));
      root.appendChild(h('div', { cls: 'abs mono', style: box(X + 280, y, 120, rh - 12) + `font-size:26px;font-weight:700;color:${b === '1' ? 'var(--accent)' : 'var(--muted)'};border:1px solid ${b === '1' ? 'var(--accent)' : '#2A313C'};border-radius:6px;padding:4px 0;text-align:center`, anim: [0, 'right', 1.9 + i * 0.06] }, b));
    });
    root.appendChild(h('div', { cls: 'abs', style: box(X + 212, y0 + 160) + 'font-size:40px;color:var(--accent)', anim: [0, 'fade', 1.8] }, '→'));
    root.appendChild(h('div', { cls: 'abs', style: box(X - 40, y0 + 330, 460) + 'font-size:26px;color:var(--ink);line-height:1.4', anim: [0, 'up', 2.3] }, `${t.binaria}<br><span class="hl" style="font-weight:700">${t.paga}</span>`));
  };

  /* ---------------------------------------------------------------- 04 · calendario */
  const MESES = ['201901', '201902', '201903', '201904', '201905', '201906', '201907', '201908', '201909', '201910', '201911', '201912'];
  ESC.calendario = root => {
    const t = T.calendario; title(root, t);
    const x0 = 470, cw = 104, gap = 6, yH = 268, y0 = 322, rh = 116;
    const mx = i => x0 + i * (cw + gap);
    MESES.forEach((m, i) => root.appendChild(h('div', { cls: 'abs mono', style: box(mx(i), yH, cw) + 'font-size:22px;text-align:center;color:var(--ink2)', anim: [0, 'fade', i * 0.03] }, m)));
    // historia para lags (01–02)
    root.appendChild(h('div', { cls: 'abs', style: box(mx(0), y0 - 12, 2 * cw + gap, 4 * rh - 8) + 'border-radius:10px;background:repeating-linear-gradient(135deg,#1A1F27 0 10px,#141820 10px 20px);border:1px solid #232A34', anim: [0, 'fade', 0.3] }));
    root.appendChild(h('div', { cls: 'abs small', style: box(96, y0 + 4 * rh + 2, 340) + 'font-size:22px;line-height:1.25', anim: [0, 'fade', 0.4] }, '▨ ' + t.leyenda.historia));
    const roles = {
      sel: { a: [2, 3, 4], e: [5] }, def: { a: [2, 3, 4, 5], p: [6, 7, 9] }, dev: { a: [2, 3, 4, 5], e: [7] }, fin: { a: [2, 3, 4, 5, 6, 7], e: [9] }
    };
    const beatOf = { sel: 0, def: 1, dev: 1, fin: 2 };
    t.filas.forEach((f, r) => {
      const y = y0 + r * rh, b = beatOf[f.k], d0 = f.k === 'dev' ? 0.5 : 0;
      root.appendChild(h('div', { cls: 'abs', style: box(96, y - 6, 350), anim: [b, 'left', d0] }, `<div style="font-size:27px;font-weight:700">${f.t}</div><div class="small" style="font-size:22px;line-height:1.25">${f.d}</div>`));
      const R = roles[f.k];
      (R.a || []).forEach((i, k) => root.appendChild(h('div', { cls: 'abs', style: box(mx(i), y, cw, 60) + 'border-radius:8px;background:#56606E', anim: [b, 'growx', d0 + 0.2 + k * 0.06, { dur: 0.4 }] })));
      (R.p || []).forEach((i, k) => root.appendChild(h('div', { cls: 'abs', style: box(mx(i), y, cw, 60) + 'border-radius:8px;background:rgba(78,134,240,.18);border:2px solid #4E86F0', anim: [b, 'pop', d0 + 0.6 + k * 0.08, { dur: 0.4 }] })));
      (R.e || []).forEach(i => root.appendChild(h('div', { cls: 'abs', style: box(mx(i), y, cw, 60) + `border-radius:8px;background:${f.k === 'fin' ? 'var(--accent)' : 'var(--accent-soft)'};border:2px solid var(--accent)`, anim: [b, 'pop', d0 + 0.7, { dur: 0.5 }] })));
    });
    // test
    root.appendChild(h('div', { cls: 'abs mono', style: box(mx(9) - 120, y0 + 4 * rh - 2, cw + 240) + 'font-size:22px;color:var(--accent);text-align:center;white-space:nowrap', anim: [2, 'up', 1.0] }, t.test));
    // leyenda
    const lg = [[t.leyenda.ajuste, 'background:#56606E'], [t.leyenda.eval, 'background:var(--accent-soft);border:2px solid var(--accent)'], [t.leyenda.aplica, 'background:rgba(78,134,240,.18);border:2px solid #4E86F0']];
    lg.forEach(([l, st], i) => root.appendChild(h('div', { cls: 'abs', style: box(470 + i * 300, 840) + 'display:flex;gap:12px;align-items:center;font-size:24px;color:var(--ink2)', anim: [0, 'fade', 0.6] }, `<span style="width:40px;height:24px;border-radius:6px;${st}"></span>${l}`)));
    // huecos (beat 3)
    root.appendChild(h('div', { cls: 'abs', style: box(mx(6) - 4, y0 - 14, cw + 8, 4 * rh - 4) + 'border:3px dashed #F4C46A;border-radius:12px', anim: [3, 'fade', 0.1] }));
    root.appendChild(h('div', { cls: 'abs', style: box(mx(10) - 4, y0 - 14, 2 * cw + gap + 8, 4 * rh - 4) + 'border-radius:12px;background:repeating-linear-gradient(45deg,rgba(240,85,47,.10) 0 10px,transparent 10px 20px);border:2px solid #5A2A20', anim: [3, 'fade', 0.4] }));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 892, 1728) + 'font-size:26px;color:var(--ink)', anim: [3, 'up', 0.6] }, `<span style="color:#F4C46A;font-weight:700">201907</span> · ${t.h07.replace(/^201907 /, '')}`));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 934, 1728) + 'font-size:26px;color:var(--ink)', anim: [3, 'up', 0.8] }, `<span style="color:var(--accent);font-weight:700">201911–12</span> · ${t.h11.replace(/^201911–12 /, '')}`));
  };

  /* ---------------------------------------------------------------- 04 · árbol */
  const ARBOL = { t: 'ctrx_quarter < 15', l: { t: 'mcaja_ahorro < 1.200', l: { t: 'cliente_antiguedad < 24', l: { leaf: '0,31' }, r: { leaf: '0,09' } }, r: { leaf: '0,04' } }, r: { t: 'mpayroll < 20.000', l: { leaf: '0,02' }, r: { leaf: '0,01' } } };
  ESC.arbol = root => {
    const t = T.arbol; title(root, t); ilus(root);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 280, 520) + 'padding:22px 28px', anim: [0, 'up', 0.1] },
      `<span class="num">${t.fila}</span>` + t.vals.map(([k, v]) => `<div class="mono" style="font-size:24px;display:flex;justify-content:space-between;padding:5px 0"><span>${k}</span><b style="color:var(--ink)">${v}</b></div>`).join('')));
    const v = svgAt(root, 0, 0, 1920, 1080);
    const spec = JSON.parse(JSON.stringify(ARBOL));
    const tr = tree(v, spec, { x: 760, y: 300, w: 1000, h: 480, nh: 50, fs: 24, lr: 34 });
    tr.nodes.forEach((n, k) => { if (n.edge) setAnim(n.edge, { b: 0, a: 'draw', d: 0.2 + n.d * 0.25, dur: 0.4 }); setAnim(n.el, { b: 0, a: 'pop', d: 0.15 + n.d * 0.25, dur: 0.45 }); });
    tr.nodes.forEach(n => { if (n.leaf != null) n.el.appendChild(s('text', { x: n.px, y: n.py + 66, 'text-anchor': 'middle', style: 'font-size:20px;fill:var(--muted)' }, 'P(baja)')); });
    const path = walk(spec, ['l', 'l', 'l']);
    path.forEach((n, k) => { if (n.edge) setAnim(n.edge, { b: 0, a: 'draw', d: 0.2 + n.d * 0.25, dur: 0.4, st: '1:on' }); n.el.dataset.st = '1:on'; n.el.dataset.d = (0.3 + k * 0.45).toFixed(2); if (n.edge) n.edge.dataset.d = n.edge.dataset.d; });
    // la fila (punto) viaja por el camino en el beat 1
    const leaf = path[path.length - 1];
    const pts = [[620, 330], ...path.slice(0, -1).map(n => [n.px, n.py])].map(([x, y]) => `${(x - leaf.px).toFixed(0)},${(y - leaf.py).toFixed(0)}`).join(';');
    v.appendChild(s('circle', { cx: leaf.px, cy: leaf.py, r: 44, fill: 'none', stroke: '#fff', 'stroke-width': 4, anim: { b: 1, a: 'path', d: 0, dur: 1.8, path: pts } }));
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 580, 520) + 'border-left:6px solid var(--accent)', anim: [1, 'up', 2.2] },
      `<span class="num">${t.reglaK}</span>` + t.regla.split('∧').map((c, i) => `<div class="mono" style="font-size:25px;color:var(--ink);padding:4px 0">${i ? '<span class="hl">∧</span> ' : ''}${c.trim()}</div>`).join('')));
  };

  /* ---------------------------------------------------------------- 04 · RF vs GBDT */
  const MINI = () => ({ t: '', l: { t: '', l: { leaf: '' }, r: { leaf: '' } }, r: { t: '', l: { leaf: '' }, r: { leaf: '' } } });
  function miniTree(v, x, y, w, hh, anim, hiLeaf) {
    const tr = tree(v, MINI(), { x, y, w, h: hh, nw: 30, nh: 22, lr: 11, leafText: false });
    tr.g.dataset.b = anim.b; tr.g.dataset.a = anim.a || 'pop'; tr.g.dataset.d = anim.d || 0;
    if (hiLeaf != null) { const lv = tr.nodes.filter(n => n.leaf != null); lv[hiLeaf].el.classList.add('on'); }
    return tr;
  }
  ESC.rfgbdt = root => {
    const t = T.rfgbdt; title(root, t); ilus(root);
    const v = svgAt(root, 0, 0, 1920, 1080);
    // RF
    root.appendChild(h('div', { cls: 'abs', style: box(96, 262, 820), anim: [0, 'up', 0] }, `<div style="font-size:32px;font-weight:700">${t.rfT}</div><div class="small" style="font-size:24px;margin-top:6px">${t.rfD}</div>`));
    [0, 1, 2].forEach(k => {
      const x = 160 + k * 260;
      v.appendChild(s('text', { cls: 'tick', x: x + 70, y: 420, 'text-anchor': 'middle', anim: [0, 'fade', 0.3 + k * 0.15] }, t.boot + ' ' + (k + 1)));
      miniTree(v, x, 450, 140, 110, { b: 0, d: 0.4 + k * 0.15 });
      v.appendChild(s('path', { d: `M${x + 70} 600 L${(160 + 260 + 70)} 660`, stroke: '#4A525E', 'stroke-width': 2.5, fill: 'none', anim: [0, 'draw', 0.9] }));
    });
    root.appendChild(h('div', { cls: 'abs pill', style: box(420, 662) + 'font-size:26px', anim: [0, 'pop', 1.1] }, t.prom));
    // GBDT
    root.appendChild(h('div', { cls: 'abs', style: box(1004, 262, 820), anim: [1, 'up', 0] }, `<div style="font-size:32px;font-weight:700">${t.gbT}</div><div class="small" style="font-size:24px;margin-top:6px">${t.gbD}</div>`));
    [0, 1, 2].forEach(k => {
      const x = 1040 + k * 270;
      miniTree(v, x, 450, 140, 110, { b: 1, d: 0.3 + k * 0.45 });
      if (k < 2) {
        v.appendChild(s('path', { d: `M${x + 160} 505 L${x + 250} 505`, stroke: 'var(--accent)', 'stroke-width': 3, fill: 'none', 'marker-end': 'url(#arr)', anim: [1, 'draw', 0.55 + k * 0.45] }));
        v.appendChild(s('text', { cls: 'tick', x: x + 205, y: 420, 'text-anchor': 'middle', anim: [1, 'fade', 0.6 + k * 0.45] }, t.error));
      }
    });
    v.appendChild(s('defs', {}, null)).innerHTML = '<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#F0552F"/></marker>';
    root.appendChild(h('div', { cls: 'abs pill acc', style: box(1340, 662) + 'font-size:26px', anim: [1, 'pop', 1.5] }, t.suma));
    // superposición vs complemento
    const ov = (x, y, k, comp) => {
      const g = s('g', { anim: [1, 'fade', 1.8 + k * 0.1] }); v.appendChild(g);
      [0, 1, 2].forEach(j => g.appendChild(s('rect', comp ? { x: x + j * 74, y, width: 70, height: 90, rx: 8, fill: ['#4E86F0', '#F0552F', '#F4C46A'][j], opacity: 0.55 } : { x: x + j * 26, y: y + j * 8, width: 150, height: 80, rx: 8, fill: '#9AA3AE', opacity: 0.28 })));
    };
    ov(110, 770, 0, false); ov(1020, 770, 1, true);
    root.appendChild(h('div', { cls: 'abs', style: box(340, 776, 560) + 'font-size:25px;color:var(--ink);line-height:1.35', anim: [1, 'fade', 1.9] }, t.rfN));
    root.appendChild(h('div', { cls: 'abs', style: box(1260, 776, 560) + 'font-size:25px;color:var(--ink);line-height:1.35', anim: [1, 'fade', 2.0] }, t.gbN));
  };

  /* ---------------------------------------------------------------- 04 · OOB */
  ESC.oob = root => {
    const t = T.oob; title(root, t); ilus(root);
    const nr = 9, nc = 14, cw = 50, ch = 40, x0 = 300, y0 = 330, hi = 3;
    let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    root.appendChild(h('div', { cls: 'abs small', style: box(x0, y0 - 46, nc * (cw + 6)) + 'font-size:24px', anim: [0, 'fade', 0] }, t.arboles + ' →'));
    root.appendChild(h('div', { cls: 'abs small', style: box(96, y0, 180) + 'font-size:24px;line-height:1.3', anim: [0, 'fade', 0] }, t.filas));
    let nOob = 0;
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
      const inb = rnd() < 0.632;
      if (r === hi && !inb) nOob++;
      const st = r === hi ? (inb ? '0:in' : '0:x 1:oob') : (inb ? '0:in' : '');
      const e = h('div', { cls: 'cell', style: box(x0 + c * (cw + 6), y0 + r * (ch + 6), cw, ch), anim: { b: 0, a: 'fade', d: 0.2 + c * 0.05, dur: 0.3, st: st || null, dim: r === hi ? null : 1 } });
      root.appendChild(e);
    }
    root.appendChild(h('div', { cls: 'abs mono', style: box(x0 - 110, y0 + hi * (ch + 6) + 4, 100) + 'font-size:24px;color:var(--accent);text-align:right;font-weight:700', anim: [1, 'left', 0] }, t.fila));
    const xr = x0 + nc * (cw + 6) + 60;
    root.appendChild(h('div', { cls: 'abs', style: box(xr, y0, 600) + 'display:flex;gap:14px;align-items:center;font-size:24px;color:var(--ink2)', anim: [0, 'fade', 0.9] }, `<span class="cell in" style="position:static;width:34px;height:26px;display:inline-block"></span>${t.inbag}`));
    root.appendChild(h('div', { cls: 'abs', style: box(xr, y0 + 56, 600) + 'display:flex;gap:14px;align-items:center;font-size:24px;color:var(--ink2)', anim: [1, 'fade', 0.3] }, `<span class="cell oob" style="position:static;width:34px;height:26px;display:inline-block"></span>${t.oobL}`));
    root.appendChild(h('div', { cls: 'abs', style: box(xr, y0 + 140, 560) + 'font-size:30px;color:var(--ink);line-height:1.35', anim: [1, 'up', 0.6] }, `<span class="hl" style="font-weight:700">${nOob} de ${nc}</span> árboles: ${t.usa}`));
    // meses posteriores
    const yA = y0 + nr * (ch + 6) + 30;
    root.appendChild(h('div', { cls: 'abs mono', style: box(96, yA + 6, 190) + 'font-size:22px;color:#4E86F0;text-align:right', anim: [2, 'left', 0] }, 'fila 201908'));
    for (let c = 0; c < nc; c++) root.appendChild(h('div', { cls: 'cell all', style: box(x0 + c * (cw + 6), yA, cw, ch), anim: [2, 'pop', 0.1 + c * 0.04, { dur: 0.3 }] }));
    root.appendChild(h('div', { cls: 'abs', style: box(x0, yA + 56, 900) + 'font-size:24px;color:var(--ink2)', anim: [2, 'fade', 0.7] }, t.despues));
    root.appendChild(h('div', { cls: 'abs card', style: box(xr, y0 + 300, 560) + 'border-left:6px solid #F4C46A;padding:22px 26px', anim: [2, 'up', 1.0] }, `<p style="font-size:25px;color:var(--ink)">${t.lim}</p>`));
  };

  /* ---------------------------------------------------------------- 04 · variante 1 */
  ESC.v1 = root => {
    const t = T.v1; title(root, t); ilus(root);
    const v = svgAt(root, 0, 0, 1920, 1080);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 300, 250) + 'padding:18px 22px', anim: [0, 'up', 0, { dim: 2 }] }, `<span class="num">${T.arbol.fila}</span><div class="mono" style="font-size:22px;color:var(--ink2);line-height:1.6">ctrx_quarter<br>mcaja_ahorro<br>…</div>`));
    // tres árboles: 3, 2 y 4 hojas; la fila cae en las hojas 2, 1 y 3
    const specs = [
      { t: '', l: { leaf: '1' }, r: { t: '', l: { leaf: '2' }, r: { leaf: '3' } } },
      { t: '', l: { leaf: '1' }, r: { leaf: '2' } },
      { t: '', l: { t: '', l: { leaf: '1' }, r: { leaf: '2' } }, r: { t: '', l: { leaf: '3' }, r: { leaf: '4' } } }
    ];
    const hits = [['r', 'l'], ['l'], ['r', 'l']], ids = [2, 1, 3], nLeaves = [3, 2, 4];
    specs.forEach((sp, k) => {
      const x = 430 + k * 300;
      v.appendChild(s('text', { cls: 'tick', x: x + 90, y: 280, 'text-anchor': 'middle', anim: [0, 'fade', 0.1 + k * 0.1, { dim: 2 }] }, 'árbol ' + (k + 1)));
      const tr = tree(v, sp, { x, y: 320, w: 180, h: 150, nw: 34, nh: 24, lr: 18 });
      tr.g.dataset.b = 0; tr.g.dataset.a = 'pop'; tr.g.dataset.d = 0.1 + k * 0.1; tr.g.dataset.dim = 2;
      const path = walk(sp, hits[k]);
      path.forEach((n, j) => { if (n.edge) n.edge.dataset.st = '0:on'; n.el.dataset.st = '0:on'; });
      path.forEach(n => { n.el.dataset.d = (0.6 + k * 0.25).toFixed(2); if (n.edge) n.edge.dataset.d = (0.6 + k * 0.25).toFixed(2); });
    });
    root.appendChild(h('div', { cls: 'abs mono', style: box(1360, 360, 420) + 'font-size:44px;font-weight:700;color:var(--ink)', anim: [0, 'right', 1.4, { dim: 2 }] }, `[${ids.join(', ')}]`));
    root.appendChild(h('div', { cls: 'abs small', style: box(1360, 420, 420), anim: [0, 'fade', 1.5, { dim: 2 }] }, t.ids));
    // one-hot
    const cw = 64, y1 = 560; let x = 430; const ones = [];
    nLeaves.forEach((n, k) => {
      for (let j = 1; j <= n; j++) {
        const one = j === ids[k];
        const e = h('div', { cls: 'abs mono', style: box(x, y1, cw - 6, 64) + `font-size:30px;font-weight:700;text-align:center;line-height:62px;border-radius:8px;${one ? 'background:var(--accent);color:#fff' : 'background:#1C222C;color:#5E6672;border:1px solid #2A313C'}`, anim: [0, 'fly', 1.8 + k * 0.35 + j * 0.04, { fx: 1360 - x, fy: 360 - y1, fs: 0.6, dur: 0.6, out: 2 }] }, one ? '1' : '0');
        root.appendChild(e); if (one) ones.push(x);
        x += cw;
      }
      root.appendChild(h('div', { cls: 'abs small', style: box(x - n * cw, y1 + 72, n * cw - 6) + 'text-align:center;font-size:22px', anim: [0, 'fade', 2.0 + k * 0.35, { out: 2 }] }, 'árbol ' + (k + 1)));
      if (k < 2) root.appendChild(h('div', { cls: 'abs', style: box(x + 2, y1 - 6, 4, 76) + 'background:var(--muted);border-radius:2px', anim: [0, 'fade', 2.0 + k * 0.35, { out: 2 }] }));
      x += 14;
    });
    root.appendChild(h('div', { cls: 'abs small', style: box(1110, y1 + 4, 700) + 'font-size:24px;line-height:1.3', anim: [0, 'fade', 3.0, { out: 2 }] }, t.oh));
    root.appendChild(h('div', { cls: 'abs small', style: box(430, y1 + 118, 1300) + 'font-size:22px', anim: [0, 'fade', 3.2, { out: 1 }] }, t.paper));
    // pesos → suma → sigmoide (beat 1)
    const w = ['+0,8', '−0,3', '+1,1'];
    ones.forEach((ox, k) => root.appendChild(h('div', { cls: 'abs mono', style: box(ox - 20, y1 + 120, 100) + 'font-size:28px;font-weight:700;color:#F4C46A;text-align:center', anim: [1, 'drop', 0.1 + k * 0.2, { out: 2 }] }, 'w=' + w[k])));
    root.appendChild(h('div', { cls: 'abs mono', style: box(430, y1 + 190, 1000) + 'font-size:30px;color:var(--ink)', anim: [1, 'up', 0.9, { out: 2 }] }, 'z = 0,8 − 0,3 + 1,1 − 2,4 <span style="color:var(--muted);font-size:22px">(sesgo)</span> = −0,8'));
    const sg = svgAt(root, 1300, 650, 300, 170, { b: 1, a: 'fade', d: 1.2, out: 2 });
    const sx = z => 20 + (z + 6) / 12 * 260, sy = p => 150 - p * 130;
    const pts = []; for (let z = -6; z <= 6; z += 0.25) pts.push([sx(z), sy(1 / (1 + Math.exp(-z)))]);
    sg.appendChild(s('line', { cls: 'ax', x1: 20, x2: 280, y1: 150, y2: 150 }));
    sg.appendChild(s('path', { cls: 'ln', d: P(pts), stroke: 'var(--ink2)' }));
    sg.appendChild(s('circle', { cx: sx(-0.8), cy: sy(1 / (1 + Math.exp(0.8))), r: 9, fill: 'var(--accent)' }));
    sg.appendChild(s('text', { cls: 'tick', x: 150, y: 20, 'text-anchor': 'middle' }, t.sig));
    root.appendChild(h('div', { cls: 'abs', style: box(1620, 700, 220) + 'font-size:30px;color:var(--ink);line-height:1.3', anim: [1, 'right', 1.6, { out: 2 }] }, `p = <b class="mono hl">0,31</b><div class="small">${t.prob}</div>`));
    root.appendChild(h('div', { cls: 'abs small', style: box(430, y1 + 250, 860) + 'font-size:24px', anim: [1, 'fade', 1.8, { out: 2 }] }, t.pesos));
    // escala real (beat 2)
    const k = D.v1Costo;
    const vals = { arboles: F.int(k.arboles), columnas: F.int(k.columnas), noNulos: F.d1(k.noNulos / 1e6) + ' M', sparseGB: F.d2(k.sparseGB) + ' GB', segundosLR: F.d1(k.segundosLR) + ' s' };
    root.appendChild(h('div', { cls: 'abs kicker', style: box(96, 520), anim: [2, 'up', 0.1] }, t.escalaK));
    t.escala.forEach(([n, l], i) => root.appendChild(h('div', { cls: 'abs', style: box(96 + i * 292, 570, 270) + 'border-top:3px solid var(--line);padding-top:14px', anim: [2, 'up', 0.2 + i * 0.12] },
      `<div class="mono" style="font-size:46px;font-weight:700;color:var(--ink)">${tpl(n, vals)}</div><div class="small" style="font-size:22px;line-height:1.3">${l}</div>`)));
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 790, 1728) + 'border-left:6px solid var(--accent);padding:22px 32px', anim: [2, 'up', 1.0] }, `<p style="font-size:30px;color:var(--ink);font-weight:600">${t.reemplaza}</p>`));
  };

  /* ---------------------------------------------------------------- 04 · variante 1: repartos y C */
  ESC.v1rep = root => {
    const t = T.v1rep; title(root, t);
    const ms = ['201903', '201904', '201905', '201906', '201907', '201908'], x0 = 560, cw = 170;
    ms.forEach((m, i) => root.appendChild(h('div', { cls: 'abs mono', style: box(x0 + i * cw, 262, cw - 10) + 'font-size:22px;text-align:center;color:var(--ink2)', anim: [0, 'fade', 0] }, m)));
    const filas = [[t.separado, t.separadoD, [0, 1, 2], [3]], [t.mismos, t.mismosD, [0, 1, 2, 3], [0, 1, 2, 3]]];
    filas.forEach(([n, d, gen, lr], r) => {
      const y = 310 + r * 150;
      root.appendChild(h('div', { cls: 'abs', style: box(96, y, 440), anim: [0, 'left', 0.2 + r * 0.4] }, `<div class="mono" style="font-size:30px;font-weight:700;color:var(--ink)">${n}</div><div class="small" style="font-size:22px;line-height:1.3">${d}</div>`));
      gen.forEach((i, k) => root.appendChild(h('div', { cls: 'abs', style: box(x0 + i * cw, y, cw - 10, 40) + 'background:#56606E;border-radius:6px', anim: [0, 'growx', 0.3 + r * 0.4 + k * 0.05, { dur: 0.35 }] })));
      lr.forEach((i, k) => root.appendChild(h('div', { cls: 'abs', style: box(x0 + i * cw, y + 48, cw - 10, 40) + 'background:#F4C46A;border-radius:6px', anim: [0, 'growx', 0.5 + r * 0.4 + k * 0.05, { dur: 0.35 }] })));
      root.appendChild(h('div', { cls: 'abs', style: box(x0 + 5 * cw, y, cw - 10, 88) + 'background:var(--accent-soft);border:2px solid var(--accent);border-radius:6px', anim: [0, 'pop', 0.8 + r * 0.4] }));
    });
    const lg = [[t.gen, '#56606E'], [t.lr, '#F4C46A'], [t.eval, 'var(--accent-soft);border:2px solid var(--accent)']];
    lg.forEach(([l, c], i) => root.appendChild(h('div', { cls: 'abs', style: box(560 + i * 300, 610) + 'display:flex;gap:12px;align-items:center;font-size:24px;color:var(--ink2)', anim: [0, 'fade', 1.2] }, `<span style="width:40px;height:22px;border-radius:5px;background:${c}"></span>${l}`)));
    // dial de C
    const Cs = [1e-4, 3e-4, 1e-3, 3e-3, 1e-2, 3e-2, 1e-1, 1];
    const cx = c => 96 + (Math.log10(c) + 4) / 4 * 800;
    root.appendChild(h('div', { cls: 'abs', style: box(96, 690, 900) + 'font-size:28px;font-weight:700', anim: [1, 'up', 0] }, `${t.cK} <span class="small" style="font-weight:400;font-size:24px">· ${t.cD}</span>`));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 790, 800, 6) + 'background:linear-gradient(90deg,var(--accent),#3A424E);border-radius:3px', anim: [1, 'growx', 0.2] }));
    Cs.forEach((c, i) => {
      root.appendChild(h('div', { cls: 'abs', style: box(cx(c) - 7, 783, 14, 20) + 'background:var(--ink2);border-radius:3px', anim: [1, 'pop', 0.3 + i * 0.05] }));
      root.appendChild(h('div', { cls: 'abs mono', style: box(cx(c) - 50, 812, 100) + 'font-size:22px;text-align:center;color:var(--ink2)', anim: [1, 'fade', 0.3 + i * 0.05] }, String(c).replace('.', ',')));
    });
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 740, 800) + 'font-size:22px', anim: [1, 'fade', 0.7] }, '← más regularización'));
    root.appendChild(h('div', { cls: 'abs kicker', style: box(1060, 690), anim: [1, 'up', 0.4] }, t.genK));
    t.gens.forEach(([g, d], i) => root.appendChild(h('div', { cls: 'abs', style: box(1060, 736 + i * 46, 780) + 'display:flex;gap:14px;align-items:center;font-size:24px', anim: [1, 'left', 0.5 + i * 0.12] },
      `<span style="width:16px;height:16px;border-radius:50%;background:${GCOL[g]}"></span><b class="mono" style="width:120px">${g}</b><span style="color:var(--ink2)">${d}</span>`)));
    root.appendChild(h('div', { cls: 'abs small', style: box(1060, 924, 760) + 'font-size:22px', anim: [1, 'fade', 1.0] }, t.comun));
  };

  ESC._h = h; ESC._s = s; ESC._plot = plot; ESC._line = line; ESC._legend = legend; ESC._tree = tree; ESC._walk = walk; ESC._box = box; ESC._svgAt = svgAt; ESC._title = title; ESC._ilus = ilus; ESC._cut = cutLine; ESC._kt = kTicks; ESC._tpl = tpl; ESC._dlabel = dlabel;
  ESC._MATRIZ = MATRIZ; ESC._GCOL = GCOL; ESC._GENS = GENS; ESC._solo = solo; ESC._at = at; ESC._sd = sd; ESC._mean = mean; ESC._P = P; ESC._miniTree = miniTree;
})();
