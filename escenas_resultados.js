/* ==========================================================================
   escenas_resultados.js — segunda parte de las escenas: variantes 2 y 3, evaluación,
   limitaciones, resultados (gráficos desde data/datos.js) y cierre.
   Usa los helpers que exporta escenas.js.
   ========================================================================== */
(() => {
  'use strict';
  const ESC = window.ESCENAS, C = window.CONTENIDO, T = C.textos, D = window.DATOS, UI = C.ui, F = ESC.F;
  const h = ESC._h, s = ESC._s, plot = ESC._plot, line = ESC._line, legend = ESC._legend, tree = ESC._tree, walk = ESC._walk,
    box = ESC._box, svgAt = ESC._svgAt, title = ESC._title, ilus = ESC._ilus, cutLine = ESC._cut, kTicks = ESC._kt, tpl = ESC._tpl,
    MATRIZ = ESC._MATRIZ, GCOL = ESC._GCOL, GENS = ESC._GENS, solo = ESC._solo, at = ESC._at, sd = ESC._sd, mean = ESC._mean, P = ESC._P;
  const corte = C.config.corteComun;
  const COL = { base: 'var(--c-base)', v2: 'var(--c-v2)', v21: 'var(--c-v21)', media: 'var(--c-media)', disp: 'var(--c-disp)', v1: 'var(--accent)' };

  /* ---------------------------------------------------------------- 04 · variante 2 */
  ESC.v2 = root => {
    const t = T.v2; title(root, t); ilus(root);
    const v = svgAt(root, 0, 0, 1920, 1080);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 290, 250) + 'padding:18px 22px', anim: [0, 'up', 0] }, `<span class="num">${T.arbol.fila}</span><div class="mono" style="font-size:22px;color:var(--ink2);line-height:1.6">ctrx_quarter<br>mcaja_ahorro<br>…</div>`));
    // probabilidades ilustrativas de 12 árboles
    const probs = [0.08, 0.15, 0.22, 0.12, 0.31, 0.18, 0.05, 0.27, 0.19, 0.11, 0.24, 0.42];
    const ax0 = 1120, ax1 = 1800, ay = 470, PX = p => ax0 + p / 0.5 * (ax1 - ax0);
    probs.forEach((p, k) => {
      const x = 420 + (k % 6) * 110, y = 280 + Math.floor(k / 6) * 150;
      ESC._miniTree(v, x, y, 60, 50, { b: 0, d: 0.1 + k * 0.05 });
      v.appendChild(s('text', { cls: 'lblm', x: x + 30, y: y + 92, 'text-anchor': 'middle', fill: 'var(--ink)', anim: [0, 'fade', 0.7 + k * 0.05] }, F.d2(p)));
      // cada probabilidad cae en la tira
      v.appendChild(s('circle', { cx: PX(p), cy: ay - 26 - (k % 3) * 22, r: 11, fill: 'var(--c-media)', opacity: 0.9, anim: [0, 'fly', 1.2 + k * 0.07, { fx: (x + 30) - PX(p), fy: (y + 85) - (ay - 26 - (k % 3) * 22), dur: 0.7 }] }));
    });
    v.appendChild(s('line', { cls: 'ax', x1: ax0, x2: ax1, y1: ay, y2: ay, anim: [0, 'draw', 1.0] }));
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(p => v.appendChild(s('text', { cls: 'tick', x: PX(p), y: ay + 32, 'text-anchor': 'middle', anim: [0, 'fade', 1.0] }, F.d1(p))));
    v.appendChild(s('text', { cls: 'tick', x: (ax0 + ax1) / 2, y: ay + 64, 'text-anchor': 'middle', anim: [0, 'fade', 1.0] }, t.eje));
    v.appendChild(s('text', { cls: 'tick', x: 420, y: 250, anim: [0, 'fade', 0.2] }, t.cadaArbol));
    // estadísticos (beat 1)
    const srt = [...probs].sort((a, b) => a - b), q = p => { const i = (srt.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return srt[lo] + (srt[hi] - srt[lo]) * (i - lo); };
    const st = { media: mean(probs), desvio: sd(probs), p10: q(0.1), p25: q(0.25), p50: q(0.5), p75: q(0.75), p90: q(0.9) };
    st.rango = st.p90 - st.p10; st.iqr = st.p75 - st.p25;
    v.appendChild(s('rect', { x: PX(st.p25), y: ay - 100, width: PX(st.p75) - PX(st.p25), height: 108, fill: 'rgba(44,196,176,.12)', stroke: 'var(--c-disp)', 'stroke-width': 2, rx: 6, anim: [1, 'growx', 0.2] }));
    v.appendChild(s('line', { x1: PX(st.p10), x2: PX(st.p90), y1: ay - 112, y2: ay - 112, stroke: 'var(--c-disp)', 'stroke-width': 3, anim: [1, 'draw', 0.4] }));
    [st.p10, st.p90].forEach((p, i) => v.appendChild(s('text', { cls: 'lblm', x: PX(p), y: ay - 124, 'text-anchor': 'middle', fill: 'var(--c-disp)', anim: [1, 'fade', 0.6] }, i ? 'P90' : 'P10')));
    v.appendChild(s('line', { x1: PX(st.media), x2: PX(st.media), y1: ay - 150, y2: ay + 6, stroke: 'var(--ink)', 'stroke-width': 4, anim: [1, 'growy', 0.8] }));
    v.appendChild(s('text', { cls: 'lbl', x: PX(st.media), y: ay - 162, 'text-anchor': 'middle', fill: 'var(--ink)', anim: [1, 'fade', 0.9] }, 'media'));
    const lista = [['rfd_media', st.media], ['rfd_desvio', st.desvio], ['rfd_p10 … p90', null], ['rfd_rango', st.rango], ['rfd_iqr', st.iqr]];
    lista.forEach(([k, val], i) => root.appendChild(h('div', { cls: 'abs mono', style: box(1120 + (i % 3) * 240, 580 + Math.floor(i / 3) * 44, 236) + 'font-size:23px;color:var(--ink2)', anim: [1, 'up', 1.0 + i * 0.1, { out: 2 }] }, `${k}${val != null ? ' <b style="color:var(--ink)">' + F.d2(val) + '</b>' : ''}`)));
    // tabla de LightGBM con columnas nuevas (beat 2)
    const yT = 690, orig = ['ctrx_quarter', 'mcaja_ahorro', '…', 'mpayroll_delta_2'], nuevas = [['rfd_media', st.media], ['rfd_desvio', st.desvio], ['rfd_rango', st.rango], ['rfd_iqr', st.iqr]];
    root.appendChild(h('div', { cls: 'abs small', style: box(96, yT - 44, 600) + 'font-size:24px', anim: [2, 'fade', 0] }, t.tabla));
    orig.forEach((c, i) => root.appendChild(h('div', { cls: 'abs mono', style: box(96 + i * 250, yT, 240, 120) + 'border:1px solid #2A313C;border-radius:8px;background:#161B23;padding:10px 12px;font-size:22px;color:var(--ink2)', anim: [2, 'fade', 0.1] }, `${c}<div style="margin-top:14px;color:#5E6672">· · ·</div>`)));
    nuevas.forEach(([c, val], i) => root.appendChild(h('div', { cls: 'abs mono', style: box(1110 + i * 180, yT, 170, 120) + 'border:2px solid var(--c-media);border-radius:8px;background:rgba(78,134,240,.12);padding:10px 12px;font-size:21px;color:var(--ink)', anim: [2, 'fly', 0.3 + i * 0.15, { fx: 0, fy: -150, dur: 0.7 }] }, `${c}<div style="margin-top:14px;font-size:26px;font-weight:700">${F.d2(val)}</div>`)));
    root.appendChild(h('div', { cls: 'abs mono', style: box(1110, yT - 44, 700) + 'font-size:26px;font-weight:700;color:var(--c-media)', anim: [2, 'fade', 0.9] }, t.cuenta));
    root.appendChild(h('div', { cls: 'abs pill', style: box(96, 850) + 'font-size:24px', anim: [2, 'up', 1.2] }, t.brazoB));
    root.appendChild(h('div', { cls: 'abs pill', style: box(600, 850) + 'font-size:24px', anim: [2, 'up', 1.35] }, t.brazoC));
  };

  /* ---------------------------------------------------------------- 04 · variante 3 */
  ESC.v3 = root => {
    const t = T.v3; title(root, t); ilus(root);
    const v = svgAt(root, 0, 0, 1920, 1080);
    // cinco árboles: 4 elegibles (OOB) y 1 in-bag que se excluye
    const arbs = [
      { sp: { t: 'ctrx_quarter', l: { t: 'mpayroll', l: { leaf: '' }, r: { leaf: '' } }, r: { leaf: '' } }, path: ['r'], var: 'ctrx_quarter' },
      { sp: { t: 'mpayroll', l: { t: 'mcaja_ahorro', l: { leaf: '' }, r: { leaf: '' } }, r: { leaf: '' } }, path: ['l', 'r'], var: 'mcaja_ahorro' },
      { sp: { t: 'mcaja_ahorro', l: { leaf: '' }, r: { t: 'ctrx_quarter', l: { leaf: '' }, r: { leaf: '' } } }, path: ['r', 'l'], var: 'ctrx_quarter' },
      { sp: { t: 'ctrx_quarter', l: { t: 'mpayroll', l: { leaf: '' }, r: { leaf: '' } }, r: { leaf: '' } }, path: ['l', 'l'], var: 'mpayroll' },
      { sp: { t: 'mcaja_ahorro', l: { leaf: '' }, r: { leaf: '' } }, path: ['l'], var: null }
    ];
    arbs.forEach((a, k) => {
      const x = 130 + k * 255, inbag = a.var == null;
      const tr = tree(v, a.sp, { x, y: 300, w: 170, h: 170, nh: 36, fs: 17, lr: 15, leafText: false });
      tr.g.dataset.b = 0; tr.g.dataset.a = 'pop'; tr.g.dataset.d = 0.1 + k * 0.12; if (inbag) tr.g.dataset.dim = 0;
      if (inbag) { tr.g.dataset.dim = 0; }
      const path = walk(a.sp, a.path), leaf = path[path.length - 1], par = path[path.length - 2];
      if (!inbag) {
        path.forEach(n => { if (n.edge) { n.edge.dataset.st = '0:on'; n.edge.dataset.d = (0.7 + k * 0.3).toFixed(2); } });
        leaf.el.dataset.st = '0:on'; leaf.el.dataset.d = (0.8 + k * 0.3).toFixed(2);
        par.el.dataset.st = '0:parent'; par.el.dataset.d = (0.9 + k * 0.3).toFixed(2);
        root.appendChild(h('div', { cls: 'abs mono', style: box(x - 40, 530, 250) + 'font-size:23px;font-weight:700;color:#F4C46A;text-align:center', anim: [0, 'drop', 1.1 + k * 0.3] }, a.var));
      } else root.appendChild(h('div', { cls: 'abs small', style: box(x - 40, 530, 250) + 'font-size:22px;text-align:center', anim: [0, 'fade', 1.0] }, 'in-bag: no cuenta'));
      v.appendChild(s('text', { cls: 'tick', x: x + 85, y: 268, 'text-anchor': 'middle', anim: [0, 'fade', 0.1 + k * 0.12] }, 'árbol ' + (k + 1)));
    });
    root.appendChild(h('div', { cls: 'abs', style: box(96, 590, 1300) + 'display:flex;gap:12px;align-items:center;font-size:24px;color:var(--ink2)', anim: [0, 'fade', 2.3] }, `<span style="width:30px;height:20px;border:3px solid #F4C46A;border-radius:5px;background:#2B2416"></span>${t.padre}`));
    // conteo y frecuencias (beat 1)
    const cnt = [['ctrx_quarter', 2], ['mcaja_ahorro', 1], ['mpayroll', 1], ['_sin_split', 0]], nE = 4, xb = 1440;
    root.appendChild(h('div', { cls: 'abs small', style: box(xb, 236, 400) + 'font-size:23px;line-height:1.3', anim: [1, 'fade', 0] }, `${t.conteo} ÷ ${nE} ${t.elegibles}`));
    cnt.forEach(([k, n], i) => {
      const y = 316 + i * 64;
      root.appendChild(h('div', { cls: 'abs mono', style: box(xb, y, 220) + 'font-size:22px;color:var(--ink2)', anim: [1, 'fade', 0.1 + i * 0.1] }, k));
      root.appendChild(h('div', { cls: 'abs', style: box(xb, y + 30, Math.max(4, n * 90), 18) + 'background:#F4C46A;border-radius:3px', anim: [1, 'growx', 0.2 + i * 0.1] }));
      root.appendChild(h('div', { cls: 'abs mono', style: box(xb + 230, y + 14, 160) + 'font-size:26px;font-weight:700;color:var(--ink);text-align:right', anim: [1, 'count', 0.6 + i * 0.1, { from: n, to: n / nE, fmt: 'd2', dur: 0.8 }] }, F.d2(n / nE)));
    });
    // columnas nuevas (beat 2)
    const yT = 680, orig = ['ctrx_quarter', 'mcaja_ahorro', '…'];
    orig.forEach((c, i) => root.appendChild(h('div', { cls: 'abs mono', style: box(96 + i * 230, yT, 220, 130) + 'border:1px solid #2A313C;border-radius:8px;background:#161B23;padding:10px 12px;font-size:22px;color:var(--ink2)', anim: [2, 'fade', 0] }, `${c}<div style="margin-top:12px;color:#5E6672">· · ·</div>`)));
    cnt.forEach(([k, n], i) => root.appendChild(h('div', { cls: 'abs mono', style: box(800 + i * 260, yT, 250, 130) + 'border:2px solid #F4C46A;border-radius:8px;background:rgba(244,196,106,.10);padding:8px 12px;font-size:22px;line-height:1.2;color:var(--ink)', anim: [2, 'fly', 0.2 + i * 0.12, { fx: xb - (800 + i * 260), fy: 346 + i * 64 - yT, fs: 0.7, dur: 0.8 }] }, `<span style="color:var(--muted)">rf_perfil_</span><br>${k}<div style="margin-top:8px;font-size:28px;font-weight:700">${F.d2(n / nE)}</div>`)));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 640, 1728) + 'font-size:24px;color:#F4C46A;font-weight:600', anim: [2, 'fade', 0.8] }, t.regla));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 836, 860) + 'font-size:24px;line-height:1.5', anim: [2, 'up', 1.0] }, `<b>${t.conserva}:</b> <span style="color:var(--ink2)">${t.conservaD}</span><br><b>${t.descarta}:</b> <span style="color:var(--ink2)">${t.descartaD}</span>`));
    root.appendChild(h('div', { cls: 'abs', style: box(1000, 836, 824) + 'font-size:24px;line-height:1.5', anim: [2, 'up', 1.2] }, `<span style="color:var(--c-v2);font-weight:700">●</span> ${t.v2}<br><span style="color:var(--c-v21);font-weight:700">●</span> ${t.v21}<br><span class="small">${t.rf}</span>`));
  };

  /* ---------------------------------------------------------------- 04 · evaluación */
  ESC.eval = root => {
    const t = T.eval; title(root, t);
    const bc = D.baseline.curva, ks = bc.envios, sel = ks.map((k, i) => i).filter(i => ks[i] >= 2000 && ks[i] <= 6000);
    const xs = sel.map(i => ks[i]);
    const p = plot(root, { x: 96, y: 260, w: 1060, h: 640, xd: [2000, 6000], yd: [255e6, 300e6], xt: kTicks(2000, 6000, 1000), yt: kTicks(260e6, 300e6, 10e6), xf: F.int, yf: F.m0, xl: UI.envios, yl: UI.ganancia, anim: [0, 'fade', 0] });
    Object.keys(bc.semillas).forEach((sm, k) => line(p, xs, sel.map(i => bc.semillas[sm][i]), '#5E6672', [0, 'draw', 0.2 + k * 0.12, { dur: 0.9 }], { 'stroke-width': 2 }));
    line(p, xs, sel.map(i => bc.promedio[i]), 'var(--c-base)', [0, 'draw', 1.2, { dur: 0.9 }], { 'stroke-width': 5 });
    cutLine(p, corte, [0, 'fade', 1.0]);
    const i4 = ks.indexOf(corte);
    Object.keys(bc.semillas).forEach((sm, k) => p.svg.appendChild(s('circle', { cx: p.X(corte), cy: p.Y(bc.semillas[sm][i4]), r: 8, fill: '#9AA3AE', stroke: 'var(--bg)', 'stroke-width': 2, anim: [0, 'pop', 1.6 + k * 0.06] })));
    p.svg.appendChild(s('circle', { cx: p.X(corte), cy: p.Y(bc.promedio[i4]), r: 11, fill: 'var(--ink)', anim: [0, 'pop', 2.1] }));
    p.svg.appendChild(s('text', { cls: 'lbl', x: p.X(corte) + 20, y: p.Y(bc.promedio[i4]) + 8, fill: 'var(--ink)', anim: [0, 'fade', 2.2] }, 'Ĝ(4.000) = ' + F.M(bc.promedio[i4])));
    p.svg.appendChild(s('text', { cls: 'tick', x: p.x1, y: p.y1 + 4, 'text-anchor': 'end', anim: [0, 'fade', 0.4] }, t.nota));
    const X = 1240;
    root.appendChild(h('div', { cls: 'abs', style: box(X, 280, 584) + 'font-size:26px;color:var(--ink2);line-height:1.4', anim: [0, 'up', 0.3] }, t.semillas));
    root.appendChild(h('div', { cls: 'abs', style: box(X, 400, 584) + 'font-size:32px;font-weight:700;color:var(--ink);line-height:1.3', anim: [0, 'up', 1.6] }, t.media));
    root.appendChild(h('div', { cls: 'abs pill acc', style: box(X, 500) + 'font-size:24px', anim: [0, 'up', 1.9] }, t.noEns));
    root.appendChild(h('div', { cls: 'abs card', style: box(X, 600, 584) + 'padding:20px 26px', anim: [1, 'up', 0.1] }, `<span class="num">${t.corteK}</span><p style="font-size:24px">${t.corte}</p>`));
    root.appendChild(h('div', { cls: 'abs card', style: box(X, 760, 584) + 'padding:20px 26px', anim: [1, 'up', 0.3] }, `<span class="num">${t.metK}</span><p style="font-size:24px">${t.met}</p>`));
  };

  /* ---------------------------------------------------------------- 05 · limitaciones */
  ESC.limit = root => {
    const t = T.limit; title(root, t);
    const i4 = D.baseline.curva.envios.indexOf(corte);
    const sdBase = sd(Object.values(D.baseline.curva.semillas).map(a => a[i4]));
    t.cards.forEach((c, i) => {
      const x = 96 + (i % 2) * 884, y = 270 + Math.floor(i / 2) * 340;
      root.appendChild(h('div', { cls: 'abs card', style: box(x, y, 844, 310), anim: [i < 2 ? 0 : 1, 'up', 0.15 + (i % 2) * 0.25] },
        `<span class="num">0${i + 1}</span><h3>${c.t}</h3><p>${tpl(c.d, { sdBase: F.M(sdBase) })}</p>`));
    });
  };
  ESC.limit2 = root => {
    const t = T.limit2; title(root, t);
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 270, 780, 640), anim: [0, 'up', 0.1] }, `<span class="num">01</span><h3>${t.v1T}</h3>` + t.v1.map(x => `<p style="margin:14px 0">· ${x}</p>`).join('')));
    const met = D.baselineMetricas.filas, ne = mean(met.map(r => r.ne)), cal = mean(met.map(r => r.calibracion));
    root.appendChild(h('div', { cls: 'abs card', style: box(916, 270, 908, 640), anim: [0, 'up', 0.35] }, `<span class="num">02</span><h3>${t.dT}</h3>` + t.d.map(x => `<p style="margin:8px 0;font-size:24px">· ${x}</p>`).join('') +
      `<p style="margin-top:22px;font-size:24px;color:var(--ink)">${t.calib}</p><div style="display:flex;gap:56px;margin-top:10px"><div><div class="mono" style="font-size:52px;font-weight:700;color:var(--ink)">${F.d2(ne)}</div><div class="small">${t.calibNE}</div></div><div><div class="mono" style="font-size:52px;font-weight:700;color:var(--ink)">${F.x1(cal)}</div><div class="small">${t.calibC}</div></div></div>`));
  };

  /* ---------------------------------------------------------------- 06 · matriz */
  ESC.matriz = root => {
    const t = T.matriz; title(root, t);
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 228, 1728) + 'font-size:26px', anim: [0, 'fade', 0.2] }, tpl(t.sub, { corte: F.int(corte) })));
    const x0 = 96, y0 = 300, rh = 92, cx = [x0, x0 + 640, x0 + 940, x0 + 1150];
    t.cols.forEach((c, j) => root.appendChild(h('div', { cls: 'abs', style: box(cx[j], y0, j ? 200 : 600) + `font-size:22px;color:var(--muted);${j ? 'text-align:right' : ''}`, anim: [j < 2 ? 0 : 1, 'fade', 0.2] }, c)));
    // eje de barras divergentes
    const bx0 = 1480, bw = 340, zero = bx0 + bw / 2, maxAbs = 2.0, pxPct = (bw / 2) / maxAbs;
    root.appendChild(h('div', { cls: 'abs', style: box(zero - 1, y0 + 40, 2, rh * t.filas.length) + 'background:#4A525E', anim: [1, 'fade', 0.1] }));
    root.appendChild(h('div', { cls: 'abs mono', style: box(zero - 40, y0, 80) + 'font-size:22px;color:var(--muted);text-align:center', anim: [1, 'fade', 0.1] }, '0 %'));
    t.filas.forEach((f, i) => {
      const r = MATRIZ[f.k], y = y0 + 44 + i * rh, pend = r.g == null;
      root.appendChild(h('div', { cls: 'abs', style: box(x0, y + 4, 1820 - x0, rh - 8) + 'border-top:1px solid #1E242D', anim: [0, 'fade', 0.3 + i * 0.1] }));
      root.appendChild(h('div', { cls: 'abs', style: box(x0, y + 22, 620) + 'font-size:28px;display:flex;gap:14px;align-items:center;' + (f.k === 'base' ? 'font-weight:700' : ''), anim: [0, 'left', 0.3 + i * 0.1] },
        `<span style="width:14px;height:14px;border-radius:50%;background:${COL[f.k]};flex:none"></span>${f.t}`));
      if (pend) {
        root.appendChild(h('div', { cls: 'abs', style: box(cx[1] - 120, y + 18, 440) + 'text-align:right', anim: [0, 'fade', 0.5 + i * 0.1] }, `<span class="pend-chip" data-pendiente="1">${UI.pendienteCorta}</span>`));
        return;
      }
      root.appendChild(h('div', { cls: 'abs mono', style: box(cx[1], y + 22, 260) + 'font-size:30px;text-align:right;font-weight:700', anim: [0, 'count', 0.5 + i * 0.1, { from: 0, to: r.g, fmt: 'M', dur: 1.0 }], 'data-val': r.g, 'data-campo': f.k + '.g' }, F.M(r.g)));
      if (f.k === 'base') { root.appendChild(h('div', { cls: 'abs', style: box(cx[2], y + 26, 400) + 'font-size:24px;color:var(--muted);text-align:right', anim: [1, 'fade', 0.2] }, t.ref)); return; }
      root.appendChild(h('div', { cls: 'abs mono', style: box(cx[2] - 40, y + 24, 240) + 'font-size:28px;text-align:right', anim: [1, 'fade', 0.3 + i * 0.1], 'data-val': r.d, 'data-campo': f.k + '.d' }, F.dM(r.d)));
      root.appendChild(h('div', { cls: 'abs mono', style: box(cx[3] - 20, y + 24, 200) + `font-size:28px;text-align:right;font-weight:700;color:${r.p >= 0 ? 'var(--good)' : 'var(--bad)'}`, anim: [1, 'fade', 0.35 + i * 0.1], 'data-val': r.p, 'data-campo': f.k + '.p' }, F.pct(r.p)));
      const w = Math.abs(r.p) * pxPct;
      root.appendChild(h('div', { cls: 'abs', style: box(r.p >= 0 ? zero : zero - w, y + 26, w, 34) + `background:${COL[f.k]};border-radius:${r.p >= 0 ? '0 4px 4px 0' : '4px 0 0 4px'}`, anim: [1, 'growx', 0.4 + i * 0.1, { origin: r.p >= 0 ? '0% 50%' : '100% 50%' }] }));
    });
    root.appendChild(h('div', { cls: 'foot', anim: [0, 'fade', 1.0] }, t.pie));
  };

  /* ---------------------------------------------------------------- 06 · curvas (helper) */
  function curvasPanel(root, o) {
    // o: { x, y, w, h, xd, yd, xt, yt, series:[{k, xs, ys, c, label, w}], b, cut, tt, labels }
    const p = plot(root, { x: o.x, y: o.y, w: o.w, h: o.h, xd: o.xd, yd: o.yd, xt: o.xt, yt: o.yt, xf: F.int, yf: o.yf || F.m0, xl: UI.envios, yl: o.yl, tt: o.tt, anim: [o.b, 'fade', 0] });
    cutLine(p, corte, [o.b, 'fade', 0.3], o.cutLabel);
    o.series.forEach((sr, k) => {
      const idx = sr.xs.map((x, i) => i).filter(i => sr.xs[i] >= o.xd[0] && sr.xs[i] <= o.xd[1]);
      line(p, idx.map(i => sr.xs[i]), idx.map(i => sr.ys[i]), sr.c, [o.b, 'draw', 0.3 + k * 0.35, { dur: 1.3 }], { 'stroke-width': sr.w || 3.5, 'stroke-dasharray': sr.dash || null });
      if (o.dots) idx.forEach(i => p.svg.appendChild(s('circle', { cx: p.X(sr.xs[i]), cy: p.Y(sr.ys[i]), r: 5, fill: sr.c, anim: [o.b, 'fade', 1.4 + k * 0.2] })));
    });
    return p;
  }
  const serieM = (curva) => ({ xs: curva.envios, ys: curva.promedio });
  // valores al corte, con desplazamientos fijos por serie para que no se pisen
  function zoomLabels(root, S) {
    const row = h('div', { cls: 'abs', style: box(1000, 912, 824) + 'display:flex;justify-content:flex-end;gap:28px;font-size:24px;color:var(--ink2)', anim: [1, 'fade', 1.6] });
    row.innerHTML = `<span>a ${F.int(corte)}:</span>` + S.map(sr => `<span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${sr.c};margin-right:8px"></i><b class="mono" style="color:var(--ink)">${F.m2(sr.ys[sr.xs.indexOf(corte)])}</b></span>`).join('');
    root.appendChild(row);
  }

  ESC.perfCurvas = root => {
    const t = T.perfCurvas; title(root, t);
    const S = [
      { k: 'base', ...serieM(D.baseline.curva), c: COL.base, label: t.series.base },
      { k: 'v2', ...serieM(D.perfilesV2.curva), c: COL.v2, label: t.series.v2 },
      { k: 'v21', ...serieM(D.perfilesV21.curva), c: COL.v21, label: t.series.v21 }
    ];
    curvasPanel(root, { x: 96, y: 290, w: 820, h: 580, xd: [0, 15000], yd: [0, 320e6], xt: kTicks(0, 15000, 5000), yt: kTicks(0, 300e6, 50e6), series: S, b: 0, yl: UI.gananciaMedia, tt: t.full });
    const pz = curvasPanel(root, { x: 1000, y: 290, w: 824, h: 580, xd: [2000, 6000], yd: [260e6, 296e6], xt: kTicks(2000, 6000, 1000), yt: kTicks(260e6, 295e6, 5e6), series: S, b: 1, yl: UI.gananciaMedia, tt: t.zoom, dots: true, cutLabel: F.int(corte) });
    const i4 = D.baseline.curva.envios.indexOf(corte);
    zoomLabels(root, S);
    legend(root, 96, 912, S.map(sr => ({ t: sr.label, c: sr.c })), [0, 'fade', 0.2]);
    root.appendChild(h('div', { cls: 'abs small', style: box(1000, 228, 824) + 'text-align:right;font-size:22px', anim: [1, 'fade', 1.8] }, t.nota + ' · perfiles transcriptos: deck págs. 16 y 18'));
  };

  ESC.perfSemillas = root => {
    const t = T.perfSemillas; title(root, t);
    const gr = [['Baseline', D.baseline.curva, COL.base], ['v2 · HP fijos', D.perfilesV2.curva, COL.v2], ['v2.1 · reoptimizado', D.perfilesV21.curva, COL.v21]];
    const p = plot(root, { x: 96, y: 270, w: 1080, h: 640, xd: [0, 3], yd: [282e6, 298e6], xt: [], yt: kTicks(282e6, 298e6, 2e6), yf: F.m0, yl: t.eje, anim: [0, 'fade', 0] });
    gr.forEach(([n, cur, c], g) => {
      const i4 = cur.envios.indexOf(corte), vals = Object.values(cur.semillas).map(a => a[i4]), cx = p.X(g + 0.5), m = mean(vals);
      p.svg.appendChild(s('text', { cls: 'alab', x: cx, y: p.y0 + 40, 'text-anchor': 'middle', anim: [0, 'fade', 0.1] }, n));
      p.svg.appendChild(s('rect', { x: cx - 120, y: p.Y(Math.max(...vals)), width: 240, height: p.Y(Math.min(...vals)) - p.Y(Math.max(...vals)), fill: c, opacity: 0.10, rx: 6, anim: [0, 'growy', 1.6 + g * 0.1] }));
      // desempate horizontal para valores repetidos
      const seen = {};
      vals.forEach((v, k) => { const n2 = (seen[v] = (seen[v] || 0) + 1) - 1; p.svg.appendChild(s('circle', { cx: cx - 60 + k * 24 + n2 * 0, cy: p.Y(v), r: 11, fill: c, stroke: 'var(--bg)', 'stroke-width': 2.5, anim: [0, 'drop', 0.3 + g * 0.3 + k * 0.06] })); });
      p.svg.appendChild(s('line', { x1: cx - 90, x2: cx + 90, y1: p.Y(m), y2: p.Y(m), stroke: 'var(--ink)', 'stroke-width': 4, anim: [0, 'growx', 1.3 + g * 0.1, { origin: '50% 50%' }] }));
      p.svg.appendChild(s('text', { cls: 'lblm', x: cx + 100, y: p.Y(m) + 8, fill: 'var(--ink)', anim: [0, 'fade', 1.4 + g * 0.1] }, F.m2(m)));
    });
    root.appendChild(h('div', { cls: 'abs pill acc', style: box(260, 228) + 'font-size:24px', anim: [0, 'up', 2.0] }, t.solap));
    const I = D.importancia.modelos, n2 = I.perfiles_v2.filter(r => r.rf).length, n21 = I.perfiles_v21.filter(r => r.rf).length;
    root.appendChild(h('div', { cls: 'abs card', style: box(1260, 300, 564, 560), anim: [0, 'up', 2.3] },
      `<span class="num">${t.fiK}</span><p style="font-size:28px;color:var(--ink);margin-top:10px">${tpl(t.fiV2, { n: n2 })}</p><p style="font-size:28px;color:var(--ink);margin-top:14px">${tpl(t.fiV21, { n: n21 })}</p>
       <p style="font-size:22px;margin-top:22px">${t.fiTop}</p><p class="mono" style="font-size:21px;color:#F4C46A;word-break:break-all">${I.perfiles_v2[0].variable}</p>`));
    root.appendChild(h('div', { cls: 'abs small', style: box(1260, 880, 564) + 'font-size:22px', anim: [0, 'fade', 2.5] }, 'Baseline: CSV exacto · perfiles: deck págs. 16, 17, 18 y 19'));
  };

  ESC.probCurvas = root => {
    const t = T.probCurvas; title(root, t);
    const pr = D.probRF;
    const S = [
      { k: 'base', ...serieM(D.baseline.curva), c: COL.base, label: t.series.base },
      { k: 'media', xs: pr.envios, ys: pr.B, c: COL.media, label: t.series.media },
      { k: 'disp', xs: pr.envios, ys: pr.C, c: COL.disp, label: t.series.disp }
    ];
    curvasPanel(root, { x: 96, y: 290, w: 820, h: 580, xd: [0, 15000], yd: [0, 320e6], xt: kTicks(0, 15000, 5000), yt: kTicks(0, 300e6, 50e6), series: S, b: 0, yl: UI.gananciaMedia, tt: t.full });
    const pz = curvasPanel(root, { x: 1000, y: 290, w: 824, h: 580, xd: [2000, 6000], yd: [260e6, 296e6], xt: kTicks(2000, 6000, 1000), yt: kTicks(260e6, 295e6, 5e6), series: S, b: 1, yl: UI.gananciaMedia, tt: t.zoom, dots: true, cutLabel: F.int(corte) });
    zoomLabels(root, S);
    legend(root, 96, 912, S.map(sr => ({ t: sr.label, c: sr.c })), [0, 'fade', 0.2]);
    root.appendChild(h('div', { cls: 'abs small', style: box(1000, 228, 824) + 'text-align:right;font-size:22px', anim: [1, 'fade', 1.8] }, 'Prob RF transcripto: deck pág. 21'));
  };

  ESC.probImp = root => {
    const t = T.probImp; title(root, t);
    const I = D.importancia.modelos;
    [['probrf_B_media', t.bT, COL.media, 96], ['probrf_C_dispersion', t.cT, COL.disp, 1000]].forEach(([k, tt, c, x], g) => {
      const rows = I[k].filter(r => r.rank <= 10), mx = 6.5, W = 380;
      root.appendChild(h('div', { cls: 'abs', style: box(x, 262, 820) + 'font-size:28px;font-weight:700', anim: [0, 'fade', g * 0.3] }, tt));
      rows.forEach((r, i) => {
        const y = 316 + i * 52;
        root.appendChild(h('div', { cls: 'abs mono', style: box(x, y + 6, 380) + `font-size:21px;text-align:right;${r.rf ? 'color:var(--ink);font-weight:700' : 'color:var(--ink2)'}`, anim: [0, 'fade', 0.2 + g * 0.3 + i * 0.05] }, r.variable));
        root.appendChild(h('div', { cls: 'abs', style: box(x + 400, y + 8, W * r.valor / mx, 30) + `background:${r.rf ? c : '#4A525E'};border-radius:0 4px 4px 0`, anim: [0, 'growx', 0.3 + g * 0.3 + i * 0.05] }));
        root.appendChild(h('div', { cls: 'abs mono', style: box(x + 410 + W * r.valor / mx, y + 8, 110) + 'font-size:21px;color:var(--ink2)', anim: [0, 'fade', 0.7 + g * 0.3 + i * 0.05] }, F.d2(r.valor) + ' %'));
      });
    });
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 850, 1728) + 'font-size:22px', anim: [0, 'fade', 1.2] }, t.eje + ' · transcripto: deck pág. 24'));
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 892, 1728) + 'font-size:26px;color:var(--ink)', anim: [0, 'up', 1.5] }, t.nota));
  };

  /* ---------------------------------------------------------------- 06 · variante 1 (desarrollo) */
  function aucPanel(root, rep, x, b, tt) {
    const t = T.v1auc;
    const p = plot(root, { x, y: 300, w: 840, h: 560, xlog: true, xd: [1e-4, 1], yd: [0.80, 0.94], xt: [1e-4, 1e-3, 1e-2, 1e-1, 1], yt: [0.80, 0.82, 0.84, 0.86, 0.88, 0.90, 0.92, 0.94], xf: v => String(v).replace('.', ','), yf: F.d2, xl: t.ejeX, yl: b === 0 ? t.ejeY : null, tt, anim: [b, 'fade', 0] });
    const yb = D.baselineDev.auc;
    p.svg.appendChild(s('line', { x1: p.x0, x2: p.x1, y1: p.Y(yb), y2: p.Y(yb), stroke: 'var(--c-base)', 'stroke-width': 3, 'stroke-dasharray': '12 8', anim: [b, 'draw', 0.2] }));
    GENS.forEach((g, k) => {
      const rows = D.v1Dev.metricas.filter(r => r.reparto === rep && r.generador === g && r.C != null).sort((a, z) => a.C - z.C);
      const so = solo(rep, g);
      p.svg.appendChild(s('line', { x1: p.x0, x2: p.x1, y1: p.Y(so.auc), y2: p.Y(so.auc), stroke: GCOL[g], 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round', opacity: 0.9, anim: [b, 'draw', 0.3 + k * 0.1] }));
      line(p, rows.map(r => r.C), rows.map(r => r.auc), GCOL[g], [b, 'draw', 0.5 + k * 0.25, { dur: 1.0 }], { 'stroke-width': 3.5 });
      rows.forEach(r => p.svg.appendChild(s('circle', { cx: p.X(r.C), cy: p.Y(r.auc), r: 5.5, fill: GCOL[g], anim: [b, 'fade', 1.3 + k * 0.1] })));
      const best = ESC.mejorC(rep, g);
      p.svg.appendChild(s('circle', { cx: p.X(best.C), cy: p.Y(best.auc), r: 10, fill: 'none', stroke: GCOL[g], 'stroke-width': 3, anim: [b, 'pop', 1.8 + k * 0.1] }));
    });
    p.svg.appendChild(s('text', { cls: 'tick', x: p.x1 - 6, y: p.Y(yb) - 12, 'text-anchor': 'end', fill: 'var(--ink2)', anim: [b, 'fade', 0.4] }, t.base));
    return p;
  }
  ESC.v1auc = root => {
    const t = T.v1auc; title(root, t);
    aucPanel(root, 'separado', 96, 0, t.separado);
    aucPanel(root, 'mismos', 984, 1, t.mismos);
    legend(root, 96, 905, GENS.map(g => ({ t: g + ' + LR', c: GCOL[g] })).concat([{ t: t.solo.replace('punteado: ', ''), c: '#9AA3AE', dash: true }]), [0, 'fade', 0.2]);
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 228, 1728) + 'font-size:24px;color:#F4C46A', anim: [0, 'fade', 0.2] }, '● ' + t.pend));
    root.appendChild(h('div', { cls: 'abs small', style: box(984, 228, 840) + 'text-align:right;font-size:22px', anim: [1, 'fade', 2.0] }, '○ mejor C por AUC · ' + t.u));
  };
  ESC.v1gan = root => {
    const t = T.v1gan, ta = T.v1auc; title(root, t);
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 228, 1728) + 'font-size:24px;color:#F4C46A', anim: [0, 'fade', 0.2] }, '● ' + ta.pend));
    const bd = D.baselineDev;
    ['separado', 'mismos'].forEach((rep, j) => {
      const p = plot(root, { x: 96 + j * 888, y: 300, w: 840, h: 470, xd: [0, 15000], yd: [0, 220e6], xt: kTicks(0, 15000, 5000), yt: kTicks(0, 200e6, 50e6), xf: F.int, yf: F.m0, xl: UI.envios, yl: j === 0 ? t.ejeY : null, tt: rep, anim: [0, 'fade', j * 0.2] });
      line(p, bd.envios, bd.ganancia, 'var(--c-base)', [0, 'draw', 0.2, { dur: 1.2 }], { 'stroke-width': 3.5, 'stroke-dasharray': '12 8' });
      GENS.forEach((g, k) => { const best = ESC.mejorC(rep, g), c = D.v1Dev.curvas[best.id]; line(p, c.envios, c.ganancia, GCOL[g], [0, 'draw', 0.4 + k * 0.2 + j * 0.2, { dur: 1.2 }], { 'stroke-width': 3 }); });
      const im = bd.ganancia.indexOf(Math.max(...bd.ganancia));
      p.svg.appendChild(s('text', { cls: 'tick', x: p.X(bd.envios[im]) + 14, y: p.Y(bd.ganancia[im]) - 10, fill: 'var(--ink2)', anim: [0, 'fade', 1.5] }, `${t.base}: ${F.m1(bd.ganancia[im])} M`));
    });
    const mejores = [].concat(...['separado', 'mismos'].map(r => GENS.map(g => ESC.mejorC(r, g))));
    const bestGain = Math.max(...mejores.map(r => r.gananciaMax));
    legend(root, 96, 820, GENS.map(g => ({ t: `${g} + LR`, c: GCOL[g] })).concat([{ t: t.base, c: '#9AA3AE', dash: true }]), [0, 'fade', 0.3, { out: 1 }]);
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 870, 1728) + 'font-size:24px', anim: [0, 'fade', 1.6, { out: 1 }] }, `Con el mejor C por AUC, el máximo más alto de un híbrido es ${F.m1(bestGain)} M, contra ${F.m1(Math.max(...bd.ganancia))} M del baseline en desarrollo.`));
    // calibración (beat 1)
    const neH = mejores.map(r => r.ne), caH = mejores.map(r => r.calibracion), met = D.baselineMetricas.filas;
    const neB = mean(met.map(r => r.ne)), caB = mean(met.map(r => r.calibracion));
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 800, 1728, 150) + 'display:grid;grid-template-columns:380px 380px 1fr;gap:36px;align-items:center;padding:18px 32px', anim: [1, 'up', 0.1] },
      `<div><div class="small" style="font-size:22px">${t.calHib}</div><div class="mono" style="font-size:32px;font-weight:700;color:var(--ink)">NE ${F.d2(Math.min(...neH))}–${F.d2(Math.max(...neH))}</div><div class="mono" style="font-size:26px;color:var(--ink2)">calib. ${F.d2(Math.min(...caH))}–${F.d2(Math.max(...caH))}</div></div>
       <div><div class="small" style="font-size:22px">${t.calBase}</div><div class="mono" style="font-size:32px;font-weight:700;color:var(--ink)">NE ${F.d2(neB)}</div><div class="mono" style="font-size:26px;color:var(--ink2)">calib. ${F.x1(caB)}</div></div>
       <div style="font-size:22px;color:var(--ink2);line-height:1.35"><b style="color:var(--ink)">${t.calK}.</b> ${t.calNota}</div>`));
  };
  ESC.v1final = root => {
    const t = T.v1final; title(root, t);
    if (!D.v1Final) {
      root.appendChild(h('div', { cls: 'abs pend-box', style: box(96, 290, 1728, 560), anim: [0, 'fade', 0.2] },
        `<div><span class="pend-chip" data-pendiente="1">${t.pend}</span><p style="font-size:28px;color:var(--ink2);margin-top:28px;max-width:1100px">${t.pendD}</p></div>`));
      return;
    }
    const bc = D.baseline.curva, vf = D.v1Final.curva;
    const p = curvasPanel(root, { x: 96, y: 290, w: 1728, h: 580, xd: [0, 15000], yd: [0, 320e6], xt: kTicks(0, 15000, 2500), yt: kTicks(0, 300e6, 50e6), b: 0, yl: UI.gananciaMedia, cutLabel: F.int(corte),
      series: [{ k: 'base', ...serieM(bc), c: COL.base }, { k: 'v1', ...serieM(vf), c: COL.v1 }] });
    legend(root, 96, 912, [{ t: 'Baseline', c: COL.base }, { t: t.serie, c: COL.v1 }], [0, 'fade', 0.2]);
    const g = at(vf.envios, vf.promedio, corte);
    root.appendChild(h('div', { cls: 'abs mono', style: box(1100, 912, 724) + 'text-align:right;font-size:26px;color:var(--ink)', anim: [0, 'fade', 1.5], 'data-val': g, 'data-campo': 'v1final.g' }, `Ĝ(${F.int(corte)}) = ${F.M(g)}`));
  };

  /* ---------------------------------------------------------------- 07 · discusión */
  ESC.disc = root => {
    const t = T.disc; title(root, t);
    const M = MATRIZ, bd = D.baselineDev;
    const mejores = [].concat(...['separado', 'mismos'].map(r => GENS.map(g => ESC.mejorC(r, g))));
    const vals = { dv2: F.pct(M.v2.p), dv21: F.pct(M.v21.p), dmedia: F.pct(M.media.p), ddisp: F.pct(M.disp.p),
      mejorV1: F.m1(Math.max(...mejores.map(r => r.gananciaMax))) + ' M', baseDev: F.m1(Math.max(...bd.ganancia)) + ' M' };
    const beats = [0, 0, 1, 2];
    t.items.forEach((it, i) => root.appendChild(h('div', { cls: 'abs', style: box(96, 262 + i * 170, 1728, 156) + 'display:grid;grid-template-columns:400px 1fr;gap:40px;border-top:1px solid var(--line);padding-top:18px', anim: [beats[i], 'up', 0.15 + (i % 2) * 0.25] },
      `<div style="font-size:30px;font-weight:700"><span class="hl mono" style="font-size:22px;display:block">0${i + 1}</span>${it.t}</div><div style="font-size:25px;line-height:1.42;color:var(--ink2)">${tpl(it.d, vals)}</div>`)));
  };

  /* ---------------------------------------------------------------- 08 · conclusiones */
  ESC.concl = root => {
    const t = T.concl; title(root, t);
    t.items.forEach((it, i) => root.appendChild(h('div', { cls: 'abs', style: box(96, 280 + i * 100, 1728) + 'font-size:32px;line-height:1.35;display:flex;gap:24px', anim: [0, 'up', 0.15 + i * 0.2] }, `<span class="hl mono" style="font-size:26px;padding-top:4px">0${i + 1}</span><span>${it}</span>`)));
    root.appendChild(h('div', { cls: 'abs card', style: box(96, 720, 1728) + 'border-left:6px solid var(--accent);padding:26px 36px', anim: [1, 'up', 0.1] }, `<span class="num">H0</span><p style="font-size:30px;color:var(--ink)">${t.h0}</p>`));
  };

  /* ---------------------------------------------------------------- 09 · futuro */
  ESC.futuro = root => {
    const t = T.futuro; title(root, t);
    t.items.forEach(([k, d], i) => {
      const x = 96 + (i % 2) * 884, y = 270 + Math.floor(i / 2) * 160, ctrl = /Control/.test(k);
      root.appendChild(h('div', { cls: 'abs card', style: box(x, y, 844, 140) + 'padding:20px 28px;' + (ctrl ? 'border-color:var(--accent);background:#1E1714' : ''), anim: [0, 'up', 0.15 + i * 0.12] },
        `<h3 style="font-size:28px;margin-bottom:4px">${ctrl ? '<span class="hl">◆</span> ' : ''}${k}</h3><p style="font-size:24px">${d}</p>`));
    });
  };

  /* ---------------------------------------------------------------- 10 · anexo */
  ESC.anexoRepro = root => {
    const t = T.anexoRepro; title(root, t);
    t.items.forEach(([k, d], i) => root.appendChild(h('div', { cls: 'abs', style: box(96, 280 + i * 118, 1728) + 'display:grid;grid-template-columns:340px 1fr;gap:40px;border-top:1px solid var(--line);padding-top:20px', anim: [0, 'up', 0.1 + i * 0.12] },
      `<div style="font-size:30px;font-weight:700">${k}</div><div style="font-size:27px;color:var(--ink2);line-height:1.4">${d}</div>`)));
  };
  ESC.anexoCorte = root => {
    const t = T.anexoCorte; title(root, t);
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 228, 1728) + 'font-size:26px', anim: [0, 'fade', 0.1] }, t.sub));
    const bd = D.baselineDev, bc = D.baseline.curva;
    const mk = (x, tt, xs, ys, yd, yt, b) => {
      const p = plot(root, { x, y: 300, w: 820, h: 440, xd: [2000, 6000], yd, xt: kTicks(2000, 6000, 1000), yt, xf: F.int, yf: F.m0, xl: UI.envios, yl: t.ejeY, tt, anim: [0, 'fade', b] });
      const idx = xs.map((v, i) => i).filter(i => xs[i] >= 2000 && xs[i] <= 6000);
      line(p, idx.map(i => xs[i]), idx.map(i => ys[i]), 'var(--c-base)', [0, 'draw', b + 0.2, { dur: 1.0 }], { 'stroke-width': 4 });
      [[4000, 'var(--accent)'], [4500, 'var(--ink)']].forEach(([k, c], j) => {
        const y = ys[xs.indexOf(k)];
        p.svg.appendChild(s('circle', { cx: p.X(k), cy: p.Y(y), r: 9, fill: c, anim: [0, 'pop', b + 1.2 + j * 0.15] }));
        p.svg.appendChild(s('text', { cls: 'lblm', x: p.X(k) + (j ? 14 : 10), y: p.Y(y) + (j ? -16 : 40), 'text-anchor': 'start', fill: 'var(--ink)', anim: [0, 'fade', b + 1.3 + j * 0.15] }, `${F.int(k)}: ${F.m2(y)}`));
      });
    };
    mk(96, '201908 · desarrollo (modelo 03–06)', bd.envios, bd.ganancia, [180e6, 215e6], kTicks(180e6, 210e6, 10e6), 0);
    mk(1004, '201910 · test (media de 6 semillas)', bc.envios, bc.promedio, [255e6, 295e6], kTicks(260e6, 290e6, 10e6), 0.4);
    [t.a, t.b, t.c].forEach((x, i) => root.appendChild(h('div', { cls: 'abs', style: box(96 + i * 590, 790, 560) + 'font-size:24px;color:var(--ink2);border-top:3px solid var(--line);padding-top:10px', anim: [0, 'up', 1.6 + i * 0.15] }, x)));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 880, 1728) + 'font-size:28px;font-weight:700;color:var(--ink)', anim: [0, 'up', 2.1] }, '→ ' + t.decision));
  };
  ESC.anexoDesvios = root => {
    const t = T.anexoDesvios; title(root, t);
    const xs = [96, 196, 556, 976], ws = [90, 350, 410, 840];
    t.cols.forEach((c, j) => root.appendChild(h('div', { cls: 'abs', style: box(xs[j], 268, ws[j]) + 'font-size:22px;color:var(--muted)', anim: [0, 'fade', 0] }, c)));
    t.filas.forEach((f, i) => f.forEach((c, j) => root.appendChild(h('div', { cls: 'abs' + (j < 2 ? ' mono' : ''), style: box(xs[j], 310 + i * 76, ws[j]) + `font-size:${j === 0 ? 24 : 25}px;color:${j === 0 ? 'var(--accent)' : j === 3 ? 'var(--ink)' : 'var(--ink2)'};border-top:1px solid #1E242D;padding-top:16px`, anim: [0, 'fade', 0.1 + i * 0.08] }, c))));
  };

  /* ---------------------------------------------------------------- cierre */
  ESC.cierre = root => {
    const t = T.cierre;
    root.appendChild(h('div', { cls: 'abs', style: box(96, 340, 1728) + 'font-size:140px;font-weight:800;letter-spacing:-.03em', anim: [0, 'up', 0.1] }, t.titulo));
    root.appendChild(h('div', { cls: 'abs', style: box(96, 520, 1728) + 'font-size:56px;font-weight:600;color:var(--accent)', anim: [0, 'up', 0.4] }, t.sub));
    root.appendChild(h('div', { cls: 'abs sub', style: box(96, 700, 1728) + 'color:var(--ink)', anim: [0, 'up', 0.7] }, t.integrantes));
    root.appendChild(h('div', { cls: 'abs small', style: box(96, 750, 1728) + 'font-size:26px', anim: [0, 'up', 0.8] }, t.programa));
  };
})();
