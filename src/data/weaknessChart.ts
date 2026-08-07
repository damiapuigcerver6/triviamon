import type { PokemonEntry } from "./pokedex";
import { TYPE_IDS, type TypeId } from "./types";
import { getMultiplier } from "./typeChart";
import { ABILITY_EFFECTS, applyAbilityEffect, findEffectAbility } from "./abilityEffects";

export interface WeaknessGroup {
  multiplicador: number;
  tipos: TypeId[];
}

/** Multiplicador final que recibe `pokemon` al ser atacado por cada uno de los 18 tipos,
 * teniendo en cuenta su(s) tipo(s) y, si la tiene, una habilidad con efecto conocido. */
export function computeWeaknessChart(pokemon: PokemonEntry): { tipo: TypeId; multiplicador: number }[] {
  const tiposDefensor = pokemon.tipos.filter((t): t is TypeId => !!t);
  const abilitySlug = findEffectAbility(pokemon.habilidades ?? []);
  const effect = abilitySlug ? ABILITY_EFFECTS[abilitySlug] : null;

  return TYPE_IDS.map((atacante) => {
    let mult = 1;
    for (const def of tiposDefensor) mult *= getMultiplier(atacante, def);
    if (effect) mult = applyAbilityEffect(mult, atacante, effect);
    return { tipo: atacante, multiplicador: mult };
  });
}

/** Agrupa por multiplicador, de mayor (mas debil) a menor (mas resistente/inmune). */
export function groupWeaknessChart(pokemon: PokemonEntry): WeaknessGroup[] {
  const chart = computeWeaknessChart(pokemon);
  const buckets = new Map<number, TypeId[]>();
  for (const { tipo, multiplicador } of chart) {
    const arr = buckets.get(multiplicador) ?? [];
    arr.push(tipo);
    buckets.set(multiplicador, arr);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([multiplicador, tipos]) => ({ multiplicador, tipos }));
}

