import type { PokemonEntry } from "../../data/pokedex";
import { mulberry32 } from "../../data/rng";
import { STAT_KEYS, statValue, type StatKey } from "../higher-lower/stats";

export const PYRAMID_ROWS = [1, 2, 3, 5];
export const PYRAMID_SIZE = PYRAMID_ROWS.reduce((a, b) => a + b, 0); // 11

export interface PyramidPuzzle {
  statKey: StatKey;
  /** Orden de presentacion en el banco de fichas (barajado, sin pistas). */
  displayIds: number[];
  /** Ids en el orden correcto: indice 0 = mejor (arriba del todo), ultimo = peor (abajo a la derecha). */
  correctOrder: number[];
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildPyramid(pokedex: PokemonEntry[], seed: number): PyramidPuzzle {
  const rng = mulberry32(seed);
  const statKey = STAT_KEYS[Math.floor(rng() * STAT_KEYS.length)];

  const pool = shuffle(
    pokedex.filter((p) => p.id < 10000),
    rng,
  );

  // Se descartan valores repetidos para que el orden correcto sea siempre unico
  // (si dos Pokemon empatasen en la estadistica, cualquiera de los dos ordenes
  // seria valido y el tablero no podria marcar con certeza acierto/fallo).
  const usedValues = new Set<number>();
  const chosen: PokemonEntry[] = [];
  for (const p of pool) {
    const value = statValue(p, statKey);
    if (usedValues.has(value)) continue;
    usedValues.add(value);
    chosen.push(p);
    if (chosen.length === PYRAMID_SIZE) break;
  }

  const displayIds = chosen.map((p) => p.id);
  const correctOrder = [...chosen].sort((a, b) => statValue(b, statKey) - statValue(a, statKey)).map((p) => p.id);

  return { statKey, displayIds, correctOrder };
}
