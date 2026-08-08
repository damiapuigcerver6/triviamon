export type PaletteMap = Record<string, string[]>;

let cache: PaletteMap | null = null;
let inflight: Promise<PaletteMap> | null = null;

export function loadPalettes(): Promise<PaletteMap> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch("/data/pokemon-palettes.json")
    .then((r) => r.json())
    .then((data: PaletteMap) => {
      cache = data;
      return data;
    });
  return inflight;
}

export function paletteFor(palettes: PaletteMap, id: number): string[] | undefined {
  return palettes[String(id)];
}
