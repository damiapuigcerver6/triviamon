import type { TypeId } from "./types";
import type { Lang } from "./language";

export type MoveCategory = "fisico" | "especial" | "estado";

export interface MoveMeta {
  nombre: string;
  nombre_en: string;
  tipo: TypeId;
  categoria: MoveCategory;
}

let cache: Record<string, MoveMeta> | null = null;
let inflight: Promise<Record<string, MoveMeta>> | null = null;

export function loadMoveMeta(): Promise<Record<string, MoveMeta>> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch("/data/moves.json")
    .then((r) => r.json())
    .then((data: Record<string, MoveMeta>) => {
      cache = data;
      return data;
    });
  return inflight;
}

export function moveMetaName(meta: MoveMeta, lang: Lang): string {
  return lang === "en" ? meta.nombre_en : meta.nombre;
}

export function categoryIcon(categoria: MoveCategory): string {
  return `/tipos/categorias/${categoria}.png`;
}
