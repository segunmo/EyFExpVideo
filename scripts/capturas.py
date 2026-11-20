"""Captura cada paso a 1920×1080 (?step=N) en una carpeta y reporta errores de consola.
Uso: python scripts/capturas.py <url_base> <carpeta_salida> [pasos separados por coma]
Requiere: pip install playwright && playwright install chromium
"""
import sys, asyncio
from playwright.async_api import async_playwright

async def main(base, out, sel):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome")
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(base + "?step=0")
        await pg.wait_for_selector("body[data-ready='1']")
        n = await pg.evaluate("__app.N")
        pasos = [int(x) for x in sel.split(",")] if sel else range(n)
        for i in pasos:
            await pg.goto(f"{base}?step={i}")
            await pg.wait_for_selector("body[data-ready='1']")
            await pg.wait_for_timeout(700)   # transiciones CSS
            pid = await pg.evaluate(f"__app.pasos[{i}].id")
            await pg.screenshot(path=f"{out}/{i:02d}_{pid}.png")
        await b.close()
        print("pasos:", n, "errores:", errs if errs else "ninguno")

asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""))
