"""Convierte los CSV de data/ en data/datos.js (window.DATOS), para que el sitio funcione desde file://.

Uso:  python3 scripts/convertir_datos.py        (Python 3.9+, sin dependencias)

- No calcula resultados: copia las curvas y métricas tal cual. Las diferencias contra el
  baseline (Δ) las calcula el sitio a partir de estos datos (escenas.js → calcularMatriz).
- Cada bloque lleva `estado` (exacto / transcripto / aproximado / pendiente) y `fuente`.
- Variante 1 en 201910: sale de data/v1_final_curvas_ganancia.csv y v1_final_metricas.csv
  (copias de EyFPipeline/resultados/v1_rf_lr/). Si no están, queda `v1Final: null` y el
  sitio muestra el estado "pendiente".
"""
import csv
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
D = RAIZ / "data"


def leer(nombre):
    p = D / nombre
    if not p.exists() or p.stat().st_size == 0:
        return None
    with open(p, newline="", encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    return filas or None


def num(x):
    if x is None or x == "":
        return None
    v = float(x)
    return int(v) if v.is_integer() else v


def curvas_por_semilla(filas, mes, col_prom="promedio"):
    """Curva por semilla + media en el formato de resultados/baseline/curvas_ganancia.csv."""
    filas = [r for r in filas if str(r.get("foto_mes", mes)) == str(mes)]
    filas.sort(key=lambda r: int(float(r["envios"])))
    semillas = [c.split("_", 1)[1] for c in filas[0] if c.startswith("semilla_")]
    out = {
        "envios": [int(float(r["envios"])) for r in filas],
        "semillas": {s: [num(r["semilla_" + s]) for r in filas] for s in semillas},
    }
    # La media se recalcula desde las semillas (no se confía en una columna redondeada).
    n = len(semillas)
    out["promedio"] = [sum(out["semillas"][s][i] for s in semillas) / n for i in range(len(filas))]
    if col_prom in filas[0]:
        out["promedio_archivo"] = [num(r[col_prom]) for r in filas]
    return out


datos = {}

# --- Clases por mes (entrada del FE del equipo) ------------------------------------------
cl = {}
for r in leer("target_y_filas_por_mes.csv"):
    cl.setdefault(r["foto_mes"], {})[r["clase_ternaria"]] = int(r["registros"])
datos["clases"] = {"estado": "exacto", "fuente": "EyFPipeline/referencia/fe_duckdb/reportes_corrida/target_y_filas_por_mes.csv (etapa=entrada)",
                   "meses": {m: v for m, v in sorted(cl.items()) if m.startswith("2019")}}

# --- Baseline -----------------------------------------------------------------------------
datos["baseline"] = {
    "estado": "exacto", "fuente": "EyFPipeline/resultados/baseline/curvas_ganancia.csv (foto_mes=201910)",
    "curva": curvas_por_semilla(leer("baseline_curvas_ganancia.csv"), 201910),
}
met = [r for r in leer("baseline_metricas.csv") if r["foto_mes"] == "201910" and r["in_sample"] == "False"]
datos["baselineMetricas"] = {
    "estado": "exacto", "fuente": "EyFPipeline/resultados/baseline/metricas.csv (201910, in_sample=False)",
    "filas": [{"semilla": r["semilla"], "auc": float(r["auc"]), "ne": float(r["ne"]), "calibracion": float(r["calibracion"])} for r in met],
}
dev = leer("baseline_curva_201908.csv")
datos["baselineDev"] = {
    "estado": "transcripto", "fuente": "EyFPipeline/experimentos/baseline/curva_agosto_notebook.py (CURVA_201908); AUC 0,93134 de HANDOFF §4.1",
    "envios": [int(r["envios"]) for r in dev], "ganancia": [num(r["ganancia"]) for r in dev], "auc": 0.93134,
}

# --- Perfiles (tablas por semilla del deck, págs. 16 y 18) --------------------------------
for clave, archivo, pag in (("perfilesV2", "perfiles_v2_curvas.csv", 16), ("perfilesV21", "perfiles_v21_curvas.csv", 18)):
    datos[clave] = {"estado": "transcripto", "fuente": f"Deck Experimento_colaborativo_RFF.pdf, pág. {pag} (tabla por semilla, exacta, leída de la imagen)",
                    "curva": curvas_por_semilla(leer(archivo), 201910, "promedio_deck")}

# --- Probabilidades RF (tabla de la pág. 21; solo medias de 6 semillas) -------------------
pr = leer("probrf_curvas.csv")
datos["probRF"] = {
    "estado": "transcripto", "fuente": "Deck Experimento_colaborativo_RFF.pdf, pág. 21 (tabla exacta, en millones con 3 decimales)",
    "envios": [int(r["envios"]) for r in pr],
    "A": [float(r["A_baseline"]) * 1e6 for r in pr],
    "B": [float(r["B_media"]) * 1e6 for r in pr],
    "C": [float(r["C_dispersion"]) * 1e6 for r in pr],
}

# --- Importancia de variables --------------------------------------------------------------
imp = {}
for r in leer("importancia_variables.csv"):
    imp.setdefault(r["modelo"], []).append({"rank": int(r["rank"]), "variable": r["variable"], "rf": r["es_variable_rf"] == "True", "valor": num(r["valor"])})
datos["importancia"] = {"estado": "transcripto",
                        "fuente": "Deck págs. 24 (Prob RF, tabla en texto) y 17/19 (Perfiles, nombres legibles del gráfico)", "modelos": imp}

# --- Variante 1, desarrollo (201908) -------------------------------------------------------
vm = leer("v1_desarrollo_metricas.csv")
datos["v1Dev"] = {
    "estado": "exacto", "fuente": "EyFPipeline/resultados/v1_rf_lr/desarrollo_metricas.csv y desarrollo_curvas.csv (201908, desarrollo)",
    "metricas": [{"id": int(r["modelo_id"]), "reparto": r["reparto"], "generador": r["generador"], "modelo": r["modelo"],
                  "C": num(r["C"]), "auc": float(r["auc"]), "ne": float(r["ne"]), "calibracion": float(r["calibracion"]),
                  "corte": int(r["corte_agosto"]), "gananciaMax": num(r["ganancia_max_agosto"]), "columnas": num(r["columnas"])} for r in vm],
    "curvas": {},
}
for r in leer("v1_desarrollo_curvas.csv"):
    c = datos["v1Dev"]["curvas"].setdefault(r["modelo_id"], {"envios": [], "ganancia": []})
    c["envios"].append(int(r["envios"])); c["ganancia"].append(num(r["ganancia"]))
costo = {r["etapa"]: r for r in leer("v1_medicion_costo.csv")}
datos["v1Costo"] = {
    "estado": "exacto", "fuente": "EyFPipeline/resultados/v1_rf_lr/medicion_costo.csv (RF-109, separado)",
    "arboles": 300, "hojasTotal": num(costo["ajustar RF"]["hojas_total"]), "hojasMedia": num(costo["ajustar RF"]["hojas_media"]),
    "columnas": num(costo["one-hot 201906"]["columnas"]), "noNulos": num(costo["one-hot 201906"]["no_nulos"]),
    "sparseGB": num(costo["one-hot 201906"]["sparse_gb"]), "filas201906": num(costo["leer 201906 + hojas"]["filas"]),
    "segundosLR": num(costo["ajustar LR"]["segundos"]), "segundosRF": num(costo["ajustar RF"]["segundos"]),
}

# --- Variante 1, final 201910 ----------------------------------------------------------------
# Fuente: EyFPipeline/resultados/v1_rf_lr/final_curvas_ganancia.csv y final_metricas.csv (copiados a data/).
# Brazo A (RF-109, "mismos", C 0,003) es el que va a la matriz; B (LGBM-12, "separado", C 0,01) es el control.
# Si no están, se acepta el formato viejo (data/v1_final_201910.csv, solo el híbrido A); si no hay nada, "pendiente".
vfc = leer("v1_final_curvas_ganancia.csv")
if vfc:
    brazos = {}
    for (b, m) in sorted({(r["brazo"], r["modelo"]) for r in vfc}):
        clave = "hibrido" if m == "hibrido" else "solo"
        brazos.setdefault(b, {})[clave] = curvas_por_semilla([r for r in vfc if r["brazo"] == b and r["modelo"] == m], 201910)
    vfm = leer("v1_final_metricas.csv") or []
    datos["v1Final"] = {
        "estado": "exacto", "fuente": "EyFPipeline/resultados/v1_rf_lr/final_curvas_ganancia.csv y final_metricas.csv (201910, 6 semillas)",
        "curva": brazos["A"]["hibrido"], "brazos": brazos,
        "config": {b: {"generador": r["generador"], "reparto": r["reparto"], "C": num(r["C"])} for b, r in {r["brazo"]: r for r in vfm}.items()},
        "metricas": [{"brazo": r["brazo"], "modelo": "hibrido" if r["modelo"] == "hibrido" else "solo", "semilla": r["semilla"],
                      "auc": float(r["auc"]), "ne": float(r["ne"]), "calibracion": float(r["calibracion"])} for r in vfm],
    }
else:
    vf = leer("v1_final_201910.csv")
    if vf:
        datos["v1Final"] = {"estado": "exacto", "fuente": "data/v1_final_201910.csv", "curva": curvas_por_semilla(vf, 201910)}
        vfm = leer("v1_final_201910_metricas.csv")
        if vfm:
            datos["v1Final"]["metricas"] = [{"semilla": r["semilla"], "auc": float(r["auc"]), "ne": float(r["ne"]), "calibracion": float(r["calibracion"])} for r in vfm]
    else:
        datos["v1Final"] = None

texto = "/* GENERADO por scripts/convertir_datos.py — no editar a mano. */\nwindow.DATOS = " + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n"
(D / "datos.js").write_text(texto, encoding="utf-8")
print(f"data/datos.js: {len(texto) / 1024:.1f} KB · v1Final: {'presente' if datos['v1Final'] else 'pendiente'}")
