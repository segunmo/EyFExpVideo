# Fuentes de cada número en pantalla

Regla: **ningún número se inventa.** Cada cifra sale de un archivo de `data/` (copiado o transcripto) y se calcula en el sitio a partir de ese archivo. Los Δ contra el baseline **no** se copian del deck: se recalculan. `scripts/verificar.py` compara lo que se ve en la matriz y en los textos con un recálculo independiente desde los CSV.

Rutas relativas a la carpeta que contiene este repo y los del equipo (`EyFPipeline/`, `EyF/`), que son de solo lectura.

## Estados

| Estado | Qué significa |
|---|---|
| `exacto` | copiado tal cual de un CSV de resultados del equipo |
| `transcripto` | tipeado desde una tabla exacta (texto o imagen de una tabla) y validado (ver abajo) |
| `aproximado` | leído de un gráfico. **No quedó ninguno en pantalla** (ver "Gráficos que no se dibujaron") |
| `pendiente` | todavía no existe; el sitio muestra "pendiente: corre en 201910" |
| `ilustrativo` | ejemplo hecho a mano para explicar (árboles, probabilidades, pesos); lleva la etiqueta "ilustrativo" |

## Archivos de `data/`

| Archivo | Origen | Estado |
|---|---|---|
| `baseline_curvas_ganancia.csv` | `EyFPipeline/resultados/baseline/curvas_ganancia.csv` (copia). En pantalla solo se usa `foto_mes = 201910`; las filas 201908 son in-sample y no se muestran | exacto |
| `baseline_metricas.csv` | `EyFPipeline/resultados/baseline/metricas.csv` (copia). Solo `in_sample = False` (201910) | exacto |
| `baseline_curva_201908.csv` | `CURVA_201908` de `EyFPipeline/experimentos/baseline/curva_agosto_notebook.py` (curva de desarrollo, modelo 03–06). AUC 0,93134 de `HANDOFF.md` §4.1 | transcripto |
| `target_y_filas_por_mes.csv` | `EyFPipeline/referencia/fe_duckdb/reportes_corrida/target_y_filas_por_mes.csv`, filas `etapa = entrada` | exacto |
| `v1_desarrollo_metricas.csv`, `v1_desarrollo_curvas.csv` | `EyFPipeline/resultados/v1_rf_lr/desarrollo_*.csv` (copia) | exacto |
| `v1_medicion_costo.csv` | `EyFPipeline/resultados/v1_rf_lr/medicion_costo.csv` (copia) | exacto |
| `perfiles_v2_curvas.csv` | Deck `Experimento_colaborativo_RFF.pptx (1).pdf`, **pág. 16**: tabla por semilla de "Perfiles · HP fijos" (imagen de una tabla de pandas, legible a resolución nativa) | transcripto |
| `perfiles_v21_curvas.csv` | Deck, **pág. 18**: tabla por semilla de "Perfiles · HP reoptimizados" | transcripto |
| `probrf_curvas.csv` | Deck, **pág. 21**: tabla de medias de 6 semillas (A_baseline, B_media, C_dispersion) | transcripto |
| `importancia_variables.csv` | Deck, pág. 24 (Prob RF, tabla en texto, % de gain medio de 6 semillas) y págs. 17 y 19 (Perfiles, solo nombres y orden, leídos del gráfico) | transcripto |
| `otro_equipo.csv` | `EyF/research/Baseline y features RF.html`, tabla de resultados (201910, 5 semillas) | transcripto |
| `v1_final_201910.csv` | **No existe todavía** (a propósito). Formato en `README.md` | pendiente |

### Validación de las transcripciones (`python3 scripts/validar_transcripciones.py`)

- La ganancia de una semilla es `G = 1.100.000·h − 27.500·k` (h = BAJA_2 entre los k primeros). Cada valor por semilla transcripto cumple que `G + 27.500·k` es múltiplo de 1.100.000: un dígito mal tipeado casi nunca lo cumple.
- La media de las 6 semillas de cada fila coincide con la columna `promedio` del deck (7 cifras significativas).
- La media de las 6 semillas de perfiles a 4.000 coincide con el resumen de la pág. 13 (293.333.333 y 291.683.333), y el desvío también (2.376.272 y 2.134.869).
- La columna `A_baseline` de la pág. 21 es igual al CSV del baseline en todas las filas.
- Cada media de B y C de la pág. 21 es una media posible de 6 ganancias (múltiplo de 1,1 M / 6 una vez sumado 0,0275·k).
- Pág. 21: en la extracción de texto las filas 5.500 y 6.000 salen desordenadas; se leyeron de la imagen de la página: A 283,617 / 279,767; B 285,083 / 280,683; C 280,317 / 276,283.

## Qué se ve en pantalla y de dónde sale

| Paso (id) | Valor en pantalla | Fuente | Estado |
|---|---|---|---|
| `problema-grilla`, `problema-clases` | 135.633 filas en 201910; 621 BAJA_1; 632 BAJA_2; 134.380 CONTINUA; 0,92 % de bajas. La grilla tiene 1.000 puntos con la misma proporción (9 encendidos: 5 BAJA_2, 4 BAJA_1) | `target_y_filas_por_mes.csv` | exacto |
| `ganancia-regla` | +$ 1.072.500 / −$ 27.500; equilibrio 1 de cada 40 (1.072.500 = 39 × 27.500) | regla de ganancia del diseño (`diseno_experimental_rf_perfiles.md` §4.5) | exacto |
| `ganancia-curva` | curva G(k) del baseline 201910; máximo $ 290,77 M a 3.500 envíos | `baseline_curvas_ganancia.csv` (promedio) | exacto |
| `biblio-antecedente` | +3,43 M (control sin target, x003) y +3,14 M (+ prob. RF, x001) | `otro_equipo.csv` | transcripto |
| `diseno-variantes` | Optuna 67 trials, mejor #56, AUC 0,93134, 182 hojas, lr 0,005, 2.689 rondas | `EyFPipeline/HANDOFF.md` §4.1 | transcripto |
| `dataset` | 152 variables × 5 = 760 + cliente y mes = 762 predictores; ≈ 130 mil filas por mes | `HANDOFF.md` §3 y §4.1 | transcripto |
| `arbol`, `rf`, `gbdt`, `oob-*`, `v1-onehot`, `v1-logistica`, `v2-*`, `v3-*` | umbrales, probabilidades (0,31…), pesos (+0,8…), conteos y frecuencias | hechos a mano con variables reales | ilustrativo |
| `v1-escala` | 300 árboles; 27.784 columnas one-hot (201906); 300 unos por fila; 38,5 M no nulos; 0,43 GB; 3,6 s | `v1_medicion_costo.csv` (RF-109, separado) | exacto |
| `v1-repartos` | ≈ 1.250 bajas (201906: 665 + 589 = 1.254) y ≈ 5.300 bajas (201903–06: 5.313) para la logística | `target_y_filas_por_mes.csv` (HANDOFF dice "unas 5.000") | exacto |
| `v1-dial` | grilla de C 1e-4…1; generadores RF-12 / RF-32 / RF-109 / LGBM-12 | `EyFPipeline/experimentos/v1_rf_lr/config.py` | exacto |
| `eval-semillas` | 6 curvas por semilla del baseline 201910 y Ĝ(4.000) = $ 288,57 M | `baseline_curvas_ganancia.csv` | exacto |
| `limitaciones-1` | desvío entre semillas del baseline a 4.000: $ 4,54 M | `baseline_curvas_ganancia.csv` (desvío muestral de las 6 semillas = 4.544.300, igual que la pág. 13) | exacto |
| `limitaciones-v1` | NE 1,68 y calibración 6,4× del baseline en 201910 (media de 6 semillas) | `baseline_metricas.csv` | exacto |
| `matriz`, `matriz-deltas` | ganancia media a 4.000: baseline $ 288,57 M; media $ 289,12 M; dispersión $ 285,63 M; HP fijos $ 293,33 M; reoptimizados $ 291,68 M. Δ: +0,55 M / +0,19 %; −2,93 M / −1,02 %; +4,77 M / +1,65 %; +3,12 M / +1,08 % | baseline: CSV; perfiles: págs. 16/18; Prob RF: pág. 21. Δ calculados en el sitio | exacto / transcripto |
| `matriz` (fila árboles + logística) | "pendiente: corre en 201910" | `v1_final_201910.csv` no existe | pendiente |
| `perfiles-curvas`, `perfiles-zoom` | curvas medias 0–15.000 y zoom 2.000–6.000 | baseline: CSV; perfiles: págs. 16 y 18 | exacto / transcripto |
| `perfiles-semillas` | las 6 ganancias por semilla a 4.000 de cada versión, su media y su rango; "8 de 10" y "10 de 10" perfiles en el top 10 de importancia; la primera: `rf_perfil_matm_other_delta_1` | baseline: CSV; perfiles: págs. 16/18; importancia: págs. 17/19 | exacto / transcripto |
| `prob-curvas`, `prob-zoom` | curvas A / B / C | pág. 21 | transcripto |
| `prob-importancia` | top 10 de importancia de B y C (`rfd_media` 5,86 %…) | pág. 24 | transcripto |
| `v1-auc-*` | AUC en 201908 por C, generador y reparto; generador solo (punteado); baseline de desarrollo 0,9313 (rayado) | `v1_desarrollo_metricas.csv`; AUC del baseline: HANDOFF §4.1 | exacto |
| `v1-ganancia` | curvas en 201908 con el mejor C por AUC de cada generador; baseline de desarrollo (máximo 209,6 M a 4.500); mejor máximo de un híbrido con su mejor C: 200,2 M | `v1_desarrollo_curvas.csv`, `baseline_curva_201908.csv` | exacto / transcripto |
| `v1-calibracion` | híbridos (mejor C, 8 configuraciones): NE 0,61–0,65, calibración 1,02–1,31; baseline 201910: NE 1,68, calibración 6,4× | `v1_desarrollo_metricas.csv`, `baseline_metricas.csv` | exacto |
| `v1-final` | panel pendiente | — | pendiente |
| `discusion-*` | los Δ de la matriz; 200,2 M vs 209,6 M; −46 M / −12 M de la primera competencia | matriz; `HANDOFF.md` §4.1 (antecedente de `EyF/competencia/experimentos/037*`) | exacto / transcripto |
| `anexo-repro` | 288,567 M a 4.000 y 288,750 M a 4.500 | `HANDOFF.md` §4.1 y §12 | exacto |
| `anexo-corte` | 201908: 206,80 M a 4.000 y 209,55 M a 4.500; 201910: 288,57 M y 288,75 M | `baseline_curva_201908.csv`, `baseline_curvas_ganancia.csv` | transcripto / exacto |

## Gráficos que no se dibujaron (para que el equipo los reemplace con sus CSV)

Estos solo existen como imágenes en el deck. Se prefirió no dibujarlos antes que mostrar valores aproximados:

- **Prob RF por semilla** (pág. 22): curvas de cada semilla de A, B y C. Hace falta el CSV por semilla (sale de `Comparacion_ganancias.ipynb`).
- **Prob RF: AUC por semilla y calibración** (pág. 23).
- **Perfiles: importancia completa** (págs. 17 y 19): se usaron solo los nombres y el orden del top 10, no los valores.

Con esos CSV en `data/` y un bloque en `scripts/convertir_datos.py`, se agregan como pasos nuevos en `content.js` + una escena.

## Discrepancias encontradas (no se propagaron)

1. **Matriz del deck (pág. 11), fila baseline:** dice "Baseline LightGBM (4k envíos) 288.750", pero 288.750.000 es la ganancia a **4.500**. A 4.000 es **288.566.667**, el valor contra el que se comparan las demás filas. En pantalla: $ 288,57 M.
2. **Matriz, Prob RF · Dispersión:** muestra "Δ 1,02 %"; es **−1,02 %** (285,633 < 288,567).
3. **Matriz, Perfiles · HP reoptimizados:** dice "(4.5k envíos) 291.683", pero 291.683.333 es el valor a **4.000** (págs. 13 y 18). A 4.500 es 288.750.000.
4. **Política de corte inconsistente:** el deck usa 4.000 común; el notebook del baseline elige 4.500 (máximo de agosto, escrito a mano como `corte_manual = 4500`); el diseño dice "máxima ganancia en agosto para cada caso" (D6). En el sitio: **4.000 común** (`config.corteComun` en `content.js`), todos los Δ se calculan de los datos, y el tema se explica en Limitaciones y en el Anexo.
5. **Fila "Árboles + regresión logística" con "2 / 3,10 %":** es un marcador provisorio. No se muestra; la fila queda "pendiente".
6. **Formato de los millones:** el deck escribe "288.567" (millones con punto de miles); en el sitio se escribe "$ 288,57 M".
7. **Calibración de los híbridos:** `HANDOFF.md` §12 dice "calibración de 1,0 a 1,1". Con el mejor C por AUC de cada generador y reparto, el CSV da **1,02 a 1,31** (RF-32 separado, C = 0,01: 1,307). Se muestra el rango del CSV.
8. **"El mejor híbrido queda en unos 200 M":** con el mejor C por AUC (la regla de selección) el máximo es **200,2 M** (LGBM-12, mismos, C = 0,003). Si se mira cualquier C, hay híbridos que llegan a 204,05 M (LGBM-12, mismos, C = 1e-4 y 3e-4), pero elegir C por ganancia en agosto no es la regla del diseño. En pantalla se aclara "con el mejor C por AUC".
9. **Tiempo de la logística:** `HANDOFF.md` dice 3,5 s; `medicion_costo.csv` dice **3,6 s**. Se muestra el CSV.
10. **Pico de la curva del baseline en 201910:** el máximo de la media está en **3.500 envíos (290,77 M)**, no entre 4.000 y 4.500 (ese es el pico de agosto, 209,55 M a 4.500).
11. **762 predictores:** son 152 × 5 = 760 variables más `numero_de_cliente` y `foto_mes`, que el baseline del equipo usa como predictores (D5). En pantalla se dice así.
12. **`rfd_disp_norm`** aparece en la importancia del brazo C (pág. 24) pero no en la lista de estadísticos del diseño (media, desvío, P10–P90, rango, IQR). No se explica en pantalla; conviene que el equipo aclare qué es.
13. **Bajas del reparto "mismos":** `HANDOFF.md` dice "unas 5.000"; los conteos de 201903–06 suman **5.313**. En pantalla: ≈ 5.300.
14. **Importancia de perfiles (págs. 17 y 19):** los títulos dicen "Trial 56" y "Trial 42", así que parecen de un modelo de desarrollo, no de los 6 finales. En pantalla solo se usa el orden ("8 de 10" / "10 de 10").

## Bibliografía a verificar (todas con `verificar: true` en `content.js`; en modo desarrollo se ve un aviso "verificar")

| Referencia | Estado |
|---|---|
| He, X., Pan, J., Jin, O., et al. (2014). *Practical Lessons from Predicting Clicks on Ads at Facebook*. ADKDD'14. doi:10.1145/2648584.2648589 | leída en `EyFPipeline/docs/referencias/06_paper_facebook_ctr_2014.md`; confirmar la cita final |
| Breiman, L. (2001). *Random Forests*. Machine Learning, 45(1), 5–32 | verificar |
| Breiman, L. (1996). *Out-of-bag estimation*. Technical report, UC Berkeley | verificar |
| Vens, C. & Costa, F. (2011). *Random Forest Based Feature Induction*. IEEE ICDM | verificar |
| Meinshausen, N. (2006). *Quantile Regression Forests*. JMLR 7, 983–999 | verificar |
| Wager, S., Hastie, T. & Efron, B. (2014). *Confidence Intervals for Random Forests: The Jackknife and the Infinitesimal Jackknife*. JMLR 15, 1625–1651 | verificar |
| Ke, G. et al. (2017). *LightGBM: A Highly Efficient Gradient Boosting Decision Tree*. NeurIPS | verificar |
| Akiba, T. et al. (2019). *Optuna: A Next-generation Hyperparameter Optimization Framework*. KDD | verificar |
| Geurts, P., Ernst, D. & Wehenkel, L. (2006). *Extremely randomized trees*. Machine Learning 63, 3–42 | verificar |
| Wolpert, D. (1992). *Stacked generalization*. Neural Networks 5(2), 241–259 | verificar |
| Antecedente: otro equipo del curso, "Baseline y features RF" (nov. 2026) | citado sin nombres personales |

No se agregó ninguna referencia fuera de esta lista.
