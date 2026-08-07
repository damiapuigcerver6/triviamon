import type { TypeId } from "./types";

export type AbilityEffect =
  | { kind: "inmune"; tipo: TypeId }
  | { kind: "reduce"; tipos: TypeId[] } // x0.5 adicional sobre el multiplicador base
  | { kind: "duplica"; tipos: TypeId[] } // x2 adicional sobre el multiplicador base
  | { kind: "guardia-maravilla" }; // solo impactan los tipos ya superefectivos (>1x)

// Solo se incluyen habilidades cuyo efecto en la tabla de tipos es fijo y bien conocido
// (inmunidades, resistencias/debilidades extra). Habilidades con efectos condicionales
// (clima, contacto, objetos...) se dejan fuera para no dar pistas incorrectas.
export const ABILITY_EFFECTS: Record<string, AbilityEffect> = {
  levitate: { kind: "inmune", tipo: "tierra" },
  "flash-fire": { kind: "inmune", tipo: "fuego" },
  "water-absorb": { kind: "inmune", tipo: "agua" },
  "storm-drain": { kind: "inmune", tipo: "agua" },
  "dry-skin": { kind: "inmune", tipo: "agua" },
  "volt-absorb": { kind: "inmune", tipo: "electrico" },
  "motor-drive": { kind: "inmune", tipo: "electrico" },
  "lightning-rod": { kind: "inmune", tipo: "electrico" },
  "sap-sipper": { kind: "inmune", tipo: "planta" },
  "well-baked-body": { kind: "inmune", tipo: "fuego" },
  "purifying-salt": { kind: "reduce", tipos: ["fantasma"] },
  "thick-fat": { kind: "reduce", tipos: ["fuego", "hielo"] },
  heatproof: { kind: "reduce", tipos: ["fuego"] },
  fluffy: { kind: "duplica", tipos: ["fuego"] },
  "wonder-guard": { kind: "guardia-maravilla" },
};

// De entre las habilidades posibles de un Pokemon, se usa la primera con efecto
// conocido (si tiene varias, casi ninguna combinacion real mezcla dos efectos
// relevantes); si ninguna tiene efecto, la tabla de tipos no se modifica.
export function findEffectAbility(habilidades: string[]): string | null {
  return habilidades.find((h) => h in ABILITY_EFFECTS) ?? null;
}

export function applyAbilityEffect(base: number, tipo: TypeId, effect: AbilityEffect): number {
  switch (effect.kind) {
    case "inmune":
      return tipo === effect.tipo ? 0 : base;
    case "reduce":
      return effect.tipos.includes(tipo) ? base * 0.5 : base;
    case "duplica":
      return effect.tipos.includes(tipo) ? base * 2 : base;
    case "guardia-maravilla":
      return base > 1 ? base : 0;
  }
}
