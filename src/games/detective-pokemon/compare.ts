import type { PokemonEntry } from "../../data/pokedex";
import type { TypeId } from "../../data/types";

export type MatchLevel = "match" | "partial" | "none";
export type Direction = "up" | "down" | null;

export interface AttrResult {
  match: MatchLevel;
  direction?: Direction;
}

export type AttributeKey =
  | "tipo1"
  | "tipo2"
  | "generacion"
  | "fase"
  | "metodo"
  | "color"
  | "altura"
  | "peso";

export const ATTRIBUTE_ORDER: AttributeKey[] = [
  "tipo1",
  "tipo2",
  "generacion",
  "fase",
  "metodo",
  "color",
  "altura",
  "peso",
];

export interface GuessResult {
  pokemon: PokemonEntry;
  attrs: Record<AttributeKey, AttrResult>;
  isWin: boolean;
}

function compareTypeSlot(
  guessValue: TypeId | null,
  targetValue: TypeId | null,
  targetOther: TypeId | null,
): MatchLevel {
  if (guessValue === null) return targetValue === null ? "match" : "none";
  if (guessValue === targetValue) return "match";
  if (guessValue === targetOther) return "partial";
  return "none";
}

function compareExact<T>(guess: T, target: T): MatchLevel {
  return guess === target ? "match" : "none";
}

function compareNumeric(guess: number, target: number): AttrResult {
  if (guess === target) return { match: "match", direction: null };
  return { match: "none", direction: target > guess ? "up" : "down" };
}

export function compareGuess(guess: PokemonEntry, target: PokemonEntry): GuessResult {
  const attrs: Record<AttributeKey, AttrResult> = {
    tipo1: { match: compareTypeSlot(guess.tipos[0], target.tipos[0], target.tipos[1]) },
    tipo2: { match: compareTypeSlot(guess.tipos[1], target.tipos[1], target.tipos[0]) },
    generacion: compareNumeric(guess.generacion, target.generacion),
    fase: compareNumeric(guess.fase, target.fase),
    metodo: { match: compareExact(guess.metodo, target.metodo) },
    color: { match: compareExact(guess.color, target.color) },
    altura: compareNumeric(guess.altura, target.altura),
    peso: compareNumeric(guess.peso, target.peso),
  };

  return { pokemon: guess, attrs, isWin: guess.id === target.id };
}

export function shareGrid(
  results: GuessResult[],
  dateLabel: string,
  gameTitle: string,
  attemptsLabel: string,
): string {
  const EMOJI: Record<MatchLevel, string> = { match: "🟩", partial: "🟨", none: "⬛" };
  const lines = results.map((r) =>
    ATTRIBUTE_ORDER.map((k) => EMOJI[r.attrs[k].match]).join(""),
  );
  const attempts = results.length;
  return `Triviamon - ${gameTitle} (${dateLabel})\n${attemptsLabel}: ${attempts}\n${lines.join("\n")}`;
}
