import type { PokemonEntry } from "../../data/pokedex";
import { TYPES, type TypeId } from "../../data/types";
import { getMultiplier } from "../../data/typeChart";
import { mulberry32 } from "../../data/rng";

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

// ---- Generacion de puzzles ----

export interface ConnectionsGroup {
  category: Category;
  members: PokemonEntry[];
}

export interface ConnectionsPuzzle {
  groups: ConnectionsGroup[];
}

function pickN<T>(pool: T[], n: number, rng: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function buildPuzzle(pokedex: PokemonEntry[], rng: () => number): ConnectionsPuzzle {
  const allCategories = buildAllCategories(pokedex);
  for (let attempt = 0; attempt < 300; attempt++) {
    const order = pickN(allCategories, allCategories.length, rng);
    const used = new Set<number>();
    const groups: ConnectionsGroup[] = [];
    for (const cat of order) {
      if (groups.length === 4) break;
      const available = cat.members.filter((p) => !used.has(p.id));
      if (available.length < 4) continue;
      const chosen = pickN(available, 4, rng);
      chosen.forEach((p) => used.add(p.id));
      groups.push({ category: cat, members: chosen });
    }
    if (groups.length === 4) return { groups };
  }
  throw new Error("No se pudo generar un puzzle de conexiones");
}

export interface ConnectionsInstance {
  puzzle: ConnectionsPuzzle;
  /** ids de Pokemon en el orden en que se muestran en la cuadricula. */
  cardOrder: number[];
}

/** Misma semilla -> mismo puzzle y mismo orden de cuadricula siempre (permite reto diario y persistencia). */
export function buildInstance(pokedex: PokemonEntry[], seed: number): ConnectionsInstance {
  const rng = mulberry32(seed);
  const puzzle = buildPuzzle(pokedex, rng);
  const allIds = puzzle.groups.flatMap((g) => g.members.map((p) => p.id));
  const cardOrder = pickN(allIds, allIds.length, rng);
  return { puzzle, cardOrder };
}

export const GROUP_COLORS = ["amarillo", "verde", "azul", "morado"] as const;
export const GROUP_EMOJI = ["🟨", "🟩", "🟦", "🟪"];

export function categoryColorIndex(puzzle: ConnectionsPuzzle, categoryId: string): number {
  return puzzle.groups.findIndex((g) => g.category.id === categoryId);
}
