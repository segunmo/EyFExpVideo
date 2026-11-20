# Random Forest Features — presentación animada para el video

Sitio por pasos que reemplaza al PowerPoint del experimento colaborativo (DMEyF 2026, Maestría en Data Mining, UBA). Se graba la pantalla mientras se narra y se avanza con el teclado.

- Escenario fijo de **1920×1080** que se escala a la ventana (con bandas si no es 16:9).
- **64 pasos** (0 a 63) en 10 secciones: 01 Hipótesis · 02 Bibliografía · 03 Sesgos · 04 Diseño · 05 Limitaciones · 06 Resultados · 07 Discusión · 08 Conclusiones · 09 Futuros · 10 Anexo.
- HTML + CSS + JS, sin build. GSAP 3.12.5 y las tipografías (Inter, JetBrains Mono) están en `vendor/`: **funciona sin conexión**.

## Cómo abrirlo

- **Doble clic en `index.html`** (Chrome), o
- servidor local:
  ```bash
  python3 -m http.server 8000
  # abrir http://localhost:8000
  ```

`index.html?step=12` arranca en un paso; `?dev=1` arranca en modo desarrollo.

## Controles

| Tecla | Acción |
|---|---|
| `→` / `Espacio` | paso siguiente (animado) |
| `←` | paso anterior (se dibuja el estado final, sin animar) |
| `R` | volver al paso 0 |
| `G` + número + `Enter` | saltar a un paso (`Esc` cancela) |
| `F` | pantalla completa |
| `D` | modo grabación ↔ modo desarrollo |

- Apretar `→` durante una animación la completa al instante y arranca la siguiente.
- **Cada paso termina siempre en el mismo estado**, llegues con `→`, con `←` o con `G`. Se puede regrabar cualquier sección.
- **Modo grabación** (por defecto): sin cursor ni paneles.
- **Modo desarrollo** (`D`): panel con número e id del paso, sección, estado de los datos (exacto / transcripto / pendiente / ilustrativo), narración sugerida y presentador. Además aparece el aviso "verificar" en la bibliografía.

## Cómo grabar

1. Chrome con la ventana en una pantalla de 1920×1080 (o cualquier 16:9), y `F` para pantalla completa.
2. Modo grabación (sin el panel de `D`).
3. OBS: lienzo y salida 1920×1080, captura de ventana o de pantalla.
4. Por sección: `G` + primer paso + `Enter`, y grabar avanzando con `→`. Los pasos de cada sección están en `GUION.md`.
5. La narración sugerida está en `GUION.md` y en el panel de `D`. Se puede leer desde otra pantalla.

## Qué se edita y dónde

| Archivo | Qué tiene |
|---|---|
| `content.js` | **todo el texto en pantalla** (`textos`), la lista de pasos (`pasos`: escena, beat, título, qué se ve, narración, estado de datos), los presentadores por sección y `config.corteComun` (4.000) |
| `escenas.js`, `escenas_resultados.js` | cómo se dibuja cada diapositiva (posiciones, gráficos, árboles ilustrativos) |
| `main.js` | el motor: pasos, animaciones, teclado, modo desarrollo |
| `styles.css` | colores (un color fijo por serie en `:root`), tipografía, componentes |
| `data/*.csv` | los datos fuente (ver `FUENTES.md`) |
| `data/datos.js` | **generado** desde los CSV; no se edita a mano |

- **Texto:** cambiá `content.js` y recargá. Los textos marcados BORRADOR (sesgos extra, discusión, conclusiones) son propuestas para el equipo.
- **Presentadores:** completá `presentadores` en `content.js` y corré `node scripts/generar_guion.js`.
- **Reordenar o quitar pasos:** editá `pasos` en `content.js`. Cada paso apunta a una `escena` y un `beat`. Los beats de una escena van en orden: si quitás un beat intermedio, el siguiente paso igual muestra todo lo anterior.
- **GUION.md:** se regenera con `node scripts/generar_guion.js`. No se edita a mano.

## Cómo actualizar los datos

```bash
# 1. reemplazar o agregar el CSV en data/
# 2. regenerar data/datos.js
python3 scripts/convertir_datos.py
# 3. (si cambiaron transcripciones) validarlas
python3 scripts/validar_transcripciones.py
```

Los Δ contra el baseline y los textos con cifras se calculan en el sitio a partir de `data/datos.js`.

### Agregar el final de la variante 1 (árboles + logística en 201910)

Hoy `data/v1_final_201910.csv` **no existe a propósito**, y la matriz y el paso `v1-final` muestran "pendiente: corre en 201910". Cuando esté el resultado:

1. Guardá `data/v1_final_201910.csv` con el **mismo formato** que `EyFPipeline/resultados/baseline/curvas_ganancia.csv`:
   ```
   foto_mes,envios,semilla_<s1>,semilla_<s2>,…,promedio
   201910,0,0.0,0.0,…,0.0
   201910,500,…
   …
   201910,15000,…
   ```
   Una columna por semilla, envíos de 0 a 15.000 cada 500, ganancia en pesos. La media se recalcula desde las semillas.
2. Opcional: `data/v1_final_201910_metricas.csv` con `foto_mes,semilla,auc,ne,calibracion`.
3. `python3 scripts/convertir_datos.py`

La fila de la matriz, sus Δ y la curva del paso `v1-final` se completan **sin tocar código**. `scripts/verificar.py` prueba los dos estados con un archivo de prueba que después borra.

## Verificación

```bash
pip install playwright pillow    # usa el Chrome instalado
python scripts/verificar.py      # ~5 min; --rapido para una muestra
python scripts/capturas.py "file://$PWD/index.html" /tmp/capturas   # una captura por paso
```

`verificar.py` comprueba:
- **Determinismo:** el estado de cada paso es el mismo llegando con →, con `?step=N` y con ←, por huella del DOM en todos los pasos y por píxeles en una muestra.
- Muchas `→` seguidas no rompen el estado, y `G` funciona.
- La matriz y los textos con cifras coinciden con un recálculo independiente desde los CSV.
- Los estados pendiente y completo de la variante 1.
- Funciona desde `file://` y desde `http.server`, con la red bloqueada.

## Estructura

```
index.html  styles.css  main.js  content.js  escenas.js  escenas_resultados.js
data/        CSV fuente + datos.js generado
scripts/     convertir_datos.py · validar_transcripciones.py · generar_guion.js · verificar.py · capturas.py
vendor/      gsap-3.12.5.min.js · fonts/ (Inter, JetBrains Mono; licencia OFL)
GUION.md     guion generado (pasos, pantalla, narración)
FUENTES.md   procedencia de cada número, discrepancias y bibliografía a verificar
```

El repo puede hacerse público: solo tiene resultados agregados (curvas, métricas), sin datos crudos, ids de clientes, modelos ni rutas absolutas.
