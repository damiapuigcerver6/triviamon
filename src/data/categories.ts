import type { PokemonEntry } from "./pokedex";
import { metodoLabel } from "./pokedex";
import { TYPES, typeName, type TypeId } from "./types";
import { getMultiplier } from "./typeChart";
import { moveLabel, MOVE_LABELS } from "./moves";
import type { Lang } from "./language";

export interface Category {
  id: string;
  label: string;
  members: PokemonEntry[];
}

const MIN_POOL = 4;

function byName(pokedex: PokemonEntry[], names: string[]): PokemonEntry[] {
  const set = new Set(names);
  return pokedex.filter((p) => set.has(p.nombre));
}

// ---- Listas curadas (no derivables de los datos; se buscan por el nombre en espanol) ----

const INICIALES = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard",
  "Squirtle", "Wartortle", "Blastoise", "Chikorita", "Bayleef", "Meganium",
  "Cyndaquil", "Quilava", "Typhlosion", "Totodile", "Croconaw", "Feraligatr",
  "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken",
  "Mudkip", "Marshtomp", "Swampert", "Turtwig", "Grotle", "Torterra",
  "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon",
  "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar",
  "Oshawott", "Dewott", "Samurott", "Chespin", "Quilladin", "Chesnaught",
  "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja",
  "Rowlet", "Dartrix", "Decidueye", "Litten", "Torracat", "Incineroar",
  "Popplio", "Brionne", "Primarina", "Grookey", "Thwackey", "Rillaboom",
  "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon",
  "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge",
  "Quaxly", "Quaxwell", "Quaquaval",
];

const PSEUDOLEGENDARIOS = [
  "Dragonite", "Tyranitar", "Salamence", "Metagross",
  "Garchomp", "Hydreigon", "Goodra", "Kommo-o",
  "Dragapult", "Baxcalibur",
];

const EEVEELUTIONS = [
  "Vaporeon", "Jolteon", "Flareon", "Espeon",
  "Umbreon", "Leafeon", "Glaceon", "Sylveon",
];

const FOSILES = [
  "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl",
  "Lileep", "Cradily", "Anorith", "Armaldo",
  "Cranidos", "Rampardos", "Shieldon", "Bastiodon",
  "Tirtouga", "Carracosta", "Archen", "Archeops",
  "Tyrunt", "Tyrantrum", "Amaura", "Aurorus",
  "Dracozolt", "Arctozolt", "Dracovish", "Arctovish",
];

const ULTRA_ENTES = [
  "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela",
  "Kartana", "Guzzlord", "Poipole", "Naganadel", "Stakataka", "Blacephalon",
];

const TRIO_LEGENDARIO = [
  "Articuno", "Zapdos", "Moltres",
  "Articuno de Galar", "Zapdos de Galar", "Moltres de Galar",
  "Raikou", "Entei", "Suicune",
  "Uxie", "Mesprit", "Azelf",
  "Dialga", "Palkia", "Giratina",
  "Cobalion", "Terrakion", "Virizion", "Keldeo",
  "Tornadus", "Thundurus", "Landorus",
  "Reshiram", "Zekrom", "Kyurem",
  "Xerneas", "Yveltal", "Zygarde",
  "Solgaleo", "Lunala", "Necrozma",
  "Kyogre", "Groudon", "Rayquaza",
];

const DUO_LEGENDARIO = ["Latios", "Latias", "Zacian", "Zamazenta", "Koraidon", "Miraidon"];

// ---- Generadores de categorias ----

function tipoCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  return TYPES.map((t) => ({
    id: `tipo:${t.id}`,
    label: lang === "en" ? `Are ${typeName(t.id, lang)}-type` : `Son de tipo ${t.nombre}`,
    members: pokedex.filter((p) => p.tipos.includes(t.id)),
  })).filter((c) => c.members.length >= MIN_POOL);
}

function generacionCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const gens = Array.from(new Set(pokedex.map((p) => p.generacion))).sort((a, b) => a - b);
  return gens
    .map((g) => ({
      id: `gen:${g}`,
      label:
        lang === "en" ? `Appeared in Generation ${g}` : `Aparecieron en la Generación ${g}`,
      members: pokedex.filter((p) => p.generacion === g),
    }))
    .filter((c) => c.members.length >= MIN_POOL);
}

function categoriaEspecialCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  return [
    {
      id: "cat:legendario",
      label: lang === "en" ? "Are Legendary Pokémon" : "Son Pokémon legendarios",
      members: pokedex.filter((p) => p.categoria === "legendario"),
    },
    {
      id: "cat:mitico",
      label: lang === "en" ? "Are Mythical Pokémon" : "Son Pokémon míticos",
      members: pokedex.filter((p) => p.categoria === "mitico"),
    },
    {
      id: "cat:pseudo",
      label: lang === "en" ? "Are Pseudo-legendary Pokémon" : "Son Pokémon pseudolegendarios",
      members: byName(pokedex, PSEUDOLEGENDARIOS),
    },
  ].filter((c) => c.members.length >= MIN_POOL);
}

function faseCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const LABEL_ES: Record<number, string> = {
    1: "Son la 1ª etapa evolutiva",
    2: "Son la 2ª etapa evolutiva",
    3: "Son la 3ª etapa evolutiva",
  };
  const LABEL_EN: Record<number, string> = {
    1: "Are the 1st evolutionary stage",
    2: "Are the 2nd evolutionary stage",
    3: "Are the 3rd evolutionary stage",
  };
  const LABEL = lang === "en" ? LABEL_EN : LABEL_ES;
  return [1, 2, 3]
    .map((f) => ({
      id: `fase:${f}`,
      label: LABEL[f],
      members: pokedex.filter((p) => p.fase === f),
    }))
    .filter((c) => c.members.length >= MIN_POOL);
}

const METODO_LABELS: Record<string, string> = {
  Amistad: "Evolucionan por amistad",
  Intercambio: "Evolucionan por intercambio",
  Objeto: "Evolucionan con un objeto especial",
  Especial: "Evolucionan de una forma especial",
};

const METODO_LABELS_EN: Record<string, string> = {
  Amistad: "Evolve via friendship",
  Intercambio: "Evolve via trade",
  Objeto: "Evolve with a special item",
  Especial: "Evolve in a special way",
};

function metodoCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const groups = new Map<string, PokemonEntry[]>();
  for (const p of pokedex) {
    if (p.metodo === "Nivel" || p.metodo === "—") continue;
    const key = p.metodo === "Amistad y nivel" ? "Amistad" : p.metodo;
    const bucket = groups.get(key);
    if (bucket) bucket.push(p);
    else groups.set(key, [p]);
  }
  const out: Category[] = [];
  for (const [key, members] of groups) {
    if (members.length < MIN_POOL) continue;
    const label =
      lang === "en"
        ? (METODO_LABELS_EN[key] ?? `Evolve with ${metodoLabel(key, "en")}`)
        : (METODO_LABELS[key] ?? `Evolucionan con ${key}`);
    out.push({ id: `metodo:${key}`, label, members });
  }
  return out;
}

function curatedCategory(
  pokedex: PokemonEntry[],
  id: string,
  label: string,
  names: string[],
): Category[] {
  const members = byName(pokedex, names);
  return members.length >= MIN_POOL ? [{ id, label, members }] : [];
}

function combinedMultiplier(atk: TypeId, tipos: PokemonEntry["tipos"]): number {
  let m = 1;
  for (const t of tipos) {
    if (t) m *= getMultiplier(atk, t);
  }
  return m;
}

function debilidadesCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const out: Category[] = [];
  for (const t of TYPES) {
    const buckets: Record<number, PokemonEntry[]> = { 0: [], 2: [], 4: [] };
    for (const p of pokedex) {
      const m = combinedMultiplier(t.id, p.tipos);
      if (m in buckets) buckets[m].push(p);
    }
    const name = typeName(t.id, lang);
    if (buckets[2].length >= MIN_POOL) {
      out.push({
        id: `x2:${t.id}`,
        label: lang === "en" ? `Take x2 damage from ${name}` : `Reciben daño x2 de ${t.nombre}`,
        members: buckets[2],
      });
    }
    if (buckets[4].length >= MIN_POOL) {
      out.push({
        id: `x4:${t.id}`,
        label: lang === "en" ? `Take x4 damage from ${name}` : `Reciben daño x4 de ${t.nombre}`,
        members: buckets[4],
      });
    }
    if (buckets[0].length >= MIN_POOL) {
      out.push({
        id: `x0:${t.id}`,
        label: lang === "en" ? `Are immune to ${name}` : `Son inmunes a ${t.nombre}`,
        members: buckets[0],
      });
    }
  }
  return out;
}

export function buildAllCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const curated: [string, string, string, string[]][] = [
    ["iniciales", "Son Pokémon iniciales", "Are starter Pokémon", INICIALES],
    ["eevee", "Son evoluciones de Eevee", "Are Eeveelutions", EEVEELUTIONS],
    ["fosiles", "Son Pokémon fósil", "Are Fossil Pokémon", FOSILES],
    ["ultraentes", "Son Ultra Entes", "Are Ultra Beasts", ULTRA_ENTES],
    ["trio", "Forman parte de un trío legendario", "Are part of a legendary trio", TRIO_LEGENDARIO],
    ["duo", "Forman parte de un dúo legendario", "Are part of a legendary duo", DUO_LEGENDARIO],
  ];
  return [
    ...tipoCategories(pokedex, lang),
    ...generacionCategories(pokedex, lang),
    ...categoriaEspecialCategories(pokedex, lang),
    ...faseCategories(pokedex, lang),
    ...metodoCategories(pokedex, lang),
    ...curated.flatMap(([id, es, en, names]) =>
      curatedCategory(pokedex, id, lang === "en" ? en : es, names),
    ),
    ...debilidadesCategories(pokedex, lang),
  ];
}

// Movimientos que aprende casi cualquier Pokemon (p.ej. Toxico) no discriminan nada
// y hacen la categoria aburrida, asi que se descartan por arriba ademas de por abajo.
const MOVE_MAX_POOL = 400;

function movimientoCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  const out: Category[] = [];
  for (const slug of Object.keys(MOVE_LABELS)) {
    const members = pokedex.filter((p) => p.movimientos.includes(slug));
    if (members.length >= MIN_POOL && members.length <= MOVE_MAX_POOL) {
      const label = lang === "en" ? `Can learn ${moveLabel(slug, lang)}` : `Pueden aprender ${moveLabel(slug, lang)}`;
      out.push({ id: `mov:${slug}`, label, members });
    }
  }
  return out;
}

/** Categorias de movimientos, separadas de buildAllCategories para no afectar a Conexiones. */
export function buildMoveCategories(pokedex: PokemonEntry[], lang: Lang): Category[] {
  return movimientoCategories(pokedex, lang);
}
