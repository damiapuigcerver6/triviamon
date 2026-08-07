"""
Descarga metadatos (tipo, categoria, nombre ES/EN) de todos los movimientos que
aparecen en el moveset por nivel de public/data/pokemon.json, y genera
public/data/moves.json. Se ejecuta despues de fetch-pokemon-data.py.

Uso: python scripts/fetch-move-data.py
"""

import json
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API = "https://pokeapi.co/api/v2"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PokewebDataFetch/1.0)"}
POKEMON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "pokemon.json")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "moves.json")

TYPE_ES = {
    "normal": "normal", "fighting": "lucha", "flying": "volador", "poison": "veneno",
    "ground": "tierra", "rock": "roca", "bug": "bicho", "ghost": "fantasma",
    "steel": "acero", "fire": "fuego", "water": "agua", "grass": "planta",
    "electric": "electrico", "psychic": "psiquico", "ice": "hielo",
    "dragon": "dragon", "dark": "siniestro", "fairy": "hada",
}

CATEGORIA_ES = {
    "physical": "fisico",
    "special": "especial",
    "status": "estado",
}


def get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def name_in_lang(names, lang, fallback):
    for n in names:
        if n["language"]["name"] == lang:
            return n["name"]
    return fallback.replace("-", " ").title()


def fetch_move(slug):
    d = get(f"{API}/move/{slug}")
    return slug, {
        "nombre": name_in_lang(d["names"], "es", slug),
        "nombre_en": name_in_lang(d["names"], "en", slug),
        "tipo": TYPE_ES.get(d["type"]["name"], d["type"]["name"]),
        "categoria": CATEGORIA_ES.get(d["damage_class"]["name"], "estado"),
    }


def main():
    with open(POKEMON_PATH, "r", encoding="utf-8") as f:
        pokedex = json.load(f)

    slugs = sorted({mv["move"] for p in pokedex for mv in p.get("movimientos_nivel", [])})
    print(f"{len(slugs)} movimientos distintos a consultar...")

    results = {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {pool.submit(fetch_move, slug): slug for slug in slugs}
        done = 0
        for fut in as_completed(futures):
            slug = futures[fut]
            try:
                key, meta = fut.result()
                results[key] = meta
            except Exception as e:
                print(f"ERROR move {slug}: {e}")
            done += 1
            if done % 50 == 0:
                print(f"{done}/{len(slugs)} movimientos procesados...")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    print(f"\nGuardado {len(results)} movimientos en {OUT_PATH}")


if __name__ == "__main__":
    main()
