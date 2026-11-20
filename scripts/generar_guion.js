// Genera GUION.md desde content.js (pasos, pantalla, narración sugerida, presentadores).
// Uso: node scripts/generar_guion.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(raiz, 'content.js'), 'utf8'), ctx);
const C = ctx.window.CONTENIDO;
const nombre = id => id === 'portada' ? 'Portada' : id === 'cierre' ? 'Cierre' : (s => s.id + ' · ' + s.nombre)(C.secciones.find(s => s.id === id));
const palabras = C.pasos.reduce((n, p) => n + p.notas.split(/\s+/).length, 0);
let md = `# Guion del video — Random Forest Features

> Generado desde \`content.js\` con \`node scripts/generar_guion.js\`. **No editar a mano:** los cambios se hacen en \`content.js\` y se regenera.

- ${C.pasos.length} pasos (0 a ${C.pasos.length - 1}). Narración sugerida: ${palabras} palabras ≈ ${Math.round(palabras / 140)} min a 140 palabras por minuto, más las pausas de las animaciones.
- Para grabar una sección: \`G\` + número del primer paso + \`Enter\`, y avanzar con \`→\`.
- Los textos marcados **BORRADOR** son propuestas para que el equipo los reescriba.
- Presentador: completar \`presentadores\` en \`content.js\`.

| Sección | Pasos | Presenta |
|---|---|---|
`;
const secs = [];
C.pasos.forEach((p, i) => { const s = secs[secs.length - 1]; if (!s || s.id !== p.seccion) secs.push({ id: p.seccion, a: i, b: i }); else s.b = i; });
secs.forEach(s => { md += `| ${nombre(s.id)} | ${s.a}–${s.b} | ${C.presentadores[s.id] || '—'} |\n`; });
let last = null;
C.pasos.forEach((p, i) => {
  if (p.seccion !== last) { md += `\n## ${nombre(p.seccion)}${C.presentadores[p.seccion] ? ' — presenta ' + C.presentadores[p.seccion] : ''}\n`; last = p.seccion; }
  md += `\n### Paso ${i} · \`${p.id}\` — ${p.titulo}\n\n**En pantalla:** ${p.pantalla}\n\n**Narración sugerida:** ${p.notas}\n`;
  if (p.datos && p.datos.length) md += `\n*Datos:* ${p.datos.join(' · ')}\n`;
});
fs.writeFileSync(path.join(raiz, 'GUION.md'), md);
console.log('GUION.md:', C.pasos.length, 'pasos,', palabras, 'palabras');
