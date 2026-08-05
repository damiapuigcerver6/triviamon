import type { TypeId } from "./types";

export interface PokemonEntry {
  id: number;
  numero_pokedex: number; // numero de la Pokedex nacional (compartido entre formas de la misma especie)
  nombre: string;
  tipos: [TypeId, TypeId | null];
  generacion: number;
  color: string;
  forma: string;
  categoria: "normal" | "legendario" | "mitico";
  fase: number; // 1 = forma base, 2 = intermedia, 3 = final
  metodo: string; // como evoluciona HACIA este Pokemon ("—" si es la forma base)
  altura: number; // metros
  peso: number; // kg
  vida: number;
  ataque: number;
  defensa: number;
  ataque_especial: number;
  defensa_especial: number;
  velocidad: number;
}

let cache: PokemonEntry[] | null = null;
let inflight: Promise<PokemonEntry[]> | null = null;

export function loadPokedex(): Promise<PokemonEntry[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch("/data/pokemon.json")
    .then((r) => r.json())
    .then((data: PokemonEntry[]) => {
      cache = data;
      return data;
    });
  return inflight;
}

export function pokemonSprite(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const CATEGORIA_LABEL: Record<PokemonEntry["categoria"], string> = {
  normal: "Normal",
  legendario: "Legendario",
  mitico: "Mítico",
};

export function categoriaLabel(c: PokemonEntry["categoria"]): string {
  return CATEGORIA_LABEL[c];
}

// Fecha estable en horario local, formato YYYY-MM-DD, para el reto diario.
export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function dailyIndex(list: PokemonEntry[], dateKey: string): number {
  return hashString(dateKey) % list.length;
}

// Contador de dias desde el lanzamiento. No se muestra en la web (de momento);
// se mantiene por si mas adelante se usa para rachas/estadisticas.
// Ajustar EPOCH al dia real de lanzamiento cuando se publique la web.
const EPOCH = new Date(2025, 0, 1).getTime();

export function dailyNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const t = new Date(y, m - 1, d).getTime();
  return Math.floor((t - EPOCH) / 86_400_000) + 1;
}
