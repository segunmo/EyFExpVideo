"""Verificación completa del sitio (ver README → "Verificación").

Uso:
    python scripts/verificar.py            # todo
    python scripts/verificar.py --rapido   # determinismo con muestra de pasos

Requiere: pip install playwright pillow  (usa el Chrome instalado: channel="chrome")

Comprueba:
 1. Determinismo: el estado de cada paso es el mismo llegando con →, con ?step=N y con ←
    (huella del DOM en todos los pasos; comparación de píxeles en una muestra).
 2. Apretar → muchas veces seguidas no rompe el estado; G + número + Enter salta.
 3. Números: la matriz y los textos con cifras coinciden con un recálculo independiente
    desde los CSV de data/ (en Python, sin usar data/datos.js).
 4. Variante 1 final: estado "pendiente" sin archivo y estado completo con un CSV de prueba
    (que se borra al terminar).
 5. Funciona desde file:// y desde python3 -m http.server, sin red (se bloquea todo lo externo).
"""
import asyncio, csv, io, json, os, statistics, subprocess, sys, time
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image, ImageChops

RAIZ = Path(__file__).resolve().parent.parent
D = RAIZ / "data"
RAPIDO = "--rapido" in sys.argv
fallas = []


def ok(cond, msg):
    print(("  ok   " if cond else "  FALLA ") + msg)
    if not cond:
        fallas.append(msg)


# ------------------------------------------------------------------ formato es-AR (independiente)
def es(v, dec):
    s = f"{abs(v):,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return ("−" if v < 0 else "") + s


def M(v):  # $ 288,57 M
    return "$ " + es(v / 1e6, 2) + " M"


def dM(v):
    return ("+" if v > 0 else "−") + es(abs(v) / 1e6, 2) + " M"


def pct(v):
    return ("+" if v > 0 else "−") + es(abs(v), 2) + " %"


# ------------------------------------------------------------------ recálculo desde los CSV
def leer(n):
    with open(D / n, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def media_semillas(filas, k, mes="201910"):
    r = [x for x in filas if x.get("foto_mes", mes) == mes and int(float(x["envios"])) == k][0]
    vals = [float(r[c]) for c in r if c.startswith("semilla_")]
    return sum(vals) / len(vals), vals


CORTE = 4000
base, base_sem = media_semillas(leer("baseline_curvas_ganancia.csv"), CORTE)
pr = [r for r in leer("probrf_curvas.csv") if int(r["envios"]) == CORTE][0]
esperado = {
    "base": base,
    "v2": media_semillas(leer("perfiles_v2_curvas.csv"), CORTE)[0],
    "v21": media_semillas(leer("perfiles_v21_curvas.csv"), CORTE)[0],
    "media": float(pr["B_media"]) * 1e6,
    "disp": float(pr["C_dispersion"]) * 1e6,
}
met = [r for r in leer("baseline_metricas.csv") if r["foto_mes"] == "201910" and r["in_sample"] == "False"]
ne_base = statistics.mean(float(r["ne"]) for r in met)
cal_base = statistics.mean(float(r["calibracion"]) for r in met)
sd_base = statistics.stdev(base_sem)
vm = leer("v1_desarrollo_metricas.csv")
mejores = []
for rep in ("separado", "mismos"):
    for g in ("RF-12", "RF-32", "RF-109", "LGBM-12"):
        rows = [r for r in vm if r["reparto"] == rep and r["generador"] == g and r["C"]]
        mejores.append(max(rows, key=lambda r: float(r["auc"])))
mejor_v1 = max(float(r["ganancia_max_agosto"]) for r in mejores)
dev_max = max(float(r["ganancia"]) for r in leer("baseline_curva_201908.csv"))
textos_esperados = {  # paso id → textos que tienen que aparecer
    "limitaciones-1": [M(sd_base)],
    "limitaciones-v1": [es(ne_base, 2), es(cal_base, 1) + "×"],
    "v1-ganancia": [es(mejor_v1 / 1e6, 1) + " M", es(dev_max / 1e6, 1) + " M"],
    "v1-calibracion": ["NE " + es(min(float(r["ne"]) for r in mejores), 2) + "–" + es(max(float(r["ne"]) for r in mejores), 2),
                       "calib. " + es(min(float(r["calibracion"]) for r in mejores), 2) + "–" + es(max(float(r["calibracion"]) for r in mejores), 2)],
    "discusion-1": [pct(100 * (esperado[k] - base) / base) for k in ("v2", "v21", "media", "disp")],
    "ganancia-curva": [M(max(float(r["promedio"]) for r in leer("baseline_curvas_ganancia.csv") if r["foto_mes"] == "201910"))],
    "eval-semillas": [M(base)],
}


# ------------------------------------------------------------------ navegador
async def nueva(browser, offline=True):
    ctx = await browser.new_context(viewport={"width": 1920, "height": 1080})
    pg = await ctx.new_page()
    pg.errores, pg.externos = [], []
    pg.on("console", lambda m: pg.errores.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: pg.errores.append(str(e)))
    if offline:
        async def ruta(route):
            u = route.request.url
            if u.startswith("file://") or u.startswith("http://localhost") or u.startswith("http://127.0.0.1"):
                await route.continue_()
            else:
                pg.externos.append(u); await route.abort()
        await pg.route("**/*", ruta)
    return pg


async def abrir(pg, url, step):
    await pg.goto(f"{url}?step={step}")
    await pg.wait_for_selector("body[data-ready='1']")
    await pg.wait_for_timeout(250)


async def esperar_fin(pg):
    for _ in range(200):
        if not await pg.evaluate("__app.busy()"):
            break
        await pg.wait_for_timeout(50)
    await pg.wait_for_timeout(700)   # transiciones CSS (≤ 0,6 s)


async def foto(pg):
    return Image.open(io.BytesIO(await pg.screenshot())).convert("RGB")


def difiere(a, b):
    d = ImageChops.difference(a, b).convert("L").point(lambda x: 255 if x > 24 else 0)
    return d.getbbox(), sum(d.histogram()[255:])


async def determinismo(browser, url, n):
    print("1. Determinismo (→ vs ?step=N vs ←)")
    pg = await nueva(browser)
    muestra_px = set(range(1, n, 1 if not RAPIDO else 1)) if False else set(range(1, n, 3)) | {n - 1}
    pasos = range(1, n) if not RAPIDO else sorted(muestra_px)
    malos = []
    for i in pasos:
        await abrir(pg, url, i - 1)
        await pg.keyboard.press("ArrowRight"); await esperar_fin(pg)
        a = await pg.evaluate("__app.snapshot()"); fa = await foto(pg) if i in muestra_px else None
        await abrir(pg, url, i); await pg.wait_for_timeout(500)
        b = await pg.evaluate("__app.snapshot()"); fb = await foto(pg) if i in muestra_px else None
        c = None
        if i < n - 1:
            await abrir(pg, url, i + 1)
            await pg.keyboard.press("ArrowLeft"); await pg.wait_for_timeout(500)
            c = await pg.evaluate("__app.snapshot()"); fc = await foto(pg) if i in muestra_px else None
        if a != b:
            malos.append((i, "→ vs directo", [k for k in a if a.get(k) != b.get(k)][:5]))
        if c is not None and c != b:
            malos.append((i, "← vs directo", [k for k in b if b.get(k) != c.get(k)][:5]))
        if fa is not None:
            bb, npx = difiere(fa, fb)
            if npx > 50: malos.append((i, f"píxeles → vs directo: {npx} px en {bb}", []))
            if c is not None:
                bb, npx = difiere(fc, fb)
                if npx > 50: malos.append((i, f"píxeles ← vs directo: {npx} px en {bb}", []))
    for m in malos: print("     ", m)
    ok(not malos, f"{len(list(pasos))} pasos con huella idéntica; píxeles comparados en {len(muestra_px)} pasos")
    ok(not pg.errores, "sin errores de consola " + (str(pg.errores[:3]) if pg.errores else ""))
    ok(not pg.externos, "sin pedidos externos (funciona sin red) " + (str(pg.externos[:3]) if pg.externos else ""))
    fuentes = await pg.evaluate("[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i)")
    ok("Inter" in fuentes and "JetBrains Mono" in fuentes, f"tipografías locales cargadas: {fuentes}")


async def teclas(browser, url):
    print("2. Teclas rápidas y salto con G")
    pg = await nueva(browser)
    await abrir(pg, url, 0)
    for _ in range(15):
        await pg.keyboard.press("ArrowRight"); await pg.wait_for_timeout(30)
    await esperar_fin(pg)
    a = await pg.evaluate("__app.snapshot()"); cur = await pg.evaluate("__app.cur")
    await abrir(pg, url, 15); await pg.wait_for_timeout(500)
    b = await pg.evaluate("__app.snapshot()")
    ok(cur == 15 and a == b, f"15 × → rápidas terminan en el paso 15 con el mismo estado que ?step=15 (cur={cur})")
    for k in ["g", "4", "2", "Enter"]:
        await pg.keyboard.press(k)
    await pg.wait_for_timeout(300)
    ok(await pg.evaluate("__app.cur") == 42, "G 4 2 Enter salta al paso 42")
    await pg.keyboard.press("r"); await pg.wait_for_timeout(200)
    ok(await pg.evaluate("__app.cur") == 0, "R vuelve al paso 0")
    await pg.keyboard.press("d"); await pg.wait_for_timeout(100)
    ok(await pg.evaluate("document.body.classList.contains('dev') && getComputedStyle(document.getElementById('hud')).display !== 'none'"), "D muestra el HUD de desarrollo")


async def numeros(browser, url, v1_presente=False):
    print("3. Números en pantalla vs. recálculo desde los CSV" + (" (con v1 final de prueba)" if v1_presente else ""))
    pg = await nueva(browser)
    await abrir(pg, url, 0)
    pasos = await pg.evaluate("__app.pasos.map(p => p.id)")
    await abrir(pg, url, pasos.index("matriz-deltas")); await pg.wait_for_timeout(400)
    celdas = await pg.evaluate("""[...document.querySelectorAll('.slide.show [data-campo]')].map(e => [e.dataset.campo, +e.dataset.val, e.textContent.trim()])""")
    vistos = {c: (v, t) for c, v, t in celdas}
    for k, g in esperado.items():
        v, t = vistos.get(k + ".g", (None, None))
        ok(v is not None and abs(v - g) < 1 and t == M(g), f"matriz {k}: {t} (esperado {M(g)})")
        if k != "base":
            d = g - base; p = 100 * d / base
            ok(vistos.get(k + ".d", ("", ""))[1] == dM(d), f"Δ $ {k}: {vistos.get(k + '.d', ('', ''))[1]} (esperado {dM(d)})")
            ok(vistos.get(k + ".p", ("", ""))[1] == pct(p), f"Δ % {k}: {vistos.get(k + '.p', ('', ''))[1]} (esperado {pct(p)})")
    pend = await pg.evaluate("document.querySelectorAll('.slide.show [data-pendiente]').length")
    if v1_presente:
        g = esperado_v1
        v, t = vistos.get("v1.g", (None, None))
        ok(pend == 0 and t == M(g), f"matriz v1 completa: {t} (esperado {M(g)}), Δ % {vistos.get('v1.p', ('', ''))[1]}")
        await abrir(pg, url, pasos.index("v1-final")); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.querySelectorAll('.slide.show path.ln').length") >= 2, "v1-final dibuja la curva")
    else:
        ok(pend == 1 and "v1.g" not in vistos, "matriz v1 en estado pendiente")
        await abrir(pg, url, pasos.index("v1-final")); await pg.wait_for_timeout(300)
        ok(await pg.evaluate("document.querySelectorAll('.slide.show [data-pendiente]').length") == 1, "v1-final en estado pendiente")
        for pid, txts in textos_esperados.items():
            await abrir(pg, url, pasos.index(pid)); await pg.wait_for_timeout(300)
            texto = await pg.evaluate("document.querySelector('.slide.show').textContent")
            for t in txts:
                ok(t in texto, f"{pid}: aparece «{t}»")


esperado_v1 = None


async def main():
    global esperado_v1
    url_file = (RAIZ / "index.html").as_uri()
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--bind", "127.0.0.1"], cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(channel="chrome")
            pg = await nueva(browser); await abrir(pg, url_file, 0); n = await pg.evaluate("__app.N")
            await determinismo(browser, url_file, n)
            await teclas(browser, url_file)
            await numeros(browser, url_file)
            print("5. Servidor local (python3 -m http.server) sin red")
            pg = await nueva(browser); await abrir(pg, "http://127.0.0.1:8765/index.html", 41)
            ok(not pg.errores and not pg.externos and await pg.evaluate("__app.cur") == 41, "carga por http://localhost sin errores ni pedidos externos")
            # 4. estado completo de la variante 1 con un CSV de prueba
            print("4. Variante 1 final: archivo de prueba")
            prueba = D / "v1_final_201910.csv"
            assert not prueba.exists(), "data/v1_final_201910.csv ya existe: no se pisa"
            filas = leer("baseline_curvas_ganancia.csv")
            with open(prueba, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f); cols = [c for c in filas[0] if c.startswith("semilla_")]
                w.writerow(["foto_mes", "envios"] + cols + ["promedio"])
                for r in filas:
                    if r["foto_mes"] != "201910": continue
                    vals = [float(r[c]) - 5_500_000 if int(r["envios"]) else 0.0 for c in cols]  # dummy: baseline − 5,5 M
                    w.writerow([r["foto_mes"], r["envios"]] + vals + [sum(vals) / len(vals)])
            try:
                subprocess.run([sys.executable, str(RAIZ / "scripts/convertir_datos.py")], check=True)
                esperado_v1 = base - 5_500_000
                await numeros(browser, url_file, v1_presente=True)
            finally:
                prueba.unlink()
                subprocess.run([sys.executable, str(RAIZ / "scripts/convertir_datos.py")], check=True)
            await browser.close()
    finally:
        srv.terminate()
    print("\nRESULTADO:", "OK" if not fallas else f"{len(fallas)} fallas")
    sys.exit(1 if fallas else 0)


asyncio.run(main())
