import type { PokemonEntry } from "../../data/pokedex";
import type { Strings } from "../../i18n/strings";

export type StatKey =
  | "vida"
  | "ataque"
  | "defensa"
  | "ataque_especial"
  | "defensa_especial"
  | "velocidad"
  | "numero_pokedex"
  | "bst_total";

export const STAT_KEYS: StatKey[] = [
  "vida",
  "ataque",
  "defensa",
  "ataque_especial",
  "defensa_especial",
  "velocidad",
  "numero_pokedex",
  "bst_total",
];

export function statOptions(t: Strings): { key: StatKey; label: string }[] {
  return [
    { key: "vida", label: t.mayorMenor.statHp },
    { key: "ataque", label: t.mayorMenor.statAttack },
    { key: "defensa", label: t.mayorMenor.statDefense },
    { key: "ataque_especial", label: t.mayorMenor.statSpAttack },
    { key: "defensa_especial", label: t.mayorMenor.statSpDefense },
    { key: "velocidad", label: t.mayorMenor.statSpeed },
    { key: "numero_pokedex", label: t.mayorMenor.statPokedexNumber },
    { key: "bst_total", label: t.mayorMenor.statBstTotal },
  ];
}

export function statLabel(key: StatKey, t: Strings): string {
  return statOptions(t).find((s) => s.key === key)?.label ?? key;
}

export function statValue(p: PokemonEntry, key: StatKey): number {
  if (key === "bst_total") {
    return p.vida + p.ataque + p.defensa + p.ataque_especial + p.defensa_especial + p.velocidad;
  }
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
