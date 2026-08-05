export interface GameMeta {
  id: string;
  path: string;
  titulo: string;
  descripcion: string;
  icono: string;
  disponible: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: "tabla-tipos",
    path: "/juegos/tabla-de-tipos",
    titulo: "Tabla de tipos",
    descripcion:
      "Rellena de memoria la tabla completa de efectividades entre los 18 tipos. ¿Te la sabes al 100%?",
    icono: "/tipos/icons/lucha.svg",
    disponible: true,
  },
];
