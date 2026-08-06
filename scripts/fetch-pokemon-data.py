"""
Descarga los datos necesarios para el juego "adivina el Pokemon" desde PokeAPI
y genera public/data/pokemon.json. Se ejecuta una sola vez (o cuando se quiera
ampliar/actualizar el roster); la web nunca llama a PokeAPI en vivo.

Uso: python scripts/fetch-pokemon-data.py
"""

import json
import os
import threading
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API = "https://pokeapi.co/api/v2"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; PokewebDataFetch/1.0)"}
TOTAL_SPECIES = 1025
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "pokemon.json")

REGIONAL_SUFFIXES = {
    "-alola": ("Alola", 7),
    "-galar": ("Galar", 8),
    "-hisui": ("Hisui", 8),
    "-paldea": ("Paldea", 9),
}

TYPE_ES = {
    "normal": "normal", "fighting": "lucha", "flying": "volador", "poison": "veneno",
    "ground": "tierra", "rock": "roca", "bug": "bicho", "ghost": "fantasma",
    "steel": "acero", "fire": "fuego", "water": "agua", "grass": "planta",
    "electric": "electrico", "psychic": "psiquico", "ice": "hielo",
    "dragon": "dragon", "dark": "siniestro", "fairy": "hada",
}

COLOR_ES = {
    "black": "Negro", "blue": "Azul", "brown": "Marrón", "gray": "Gris",
    "green": "Verde", "pink": "Rosa", "purple": "Morado", "red": "Rojo",
    "white": "Blanco", "yellow": "Amarillo",
}

SHAPE_ES = {
    "ball": "Bola", "squiggle": "Serpentina", "fish": "Pez", "arms": "Brazos",
    "blob": "Amorfo", "upright": "Erguido", "legs": "Piernas", "quadruped": "Cuadrúpedo",
    "wings": "Alado", "tentacles": "Tentáculos", "heads": "Cabezas múltiples",
    "humanoid": "Humanoide", "bug-wings": "Insecto alado", "armor": "Armadura",
}

GEN_ROMAN_TO_INT = {
    "generation-i": 1, "generation-ii": 2, "generation-iii": 3, "generation-iv": 4,
    "generation-v": 5, "generation-vi": 6, "generation-vii": 7, "generation-viii": 8,
    "generation-ix": 9,
}

STAT_ES = {
    "hp": "vida",
    "attack": "ataque",
    "defense": "defensa",
    "special-attack": "ataque_especial",
    "special-defense": "defensa_especial",
    "speed": "velocidad",
}

STONE_ES = {
    "fire-stone": "Piedra Fuego",
    "water-stone": "Piedra Agua",
    "thunder-stone": "Piedra Trueno",
    "leaf-stone": "Piedra Hoja",
    "moon-stone": "Piedra Luna",
    "sun-stone": "Piedra Sol",
    "shiny-stone": "Piedra Destello",
    "dusk-stone": "Piedra Noche",
    "dawn-stone": "Piedra Alba",
    "ice-stone": "Piedra Hielo",
}

MOVE_SLUGS = [
    "fire-punch", "thunder-punch", "ice-punch", "icicle-crash",
    "flamethrower", "hydro-pump", "thunderbolt", "ice-beam",
    "psychic", "shadow-ball", "earthquake", "rock-slide",
    "sludge-bomb", "poison-jab", "crunch", "bite",
    "dragon-claw", "outrage", "leaf-blade", "close-combat",
    "iron-head", "iron-tail", "extreme-speed", "double-edge",
    "megahorn", "x-scissor", "bug-buzz", "stone-edge",
    "shadow-claw", "night-slash", "air-slash", "brave-bird",
    "aqua-tail", "water-pulse", "moonblast", "play-rough",
    "meteor-mash", "zen-headbutt", "swords-dance", "dragon-dance",
    "recover", "roost", "u-turn", "knock-off", "toxic",
    "stealth-rock", "will-o-wisp", "spore", "earth-power",
    "draco-meteor",
]
MOVE_SLUG_SET = set(MOVE_SLUGS)

CHAIN_CACHE = {}
CHAIN_LOCK = threading.Lock()


def get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def classify_trigger_detail(d):
    """Traduce un evolution_details individual de PokeAPI a una etiqueta corta en espanol."""
    trigger = d["trigger"]["name"] if d.get("trigger") else None
    if trigger == "level-up":
        has_level = d.get("min_level") is not None
        has_happiness = d.get("min_happiness") is not None
        if has_happiness and has_level:
            return "Amistad y nivel"
        if has_happiness:
            return "Amistad"
        return "Nivel"
    if trigger == "trade":
        return "Intercambio"
    if trigger == "use-item":
        item = d["item"]["name"] if d.get("item") else ""
        return STONE_ES.get(item, "Objeto")
    return "Especial"


def classify_method(children, variety_name):
    """
    Busca entre TODOS los hijos de evolucion de esta especie el detalle que
    corresponde a esta variedad en concreto: algunas formas regionales
    evolucionan de forma distinta a la forma base (ej. Vulpix de Alola con
    Piedra Hielo en vez de Piedra Fuego, o Qwilfish de Hisui que evoluciona
    mientras que el Qwilfish normal no evoluciona nunca). Si no hay ningun
    detalle especifico para esta variedad ni tampoco uno generico (aplicable
    a la forma base), esta variedad no evoluciona mas -> "-".
    """
    if not children:
        return "—"
    all_details = [d for child in children for d in child.get("evolution_details", [])]
    if not all_details:
        return "—"
    specific = [d for d in all_details if d.get("base_form")]
    match = next((d for d in specific if d["base_form"]["name"] == variety_name), None)
    if match:
        return classify_trigger_detail(match)
    generic = next((d for d in all_details if not d.get("base_form")), None)
    if generic:
        return classify_trigger_detail(generic)
    return "—"


def walk_chain(node, stage, out):
    # "metodo" describe como evoluciona ESTE Pokemon hacia su siguiente fase
    # (no como llego a existir). Las formas finales no evolucionan mas -> "-".
    # Se guardan TODOS los hijos (no solo el primero) porque algunas formas
    # regionales evolucionan a una especie distinta o con un metodo distinto
    # al de la forma base (ej. Meowth de Galar -> Perrserker).
    name = node["species"]["name"]
    children = node["evolves_to"]
    out[name] = (stage, children)
    for child in children:
        walk_chain(child, stage + 1, out)


def get_chain_map(chain_url):
    with CHAIN_LOCK:
        cached = CHAIN_CACHE.get(chain_url)
    if cached is not None:
        return cached
    data = get(chain_url)
    out = {}
    walk_chain(data["chain"], 1, out)
    with CHAIN_LOCK:
        CHAIN_CACHE[chain_url] = out
    return out


def es_name(names, fallback):
    for n in names:
        if n["language"]["name"] == "es":
            return n["name"]
    return fallback.replace("-", " ").title()


def name_in_lang(names, lang, fallback):
    for n in names:
        if n["language"]["name"] == lang:
            return n["name"]
    return fallback.replace("-", " ").title()


# Convencion inglesa: "Alolan Vulpix" (adjetivo delante), no "Vulpix de Alola".
REGIONAL_ADJ_EN = {"Alola": "Alolan", "Galar": "Galarian", "Hisui": "Hisuian", "Paldea": "Paldean"}


def fetch_species(species_id):
    sp = get(f"{API}/pokemon-species/{species_id}")
    base_name = es_name(sp["names"], sp["name"])
    base_name_en = name_in_lang(sp["names"], "en", sp["name"])
    generation = GEN_ROMAN_TO_INT.get(sp["generation"]["name"], 1)
    color = COLOR_ES.get(sp["color"]["name"], sp["color"]["name"]) if sp["color"] else "?"
    shape_name = sp["shape"]["name"] if sp["shape"] else None
    shape = SHAPE_ES.get(shape_name, shape_name) if shape_name else "?"
    categoria = "mitico" if sp["is_mythical"] else ("legendario" if sp["is_legendary"] else "normal")

    chain_map = get_chain_map(sp["evolution_chain"]["url"])
    fase, chain_children = chain_map.get(sp["name"], (1, []))

    varieties = sp["varieties"]
    wanted = []
    for v in varieties:
        name = v["pokemon"]["name"]
        if v["is_default"]:
            wanted.append((name, None))
            continue
        if "totem" in name:
            continue  # formas totem (batalla especial), no son un Pokemon distinto guessable
        for suffix, (label, gen_override) in REGIONAL_SUFFIXES.items():
            if name.endswith(suffix):
                wanted.append((name, (label, gen_override)))
                break

    entries = []
    for variety_name, region in wanted:
        poke = get(f"{API}/pokemon/{variety_name}")
        tipos = [TYPE_ES.get(t["type"]["name"], t["type"]["name"]) for t in poke["types"]]
        while len(tipos) < 2:
            tipos.append(None)

        metodo = classify_method(chain_children, variety_name)

        stats = {STAT_ES[s["stat"]["name"]]: s["base_stat"] for s in poke["stats"] if s["stat"]["name"] in STAT_ES}

        # "Puede aprender" = por cualquier metodo (nivel, MT, tutor, huevo...) en cualquier
        # juego; no solo evolucion natural por nivel. Weavile, por ejemplo, aprende
        # Chuzos (Icicle Crash) por entrenamiento especial, no por nivel.
        movimientos = sorted({
            m["move"]["name"] for m in poke["moves"] if m["move"]["name"] in MOVE_SLUG_SET
        })

        nombre = base_name if region is None else f"{base_name} de {region[0]}"
        nombre_en = base_name_en if region is None else f"{REGIONAL_ADJ_EN[region[0]]} {base_name_en}"
        gen = generation if region is None else region[1]

        entries.append({
            "id": poke["id"],
            "numero_pokedex": species_id,
            "nombre": nombre,
            "nombre_en": nombre_en,
            "tipos": tipos[:2],
            "generacion": gen,
            "color": color,
            "forma": shape,
            "categoria": categoria,
            "fase": fase,
            "metodo": metodo,
            "altura": round(poke["height"] / 10, 2),
            "peso": round(poke["weight"] / 10, 2),
            "vida": stats.get("vida", 0),
            "ataque": stats.get("ataque", 0),
            "defensa": stats.get("defensa", 0),
            "ataque_especial": stats.get("ataque_especial", 0),
            "defensa_especial": stats.get("defensa_especial", 0),
            "velocidad": stats.get("velocidad", 0),
            "movimientos": movimientos,
        })
    return entries


def main():
    results = {}
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {pool.submit(fetch_species, i): i for i in range(1, TOTAL_SPECIES + 1)}
        done = 0
        for fut in as_completed(futures):
            species_id = futures[fut]
            try:
                entries = fut.result()
                results[species_id] = entries
            except Exception as e:
                print(f"ERROR species {species_id}: {e}")
            done += 1
            if done % 100 == 0:
                print(f"{done}/{TOTAL_SPECIES} especies procesadas...")

    all_entries = []
    for species_id in sorted(results.keys()):
        all_entries.extend(results[species_id])

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\nGuardado {len(all_entries)} entradas en {OUT_PATH}")


if __name__ == "__main__":
    main()
