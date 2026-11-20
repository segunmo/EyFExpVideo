# Guion del video — Random Forest Features

> Generado desde `content.js` con `node scripts/generar_guion.js`. **No editar a mano:** los cambios se hacen en `content.js` y se regenera.

- 64 pasos (0 a 63). Narración sugerida: 1655 palabras ≈ 12 min a 140 palabras por minuto, más las pausas de las animaciones.
- Para grabar una sección: `G` + número del primer paso + `Enter`, y avanzar con `→`.
- Los textos marcados **BORRADOR** son propuestas para que el equipo los reescriba.
- Presentador: completar `presentadores` en `content.js`.

| Sección | Pasos | Presenta |
|---|---|---|
| Portada | 0–0 | — |
| 01 · Hipótesis | 1–6 | — |
| 02 · Bibliografía | 7–9 | — |
| 03 · Sesgos | 10–11 | — |
| 04 · Diseño experimental | 12–37 | — |
| 05 · Limitaciones | 38–40 | — |
| 06 · Resultados | 41–53 | — |
| 07 · Discusión | 54–56 | — |
| 08 · Conclusiones | 57–58 | — |
| 09 · Trabajo futuro | 59–59 | — |
| 10 · Anexo | 60–62 | — |
| Cierre | 63–63 | — |

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

### Paso 3 · `ganancia-regla` — La regla de ganancia

**En pantalla:** +$ 1.072.500 por BAJA_2 contactado, −$ 27.500 por cualquier otro; equilibrio: 1 de cada 40.

**Narración sugerida:** Pero la ganancia solo paga BAJA_2: un millón setenta y dos mil quinientos por acierto y veintisiete mil quinientos de costo por cada otro contacto. Alcanza con acertar uno de cada cuarenta, así que lo que importa es ordenar bien la punta del ranking.

### Paso 4 · `ganancia-curva` — La curva de ganancia G(k)

**En pantalla:** Se dibuja la curva G(k) del baseline en 201910 (0–15.000 envíos) y se marca su máximo.

**Narración sugerida:** Si contactamos a los k primeros del ranking, la ganancia sube, llega a un máximo y después baja, porque cada vez hay menos bajas entre los que siguen. Todo el experimento compara estas curvas.

*Datos:* exacto: curva baseline 201910

### Paso 5 · `hipotesis` — H1 y H0

**En pantalla:** Tarjetas de H1 (principal) y H0.

**Narración sugerida:** Nuestra hipótesis: los splits y las predicciones de un Random Forest capturan interacciones que, codificadas como variables, pueden mejorar a LightGBM. La hipótesis nula: ninguna representación RF mejora la ganancia en la comparación que definimos.

### Paso 6 · `hipotesis-porque` — Por qué

**En pantalla:** Aparece la motivación: interacciones y segmentaciones que el baseline aprovecha menos.

**Narración sugerida:** La intuición es que los árboles podrían hacer accesibles interacciones y segmentaciones que el baseline aprovecha menos.

## 02 · Bibliografía

### Paso 7 · `biblio-base` — Referencias base

**En pantalla:** Cinco tarjetas: He et al. 2014, Breiman 2001, Breiman 1996, Ke et al. 2017, Akiba et al. 2019, cada una con qué tomamos.

**Narración sugerida:** La variante de árboles más logística sale del paper de Facebook de 2014. El Random Forest y el out-of-bag son de Breiman; LightGBM y Optuna son las herramientas del baseline.

*Datos:* verificar: referencias

### Paso 8 · `biblio-variantes` — Referencias por variante y antecedente

**En pantalla:** Cinco tarjetas más: Vens & Costa, Meinshausen, Wager et al., Geurts et al., Wolpert.

**Narración sugerida:** Para los perfiles, la inducción de variables desde el bosque; para las probabilidades, los trabajos sobre la distribución entre árboles. Y dos referencias para controles que todavía no corrimos.

*Datos:* verificar: referencias

### Paso 9 · `biblio-antecedente` — Antecedente: el control sin target

**En pantalla:** Tarjeta del antecedente: el control sin target (+3,43 M) empata con + probabilidad RF (+3,14 M).

**Narración sugerida:** Y un antecedente clave: otro equipo del curso encontró que un control sin target, que no mira las etiquetas, sube lo mismo que las features RF. Sin ese control, una mejora no se puede atribuir al RF.

*Datos:* transcripto: informe del otro equipo

## 03 · Sesgos

### Paso 10 · `sesgos-expectativa` — Expectativa vs. lo que hay que demostrar

**En pantalla:** El texto del deck sobre la expectativa (bagging + boosting) y dos columnas: expectativa / lo que hay que demostrar.

**Narración sugerida:** Antes de correr esperábamos que juntar dos ensambles con mecánicas opuestas, bagging y boosting, mejorara el resultado, porque modelos decorrelacionados reducen el error. Eso es una expectativa, no un resultado: hay que demostrarlo en la ganancia.

### Paso 11 · `sesgos-diseno` — De qué se cuida el diseño (borrador)

**En pantalla:** Dos sesgos más: elegir el corte mirando el test y atribuirle al RF el efecto de cualquier columna extra.

**Narración sugerida:** BORRADOR: el diseño también se cuida de elegir el corte mirando octubre, y de atribuirle al RF lo que podría causar cualquier columna nueva.

## 04 · Diseño experimental

### Paso 12 · `diseno-variantes` — Tres representaciones

**En pantalla:** Tres columnas: árboles + logística, probabilidades RF, perfiles de hojas; abajo el control.

**Narración sugerida:** Probamos tres formas de convertir un Random Forest en información: hojas más logística, las probabilidades de los árboles y los perfiles de hojas. Todo se compara contra el LightGBM baseline del equipo.

*Datos:* exacto: hiperparámetros del baseline (HANDOFF)

### Paso 13 · `dataset` — Dataset y target

**En pantalla:** Tabla con columnas reales (ctrx_quarter, mcaja_ahorro, … y sus _lag/_delta); la columna de clase pasa a binaria.

**Narración sugerida:** Los datos son de 2019: 152 variables con sus lags y deltas de uno y dos meses. El target junta BAJA_1 y BAJA_2, pero la ganancia paga solo BAJA_2.

### Paso 14 · `calendario-seleccion` — Calendario: selección del RF

**En pantalla:** Línea de tiempo 201901–201912; enero y febrero solo para lags; la selección del RF se ajusta en 03–05 y se evalúa en 06.

**Narración sugerida:** Todas las variantes comparten un calendario. Enero y febrero solo sirven para construir lags. El Random Forest se elige ajustando con marzo a mayo y midiendo AUC en junio.

### Paso 15 · `calendario-desarrollo` — Calendario: RF definitivo y desarrollo

**En pantalla:** RF definitivo 03–06 (OOB en train, todos los árboles para 07, 08, 10) y LightGBM de desarrollo 03–06 → 08.

**Narración sugerida:** El RF definitivo se ajusta con marzo a junio. El LightGBM de desarrollo entrena con esos meses y se evalúa en agosto: ahí se miran el AUC y el corte.

### Paso 16 · `calendario-final` — Calendario: final y test

**En pantalla:** LightGBM final 03–08 con 6 semillas; 201910 resaltado como test.

**Narración sugerida:** El modelo final entrena de marzo a agosto con seis semillas, y la ganancia se mide en octubre, que no se usa para nada más.

### Paso 17 · `calendario-huecos` — Calendario: los huecos

**En pantalla:** Se marcan 201907 (salteado en desarrollo) y 201911–12 (excluidos), con su explicación.

**Narración sugerida:** Julio se saltea en desarrollo porque su BAJA_2 recién se conoce en septiembre. Noviembre y diciembre nunca se usan: uno solo tiene BAJA_1 y el otro no tiene clase.

### Paso 18 · `arbol` — Un árbol de decisión

**En pantalla:** Se dibuja un árbol chico con cortes en ctrx_quarter, mcaja_ahorro y cliente_antiguedad (ilustrativo).

**Narración sugerida:** Antes de las variantes, un repaso: un árbol hace preguntas sobre las variables, una por nodo.

*Datos:* ilustrativo

### Paso 19 · `arbol-recorrido` — La hoja es una regla

**En pantalla:** Una fila recorre el árbol y cae en una hoja con su probabilidad; el camino se escribe como regla.

**Narración sugerida:** Una fila baja por el árbol y termina en una hoja. Esa hoja es una regla: la conjunción de todos los cortes del camino.

*Datos:* ilustrativo

### Paso 20 · `rf` — Random Forest: bagging

**En pantalla:** Tres árboles en paralelo sobre muestras bootstrap, que se promedian.

**Narración sugerida:** Un Random Forest arma muchos árboles en paralelo, cada uno con una muestra bootstrap y subconjuntos de variables, y los promedia.

*Datos:* ilustrativo

### Paso 21 · `gbdt` — LightGBM: boosting

**En pantalla:** Árboles en serie, cada uno sobre el error del anterior; abajo: hojas superpuestas (RF) vs. complementarias (GBDT).

**Narración sugerida:** LightGBM, en cambio, arma árboles en serie: cada uno corrige lo que erraron los anteriores. Por eso las hojas del RF son reglas redundantes y las del boosting se complementan.

*Datos:* ilustrativo

### Paso 22 · `oob-matriz` — Out-of-bag: la matriz

**En pantalla:** Matriz filas × árboles; cada árbol marca las filas de su bootstrap (in-bag).

**Narración sugerida:** Si generamos variables con el mismo RF que vio la etiqueta de esa fila, filtramos el target. Cada árbol se ajusta con una muestra bootstrap: algunas filas quedan adentro y otras afuera.

*Datos:* ilustrativo

### Paso 23 · `oob-fila` — Out-of-bag: una fila

**En pantalla:** Se resalta una fila: sus árboles elegibles (OOB) se encienden; el resto se atenúa.

**Narración sugerida:** Para cada fila de entrenamiento usamos solo los árboles que no la vieron: sus árboles out-of-bag.

*Datos:* ilustrativo

### Paso 24 · `oob-despues` — Out-of-bag: meses posteriores y límite

**En pantalla:** Los meses 07, 08 y 10 usan todos los árboles; recuadro con la limitación (por fila, no por cliente ni tiempo).

**Narración sugerida:** Para julio, agosto y octubre, que el bosque no vio, se usan todos los árboles. Ojo: es una exclusión por fila; un árbol pudo ver otra foto del mismo cliente.

*Datos:* ilustrativo

### Paso 25 · `v1-onehot` — Variante 1: hojas → one-hot

**En pantalla:** Una fila pasa por 3 árboles → ids de hoja [2, 1, 3] → el vector one-hot se arma bloque por bloque.

**Narración sugerida:** Variante uno, la parte de Segundo, adaptada del paper de Facebook. Cada árbol se convierte en una variable categórica: la hoja donde cae la fila. En one-hot, cada fila tiene exactamente un uno por árbol.

*Datos:* ilustrativo

### Paso 26 · `v1-logistica` — Variante 1: pesos y sigmoide

**En pantalla:** Cada 1 toma el peso de su hoja; se suman y pasan por una sigmoide → probabilidad.

**Narración sugerida:** Sobre ese vector se ajusta una regresión logística con L2: un peso por hoja, o sea un peso por regla. La suma pasa por una sigmoide y da la probabilidad.

*Datos:* ilustrativo

### Paso 27 · `v1-escala` — Variante 1: escala real

**En pantalla:** Números reales de RF-109: 300 árboles, 27.784 columnas, 300 unos por fila, 38,5 M no nulos, 0,43 GB, 3,6 s.

**Narración sugerida:** Con los números reales: trescientos árboles dan casi veintiocho mil columnas, pero la matriz es dispersa y la logística se ajusta en segundos. Ojo: acá la salida reemplaza a LightGBM, no se le agregan columnas.

*Datos:* exacto: medicion_costo.csv

### Paso 28 · `v1-repartos` — Variante 1: dos repartos

**En pantalla:** Dos líneas de tiempo: separado (generador 03–05, logística 06) y mismos (ambos 03–06), evaluadas en 201908.

**Narración sugerida:** Probamos dos repartos de meses: separado, donde la logística aprende en un mes que el generador no vio, y mismos, con el mismo calendario que el baseline.

### Paso 29 · `v1-dial` — Variante 1: C y generadores

**En pantalla:** Dial de C de 1e-4 a 1 (más chico = más regularización) y los cuatro generadores: RF-12, RF-32, RF-109, LGBM-12.

**Narración sugerida:** La regularización se controla con C: más chico, más regularización. Y variamos el generador: tres Random Forest de distinto tamaño de hoja y el LightGBM de doce hojas del paper.

### Paso 30 · `v2-arboles` — Variante 2: una probabilidad por árbol

**En pantalla:** Una fila pasa por muchos árboles; cada uno emite una probabilidad que cae en una tira de puntos.

**Narración sugerida:** Variante dos: la fila pasa por todos los árboles y cada uno da su propia probabilidad de baja.

*Datos:* ilustrativo

### Paso 31 · `v2-stats` — Variante 2: estadísticos

**En pantalla:** Sobre la tira se marcan media, desvío, percentiles P10–P90, rango e IQR.

**Narración sugerida:** De esa distribución sacamos la media, el desvío, los percentiles, el rango y el rango intercuartil. La idea es que el desacuerdo entre árboles también sea información.

*Datos:* ilustrativo

### Paso 32 · `v2-columnas` — Variante 2: columnas nuevas

**En pantalla:** Los valores vuelan a columnas nuevas (rfd_media, rfd_desvio, …) a la derecha de la tabla de LightGBM; brazos B y C.

**Narración sugerida:** Esos valores se agregan como columnas a la tabla de LightGBM. Brazo B: baseline más la media. Brazo C: baseline más las medidas de dispersión.

*Datos:* ilustrativo

### Paso 33 · `v3-padre` — Variante 3: el último split

**En pantalla:** La fila baja por cuatro árboles; en cada uno se resalta el nodo padre de la hoja y se extrae su variable.

**Narración sugerida:** Variante tres, perfiles de hojas: en cada árbol miramos el nodo padre de la hoja alcanzada, o sea el último corte, y anotamos qué variable usó.

*Datos:* ilustrativo

### Paso 34 · `v3-frecuencias` — Variante 3: frecuencias

**En pantalla:** Conteo por variable dividido por los árboles elegibles (OOB) → vector de frecuencias.

**Narración sugerida:** Contamos cuántas veces aparece cada variable y dividimos por la cantidad de árboles elegibles, que en train son los out-of-bag.

*Datos:* ilustrativo

### Paso 35 · `v3-columnas` — Variante 3: columnas y versiones

**En pantalla:** Las frecuencias se agregan como rf_perfil_<variable>; qué conserva y qué descarta; v2 (HP fijos) y v2.1 (reoptimizado).

**Narración sugerida:** Cada variable del RF da una columna, más una para árboles sin split. Se conserva qué variable decidió, no el umbral ni la hoja. Hay dos versiones: v2 con los hiperparámetros del baseline y v2.1 reoptimizando LightGBM.

*Datos:* ilustrativo

### Paso 36 · `eval-semillas` — Evaluación: 6 semillas

**En pantalla:** Las 6 curvas reales del baseline en 201910 y la media Ĝ(k) al mismo corte.

**Narración sugerida:** Cada variante se entrena con seis semillas. Reportamos la media de las seis ganancias al mismo corte, no la ganancia de promediar los scores.

*Datos:* exacto: curvas baseline por semilla

### Paso 37 · `eval-reglas` — Evaluación: corte y métricas

**En pantalla:** Corte fijado en desarrollo; 201910 solo para comparar; métricas AUC, ganancia, NE y calibración.

**Narración sugerida:** El corte se fija en desarrollo y octubre solo se usa para comparar. Miramos AUC y ganancia, y para la variante uno también entropía normalizada y calibración, como en el paper.

## 05 · Limitaciones

### Paso 38 · `limitaciones-1` — Limitaciones: incertidumbre y OOB

**En pantalla:** Tarjetas 1 y 2: un mes y 6 semillas (desvío del baseline ≈ 4,54 M) y OOB por fila.

**Narración sugerida:** Un solo mes de test y seis semillas no capturan toda la incertidumbre: el desvío entre semillas del baseline es de unos cuatro millones y medio, así que tres millones es ruido. Y el OOB es por fila, no por cliente.

*Datos:* exacto: desvío por semilla del baseline

### Paso 39 · `limitaciones-2` — Limitaciones: métricas y comparabilidad

**En pantalla:** Tarjetas 3 y 4: AUC ≠ ganancia, agosto es desarrollo, octubre no se reusa; comparabilidad entre variantes.

**Narración sugerida:** El AUC no es la ganancia, y la ganancia simulada no es un efecto causal. Además hay que verificar que todas las variantes usen el mismo RF; v2.1 cambia dos cosas a la vez.

### Paso 40 · `limitaciones-v1` — Limitaciones: variante 1 y desvíos

**En pantalla:** Limitaciones de la variante 1 y desvíos del baseline (D1–D8), con NE y calibración del baseline en 201910.

**Narración sugerida:** En la variante uno la logística ve un solo mes en el reparto separado, y el final todavía está pendiente. Y nuestro baseline se aparta del de la cátedra: por ejemplo, is_unbalance lo descalibra.

*Datos:* exacto: métricas baseline 201910

## 06 · Resultados

### Paso 41 · `matriz` — Matriz común

**En pantalla:** Tabla: ganancia media a 4.000 envíos por variante; la fila de árboles + logística en estado pendiente.

**Narración sugerida:** Esta es la matriz común: ganancia media de seis semillas en octubre, a cuatro mil envíos. Árboles más logística todavía corre en 201910.

*Datos:* exacto: baseline · transcripto: perfiles y prob RF · pendiente: variante 1

### Paso 42 · `matriz-deltas` — Diferencias contra el baseline

**En pantalla:** Barras divergentes alrededor de 0 con el Δ $ y Δ % de cada variante.

**Narración sugerida:** Contra el baseline: perfiles suma uno coma sesenta y cinco y uno coma cero ocho por ciento; la media del RF, cero coma diecinueve; la dispersión resta uno coma cero dos.

*Datos:* exacto: baseline · transcripto: perfiles y prob RF

### Paso 43 · `perfiles-curvas` — Perfiles: curva completa

**En pantalla:** Curvas completas 0–15.000: baseline, perfiles HP fijos, perfiles reoptimizados; corte en 4.000.

**Narración sugerida:** Las curvas completas de perfiles casi se superponen con la del baseline.

*Datos:* exacto: baseline · transcripto: perfiles (págs. 16 y 18)

### Paso 44 · `perfiles-zoom` — Perfiles: zoom

**En pantalla:** Zoom 2.000–6.000: en 4.000 los perfiles quedan arriba; las curvas se cruzan según el corte.

**Narración sugerida:** En el zoom se ve la diferencia: a cuatro mil envíos los dos perfiles están arriba, pero las curvas se cruzan según el corte.

*Datos:* exacto: baseline · transcripto: perfiles (págs. 16 y 18)

### Paso 45 · `perfiles-semillas` — Perfiles: las 6 semillas

**En pantalla:** Puntos por semilla a 4.000 envíos con su media; los rangos se superponen. Importancia: los perfiles dominan el top 10.

**Narración sugerida:** Semilla por semilla, los rangos se superponen. LightGBM usa mucho los perfiles, pero la mejora en ganancia queda dentro del ruido.

*Datos:* exacto: baseline · transcripto: perfiles e importancia

### Paso 46 · `prob-curvas` — Probabilidades RF: curva completa

**En pantalla:** Curvas completas: baseline (A), + media (B), + dispersión (C).

**Narración sugerida:** Para probabilidades RF las tres curvas también se superponen casi por completo.

*Datos:* exacto: baseline · transcripto: prob RF (pág. 21)

### Paso 47 · `prob-zoom` — Probabilidades RF: zoom

**En pantalla:** Zoom 2.000–6.000: B empata con A en 4.000; C queda abajo.

**Narración sugerida:** En el zoom, la media queda prácticamente igual al baseline y la dispersión queda por debajo.

*Datos:* exacto: baseline · transcripto: prob RF (pág. 21)

### Paso 48 · `prob-importancia` — Probabilidades RF: importancia

**En pantalla:** Barras de importancia: rfd_media primera en el brazo B (5,86 %); en C, las de dispersión aparecen entre las primeras.

**Narración sugerida:** Curioso: la media del RF es la variable más importante del brazo B, por encima de todas las originales. Que LightGBM la use mucho no implica que mejore la ganancia.

*Datos:* transcripto: importancia (pág. 24)

### Paso 49 · `v1-auc-separado` — Variante 1: AUC vs. C (separado)

**En pantalla:** AUC en 201908 según C para los 4 generadores (separado); punteado = generador solo; rayado = baseline 0,9313.

**Narración sugerida:** Ahora la variante uno, en desarrollo. El AUC en agosto forma una U invertida según C: con poca regularización, la logística sobreajusta.

*Datos:* exacto: desarrollo_metricas.csv

### Paso 50 · `v1-auc-mismos` — Variante 1: AUC vs. C (mismos)

**En pantalla:** Segundo panel: reparto mismos.

**Narración sugerida:** Con el reparto mismos, los RF mejoran. Ningún híbrido llega a la línea del baseline.

*Datos:* exacto: desarrollo_metricas.csv

### Paso 51 · `v1-ganancia` — Variante 1: ganancia en desarrollo

**En pantalla:** Curvas de ganancia en 201908 con el mejor C por generador (dos repartos) contra la curva de desarrollo del baseline.

**Narración sugerida:** En ganancia pasa lo mismo: con el mejor C de cada generador, ninguno alcanza la curva de desarrollo del baseline.

*Datos:* exacto: desarrollo_curvas.csv · transcripto: curva 201908 del baseline

### Paso 52 · `v1-calibracion` — Variante 1: calibración

**En pantalla:** Recuadro: NE y calibración del híbrido (201908) vs. del baseline (201910), como propiedad.

**Narración sugerida:** Donde el híbrido sí se destaca es en la calibración, que es la fortaleza del paper. Pero son meses distintos y nuestra métrica es la ganancia en la punta.

*Datos:* exacto: métricas v1 y baseline

### Paso 53 · `v1-final` — Variante 1: final en 201910

**En pantalla:** Panel del final en 201910: estado pendiente (o la curva, si el archivo existe).

**Narración sugerida:** El final de la variante uno en octubre todavía está corriendo; cuando esté, se completa acá y en la matriz.

*Datos:* pendiente: v1_final_201910.csv

## 07 · Discusión

### Paso 54 · `discusion-1` — Discusión: perfiles y probabilidades

**En pantalla:** Puntos 1 y 2 de la discusión (borrador).

**Narración sugerida:** BORRADOR: los perfiles superan al baseline en el corte común, pero dentro del ruido. La media del RF empata y la dispersión empeora.

*Datos:* exacto/transcripto: Δ de la matriz

### Paso 55 · `discusion-2` — Discusión: variante 1

**En pantalla:** Punto 3 (borrador).

**Narración sugerida:** BORRADOR: el híbrido mejora a su propio Random Forest pero no llega al baseline en desarrollo.

*Datos:* exacto: desarrollo v1

### Paso 56 · `discusion-3` — Discusión: atribución

**En pantalla:** Punto 4 (borrador): el control sin target y la pregunta del tutor.

**Narración sugerida:** BORRADOR: sin un control sin target y un control de stacking, una mejora no se puede atribuir al Random Forest.

*Datos:* transcripto: otro equipo

## 08 · Conclusiones

### Paso 57 · `conclusiones` — Conclusiones (borrador)

**En pantalla:** Cuatro conclusiones cortas (borrador).

**Narración sugerida:** BORRADOR: tenemos evidencia parcial. Hay una mejora chica para perfiles en el corte común, dentro del ruido, y ningún ganador entre los tres enfoques.

### Paso 58 · `conclusiones-h0` — Qué decimos de H0 (borrador)

**En pantalla:** Recuadro sobre H0.

**Narración sugerida:** BORRADOR: no podemos rechazar la hipótesis nula, pero tampoco afirmarla: con un mes de test el diseño no tiene potencia para eso.

## 09 · Trabajo futuro

### Paso 59 · `futuro` — Trabajo futuro

**En pantalla:** Ocho líneas de trabajo futuro, con los dos controles destacados.

**Narración sugerida:** Lo que seguiríamos: completar la variante uno en octubre, más ventanas temporales, ablaciones y, sobre todo, dos controles: uno sin target y uno de stacking con un LightGBM out-of-fold.

## 10 · Anexo

### Paso 60 · `anexo-repro` — Anexo: reproducibilidad

**En pantalla:** Semillas, huellas, determinismo y procedencia de los números.

**Narración sugerida:** En el anexo: cómo se reproduce todo y de dónde sale cada número.

*Datos:* exacto: manifiesto baseline

### Paso 61 · `anexo-corte` — Anexo: el corte

**En pantalla:** Curva del baseline con 4.000 y 4.500 marcados y las tres políticas de corte del equipo.

**Narración sugerida:** El corte no es el mismo en todos los documentos: usamos cuatro mil para todos y calculamos cada diferencia desde los datos.

*Datos:* exacto: curva baseline

### Paso 62 · `anexo-desvios` — Anexo: desvíos D1–D8

**En pantalla:** Tabla de desvíos del baseline del equipo respecto de las notas de la cátedra.

**Narración sugerida:** Y la lista completa de diferencias entre nuestro baseline y el de la cátedra.

## Cierre

### Paso 63 · `cierre` — Cierre

**En pantalla:** Gracias / ¿Preguntas?

**Narración sugerida:** Gracias. Quedamos atentos a sus preguntas.
