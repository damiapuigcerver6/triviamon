export const BACKGROUNDS = [
  "alola",
  "hoenn",
  "johto",
  "kalos",
  "kanto",
  "paldea",
  "sinnoh",
  "teselia",
].map((id) => `/backgrounds/${id}.jpg`);

export function randomBackground(): string {
  return BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
}
