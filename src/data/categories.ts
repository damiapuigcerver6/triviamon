import type { PokemonEntry } from "./pokedex";
import { TYPES, type TypeId } from "./types";
import { getMultiplier } from "./typeChart";
import { MOVE_LABELS } from "./moves";

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

// ---- Listas curadas (no derivables de los datos) ----

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

function tipoCategories(pokedex: PokemonEntry[]): Category[] {
  return TYPES.map((t) => ({
    id: `tipo:${t.id}`,
    label: `Son de tipo ${t.nombre}`,
    members: pokedex.filter((p) => p.tipos.includes(t.id)),
  })).filter((c) => c.members.length >= MIN_POOL);
}

function generacionCategories(pokedex: PokemonEntry[]): Category[] {
  const gens = Array.from(new Set(pokedex.map((p) => p.generacion))).sort((a, b) => a - b);
  return gens
    .map((g) => ({
      id: `gen:${g}`,
      label: `Aparecieron en la Generación ${g}`,
      members: pokedex.filter((p) => p.generacion === g),
    }))
    .filter((c) => c.members.length >= MIN_POOL);
}

function categoriaEspecialCategories(pokedex: PokemonEntry[]): Category[] {
  return [
    {
      id: "cat:legendario",
      label: "Son Pokémon legendarios",
      members: pokedex.filter((p) => p.categoria === "legendario"),
    },
    {
      id: "cat:mitico",
      label: "Son Pokémon míticos",
      members: pokedex.filter((p) => p.categoria === "mitico"),
    },
    {
      id: "cat:pseudo",
      label: "Son Pokémon pseudolegendarios",
      members: byName(pokedex, PSEUDOLEGENDARIOS),
    },
  ].filter((c) => c.members.length >= MIN_POOL);
}

function faseCategories(pokedex: PokemonEntry[]): Category[] {
  const LABEL: Record<number, string> = {
    1: "Son la 1ª etapa evolutiva",
    2: "Son la 2ª etapa evolutiva",
    3: "Son la 3ª etapa evolutiva",
  };
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

function metodoCategories(pokedex: PokemonEntry[]): Category[] {
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
    const label = METODO_LABELS[key] ?? `Evolucionan con ${key}`;
    out.push({ id: `metodo:${key}`, label, members });
  }
  return out;
}

function curatedCategory(pokedex: PokemonEntry[], id: string, label: string, names: string[]): Category[] {
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

function debilidadesCategories(pokedex: PokemonEntry[]): Category[] {
  const out: Category[] = [];
  for (const t of TYPES) {
    const buckets: Record<number, PokemonEntry[]> = { 0: [], 2: [], 4: [] };
    for (const p of pokedex) {
      const m = combinedMultiplier(t.id, p.tipos);
      if (m in buckets) buckets[m].push(p);
    }
    if (buckets[2].length >= MIN_POOL) {
      out.push({ id: `x2:${t.id}`, label: `Reciben daño x2 de ${t.nombre}`, members: buckets[2] });
    }
    if (buckets[4].length >= MIN_POOL) {
      out.push({ id: `x4:${t.id}`, label: `Reciben daño x4 de ${t.nombre}`, members: buckets[4] });
    }
    if (buckets[0].length >= MIN_POOL) {
      out.push({ id: `x0:${t.id}`, label: `Son inmunes a ${t.nombre}`, members: buckets[0] });
    }
  }
  return out;
}

export function buildAllCategories(pokedex: PokemonEntry[]): Category[] {
  return [
    ...tipoCategories(pokedex),
    ...generacionCategories(pokedex),
    ...categoriaEspecialCategories(pokedex),
    ...faseCategories(pokedex),
    ...metodoCategories(pokedex),
    ...curatedCategory(pokedex, "iniciales", "Son Pokémon iniciales", INICIALES),
    ...curatedCategory(pokedex, "eevee", "Son evoluciones de Eevee", EEVEELUTIONS),
    ...curatedCategory(pokedex, "fosiles", "Son Pokémon fósil", FOSILES),
    ...curatedCategory(pokedex, "ultraentes", "Son Ultra Entes", ULTRA_ENTES),
    ...curatedCategory(pokedex, "trio", "Forman parte de un trío legendario", TRIO_LEGENDARIO),
    ...curatedCategory(pokedex, "duo", "Forman parte de un dúo legendario", DUO_LEGENDARIO),
    ...debilidadesCategories(pokedex),
  ];
}

// Movimientos que aprende casi cualquier Pokemon (p.ej. Toxico) no discriminan nada
// y hacen la categoria aburrida, asi que se descartan por arriba ademas de por abajo.
const MOVE_MAX_POOL = 400;

function movimientoCategories(pokedex: PokemonEntry[]): Category[] {
  const out: Category[] = [];
  for (const [slug, label] of Object.entries(MOVE_LABELS)) {
    const members = pokedex.filter((p) => p.movimientos.includes(slug));
    if (members.length >= MIN_POOL && members.length <= MOVE_MAX_POOL) {
      out.push({ id: `mov:${slug}`, label: `Pueden aprender ${label}`, members });
    }
  }
  return out;
}

/** Categorias de movimientos, separadas de buildAllCategories para no afectar a Conexiones. */
export function buildMoveCategories(pokedex: PokemonEntry[]): Category[] {
  return movimientoCategories(pokedex);
}
