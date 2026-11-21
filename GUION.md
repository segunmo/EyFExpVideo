# Guion del video — Random Forest Features

> Generado desde `content.js` con `node scripts/generar_guion.js`. **No editar a mano:** los cambios se hacen en `content.js` y se regenera.

- 56 pasos (0 a 55). Narración sugerida: 1462 palabras ≈ 10 min a 140 palabras por minuto, más las pausas de las animaciones.
- Para grabar una sección: `G` + número del primer paso + `Enter`, y avanzar con `→`.
- Los textos marcados **BORRADOR** son propuestas para que el equipo los reescriba.
- Presentador: completar `presentadores` en `content.js`.

| Sección | Pasos | Presenta |
|---|---|---|
| Portada | 0–0 | — |
| 01 · Hipótesis | 1–4 | — |
| 02 · Bibliografía | 5–5 | — |
| 03 · Sesgos | 6–7 | — |
| 04 · Diseño experimental | 8–33 | — |
| 05 · Limitaciones | 34–35 | — |
| 06 · Resultados | 36–46 | — |
| 07 · Discusión | 47–48 | — |
| 08 · Conclusiones | 49–50 | — |
| 09 · Trabajo futuro | 51–51 | — |
| 10 · Anexo | 52–54 | — |
| Cierre | 55–55 | — |

## Portada

### Paso 0 · `portada` — Portada

**En pantalla:** Título, pregunta de investigación, integrantes y programa; un bosque de árboles se dibuja de fondo.

**Narración sugerida:** Somos Pedro Bosch, Pedro Franz y Segundo Molina. La pregunta del experimento: ¿se puede mejorar la performance del modelo generando variables supervisadas a partir de un Random Forest?

## 01 · Hipótesis

### Paso 1 · `problema-grilla` — El problema

**En pantalla:** Grilla de puntos cliente-mes; menos del 1 % se ilumina como baja. Conteos reales de 201910.

**Narración sugerida:** El problema es la baja de clientes de un banco. Cada fila es un cliente en un mes: unas 130 mil por mes, y menos del uno por ciento se da de baja.

*Datos:* exacto: clases por mes

### Paso 2 · `problema-clases` — BAJA_1, BAJA_2, CONTINUA

**En pantalla:** Las bajas se separan en BAJA_1 y BAJA_2; los modelos aprenden BAJA_1 ∪ BAJA_2 contra CONTINUA.

**Narración sugerida:** Hay dos tipos de baja: BAJA_1 se va el mes siguiente y BAJA_2 dentro de dos meses. Los modelos se entrenan con las dos juntas como positivo.

*Datos:* exacto: clases por mes

### Paso 3 · `hipotesis` — H1 y H0

**En pantalla:** Tarjetas de H1 (principal) y H0.

**Narración sugerida:** Nuestra hipótesis: los splits y las predicciones de un Random Forest capturan interacciones que, codificadas como variables, pueden mejorar a LightGBM. La hipótesis nula: ninguna representación RF mejora la ganancia en la comparación que definimos.

### Paso 4 · `hipotesis-porque` — Por qué

**En pantalla:** Aparece la motivación: interacciones y segmentaciones que el baseline aprovecha menos.

**Narración sugerida:** La intuición es que los árboles podrían hacer accesibles interacciones y segmentaciones que el baseline aprovecha menos.

## 02 · Bibliografía

### Paso 5 · `biblio-base` — Referencias base

**En pantalla:** Cinco referencias: He et al. 2014, Breiman 2001, Breiman 1996, Ke et al. 2017, Akiba et al. 2019, cada una con qué tomamos.

**Narración sugerida:** La variante de árboles más logística sale del paper de Facebook de 2014. El Random Forest y el out-of-bag son de Breiman; LightGBM y Optuna son las herramientas del baseline.

*Datos:* verificar: referencias

## 03 · Sesgos

### Paso 6 · `sesgos-expectativa` — Expectativa vs. lo que hay que demostrar

**En pantalla:** El texto del deck sobre la expectativa (bagging + boosting) y dos columnas: expectativa / lo que hay que demostrar.

**Narración sugerida:** Antes de correr esperábamos que juntar dos ensambles con mecánicas opuestas, bagging y boosting, mejorara el resultado, porque modelos decorrelacionados reducen el error. Eso es una expectativa, no un resultado: hay que demostrarlo en la ganancia.

### Paso 7 · `sesgos-diseno` — De qué se cuida el diseño (borrador)

**En pantalla:** Recuadro: evitar data leakage mediante out-of-bag.

**Narración sugerida:** Out-of-bag genera las variables de cada fila con árboles que no la vieron durante el entrenamiento para evitar data leakage.

## 04 · Diseño experimental

### Paso 8 · `diseno-variantes` — Tres representaciones

**En pantalla:** Tres columnas: árboles + logística, probabilidades RF, perfiles de hojas.

**Narración sugerida:** Probamos tres formas de convertir un Random Forest en información: hojas más logística, las probabilidades de los árboles y los perfiles de hojas. Todo se compara contra el LightGBM baseline del equipo.

*Datos:* exacto: hiperparámetros del baseline (HANDOFF)

### Paso 9 · `dataset` — Dataset y target

**En pantalla:** Tabla con columnas reales (ctrx_quarter, mcaja_ahorro, … y sus _lag/_delta); la columna de clase pasa a binaria.

**Narración sugerida:** Los datos son de 2019: 152 variables con sus lags y deltas de uno y dos meses. El target junta BAJA_1 y BAJA_2, pero la ganancia paga solo BAJA_2.

### Paso 10 · `calendario-seleccion` — Calendario: selección del RF

**En pantalla:** Línea de tiempo 201901–201912; enero y febrero solo para lags; la selección del RF se ajusta en 03–05 y se evalúa en 06.

**Narración sugerida:** Todas las variantes comparten un calendario. Enero y febrero solo sirven para construir lags. El Random Forest se elige ajustando con marzo a mayo y midiendo AUC en junio.

### Paso 11 · `calendario-desarrollo` — Calendario: RF definitivo y desarrollo

**En pantalla:** RF definitivo 03–06 (OOB en train, todos los árboles para 07, 08, 10) y LightGBM de desarrollo 03–06 → 08.

**Narración sugerida:** El RF definitivo se ajusta con marzo a junio. El LightGBM de desarrollo entrena con esos meses y se evalúa en agosto: ahí se miran el AUC y el corte.

### Paso 12 · `calendario-final` — Calendario: final y test

**En pantalla:** LightGBM final 03–08 con 6 semillas; 201910 resaltado como test.

**Narración sugerida:** El modelo final entrena de marzo a agosto con seis semillas, y la ganancia se mide en octubre, que no se usa para nada más.

### Paso 13 · `calendario-huecos` — Calendario: los huecos

**En pantalla:** Se marcan 201907 (salteado en desarrollo) y 201911–12 (excluidos), con su explicación.

**Narración sugerida:** Julio se saltea en desarrollo porque su BAJA_2 recién se conoce en septiembre. Noviembre y diciembre nunca se usan: uno solo tiene BAJA_1 y el otro no tiene clase.

### Paso 14 · `arbol` — Un árbol de decisión

**En pantalla:** Se dibuja un árbol chico con cortes en ctrx_quarter, mcaja_ahorro y cliente_antiguedad (ilustrativo).

**Narración sugerida:** Antes de las variantes, un repaso: un árbol hace preguntas sobre las variables, una por nodo.

*Datos:* ilustrativo

### Paso 15 · `arbol-recorrido` — La hoja es una regla

**En pantalla:** Una fila recorre el árbol y cae en una hoja con su probabilidad; el camino se escribe como regla.

**Narración sugerida:** Una fila baja por el árbol y termina en una hoja. Esa hoja es una regla: la conjunción de todos los cortes del camino.

*Datos:* ilustrativo

### Paso 16 · `rf` — Random Forest: bagging

**En pantalla:** Tres árboles en paralelo sobre muestras bootstrap, que se promedian.

**Narración sugerida:** Un Random Forest arma muchos árboles en paralelo, cada uno con una muestra bootstrap y subconjuntos de variables, y los promedia.

*Datos:* ilustrativo

### Paso 17 · `gbdt` — LightGBM: boosting

**En pantalla:** Árboles en serie, cada uno sobre el error del anterior; abajo: hojas superpuestas (RF) vs. complementarias (GBDT).

**Narración sugerida:** LightGBM, en cambio, arma árboles en serie: cada uno corrige lo que erraron los anteriores. Por eso las hojas del RF son reglas redundantes y las del boosting se complementan.

*Datos:* ilustrativo

### Paso 18 · `oob-matriz` — Out-of-bag: la matriz

**En pantalla:** Matriz filas × árboles; cada árbol marca las filas de su bootstrap (in-bag).

**Narración sugerida:** Si generamos variables con el mismo RF que vio la etiqueta de esa fila, filtramos el target. Cada árbol se ajusta con una muestra bootstrap: algunas filas quedan adentro y otras afuera.

*Datos:* ilustrativo

### Paso 19 · `oob-fila` — Out-of-bag: una fila

**En pantalla:** Se resalta una fila: sus árboles elegibles (OOB) se encienden; el resto se atenúa.

**Narración sugerida:** Para cada fila de entrenamiento usamos solo los árboles que no la vieron: sus árboles out-of-bag.

*Datos:* ilustrativo

### Paso 20 · `oob-despues` — Out-of-bag: meses posteriores y límite

**En pantalla:** Los meses 07, 08 y 10 usan todos los árboles; recuadro con la limitación (por fila, no por cliente ni tiempo).

**Narración sugerida:** Para julio, agosto y octubre, que el bosque no vio, se usan todos los árboles. Ojo: es una exclusión por fila; un árbol pudo ver otra foto del mismo cliente.

*Datos:* ilustrativo

### Paso 21 · `v1-onehot` — Variante 1: hojas → one-hot

**En pantalla:** Una fila pasa por 3 árboles → ids de hoja [2, 1, 3] → el vector one-hot se arma bloque por bloque.

**Narración sugerida:** Variante uno, la parte de Segundo, adaptada del paper de Facebook. Cada árbol se convierte en una variable categórica: la hoja donde cae la fila. En one-hot, cada fila tiene exactamente un uno por árbol.

*Datos:* ilustrativo

### Paso 22 · `v1-logistica` — Variante 1: pesos y sigmoide

**En pantalla:** Cada 1 toma el peso de su hoja; se suman y pasan por una sigmoide → probabilidad.

**Narración sugerida:** Sobre ese vector se ajusta una regresión logística con L2: un peso por hoja, o sea un peso por regla. La suma pasa por una sigmoide y da la probabilidad.

*Datos:* ilustrativo

### Paso 23 · `v1-escala` — Variante 1: escala real

**En pantalla:** Números reales de RF-109: 300 árboles, 27.784 columnas, 300 unos por fila, 38,5 M no nulos, 0,43 GB, 3,6 s.

**Narración sugerida:** Con los números reales: trescientos árboles dan casi veintiocho mil columnas, pero la matriz es dispersa y la logística se ajusta en segundos. Ojo: acá la salida reemplaza a LightGBM, no se le agregan columnas.

*Datos:* exacto: medicion_costo.csv

### Paso 24 · `v1-repartos` — Variante 1: dos repartos

**En pantalla:** Dos líneas de tiempo: separado (generador 03–05, logística 06) y mismos (ambos 03–06), evaluadas en 201908.

**Narración sugerida:** Probamos dos repartos de meses: separado, donde la logística aprende en un mes que el generador no vio, y mismos, con el mismo calendario que el baseline.

### Paso 25 · `v1-dial` — Variante 1: C y generadores

**En pantalla:** Dial de C de 1e-4 a 1 (más chico = más regularización) y los cuatro generadores: RF-12, RF-32, RF-109, LGBM-12.

**Narración sugerida:** La regularización se controla con C: más chico, más regularización. Y variamos el generador: tres Random Forest de distinto tamaño de hoja y el LightGBM de doce hojas del paper.

### Paso 26 · `v2-arboles` — Variante 2: una probabilidad por árbol

**En pantalla:** Una fila pasa por muchos árboles; cada uno emite una probabilidad que cae en una tira de puntos.

**Narración sugerida:** Variante dos: la fila pasa por todos los árboles y cada uno da su propia probabilidad de baja.

*Datos:* ilustrativo

### Paso 27 · `v2-stats` — Variante 2: estadísticos

**En pantalla:** Sobre la tira se marcan media, desvío, percentiles P10–P90, rango e IQR.

**Narración sugerida:** De esa distribución sacamos la media, el desvío, los percentiles, el rango y el rango intercuartil. La idea es que el desacuerdo entre árboles también sea información.

*Datos:* ilustrativo

### Paso 28 · `v2-columnas` — Variante 2: columnas nuevas

**En pantalla:** Los valores vuelan a columnas nuevas (rfd_media, rfd_desvio, …) a la derecha de la tabla de LightGBM; brazos B y C.

**Narración sugerida:** Esos valores se agregan como columnas a la tabla de LightGBM. Brazo B: baseline más la media. Brazo C: baseline más las medidas de dispersión.

*Datos:* ilustrativo

### Paso 29 · `v3-padre` — Variante 3: el último split

**En pantalla:** La fila baja por cuatro árboles; en cada uno se resalta el nodo padre de la hoja y se extrae su variable.

**Narración sugerida:** Variante tres, perfiles de hojas: en cada árbol miramos el nodo padre de la hoja alcanzada, o sea el último corte, y anotamos qué variable usó.

*Datos:* ilustrativo

### Paso 30 · `v3-frecuencias` — Variante 3: frecuencias

**En pantalla:** Conteo por variable dividido por los árboles elegibles (OOB) → vector de frecuencias.

**Narración sugerida:** Contamos cuántas veces aparece cada variable y dividimos por la cantidad de árboles elegibles, que en train son los out-of-bag.

*Datos:* ilustrativo

### Paso 31 · `v3-columnas` — Variante 3: columnas y versiones

**En pantalla:** Las frecuencias se agregan como rf_perfil_<variable>; qué conserva y qué descarta; v2 (HP fijos) y v2.1 (reoptimizado).

**Narración sugerida:** Cada variable del RF da una columna, más una para árboles sin split. Se conserva qué variable decidió, no el umbral ni la hoja. Hay dos versiones: v2 con los hiperparámetros del baseline y v2.1 reoptimizando LightGBM.

*Datos:* ilustrativo

### Paso 32 · `eval-semillas` — Evaluación: 6 semillas

**En pantalla:** Las 6 curvas reales del baseline en 201910 y la media Ĝ(k) al mismo corte.

**Narración sugerida:** Cada variante se entrena con seis semillas. Reportamos la media de las seis ganancias al mismo corte, no la ganancia de promediar los scores.

*Datos:* exacto: curvas baseline por semilla

### Paso 33 · `eval-reglas` — Evaluación: corte y métricas

**En pantalla:** Corte fijado en desarrollo; 201910 solo para comparar; métricas AUC, ganancia, NE y calibración.

**Narración sugerida:** El corte se fija en desarrollo y octubre solo se usa para comparar. Miramos AUC y ganancia, y para la variante uno también entropía normalizada y calibración, como en el paper.

## 05 · Limitaciones

### Paso 34 · `limitaciones-1` — Limitaciones: incertidumbre y OOB

**En pantalla:** Tarjetas 1 y 2: un mes y 6 semillas (desvío del baseline ≈ 4,54 M) y OOB por fila.

**Narración sugerida:** Un solo mes de test y seis semillas no capturan toda la incertidumbre: el desvío entre semillas del baseline es de unos cuatro millones y medio, así que tres millones es ruido. Y el OOB es por fila, no por cliente.

*Datos:* exacto: desvío por semilla del baseline

### Paso 35 · `limitaciones-2` — Limitaciones: métricas y comparabilidad

**En pantalla:** Tarjetas 3 y 4: AUC ≠ ganancia, agosto es desarrollo, octubre no se reusa; comparabilidad entre variantes.

**Narración sugerida:** El AUC no es la ganancia, y la ganancia simulada no es un efecto causal. Además hay que verificar que todas las variantes usen el mismo RF; v2.1 cambia dos cosas a la vez.

## 06 · Resultados

### Paso 36 · `matriz` — Matriz común

**En pantalla:** Tabla: ganancia media a 4.000 envíos por variante, incluida árboles + logística (brazo A, RF-109).

**Narración sugerida:** Esta es la matriz común: ganancia media de seis semillas en octubre, a cuatro mil envíos.

*Datos:* exacto: baseline y variante 1 · transcripto: perfiles y prob RF

### Paso 37 · `matriz-deltas` — Diferencias contra el baseline

**En pantalla:** Barras divergentes alrededor de 0 con el Δ $ y Δ % de cada variante.

**Narración sugerida:** Contra el baseline: perfiles suma uno coma sesenta y cinco y uno coma cero ocho por ciento; la media del RF, cero coma diecinueve; la dispersión resta uno coma cero dos, y árboles más logística resta dos coma treinta y cinco.

*Datos:* exacto: baseline y variante 1 · transcripto: perfiles y prob RF

### Paso 38 · `v1-auc` — Variante 1: AUC vs. C

**En pantalla:** AUC en 201908 según C para los 4 generadores, en los dos repartos (separado y mismos); punteado = generador solo; rayado = baseline 0,9313.

**Narración sugerida:** Ahora la variante uno, en desarrollo. El AUC en agosto forma una U invertida según C: con poca regularización, la logística sobreajusta. Con el reparto mismos los RF mejoran, pero ningún híbrido llega a la línea del baseline.

*Datos:* exacto: desarrollo_metricas.csv

### Paso 39 · `v1-ganancia` — Variante 1: ganancia en desarrollo

**En pantalla:** Curvas de ganancia en 201908 con el mejor C por generador (dos repartos) contra la curva de desarrollo del baseline.

**Narración sugerida:** En ganancia pasa lo mismo: con el mejor C de cada generador, ninguno alcanza la curva de desarrollo del baseline.

*Datos:* exacto: desarrollo_curvas.csv · transcripto: curva 201908 del baseline

### Paso 40 · `v1-final` — Variante 1: final en 201910

**En pantalla:** Zoom 2.000–6.000 de las curvas en 201910 (baseline, RF-109 + logística, RF-109 solo) y las 6 semillas a 4.000; abajo, el control con LGBM-12.

**Narración sugerida:** En el final, con la configuración fijada en agosto, el híbrido queda dos coma tres por ciento debajo del baseline, con las seis semillas por debajo. Lo que sí hace la logística es levantar mucho a su propio Random Forest: casi veinte millones.

*Datos:* exacto: final_curvas_ganancia.csv y final_metricas.csv

### Paso 41 · `prob-curvas` — Variante 2 · Probabilidades RF: curva completa

**En pantalla:** Curvas completas: baseline (A), + media (B), + dispersión (C).

**Narración sugerida:** Para probabilidades RF las tres curvas también se superponen casi por completo.

*Datos:* exacto: baseline · transcripto: prob RF (pág. 21)

### Paso 42 · `prob-zoom` — Variante 2 · Probabilidades RF: zoom

**En pantalla:** Zoom 2.000–6.000: B empata con A en 4.000; C queda abajo.

**Narración sugerida:** En el zoom, la media queda prácticamente igual al baseline y la dispersión queda por debajo.

*Datos:* exacto: baseline · transcripto: prob RF (pág. 21)

### Paso 43 · `prob-importancia` — Variante 2 · Probabilidades RF: importancia

**En pantalla:** Barras de importancia: rfd_media primera en el brazo B (5,86 %); en C, las de dispersión aparecen entre las primeras.

**Narración sugerida:** Curioso: la media del RF es la variable más importante del brazo B, por encima de todas las originales. Que LightGBM la use mucho no implica que mejore la ganancia.

*Datos:* transcripto: importancia (pág. 24)

### Paso 44 · `perfiles-curvas` — Variante 3 · Perfiles RF: curva completa

**En pantalla:** Curvas completas 0–15.000: baseline y perfiles HP fijos a 4.000 envíos; perfiles HP reoptimizados a 4.500.

**Narración sugerida:** Las curvas completas de perfiles casi se superponen con la del baseline.

*Datos:* exacto: baseline · transcripto: perfiles (págs. 16 y 18)

### Paso 45 · `perfiles-zoom` — Variante 3 · Perfiles RF: zoom

**En pantalla:** Zoom 2.000–6.000: HP fijos a 4.000 envíos y HP reoptimizados a 4.500; las curvas se cruzan según el corte.

**Narración sugerida:** En el zoom comparamos los perfiles con HP fijos a cuatro mil envíos y los reoptimizados a cuatro mil quinientos. Las curvas se cruzan según el corte.

*Datos:* exacto: baseline · transcripto: perfiles (págs. 16 y 18)

### Paso 46 · `perfiles-semillas` — Variante 3 · Perfiles RF: las 6 semillas

**En pantalla:** Puntos por semilla y media: baseline y HP fijos a 4.000 envíos; HP reoptimizados a 4.500. Importancia: los perfiles dominan el top 10.

**Narración sugerida:** Semilla por semilla, los rangos se superponen. LightGBM usa mucho los perfiles, pero la mejora en ganancia queda dentro del ruido.

*Datos:* exacto: baseline · transcripto: perfiles e importancia

## 07 · Discusión

### Paso 47 · `discusion-1` — Discusión: variantes 1 y 2

**En pantalla:** Puntos 1 y 2 de la discusión (borrador).

**Narración sugerida:** BORRADOR: árboles más logística no supera al baseline, pero mejora a su propio RF. La media del RF empata y la dispersión empeora.

*Datos:* exacto/transcripto: Δ de la matriz

### Paso 48 · `discusion-2` — Discusión: variante 3

**En pantalla:** Punto 3 (borrador): perfiles RF.

**Narración sugerida:** BORRADOR: los perfiles superan al baseline en el corte común, pero los rangos entre semillas se superponen.

*Datos:* exacto: final v1

## 08 · Conclusiones

### Paso 49 · `conclusiones` — Conclusiones (borrador)

**En pantalla:** Cuatro conclusiones cortas (borrador).

**Narración sugerida:** BORRADOR: tenemos evidencia parcial. Hay una mejora chica para perfiles en el corte común, dentro del ruido; árboles más logística queda abajo, y no hay un ganador entre los tres enfoques.

### Paso 50 · `conclusiones-h0` — Qué decimos de H0 (borrador)

**En pantalla:** Recuadro sobre H0.

**Narración sugerida:** Sobre H0: hay evidencia de que los perfiles RF tienen potencial de superar al baseline, dado que obtuvieron mejoras moderadas de ganancia.

## 09 · Trabajo futuro

### Paso 51 · `futuro` — Trabajo futuro

**En pantalla:** Siete líneas de trabajo futuro, con los dos controles destacados.

**Narración sugerida:** Lo que seguiríamos: más ventanas temporales, más generadores para la variante uno, ablaciones y, sobre todo, dos controles: uno sin target y uno de stacking con un LightGBM out-of-fold.

## 10 · Anexo

### Paso 52 · `anexo-repro` — Anexo: reproducibilidad

**En pantalla:** Semillas, huellas, determinismo y procedencia de los números.

**Narración sugerida:** En el anexo: cómo se reproduce todo y de dónde sale cada número.

*Datos:* exacto: manifiesto baseline

### Paso 53 · `anexo-corte` — Anexo: el corte

**En pantalla:** Curva del baseline con 4.000 y 4.500 marcados y las tres políticas de corte del equipo.

**Narración sugerida:** El corte no es el mismo en todos los documentos: usamos cuatro mil para todos y calculamos cada diferencia desde los datos.

*Datos:* exacto: curva baseline

### Paso 54 · `anexo-desvios` — Anexo: desvíos D1–D8

**En pantalla:** Tabla de desvíos del baseline del equipo respecto de las notas de la cátedra.

**Narración sugerida:** Y la lista completa de diferencias entre nuestro baseline y el de la cátedra.

## Cierre

### Paso 55 · `cierre` — Cierre

**En pantalla:** Gracias / ¿Preguntas?

**Narración sugerida:** Gracias. Quedamos atentos a sus preguntas.
