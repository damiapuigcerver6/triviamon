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
  color: string;
}

// Orden clasico de la Pokedex nacional para los tipos (aprox. orden de introduccion)
export const TYPES: TypeInfo[] = [
  { id: "normal", nombre: "Normal", color: "#a8a878" },
  { id: "fuego", nombre: "Fuego", color: "#f08030" },
  { id: "agua", nombre: "Agua", color: "#6890f0" },
  { id: "electrico", nombre: "Eléctrico", color: "#f8d030" },
  { id: "planta", nombre: "Planta", color: "#78c850" },
  { id: "hielo", nombre: "Hielo", color: "#98d8d8" },
  { id: "lucha", nombre: "Lucha", color: "#c03028" },
  { id: "veneno", nombre: "Veneno", color: "#a040a0" },
  { id: "tierra", nombre: "Tierra", color: "#e0c068" },
  { id: "volador", nombre: "Volador", color: "#a890f0" },
  { id: "psiquico", nombre: "Psíquico", color: "#f85888" },
  { id: "bicho", nombre: "Bicho", color: "#a8b820" },
  { id: "roca", nombre: "Roca", color: "#b8a038" },
  { id: "fantasma", nombre: "Fantasma", color: "#705898" },
  { id: "dragon", nombre: "Dragón", color: "#7038f8" },
  { id: "siniestro", nombre: "Siniestro", color: "#705848" },
  { id: "acero", nombre: "Acero", color: "#b8b8d0" },
  { id: "hada", nombre: "Hada", color: "#ee99ac" },
];

export const TYPE_IDS: TypeId[] = TYPES.map((t) => t.id);

export function typeIcon(id: TypeId): string {
  return `/tipos/icons/${id}.svg`;
}

export function typeBadge(id: TypeId): string {
  return `/tipos/badges/${id}.png`;
}
