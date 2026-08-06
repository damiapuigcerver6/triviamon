import type { Strings } from "../i18n/strings";

export interface GameMeta {
  id: string;
  path: string;
  /** Clave dentro de Strings["games"] para el titulo/descripcion traducidos. */
  strKey: keyof Strings["games"];
  /** Icono fijo. Si se omite y iconoAleatorio es true, se elige un tipo al azar en cada carga. */
  icono?: string;
  iconoAleatorio?: boolean;
  disponible: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: "tabla-tipos",
    path: "/juegos/tabla-de-tipos",
    strKey: "tablaTipos",
    iconoAleatorio: true,
    disponible: true,
  },
  {
    id: "detective-pokemon",
    path: "/juegos/detective-pokemon",
    strKey: "detectivePokemon",
    icono: "/brand/detective-lupa.png",
    disponible: true,
  },
  {
    id: "conexiones",
    path: "/juegos/conexiones",
    strKey: "conexiones",
    icono: "/brand/conexiones-icono-b.png",
    disponible: true,
  },
  {
    id: "mayor-o-menor",
    path: "/juegos/mayor-o-menor",
    strKey: "mayorMenor",
    icono: "/brand/nestball.png",
    disponible: true,
  },
  {
    id: "quien-es-ese-pokemon",
    path: "/juegos/quien-es-ese-pokemon",
    strKey: "quienEsEsePokemon",
    icono: "/brand/pikachu-silueta.png",
    disponible: true,
  },
  {
    id: "parrilla-pokemon",
    path: "/juegos/parrilla-pokemon",
    strKey: "parrillaPokemon",
    icono: "/brand/parrilla-icono.png",
    disponible: true,
  },
  {
    id: "pokedle",
    path: "/juegos/pokedle",
    strKey: "pokedle",
    icono: "/brand/pokedle-icono.png",
    disponible: true,
  },
];
