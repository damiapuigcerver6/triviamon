"""
Descarga el artwork oficial de cada Pokemon en public/data/pokemon.json y
extrae una paleta de colores dominantes (ignorando el fondo transparente),
guardandola en public/data/pokemon-palettes.json. Se ejecuta una sola vez
(o cuando se anada roster nuevo); la web nunca descarga ni procesa imagenes
en vivo, solo lee el JSON ya generado.

Uso: python scripts/fetch-pokemon-palettes.py
"""

import io
import json
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PokewebPaletteFetch/1.0)"}
POKEMON_JSON = os.path.join(os.path.dirname(__file__), "..", "public", "data", "pokemon.json")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "pokemon-palettes.json")
N_COLORS = 5


def sprite_url(pid):
    return f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pid}.png"


def extract_palette(pid):
    req = urllib.request.Request(sprite_url(pid), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im = im.resize((96, 96))
    pixels = im.getdata()
    opaque = [(r, g, b) for r, g, b, a in pixels if a > 128]
    if not opaque:
        return []

    tmp = Image.new("RGB", (len(opaque), 1))
    tmp.putdata(opaque)
    quant = tmp.quantize(colors=N_COLORS, method=Image.MEDIANCUT)
    counts = sorted(quant.getcolors(), reverse=True)
    pal = quant.getpalette()

    hexes = []
    for _count, idx in counts:
        r, g, b = pal[idx * 3 : idx * 3 + 3]
        hexes.append("#{:02x}{:02x}{:02x}".format(r, g, b))
    return hexes


def main():
    with open(POKEMON_JSON, encoding="utf-8") as f:
        pokedex = json.load(f)
    ids = [p["id"] for p in pokedex]

    results = {}
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = {pool.submit(extract_palette, pid): pid for pid in ids}
        done = 0
        for fut in as_completed(futures):
            pid = futures[fut]
            try:
                palette = fut.result()
                if palette:
                    results[str(pid)] = palette
            except Exception as e:
                print(f"ERROR id {pid}: {e}")
            done += 1
            if done % 100 == 0:
                print(f"{done}/{len(ids)} procesados...")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, separators=(",", ":"))

    print(f"\nGuardadas {len(results)} paletas en {OUT_PATH}")


if __name__ == "__main__":
    main()
