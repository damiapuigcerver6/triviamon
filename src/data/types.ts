import type { Lang } from "./language";

export type TypeId =
  | "acero"
  | "agua"
  | "bicho"
  | "dragon"
  | "electrico"
  | "fantasma"
  | "fuego"
  | "hada"
  | "hielo"
  | "lucha"
  | "normal"
  | "planta"
  | "psiquico"
  | "roca"
  | "siniestro"
  | "tierra"
  | "veneno"
  | "volador";

export interface TypeInfo {
  id: TypeId;
  nombre: string;
  nombre_en: string;
  color: string;
}

// Orden clasico de la Pokedex nacional para los tipos (aprox. orden de introduccion)
export const TYPES: TypeInfo[] = [
  { id: "normal", nombre: "Normal", nombre_en: "Normal", color: "#a8a878" },
  { id: "fuego", nombre: "Fuego", nombre_en: "Fire", color: "#f08030" },
  { id: "agua", nombre: "Agua", nombre_en: "Water", color: "#6890f0" },
  { id: "electrico", nombre: "Eléctrico", nombre_en: "Electric", color: "#f8d030" },
  { id: "planta", nombre: "Planta", nombre_en: "Grass", color: "#78c850" },
  { id: "hielo", nombre: "Hielo", nombre_en: "Ice", color: "#98d8d8" },
  { id: "lucha", nombre: "Lucha", nombre_en: "Fighting", color: "#c03028" },
  { id: "veneno", nombre: "Veneno", nombre_en: "Poison", color: "#a040a0" },
  { id: "tierra", nombre: "Tierra", nombre_en: "Ground", color: "#e0c068" },
  { id: "volador", nombre: "Volador", nombre_en: "Flying", color: "#a890f0" },
  { id: "psiquico", nombre: "Psíquico", nombre_en: "Psychic", color: "#f85888" },
  { id: "bicho", nombre: "Bicho", nombre_en: "Bug", color: "#a8b820" },
  { id: "roca", nombre: "Roca", nombre_en: "Rock", color: "#b8a038" },
  { id: "fantasma", nombre: "Fantasma", nombre_en: "Ghost", color: "#705898" },
  { id: "dragon", nombre: "Dragón", nombre_en: "Dragon", color: "#7038f8" },
  { id: "siniestro", nombre: "Siniestro", nombre_en: "Dark", color: "#705848" },
  { id: "acero", nombre: "Acero", nombre_en: "Steel", color: "#b8b8d0" },
  { id: "hada", nombre: "Hada", nombre_en: "Fairy", color: "#ee99ac" },
];

export const TYPE_IDS: TypeId[] = TYPES.map((t) => t.id);

export function typeName(id: TypeId, lang: Lang): string {
  const t = TYPES.find((t) => t.id === id);
  if (!t) return id;
  return lang === "en" ? t.nombre_en : t.nombre;
}

export function typeIcon(id: TypeId): string {
  return `/tipos/icons/${id}.svg`;
}

export function typeBadge(id: TypeId, lang: Lang): string {
  return lang === "en" ? `/tipos/badges-en/${id}.png` : `/tipos/badges/${id}.png`;
}

export function randomTypeIcon(): string {
  const id = TYPE_IDS[Math.floor(Math.random() * TYPE_IDS.length)];
  return typeIcon(id);
}
