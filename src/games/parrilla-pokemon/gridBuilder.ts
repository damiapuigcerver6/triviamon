import type { PokemonEntry } from "../../data/pokedex";
import { mulberry32 } from "../../data/rng";
import { buildAllCategories, buildMoveCategories, type Category } from "../../data/categories";

export interface GridPuzzle {
  rows: Category[];
  cols: Category[];
  /** cellCandidates[r][c] = Pokemon que cumplen rows[r] Y cols[c]. */
  cellCandidates: PokemonEntry[][][];
}

export interface GridInstance {
  puzzle: GridPuzzle;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function intersect(a: PokemonEntry[], b: PokemonEntry[]): PokemonEntry[] {
  const bIds = new Set(b.map((p) => p.id));
  return a.filter((p) => bIds.has(p.id));
}

// Familias de categorias mutuamente excluyentes: un Pokemon solo puede tener UN valor
// de generacion/fase/metodo/categoria especial, asi que combinar dos de la misma familia
// como fila+columna siempre da una interseccion vacia. Se evita para no desperdiciar intentos.
function familyOf(id: string): string {
  return id.split(":")[0];
}
const EXCLUSIVE_FAMILIES = new Set(["gen", "fase", "cat", "metodo"]);

function pickCategoryCombo(allCategories: Category[], rng: () => number): Category[] | null {
  const shuffled = shuffle(allCategories, rng);
  const chosen: Category[] = [];
  const usedFamilies = new Set<string>();
  for (const cat of shuffled) {
    const fam = familyOf(cat.id);
    if (EXCLUSIVE_FAMILIES.has(fam) && usedFamilies.has(fam)) continue;
    chosen.push(cat);
    if (EXCLUSIVE_FAMILIES.has(fam)) usedFamilies.add(fam);
    if (chosen.length === 6) break;
  }
  return chosen.length === 6 ? chosen : null;
}

/** Busca si existe una asignacion de 9 Pokemon distintos, uno por celda (backtracking). */
function hasPerfectAssignment(cellCandidates: PokemonEntry[][]): boolean {
  const order = cellCandidates
    .map((_, i) => i)
    .sort((a, b) => cellCandidates[a].length - cellCandidates[b].length);
  const used = new Set<number>();

  function backtrack(pos: number): boolean {
    if (pos === order.length) return true;
    const cellIdx = order[pos];
    for (const p of cellCandidates[cellIdx]) {
      if (used.has(p.id)) continue;
      used.add(p.id);
      if (backtrack(pos + 1)) return true;
      used.delete(p.id);
    }
    return false;
  }

  return backtrack(0);
}

const MAX_ATTEMPTS = 1500;

export function buildGridPuzzle(pokedex: PokemonEntry[], rng: () => number): GridPuzzle {
  const allCategories = [...buildAllCategories(pokedex), ...buildMoveCategories(pokedex)];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const combo = pickCategoryCombo(allCategories, rng);
    if (!combo) continue;
    const rows = combo.slice(0, 3);
    const cols = combo.slice(3, 6);

    const cellCandidates = rows.map((r) => cols.map((c) => intersect(r.members, c.members)));

    const hasEmptyCell = cellCandidates.some((row) => row.some((cell) => cell.length === 0));
    if (hasEmptyCell) continue;

    if (!hasPerfectAssignment(cellCandidates.flat())) continue;

    return { rows, cols, cellCandidates };
  }

  throw new Error("No se pudo generar una parrilla valida");
}

export function buildGridInstance(pokedex: PokemonEntry[], seed: number): GridInstance {
  const rng = mulberry32(seed);
  const puzzle = buildGridPuzzle(pokedex, rng);
  return { puzzle };
}

export function cellCandidateIds(puzzle: GridPuzzle, row: number, col: number): Set<number> {
  return new Set(puzzle.cellCandidates[row][col].map((p) => p.id));
}

/** Un ejemplo valido para revelar una celda vacia al rendirse. */
export function exampleAnswer(
  puzzle: GridPuzzle,
  row: number,
  col: number,
  usedIds: Set<number>,
): PokemonEntry | null {
  const candidates = puzzle.cellCandidates[row][col];
  return candidates.find((p) => !usedIds.has(p.id)) ?? candidates[0] ?? null;
}
