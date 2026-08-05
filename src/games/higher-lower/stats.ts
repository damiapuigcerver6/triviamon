import type { PokemonEntry } from "../../data/pokedex";

export type StatKey =
  | "vida"
  | "ataque"
  | "defensa"
  | "ataque_especial"
  | "defensa_especial"
  | "velocidad"
  | "numero_pokedex";

export const STAT_OPTIONS: { key: StatKey; label: string }[] = [
  { key: "vida", label: "Vida" },
  { key: "ataque", label: "Ataque" },
  { key: "defensa", label: "Defensa" },
  { key: "ataque_especial", label: "Ataque especial" },
  { key: "defensa_especial", label: "Defensa especial" },
  { key: "velocidad", label: "Velocidad" },
  { key: "numero_pokedex", label: "Número de Pokédex" },
];

export function statLabel(key: StatKey): string {
  return STAT_OPTIONS.find((s) => s.key === key)?.label ?? key;
}

export function statValue(p: PokemonEntry, key: StatKey): number {
  return p[key];
}

const BEST_PREFIX = "triviamon:hl:best:";

export function loadBestStreak(key: StatKey): number {
  return Number(localStorage.getItem(BEST_PREFIX + key)) || 0;
}

export function saveBestStreakIfHigher(key: StatKey, streak: number): number {
  const current = loadBestStreak(key);
  if (streak > current) {
    localStorage.setItem(BEST_PREFIX + key, String(streak));
    return streak;
  }
  return current;
}
