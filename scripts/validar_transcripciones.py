"""Valida las tablas transcriptas del deck (data/perfiles_*.csv, data/probrf_curvas.csv).

La ganancia de una semilla en k envíos es G = 1.072.500·h − 27.500·(k − h) = 1.100.000·h − 27.500·k,
con h = BAJA_2 entre los primeros k. Entonces (G + 27.500·k) tiene que ser múltiplo de 1.100.000.
Eso detecta casi cualquier error de tipeo al transcribir un dígito.
Uso: python3 scripts/validar_transcripciones.py   (sin dependencias)
"""
import csv, sys
from pathlib import Path

D = Path(__file__).resolve().parent.parent / "data"
errores = []

def leer(nombre):
    with open(D / nombre, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

for nombre in ("perfiles_v2_curvas.csv", "perfiles_v21_curvas.csv"):
    for r in leer(nombre):
        k = int(r["envios"]); semillas = [c for c in r if c.startswith("semilla_")]
        vals = [float(r[c]) for c in semillas]
        for c, g in zip(semillas, vals):
            if (g + 27500 * k) % 1_100_000 != 0:
                errores.append(f"{nombre} k={k} {c}={g:.0f} no cae en la grilla de ganancia")
        media = sum(vals) / len(vals); deck = float(r["promedio_deck"])
        if abs(media - deck) > 60:  # el deck redondea a 7 cifras significativas
            errores.append(f"{nombre} k={k}: media {media:.0f} ≠ promedio del deck {deck:.0f}")

base = {int(r["envios"]): float(r["promedio"]) for r in leer("baseline_curvas_ganancia.csv") if r["foto_mes"] == "201910"}
for r in leer("probrf_curvas.csv"):
    k = int(r["envios"])
    if abs(float(r["A_baseline"]) * 1e6 - base[k]) > 600:
        errores.append(f"probrf k={k}: A_baseline {r['A_baseline']} ≠ baseline CSV {base[k]/1e6:.3f}")
    for c in ("B_media", "C_dispersion"):
        h6 = (float(r[c]) * 6 + 0.165 * k) / 1.1   # suma de BAJA_2 de las 6 semillas
        if abs(h6 - round(h6)) > 0.02:
            errores.append(f"probrf k={k} {c}={r[c]} no es una media posible de 6 ganancias")

if errores:
    print("\n".join(errores)); sys.exit(1)
print("OK: transcripciones consistentes (grilla de ganancia, medias del deck y baseline).")
