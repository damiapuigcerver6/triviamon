import type { PokemonEntry } from "../../data/pokedex";
import { mulberry32 } from "../../data/rng";
import { buildAllCategories, type Category } from "../../data/categories";
import type { Lang } from "../../data/language";

export type { Category };
export { buildAllCategories };

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

export function buildPuzzle(
  pokedex: PokemonEntry[],
  rng: () => number,
  lang: Lang,
): ConnectionsPuzzle {
  const allCategories = buildAllCategories(pokedex, lang);
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

/** Misma semilla -> mismo puzzle y mismo orden de cuadricula siempre (permite reto diario y persistencia).
 *  El idioma solo cambia las etiquetas mostradas, no que Pokemon salen ni el orden. */
export function buildInstance(pokedex: PokemonEntry[], seed: number, lang: Lang): ConnectionsInstance {
  const rng = mulberry32(seed);
  const puzzle = buildPuzzle(pokedex, rng, lang);
  const allIds = puzzle.groups.flatMap((g) => g.members.map((p) => p.id));
  const cardOrder = pickN(allIds, allIds.length, rng);
  return { puzzle, cardOrder };
}

export const GROUP_COLORS = ["amarillo", "verde", "azul", "rojo"] as const;
export const GROUP_EMOJI = ["🟨", "🟩", "🟦", "🟥"];

export function categoryColorIndex(puzzle: ConnectionsPuzzle, categoryId: string): number {
  return puzzle.groups.findIndex((g) => g.category.id === categoryId);
}
