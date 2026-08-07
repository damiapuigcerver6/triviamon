export interface EmojiRiddle {
  numero_pokedex: number;
  emojis: string;
}

let cache: EmojiRiddle[] | null = null;
let inflight: Promise<EmojiRiddle[]> | null = null;

export function loadEmojiRiddles(): Promise<EmojiRiddle[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch("/data/emoji-riddles.json")
    .then((r) => r.json())
    .then((data: EmojiRiddle[]) => {
      cache = data;
      return data;
    });
  return inflight;
}
