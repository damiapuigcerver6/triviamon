export interface GameMeta {
  id: string;
  path: string;
  titulo: string;
  descripcion: string;
  /** Icono fijo. Si se omite y iconoAleatorio es true, se elige un tipo al azar en cada carga. */
  icono?: string;
  iconoAleatorio?: boolean;
  disponible: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: "tabla-tipos",
    path: "/juegos/tabla-de-tipos",
    titulo: "Tabla de tipos",
    descripcion:
      "Rellena de memoria la tabla completa de efectividades entre los 18 tipos. ¿Te la sabes al 100%?",
    iconoAleatorio: true,
    disponible: true,
  },
  {
    id: "quien-es-ese-pokemon",
    path: "/juegos/quien-es-ese-pokemon",
    titulo: "¿Quién es ese Pokémon?",
    descripcion:
      "Adivina el Pokémon comparando tipo, generación, evolución, color y más. Reto diario o práctica libre.",
    icono: "/brand/pikachu-silueta.png",
    disponible: true,
  },
  {
    id: "conexiones",
    path: "/juegos/conexiones",
    titulo: "Conexiones",
    descripcion:
      "Agrupa 16 Pokémon en 4 grupos de 4 según lo que tienen en común. Reto diario o práctica libre.",
    icono: "/brand/conexiones-icono-b.png",
    disponible: true,
  },
  {
    id: "mayor-o-menor",
    path: "/juegos/mayor-o-menor",
    titulo: "Mayor o menor",
    descripcion:
      "Elige una estadística y adivina si el siguiente Pokémon la tiene mayor o menor. ¿Cuánta racha aguantas?",
    icono: "/brand/nestball.png",
    disponible: true,
  },
];
