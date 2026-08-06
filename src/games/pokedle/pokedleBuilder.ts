import type { PokemonEntry } from "../../data/pokedex";
import { mulberry32 } from "../../data/rng";

export const MAX_ATTEMPTS = 6;

/** Formas regionales (Alola, Galar, Hisui, Paldea...) usan ids >= 10000; se excluyen
 * del objetivo para que el nombre a adivinar sea siempre una sola especie base. */
export function baseSpecies(pokedex: PokemonEntry[]): PokemonEntry[] {
  return pokedex.filter((p) => p.id < 10000);
}

export function pickAnswer(pokedex: PokemonEntry[], seed: number): PokemonEntry {
  const pool = baseSpecies(pokedex);
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * pool.length);
  return pool[idx];
}
