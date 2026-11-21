/* ==========================================================================
   content.js — TODO el texto que aparece en pantalla y la lista de pasos.
   Se edita acá sin tocar main.js ni escenas.js.

   - `textos.<escena>`: los textos de cada diapositiva (los usa escenas.js).
   - `pasos`: la secuencia. Cada paso = { id, seccion, escena, beat, titulo, pantalla, notas, datos }
       escena/beat → qué diapositiva y qué "momento" de esa diapositiva se muestra.
       pantalla     → qué aparece (va a GUION.md).
       notas        → narración sugerida (1–3 oraciones), visible solo en modo desarrollo (D).
       datos        → estado de los datos que se ven: exacto / transcripto / aproximado / pendiente / ilustrativo.
   - `presentadores`: quién narra cada sección (vacío hasta que el equipo lo complete).
   - Los textos marcados "BORRADOR" son una propuesta para que el equipo los edite.
   - Para regenerar GUION.md:  node scripts/generar_guion.js
   ========================================================================== */
window.CONTENIDO = {
  config: {
    corteComun: 4000,        // corte común de envíos para la matriz y los Δ (ver Limitaciones y Anexo)
    devPorDefecto: false     // true = arranca en modo desarrollo
  },

  secciones: [
    { id: '01', corto: 'Hipótesis', nombre: 'Hipótesis' },
    { id: '02', corto: 'Bibliografía', nombre: 'Bibliografía' },
    { id: '03', corto: 'Sesgos', nombre: 'Sesgos' },
    { id: '04', corto: 'Diseño', nombre: 'Diseño experimental' },
    { id: '05', corto: 'Limitaciones', nombre: 'Limitaciones' },
    { id: '06', corto: 'Resultados', nombre: 'Resultados' },
    { id: '07', corto: 'Discusión', nombre: 'Discusión' },
    { id: '08', corto: 'Conclusiones', nombre: 'Conclusiones' },
    { id: '09', corto: 'Futuros', nombre: 'Trabajo futuro' },
    { id: '10', corto: 'Anexo', nombre: 'Anexo' }
  ],

  // Completar con el nombre de quien narra cada sección (se ve en el HUD y en GUION.md).
  presentadores: { portada: '', '01': '', '02': '', '03': '', '04': '', '05': '', '06': '', '07': '', '08': '', '09': '', '10': '', cierre: '' },

  ui: {
    ilustrativo: 'ilustrativo',
    envios: 'Cantidad de envíos',
    ganancia: 'Ganancia ($ millones)',
    gananciaMedia: 'Ganancia media de 6 semillas ($ millones)',
    corte: 'corte común',
    pendienteCorta: 'pendiente: corre en 201910',
    transcripto: 'Valores transcriptos de las tablas del deck del equipo (exactos).'
  },

  textos: {
    portada: {
      titulo: 'Random Forest Features',
      pregunta: '¿Se puede mejorar la performance del modelo mediante la generación supervisada de variables a partir de modelos Random Forest?',
      integrantes: 'Pedro Bosch · Pedro Franz · Segundo Molina',
      programa: 'Maestría en Data Mining · Universidad de Buenos Aires',
      materia: 'DMEyF 2026 · Experimento colaborativo'
    },
    problema: {
      kicker: 'El problema',
      titulo: '¿Quién se va del banco?',
      unidad: 'Cada punto: un cliente en un mes',
      escala: 'filas cliente-mes en 201910 (≈ 130 mil por mes)',
      tasa: 'menos del 1 % se da de baja',
      fuente: '201910: {filas} filas · {b1} BAJA_1 · {b2} BAJA_2',
      cont: 'CONTINUA',
      b1: 'BAJA_1', b1d: 'se va el mes siguiente',
      b2: 'BAJA_2', b2d: 'se va dentro de dos meses',
      entrena: 'Los modelos aprenden BAJA_1 ∪ BAJA_2 contra CONTINUA'
    },
    ganancia: {
      kicker: 'La métrica',
      titulo: 'La ganancia solo paga BAJA_2',
      gana: '+ $ 1.072.500', ganaD: 'por cada BAJA_2 contactado',
      pierde: '− $ 27.500', pierdeD: 'por cualquier otro contacto',
      equilibrio: 'Equilibrio: 1 acierto cada 40 contactos',
      equilibrioD: 'Lo que importa es el orden en la punta del ranking',
      curvaTit: 'G(k): ganancia de contactar a los k primeros del ranking',
      curvaNota: 'Baseline, 201910, media de 6 semillas',
      maxLbl: 'máximo'
    },
    hipotesis: {
      kicker: 'Hipótesis',
      titulo: 'Qué queremos probar',
      h1k: 'H1 · principal',
      h1: 'Los splits y predicciones de modelos Random Forest capturan interacciones que, al codificarlas en variables, pueden mejorar la predicción de otro modelo (LightGBM).',
      h0k: 'H0',
      h0: 'Ninguna de las representaciones Random Forest aprendidas mejora la ganancia en la comparación definida.',
      porque: 'Por qué: los árboles podrían hacer accesibles interacciones y segmentaciones que el baseline aprovecha menos.'
    },
    biblio1: {
      kicker: 'Bibliografía',
      titulo: 'De dónde salen las ideas',
      refs: [
        { cita: 'He, Pan, Jin et al. (2014)', obra: 'Practical Lessons from Predicting Clicks on Ads at Facebook. ADKDD’14', tomamos: 'Árboles → hojas one-hot → regresión logística: la base de la variante 1. NE y calibración como métricas.', verificar: true },
        { cita: 'Breiman (2001)', obra: 'Random Forests. Machine Learning 45(1), 5–32', tomamos: 'El generador: árboles en paralelo sobre bootstrap y subconjuntos de variables.', verificar: true },
        { cita: 'Breiman (1996)', obra: 'Out-of-bag estimation. Technical report, UC Berkeley', tomamos: 'Usar, para cada fila, solo los árboles que no la vieron.', verificar: true },
        { cita: 'Ke et al. (2017)', obra: 'LightGBM: A Highly Efficient Gradient Boosting Decision Tree. NeurIPS', tomamos: 'El modelo baseline y el que recibe las variables nuevas.', verificar: true },
        { cita: 'Akiba et al. (2019)', obra: 'Optuna: A Next-generation Hyperparameter Optimization Framework. KDD', tomamos: 'Optimización bayesiana de hiperparámetros (baseline, RF y v2.1).', verificar: true }
      ]
    },
    sesgos: {
      kicker: 'Sesgos',
      titulo: 'Lo que esperábamos antes de correr',
      cita: 'Antes de correr el experimento, nuestra expectativa era que combinar dos modelos con mecánicas de ensamble opuestas —RF por bagging y LGBM por boosting— iba a mejorar el resultado. El razonamiento: la teoría de ensambles indica que juntar modelos decorrelacionados reduce el error, y como RF y LGBM construyen sus árboles de forma distinta, se esperaba que la vista del RF aportara una señal complementaria que el boosting por sí solo no generaba.',
      expK: 'Expectativa', exp: 'RF (bagging) + LGBM (boosting) → modelos decorrelacionados → menos error',
      demK: 'Lo que hay que demostrar', dem: 'Que la mejora aparece en la ganancia, a igual corte, y que no la daría cualquier columna extra',
      // BORRADOR: otros sesgos de los que se cuida el diseño (para que el equipo edite)
      borradorK: 'De qué se cuida el diseño',
      borrador: [
        { t: 'Evitar data leakage', d: 'Out-of-bag genera las variables de cada fila con árboles que no la vieron durante el entrenamiento.' }
      ]
    },
    diseno: {
      kicker: 'Diseño experimental',
      titulo: 'Mismo dataset, tres representaciones, contra LightGBM',
      variantes: [
        { n: '01', t: 'Árboles + logística', pasos: ['IDs de hojas', 'one-hot disperso', 'regresión logística regularizada'], nota: 'reemplaza a LightGBM' },
        { n: '02', t: 'Probabilidades RF', pasos: ['probabilidad de cada árbol', 'media + dispersión', 'columnas nuevas → LightGBM'], nota: 'se suma al baseline' },
        { n: '03', t: 'Perfiles de hojas RF', pasos: ['variable del último split', 'frecuencias por fila', 'columnas nuevas → LightGBM'], nota: 'se suma al baseline' }
      ],
      control: ''
    },
    dataset: {
      kicker: 'Datos',
      titulo: 'Una fila por cliente y mes',
      filas: '2019 · ≈ 130 mil filas por mes',
      cols: '152 variables × 5 versiones = 760 + cliente y mes = 762 columnas predictoras',
      versiones: ['original', '_lag_1', '_lag_2', '_delta_1', '_delta_2'],
      variables: ['ctrx_quarter', 'mcaja_ahorro', 'mcuentas_saldo', 'mpayroll', 'Visa_mpagospesos'],
      target: 'clase_ternaria',
      binaria: 'target = 1 si BAJA_1 ∪ BAJA_2',
      paga: 'la ganancia paga solo BAJA_2',
      nota: ''
    },
    calendario: {
      kicker: 'Calendario común',
      titulo: 'Qué mes se usa para qué',
      filas: [
        { k: 'sel', t: 'Selección del RF', d: 'ajuste 03–05 · AUC en 06' },
        { k: 'def', t: 'RF definitivo', d: '03–06 · OOB en train; todos los árboles en 07, 08 y 10' },
        { k: 'dev', t: 'LightGBM de desarrollo', d: '03–06 → 08: AUC y corte' },
        { k: 'fin', t: 'LightGBM final · 6 semillas', d: '03–08 → ganancia en 201910' }
      ],
      leyenda: { ajuste: 'ajuste', eval: 'evaluación', aplica: 'se aplica', historia: 'solo historia para lags' },
      test: 'test: solo para comparar',
      h07: '201907 se saltea en desarrollo: su BAJA_2 se conoce recién en septiembre',
      h11: '201911–12 nunca se usan: 11 solo tiene BAJA_1 y 12 no tiene clase'
    },
    arbol: {
      kicker: 'Cómo decide un árbol',
      titulo: 'Una fila baja por el árbol hasta una hoja',
      fila: 'Un cliente-mes',
      vals: [['ctrx_quarter', '8'], ['mcaja_ahorro', '640'], ['cliente_antiguedad', '18']],
      prob: 'P(baja) en la hoja',
      reglaK: 'La hoja es una regla',
      regla: 'ctrx_quarter < 15  ∧  mcaja_ahorro < 1.200  ∧  cliente_antiguedad < 24'
    },
    rfgbdt: {
      kicker: 'Dos formas de juntar árboles',
      titulo: 'Random Forest vs. LightGBM',
      rfT: 'Random Forest · bagging', rfD: 'Árboles en paralelo, cada uno sobre una muestra bootstrap y subconjuntos de variables. Se promedian.',
      gbT: 'LightGBM (GBDT) · boosting', gbD: 'Árboles en serie: cada uno ajusta lo que los anteriores erraron. Se suman.',
      rfN: 'Todos intentan explicar lo mismo: las hojas se superponen (reglas redundantes)',
      gbN: 'Cada árbol explica algo nuevo: las hojas se complementan',
      prom: 'promedio', suma: 'suma', boot: 'bootstrap', error: 'error del anterior'
    },
    oob: {
      kicker: 'Out-of-bag',
      titulo: 'Cada fila, descrita por árboles que no la vieron',
      filas: 'filas (cliente-mes de 201903–06)', arboles: 'árboles del RF',
      inbag: 'in-bag: el árbol se ajustó con esa fila', oobL: 'OOB: árboles elegibles para esa fila',
      fila: 'fila i', usa: 'sus variables RF usan solo estos árboles',
      despues: '201907, 08 y 10: el bosque no los vio → se usan todos los árboles',
      lim: 'Limitación: la exclusión es por fila, no por cliente ni por tiempo. Un árbol pudo ver otra foto del mismo cliente.'
    },
    v1: {
      kicker: 'Variante 1 · árboles + regresión logística',
      titulo: 'Cada hoja es una variable binaria',
      ids: 'ids de hoja', oh: 'one-hot: una columna por (árbol, hoja), exactamente un 1 por árbol',
      pesos: 'cada 1 trae el peso de su hoja (= de su regla)', sig: 'sigmoide', prob: 'probabilidad de baja',
      escalaK: 'Con los números reales (RF-109)',
      escala: [
        ['{arboles}', 'árboles'], ['{columnas}', 'columnas one-hot (201906)'], ['{arboles}', 'unos por fila'],
        ['{noNulos}', 'no nulos'], ['{sparseGB}', 'en formato disperso'], ['{segundosLR}', 'ajuste de la logística']
      ],
      reemplaza: 'Acá la salida reemplaza a LightGBM: no se agregan columnas.',
      paper: 'Ejemplo del paper: árboles de 3 y 2 hojas → [0,1,0 | 1,0]'
    },
    v1rep: {
      kicker: 'Variante 1 · cómo se reparten los meses',
      titulo: 'Dos repartos y un dial de regularización',
      separado: 'separado', separadoD: 'generador 03–05, logística en 06 (≈ 1.250 bajas, sin reuso de filas)',
      mismos: 'mismos', mismosD: 'generador y logística con 03–06 (≈ 5.300 bajas, reusa el train)',
      eval: 'AUC y ganancia en 201908', gen: 'generador', lr: 'logística',
      cK: 'C de la logística (L2)', cD: 'más chico = más regularización',
      genK: 'Generadores', gens: [
        ['RF-12', '300 árboles × 12 hojas'], ['RF-32', '300 árboles × 32 hojas'], ['RF-109', '300 árboles, prof. 10 (≈109 hojas)'], ['LGBM-12', '500 árboles × 12 hojas (la versión del paper)']
      ],
      comun: 'todos con ≥ 200 filas por hoja'
    },
    v2: {
      kicker: 'Variante 2 · probabilidades RF',
      titulo: 'El desacuerdo entre árboles como información',
      cadaArbol: 'cada árbol da una probabilidad de baja',
      eje: 'probabilidad del árbol',
      stats: ['media', 'desvío', 'P10 · P25 · P50 · P75 · P90', 'rango P90–P10', 'IQR'],
      tabla: 'tabla de LightGBM', nuevas: 'columnas nuevas', cuenta: '762 → 762 + k columnas',
      brazoB: 'Brazo B · baseline + media', brazoC: 'Brazo C · baseline + medidas de dispersión'
    },
    v3: {
      kicker: 'Variante 3 · perfiles de hojas RF',
      titulo: '¿Qué variable decidió el último corte?',
      padre: 'nodo padre de la hoja alcanzada', conteo: 'conteo por variable', elegibles: 'árboles elegibles (OOB)',
      frec: 'frecuencia', regla: 'p variables del RF → p + 1 columnas nuevas (rf_perfil_<variable> + rf_perfil__sin_split)',
      conserva: 'Conserva', conservaD: 'la variable del último split',
      descarta: 'Descarta', descartaD: 'el umbral, la rama y el id de la hoja',
      v2: 'v2 · hiperparámetros del baseline fijos', v21: 'v2.1 · LightGBM reoptimizado con Optuna', rf: 'RF definitivo: 1.000 árboles'
    },
    eval: {
      kicker: 'Protocolo de evaluación',
      titulo: '6 semillas, 6 curvas, una media al mismo corte',
      semillas: '',
      media: 'Ĝ(k) = media de las 6 ganancias al mismo corte',
      noEns: 'no es la ganancia de un ensamble de scores',
      corteK: 'Corte', corte: 'se fija en desarrollo (agosto); 201910 solo para comparar',
      metK: 'Métricas', met: 'AUC · ganancia · para la variante 1 también NE y calibración',
      nota: 'Curvas reales del baseline en 201910'
    },
    limit: {
      kicker: 'Limitaciones',
      titulo: 'Hasta dónde se puede interpretar la comparación',
      cards: [
        { t: 'Incertidumbre', d: 'Un mes de test (201910) y 6 semillas de LightGBM no capturan toda la incertidumbre: las semillas comparten datos y RF. El desvío entre semillas del baseline es {sdBase} a 4.000 envíos: ±3 M es ruido.' },
        { t: 'OOB por fila', d: 'No separa clientes ni garantiza que el target estuviera disponible en el tiempo. El imputador y los hiperparámetros no se reajustan por fila OOB.' },
        { t: 'Métricas', d: 'AUC ≠ ganancia. Agosto es desarrollo. Octubre no se reutiliza para decidir. La ganancia es simulada, no un efecto causal del contacto.' },
        { t: 'Comparabilidad', d: 'Mismo universo, corte y presupuesto; hay que verificar que el RF y las matrices sean las mismas entre variantes. v2.1 cambia dos cosas a la vez (entradas e hiperparámetros). 300 árboles para elegir, 1.000 para generar.' }
      ]
    },
    matriz: {
      kicker: 'Resultados · 201910',
      titulo: 'Matriz común de resultados',
      sub: 'Ganancia media de 6 semillas · Δ contra el baseline calculado de los datos',
      cols: ['Enfoque / variante', 'Ganancia media', 'Δ $', 'Δ %'],
      filas: [
        { k: 'base', t: 'Baseline LightGBM' },
        { k: 'v1', t: 'Árboles + regresión logística (RF-109)' },
        { k: 'media', t: 'Probabilidades RF · media' },
        { k: 'disp', t: 'Probabilidades RF · dispersión' },
        { k: 'v2', t: 'Perfiles de hojas · HP fijos' },
        { k: 'v21', t: 'Perfiles de hojas · HP reoptimizados' }
      ],
      ref: 'referencia',
      pie: 'Δ en % del baseline. Para cada variante se determinó el corte de envíos óptimo'
    },
    perfCurvas: {
      kicker: 'Resultados · Variante 3 · Perfiles RF',
      titulo: 'Curvas de ganancia en 201910',
      full: 'Curva completa', zoom: 'Zoom · 2.000–6.000 envíos',
      series: { base: 'Baseline · 4.000', v2: 'HP fijos · 4.000', v21: 'HP reoptimizados · 4.500' },
      nota: 'Las curvas se cruzan según el corte'
    },
    perfSemillas: {
      kicker: 'Resultados · Variante 3 · Perfiles RF',
      titulo: 'Las 6 semillas al corte de cada versión',
      eje: 'Ganancia al corte de cada versión ($ millones)',
      media: 'media', solap: 'Los rangos se superponen',
      fiK: 'Importancia por gain (gráficos del equipo)', fiV2: 'v2: {n} de las 10 variables más importantes son perfiles', fiV21: 'v2.1: {n} de 10',
      fiTop: 'la primera:'
    },
    probCurvas: {
      kicker: 'Resultados · Variante 2 · Probabilidades RF',
      titulo: 'Curvas de ganancia en 201910',
      full: 'Curva completa', zoom: 'Zoom · 2.000–6.000 envíos',
      series: { base: 'Baseline (A)', media: 'B · + media RF', disp: 'C · + dispersión RF' }
    },
    probImp: {
      kicker: 'Resultados · Variante 2 · Probabilidades RF',
      titulo: 'La media del RF es la variable más importante',
      bT: 'Brazo B · + media', cT: 'Brazo C · + dispersión',
      eje: '% de la ganancia total de los splits (media de 6 semillas)',
      nota: 'Pero que LightGBM la use mucho no implica que mejore la ganancia: B queda en +0,19 %.'
    },
    v1auc: {
      kicker: 'Resultados · Variante 1 · desarrollo (201908)',
      titulo: 'AUC según la regularización',
      separado: 'separado · generador 03–05, logística 06', mismos: 'mismos · generador y logística 03–06',
      ejeX: 'C de la logística (más chico = más regularización)', ejeY: 'AUC en 201908',
      base: 'baseline (desarrollo) 0,9313', solo: 'punteado: generador solo',
      u: 'U invertida: con C grande la logística sobreajusta',
      pend: 'desarrollo (201908): acá se fijaron los brazos del final, antes de mirar 201910'
    },
    v1gan: {
      kicker: 'Resultados · Variante 1 · desarrollo (201908)',
      titulo: 'Ganancia con el mejor C de cada generador',
      ejeY: 'Ganancia en 201908 ($ millones)',
      base: 'baseline (desarrollo)'
    },
    v1final: {
      kicker: 'Resultados · Variante 1 · final (201910)',
      titulo: 'Árboles + logística no le gana al baseline',
      curvas: 'Zoom · 2.000–6.000 envíos', semillas: 'Las 6 semillas a {corte} envíos',
      series: { base: 'Baseline', hib: 'RF-109 + logística', solo: 'RF-109 solo' },
      ejeS: 'Ganancia a {corte} envíos ($ millones)',
      bajo: '{n} de 6 semillas por debajo del baseline',
      control: 'Control con LGBM-12 como generador: híbrido {hibB} contra {soloB} del generador solo.',
      pend: 'pendiente: corre en 201910',
      pendD: 'Cuando estén data/v1_final_curvas_ganancia.csv y v1_final_metricas.csv, este gráfico y la fila de la matriz se completan solos.'
    },
    disc: {
      kicker: 'Discusión',
      titulo: 'Qué dicen los resultados sobre la hipótesis',
      // BORRADOR para que el equipo edite
      items: [
        { t: 'Variante 1 · Árboles + logística', d: 'En 201910 queda {dv1} contra el baseline, con las 6 semillas por debajo. Pero la logística sobre las hojas mejora mucho a su propio RF ({solo} → {hib}, {mejora}) y sale calibrada (calibración {calA}, contra {calB} del baseline). La ganancia depende solo del orden.' },
        { t: 'Variante 2 · Probabilidades RF', d: 'La media empata con el baseline ({dmedia}, dentro del ruido). La dispersión empeora ({ddisp}): probablemente ruido agregado al LightGBM.' },
        { t: 'Variante 3 · Perfiles RF', d: 'Las dos versiones superan al baseline a 4.000 envíos ({dv2} / {dv21}), pero los rangos por semilla se superponen y las curvas se cruzan según el corte. Reoptimizar no ayuda en ese corte.' }
      ]
    },
    concl: {
      kicker: 'Conclusiones · borrador',
      titulo: 'Evidencia parcial; comparación global abierta',
      items: [
        'Variante 1 · Árboles + logística: queda {dv1} debajo del baseline en 201910; mejora a su RF y sale calibrada.',
        'Variante 2 · Probabilidades RF: sin mejora clara; la dispersión empeora.',
        'Variante 3 · Perfiles RF: mejora chica en el corte común de este mes, dentro del rango de ruido entre semillas.',
        'No se establece superioridad general ni un ganador entre los tres enfoques.'
      ],
      h0: 'Sobre H0: hay evidencia de que los perfiles RF tienen potencial de superar al baseline, dado que obtuvieron mejoras moderadas de ganancia.'
    },
    futuro: {
      kicker: 'Trabajo futuro',
      titulo: 'Qué seguiríamos experimentando',
      items: [
        ['Variante 1: más generadores y repartos', 'en más ventanas: agosto no predijo qué generador rinde más en octubre'],
        ['Más ventanas temporales', 'repetir con train, validación y test desplazados'],
        ['Variar el generador RF', 'registrar tiempo, memoria y presupuesto'],
        ['Ablaciones', 'media vs. dispersión, selección de perfiles, política de hiperparámetros'],
        ['Control sin target', 'RandomTreesEmbedding: ¿importa la señal del target?'],
        ['Control de stacking / blend', 'con un LightGBM out-of-fold'],
        ['Decisiones fijas en desarrollo', 'y una evaluación posterior independiente']
      ]
    },
    anexoRepro: {
      kicker: 'Anexo',
      titulo: 'Reproducibilidad',
      items: [
        ['Semillas', 'finales 1977, 1978, 2000, 2001, 2003, 2007; Optuna y RF con 12'],
        ['Baseline', 'los 6 modelos guardados reproducen exacto 201910 (288,567 M a 4.000 y 288,750 M a 4.500)'],
        ['Huellas', 'hash de cada predicción; dos corridas, mismas huellas'],
        ['Determinismo', 'predict_proba del RF en un solo thread: la suma en paralelo cambiaba el desempate'],
        ['Este video', 'cada número en pantalla sale de data/ con su fuente en FUENTES.md']
      ]
    },
    anexoCorte: {
      kicker: 'Anexo',
      titulo: '¿4.000 o 4.500 envíos?',
      sub: 'El corte no es el mismo en todos los documentos del equipo',
      a: 'Slides del equipo: corte común 4.000', b: 'Notebook del baseline: 4.500 (máximo de agosto)', c: 'Diseño: el máximo de agosto de cada variante',
      decision: 'En este video: 4.000 para todos, y cada Δ se calcula de los datos.',
      ejeY: 'Ganancia baseline ($ millones)'
    },
    anexoDesvios: {
      kicker: 'Anexo',
      titulo: 'Baseline del equipo vs. notas de la cátedra',
      filas: [
        ['D1', 'learning_rate', 'se optimiza', 'fijo en 0,005'],
        ['D2', 'min_data_in_leaf', 'se optimiza', 'fijo en 0 (regula min_sum_hessian)'],
        ['D3', 'extra', '5 HP + bagging_freq', 'min_gain_to_split; is_unbalance = True'],
        ['D4', 'meses del final', '201903–06', '201903–08'],
        ['D5', 'predictores', '—', 'incluye cliente y mes'],
        ['D6', 'corte', '—', '4.500 notebook / 4.000 slides'],
        ['D7', 'semillas', 'propias', 'las del equipo'],
        ['D8', 'resumen', '—', 'media de 6 ganancias al mismo corte']
      ],
      cols: ['', 'Aspecto', 'Cátedra', 'Equipo (lo que se usa)']
    },
    cierre: {
      titulo: 'Gracias',
      sub: '¿Preguntas?',
      integrantes: 'Pedro Bosch · Pedro Franz · Segundo Molina',
      programa: 'DMEyF 2026 · Maestría en Data Mining · UBA'
    }
  },

  /* ------------------------------------------------------------------ Pasos */
  pasos: [
    { id: 'portada', seccion: 'portada', escena: 'portada', beat: 0, titulo: 'Portada',
      pantalla: 'Título, pregunta de investigación, integrantes y programa; un bosque de árboles se dibuja de fondo.',
      notas: 'Somos Pedro Bosch, Pedro Franz y Segundo Molina. La pregunta del experimento: ¿se puede mejorar la performance del modelo generando variables supervisadas a partir de un Random Forest?',
      datos: [] },
    { id: 'problema-grilla', seccion: '01', escena: 'problema', beat: 0, titulo: 'El problema',
      pantalla: 'Grilla de puntos cliente-mes; menos del 1 % se ilumina como baja. Conteos reales de 201910.',
      notas: 'El problema es la baja de clientes de un banco. Cada fila es un cliente en un mes: unas 130 mil por mes, y menos del uno por ciento se da de baja.',
      datos: ['exacto: clases por mes'] },
    { id: 'problema-clases', seccion: '01', escena: 'problema', beat: 1, titulo: 'BAJA_1, BAJA_2, CONTINUA',
      pantalla: 'Las bajas se separan en BAJA_1 y BAJA_2; los modelos aprenden BAJA_1 ∪ BAJA_2 contra CONTINUA.',
      notas: 'Hay dos tipos de baja: BAJA_1 se va el mes siguiente y BAJA_2 dentro de dos meses. Los modelos se entrenan con las dos juntas como positivo.',
      datos: ['exacto: clases por mes'] },
    { id: 'hipotesis', seccion: '01', escena: 'hipotesis', beat: 0, titulo: 'H1 y H0',
      pantalla: 'Tarjetas de H1 (principal) y H0.',
      notas: 'Nuestra hipótesis: los splits y las predicciones de un Random Forest capturan interacciones que, codificadas como variables, pueden mejorar a LightGBM. La hipótesis nula: ninguna representación RF mejora la ganancia en la comparación que definimos.',
      datos: [] },
    { id: 'hipotesis-porque', seccion: '01', escena: 'hipotesis', beat: 1, titulo: 'Por qué',
      pantalla: 'Aparece la motivación: interacciones y segmentaciones que el baseline aprovecha menos.',
      notas: 'La intuición es que los árboles podrían hacer accesibles interacciones y segmentaciones que el baseline aprovecha menos.',
      datos: [] },
    { id: 'biblio-base', seccion: '02', escena: 'biblio1', beat: 0, titulo: 'Referencias base',
      pantalla: 'Cinco referencias: He et al. 2014, Breiman 2001, Breiman 1996, Ke et al. 2017, Akiba et al. 2019, cada una con qué tomamos.',
      notas: 'La variante de árboles más logística sale del paper de Facebook de 2014. El Random Forest y el out-of-bag son de Breiman; LightGBM y Optuna son las herramientas del baseline.',
      datos: ['verificar: referencias'] },
    { id: 'sesgos-expectativa', seccion: '03', escena: 'sesgos', beat: 0, titulo: 'Expectativa vs. lo que hay que demostrar',
      pantalla: 'El texto del deck sobre la expectativa (bagging + boosting) y dos columnas: expectativa / lo que hay que demostrar.',
      notas: 'Antes de correr esperábamos que juntar dos ensambles con mecánicas opuestas, bagging y boosting, mejorara el resultado, porque modelos decorrelacionados reducen el error. Eso es una expectativa, no un resultado: hay que demostrarlo en la ganancia.',
      datos: [] },
    { id: 'sesgos-diseno', seccion: '03', escena: 'sesgos', beat: 1, titulo: 'De qué se cuida el diseño (borrador)',
      pantalla: 'Recuadro: evitar data leakage mediante out-of-bag.',
      notas: 'Out-of-bag genera las variables de cada fila con árboles que no la vieron durante el entrenamiento para evitar data leakage.',
      datos: [] },
    { id: 'diseno-variantes', seccion: '04', escena: 'diseno', beat: 0, titulo: 'Tres representaciones',
      pantalla: 'Tres columnas: árboles + logística, probabilidades RF, perfiles de hojas.',
      notas: 'Probamos tres formas de convertir un Random Forest en información: hojas más logística, las probabilidades de los árboles y los perfiles de hojas. Todo se compara contra el LightGBM baseline del equipo.',
      datos: ['exacto: hiperparámetros del baseline (HANDOFF)'] },
    { id: 'dataset', seccion: '04', escena: 'dataset', beat: 0, titulo: 'Dataset y target',
      pantalla: 'Tabla con columnas reales (ctrx_quarter, mcaja_ahorro, … y sus _lag/_delta); la columna de clase pasa a binaria.',
      notas: 'Los datos son de 2019: 152 variables con sus lags y deltas de uno y dos meses. El target junta BAJA_1 y BAJA_2, pero la ganancia paga solo BAJA_2.',
      datos: [] },
    { id: 'calendario-seleccion', seccion: '04', escena: 'calendario', beat: 0, titulo: 'Calendario: selección del RF',
      pantalla: 'Línea de tiempo 201901–201912; enero y febrero solo para lags; la selección del RF se ajusta en 03–05 y se evalúa en 06.',
      notas: 'Todas las variantes comparten un calendario. Enero y febrero solo sirven para construir lags. El Random Forest se elige ajustando con marzo a mayo y midiendo AUC en junio.',
      datos: [] },
    { id: 'calendario-desarrollo', seccion: '04', escena: 'calendario', beat: 1, titulo: 'Calendario: RF definitivo y desarrollo',
      pantalla: 'RF definitivo 03–06 (OOB en train, todos los árboles para 07, 08, 10) y LightGBM de desarrollo 03–06 → 08.',
      notas: 'El RF definitivo se ajusta con marzo a junio. El LightGBM de desarrollo entrena con esos meses y se evalúa en agosto: ahí se miran el AUC y el corte.',
      datos: [] },
    { id: 'calendario-final', seccion: '04', escena: 'calendario', beat: 2, titulo: 'Calendario: final y test',
      pantalla: 'LightGBM final 03–08 con 6 semillas; 201910 resaltado como test.',
      notas: 'El modelo final entrena de marzo a agosto con seis semillas, y la ganancia se mide en octubre, que no se usa para nada más.',
      datos: [] },
    { id: 'calendario-huecos', seccion: '04', escena: 'calendario', beat: 3, titulo: 'Calendario: los huecos',
      pantalla: 'Se marcan 201907 (salteado en desarrollo) y 201911–12 (excluidos), con su explicación.',
      notas: 'Julio se saltea en desarrollo porque su BAJA_2 recién se conoce en septiembre. Noviembre y diciembre nunca se usan: uno solo tiene BAJA_1 y el otro no tiene clase.',
      datos: [] },
    { id: 'arbol', seccion: '04', escena: 'arbol', beat: 0, titulo: 'Un árbol de decisión',
      pantalla: 'Se dibuja un árbol chico con cortes en ctrx_quarter, mcaja_ahorro y cliente_antiguedad (ilustrativo).',
      notas: 'Antes de las variantes, un repaso: un árbol hace preguntas sobre las variables, una por nodo.',
      datos: ['ilustrativo'] },
    { id: 'arbol-recorrido', seccion: '04', escena: 'arbol', beat: 1, titulo: 'La hoja es una regla',
      pantalla: 'Una fila recorre el árbol y cae en una hoja con su probabilidad; el camino se escribe como regla.',
      notas: 'Una fila baja por el árbol y termina en una hoja. Esa hoja es una regla: la conjunción de todos los cortes del camino.',
      datos: ['ilustrativo'] },
    { id: 'rf', seccion: '04', escena: 'rfgbdt', beat: 0, titulo: 'Random Forest: bagging',
      pantalla: 'Tres árboles en paralelo sobre muestras bootstrap, que se promedian.',
      notas: 'Un Random Forest arma muchos árboles en paralelo, cada uno con una muestra bootstrap y subconjuntos de variables, y los promedia.',
      datos: ['ilustrativo'] },
    { id: 'gbdt', seccion: '04', escena: 'rfgbdt', beat: 1, titulo: 'LightGBM: boosting',
      pantalla: 'Árboles en serie, cada uno sobre el error del anterior; abajo: hojas superpuestas (RF) vs. complementarias (GBDT).',
      notas: 'LightGBM, en cambio, arma árboles en serie: cada uno corrige lo que erraron los anteriores. Por eso las hojas del RF son reglas redundantes y las del boosting se complementan.',
      datos: ['ilustrativo'] },
    { id: 'oob-matriz', seccion: '04', escena: 'oob', beat: 0, titulo: 'Out-of-bag: la matriz',
      pantalla: 'Matriz filas × árboles; cada árbol marca las filas de su bootstrap (in-bag).',
      notas: 'Si generamos variables con el mismo RF que vio la etiqueta de esa fila, filtramos el target. Cada árbol se ajusta con una muestra bootstrap: algunas filas quedan adentro y otras afuera.',
      datos: ['ilustrativo'] },
    { id: 'oob-fila', seccion: '04', escena: 'oob', beat: 1, titulo: 'Out-of-bag: una fila',
      pantalla: 'Se resalta una fila: sus árboles elegibles (OOB) se encienden; el resto se atenúa.',
      notas: 'Para cada fila de entrenamiento usamos solo los árboles que no la vieron: sus árboles out-of-bag.',
      datos: ['ilustrativo'] },
    { id: 'oob-despues', seccion: '04', escena: 'oob', beat: 2, titulo: 'Out-of-bag: meses posteriores y límite',
      pantalla: 'Los meses 07, 08 y 10 usan todos los árboles; recuadro con la limitación (por fila, no por cliente ni tiempo).',
      notas: 'Para julio, agosto y octubre, que el bosque no vio, se usan todos los árboles. Ojo: es una exclusión por fila; un árbol pudo ver otra foto del mismo cliente.',
      datos: ['ilustrativo'] },
    { id: 'v1-onehot', seccion: '04', escena: 'v1', beat: 0, titulo: 'Variante 1: hojas → one-hot',
      pantalla: 'Una fila pasa por 3 árboles → ids de hoja [2, 1, 3] → el vector one-hot se arma bloque por bloque.',
      notas: 'Variante uno, la parte de Segundo, adaptada del paper de Facebook. Cada árbol se convierte en una variable categórica: la hoja donde cae la fila. En one-hot, cada fila tiene exactamente un uno por árbol.',
      datos: ['ilustrativo'] },
    { id: 'v1-logistica', seccion: '04', escena: 'v1', beat: 1, titulo: 'Variante 1: pesos y sigmoide',
      pantalla: 'Cada 1 toma el peso de su hoja; se suman y pasan por una sigmoide → probabilidad.',
      notas: 'Sobre ese vector se ajusta una regresión logística con L2: un peso por hoja, o sea un peso por regla. La suma pasa por una sigmoide y da la probabilidad.',
      datos: ['ilustrativo'] },
    { id: 'v1-escala', seccion: '04', escena: 'v1', beat: 2, titulo: 'Variante 1: escala real',
      pantalla: 'Números reales de RF-109: 300 árboles, 27.784 columnas, 300 unos por fila, 38,5 M no nulos, 0,43 GB, 3,6 s.',
      notas: 'Con los números reales: trescientos árboles dan casi veintiocho mil columnas, pero la matriz es dispersa y la logística se ajusta en segundos. Ojo: acá la salida reemplaza a LightGBM, no se le agregan columnas.',
      datos: ['exacto: medicion_costo.csv'] },
    { id: 'v1-repartos', seccion: '04', escena: 'v1rep', beat: 0, titulo: 'Variante 1: dos repartos',
      pantalla: 'Dos líneas de tiempo: separado (generador 03–05, logística 06) y mismos (ambos 03–06), evaluadas en 201908.',
      notas: 'Probamos dos repartos de meses: separado, donde la logística aprende en un mes que el generador no vio, y mismos, con el mismo calendario que el baseline.',
      datos: [] },
    { id: 'v1-dial', seccion: '04', escena: 'v1rep', beat: 1, titulo: 'Variante 1: C y generadores',
      pantalla: 'Dial de C de 1e-4 a 1 (más chico = más regularización) y los cuatro generadores: RF-12, RF-32, RF-109, LGBM-12.',
      notas: 'La regularización se controla con C: más chico, más regularización. Y variamos el generador: tres Random Forest de distinto tamaño de hoja y el LightGBM de doce hojas del paper.',
      datos: [] },
    { id: 'v2-arboles', seccion: '04', escena: 'v2', beat: 0, titulo: 'Variante 2: una probabilidad por árbol',
      pantalla: 'Una fila pasa por muchos árboles; cada uno emite una probabilidad que cae en una tira de puntos.',
      notas: 'Variante dos: la fila pasa por todos los árboles y cada uno da su propia probabilidad de baja.',
      datos: ['ilustrativo'] },
    { id: 'v2-stats', seccion: '04', escena: 'v2', beat: 1, titulo: 'Variante 2: estadísticos',
      pantalla: 'Sobre la tira se marcan media, desvío, percentiles P10–P90, rango e IQR.',
      notas: 'De esa distribución sacamos la media, el desvío, los percentiles, el rango y el rango intercuartil. La idea es que el desacuerdo entre árboles también sea información.',
      datos: ['ilustrativo'] },
    { id: 'v2-columnas', seccion: '04', escena: 'v2', beat: 2, titulo: 'Variante 2: columnas nuevas',
      pantalla: 'Los valores vuelan a columnas nuevas (rfd_media, rfd_desvio, …) a la derecha de la tabla de LightGBM; brazos B y C.',
      notas: 'Esos valores se agregan como columnas a la tabla de LightGBM. Brazo B: baseline más la media. Brazo C: baseline más las medidas de dispersión.',
      datos: ['ilustrativo'] },
    { id: 'v3-padre', seccion: '04', escena: 'v3', beat: 0, titulo: 'Variante 3: el último split',
      pantalla: 'La fila baja por cuatro árboles; en cada uno se resalta el nodo padre de la hoja y se extrae su variable.',
      notas: 'Variante tres, perfiles de hojas: en cada árbol miramos el nodo padre de la hoja alcanzada, o sea el último corte, y anotamos qué variable usó.',
      datos: ['ilustrativo'] },
    { id: 'v3-frecuencias', seccion: '04', escena: 'v3', beat: 1, titulo: 'Variante 3: frecuencias',
      pantalla: 'Conteo por variable dividido por los árboles elegibles (OOB) → vector de frecuencias.',
      notas: 'Contamos cuántas veces aparece cada variable y dividimos por la cantidad de árboles elegibles, que en train son los out-of-bag.',
      datos: ['ilustrativo'] },
    { id: 'v3-columnas', seccion: '04', escena: 'v3', beat: 2, titulo: 'Variante 3: columnas y versiones',
      pantalla: 'Las frecuencias se agregan como rf_perfil_<variable>; qué conserva y qué descarta; v2 (HP fijos) y v2.1 (reoptimizado).',
      notas: 'Cada variable del RF da una columna, más una para árboles sin split. Se conserva qué variable decidió, no el umbral ni la hoja. Hay dos versiones: v2 con los hiperparámetros del baseline y v2.1 reoptimizando LightGBM.',
      datos: ['ilustrativo'] },
    { id: 'eval-semillas', seccion: '04', escena: 'eval', beat: 0, titulo: 'Evaluación: 6 semillas',
      pantalla: 'Las 6 curvas reales del baseline en 201910 y la media Ĝ(k) al mismo corte.',
      notas: 'Cada variante se entrena con seis semillas. Reportamos la media de las seis ganancias al mismo corte, no la ganancia de promediar los scores.',
      datos: ['exacto: curvas baseline por semilla'] },
    { id: 'eval-reglas', seccion: '04', escena: 'eval', beat: 1, titulo: 'Evaluación: corte y métricas',
      pantalla: 'Corte fijado en desarrollo; 201910 solo para comparar; métricas AUC, ganancia, NE y calibración.',
      notas: 'El corte se fija en desarrollo y octubre solo se usa para comparar. Miramos AUC y ganancia, y para la variante uno también entropía normalizada y calibración, como en el paper.',
      datos: [] },
    { id: 'limitaciones-1', seccion: '05', escena: 'limit', beat: 0, titulo: 'Limitaciones: incertidumbre y OOB',
      pantalla: 'Tarjetas 1 y 2: un mes y 6 semillas (desvío del baseline ≈ 4,54 M) y OOB por fila.',
      notas: 'Un solo mes de test y seis semillas no capturan toda la incertidumbre: el desvío entre semillas del baseline es de unos cuatro millones y medio, así que tres millones es ruido. Y el OOB es por fila, no por cliente.',
      datos: ['exacto: desvío por semilla del baseline'] },
    { id: 'limitaciones-2', seccion: '05', escena: 'limit', beat: 1, titulo: 'Limitaciones: métricas y comparabilidad',
      pantalla: 'Tarjetas 3 y 4: AUC ≠ ganancia, agosto es desarrollo, octubre no se reusa; comparabilidad entre variantes.',
      notas: 'El AUC no es la ganancia, y la ganancia simulada no es un efecto causal. Además hay que verificar que todas las variantes usen el mismo RF; v2.1 cambia dos cosas a la vez.',
      datos: [] },
    { id: 'matriz', seccion: '06', escena: 'matriz', beat: 0, titulo: 'Matriz común',
      pantalla: 'Tabla: ganancia media a 4.000 envíos por variante, incluida árboles + logística (brazo A, RF-109).',
      notas: 'Esta es la matriz común: ganancia media de seis semillas en octubre, a cuatro mil envíos.',
      datos: ['exacto: baseline y variante 1', 'transcripto: perfiles y prob RF'] },
    { id: 'matriz-deltas', seccion: '06', escena: 'matriz', beat: 1, titulo: 'Diferencias contra el baseline',
      pantalla: 'Barras divergentes alrededor de 0 con el Δ $ y Δ % de cada variante.',
      notas: 'Contra el baseline: perfiles suma uno coma sesenta y cinco y uno coma cero ocho por ciento; la media del RF, cero coma diecinueve; la dispersión resta uno coma cero dos, y árboles más logística resta dos coma treinta y cinco.',
      datos: ['exacto: baseline y variante 1', 'transcripto: perfiles y prob RF'] },
    { id: 'v1-auc', seccion: '06', escena: 'v1auc', beat: 0, titulo: 'Variante 1: AUC vs. C',
      pantalla: 'AUC en 201908 según C para los 4 generadores, en los dos repartos (separado y mismos); punteado = generador solo; rayado = baseline 0,9313.',
      notas: 'Ahora la variante uno, en desarrollo. El AUC en agosto forma una U invertida según C: con poca regularización, la logística sobreajusta. Con el reparto mismos los RF mejoran, pero ningún híbrido llega a la línea del baseline.',
      datos: ['exacto: desarrollo_metricas.csv'] },
    { id: 'v1-ganancia', seccion: '06', escena: 'v1gan', beat: 0, titulo: 'Variante 1: ganancia en desarrollo',
      pantalla: 'Curvas de ganancia en 201908 con el mejor C por generador (dos repartos) contra la curva de desarrollo del baseline.',
      notas: 'En ganancia pasa lo mismo: con el mejor C de cada generador, ninguno alcanza la curva de desarrollo del baseline.',
      datos: ['exacto: desarrollo_curvas.csv', 'transcripto: curva 201908 del baseline'] },
    { id: 'v1-final', seccion: '06', escena: 'v1final', beat: 0, titulo: 'Variante 1: final en 201910',
      pantalla: 'Zoom 2.000–6.000 de las curvas en 201910 (baseline, RF-109 + logística, RF-109 solo) y las 6 semillas a 4.000; abajo, el control con LGBM-12.',
      notas: 'En el final, con la configuración fijada en agosto, el híbrido queda dos coma tres por ciento debajo del baseline, con las seis semillas por debajo. Lo que sí hace la logística es levantar mucho a su propio Random Forest: casi veinte millones.',
      datos: ['exacto: final_curvas_ganancia.csv y final_metricas.csv'] },
    { id: 'prob-curvas', seccion: '06', escena: 'probCurvas', beat: 0, titulo: 'Variante 2 · Probabilidades RF: curva completa',
      pantalla: 'Curvas completas: baseline (A), + media (B), + dispersión (C).',
      notas: 'Para probabilidades RF las tres curvas también se superponen casi por completo.',
      datos: ['exacto: baseline', 'transcripto: prob RF (pág. 21)'] },
    { id: 'prob-zoom', seccion: '06', escena: 'probCurvas', beat: 1, titulo: 'Variante 2 · Probabilidades RF: zoom',
      pantalla: 'Zoom 2.000–6.000: B empata con A en 4.000; C queda abajo.',
      notas: 'En el zoom, la media queda prácticamente igual al baseline y la dispersión queda por debajo.',
      datos: ['exacto: baseline', 'transcripto: prob RF (pág. 21)'] },
    { id: 'prob-importancia', seccion: '06', escena: 'probImp', beat: 0, titulo: 'Variante 2 · Probabilidades RF: importancia',
      pantalla: 'Barras de importancia: rfd_media primera en el brazo B (5,86 %); en C, las de dispersión aparecen entre las primeras.',
      notas: 'Curioso: la media del RF es la variable más importante del brazo B, por encima de todas las originales. Que LightGBM la use mucho no implica que mejore la ganancia.',
      datos: ['transcripto: importancia (pág. 24)'] },
    { id: 'perfiles-curvas', seccion: '06', escena: 'perfCurvas', beat: 0, titulo: 'Variante 3 · Perfiles RF: curva completa',
      pantalla: 'Curvas completas 0–15.000: baseline y perfiles HP fijos a 4.000 envíos; perfiles HP reoptimizados a 4.500.',
      notas: 'Las curvas completas de perfiles casi se superponen con la del baseline.',
      datos: ['exacto: baseline', 'transcripto: perfiles (págs. 16 y 18)'] },
    { id: 'perfiles-zoom', seccion: '06', escena: 'perfCurvas', beat: 1, titulo: 'Variante 3 · Perfiles RF: zoom',
      pantalla: 'Zoom 2.000–6.000: HP fijos a 4.000 envíos y HP reoptimizados a 4.500; las curvas se cruzan según el corte.',
      notas: 'En el zoom comparamos los perfiles con HP fijos a cuatro mil envíos y los reoptimizados a cuatro mil quinientos. Las curvas se cruzan según el corte.',
      datos: ['exacto: baseline', 'transcripto: perfiles (págs. 16 y 18)'] },
    { id: 'perfiles-semillas', seccion: '06', escena: 'perfSemillas', beat: 0, titulo: 'Variante 3 · Perfiles RF: las 6 semillas',
      pantalla: 'Puntos por semilla y media: baseline y HP fijos a 4.000 envíos; HP reoptimizados a 4.500. Importancia: los perfiles dominan el top 10.',
      notas: 'Semilla por semilla, los rangos se superponen. LightGBM usa mucho los perfiles, pero la mejora en ganancia queda dentro del ruido.',
      datos: ['exacto: baseline', 'transcripto: perfiles e importancia'] },
    { id: 'discusion-1', seccion: '07', escena: 'disc', beat: 0, titulo: 'Discusión: variantes 1 y 2',
      pantalla: 'Puntos 1 y 2 de la discusión (borrador).',
      notas: 'BORRADOR: árboles más logística no supera al baseline, pero mejora a su propio RF. La media del RF empata y la dispersión empeora.',
      datos: ['exacto/transcripto: Δ de la matriz'] },
    { id: 'discusion-2', seccion: '07', escena: 'disc', beat: 1, titulo: 'Discusión: variante 3',
      pantalla: 'Punto 3 (borrador): perfiles RF.',
      notas: 'BORRADOR: los perfiles superan al baseline en el corte común, pero los rangos entre semillas se superponen.',
      datos: ['exacto: final v1'] },
    { id: 'conclusiones', seccion: '08', escena: 'concl', beat: 0, titulo: 'Conclusiones (borrador)',
      pantalla: 'Cuatro conclusiones cortas (borrador).',
      notas: 'BORRADOR: tenemos evidencia parcial. Hay una mejora chica para perfiles en el corte común, dentro del ruido; árboles más logística queda abajo, y no hay un ganador entre los tres enfoques.',
      datos: [] },
    { id: 'conclusiones-h0', seccion: '08', escena: 'concl', beat: 1, titulo: 'Qué decimos de H0 (borrador)',
      pantalla: 'Recuadro sobre H0.',
      notas: 'Sobre H0: hay evidencia de que los perfiles RF tienen potencial de superar al baseline, dado que obtuvieron mejoras moderadas de ganancia.',
      datos: [] },
    { id: 'futuro', seccion: '09', escena: 'futuro', beat: 0, titulo: 'Trabajo futuro',
      pantalla: 'Siete líneas de trabajo futuro, con los dos controles destacados.',
      notas: 'Lo que seguiríamos: más ventanas temporales, más generadores para la variante uno, ablaciones y, sobre todo, dos controles: uno sin target y uno de stacking con un LightGBM out-of-fold.',
      datos: [] },
    { id: 'anexo-repro', seccion: '10', escena: 'anexoRepro', beat: 0, titulo: 'Anexo: reproducibilidad',
      pantalla: 'Semillas, huellas, determinismo y procedencia de los números.',
      notas: 'En el anexo: cómo se reproduce todo y de dónde sale cada número.',
      datos: ['exacto: manifiesto baseline'] },
    { id: 'anexo-corte', seccion: '10', escena: 'anexoCorte', beat: 0, titulo: 'Anexo: el corte',
      pantalla: 'Curva del baseline con 4.000 y 4.500 marcados y las tres políticas de corte del equipo.',
      notas: 'El corte no es el mismo en todos los documentos: usamos cuatro mil para todos y calculamos cada diferencia desde los datos.',
      datos: ['exacto: curva baseline'] },
    { id: 'anexo-desvios', seccion: '10', escena: 'anexoDesvios', beat: 0, titulo: 'Anexo: desvíos D1–D8',
      pantalla: 'Tabla de desvíos del baseline del equipo respecto de las notas de la cátedra.',
      notas: 'Y la lista completa de diferencias entre nuestro baseline y el de la cátedra.',
      datos: [] },
    { id: 'cierre', seccion: 'cierre', escena: 'cierre', beat: 0, titulo: 'Cierre',
      pantalla: 'Gracias / ¿Preguntas?',
      notas: 'Gracias. Quedamos atentos a sus preguntas.',
      datos: [] }
  ]
};
