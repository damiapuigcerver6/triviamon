import { useEffect, useState } from "react";
import { loadPokedex, type PokemonEntry } from "../../data/pokedex";
import { loadBestScore, loadBestStreak } from "./stats";
import SilhouetteGame from "./SilhouetteGame";
import "./QuienEsEsePokemonPage.css";

export default function QuienEsEsePokemonPage() {
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  if (!pokedex) {
    return (
      <div className="sil-page">
        <h1>¿Quién es ese Pokémon?</h1>
        <p className="sil-loading">Cargando la Pokédex…</p>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="sil-page">
        <h1>¿Quién es ese Pokémon?</h1>
        <p className="sil-subtitle">
          Adivina el Pokémon a partir de su silueta antes de que se acabe el tiempo. Empiezas con
          15 segundos y cada acierto te suma 5 más, hasta un máximo de 15.
        </p>
        <div className="sil-start-stats">
          <span>
            Mejor puntuación: <strong>{loadBestScore()}</strong>
          </span>
          <span>
            Mejor racha: <strong>{loadBestStreak()}</strong>
          </span>
        </div>
        <button
          type="button"
          className="sil-btn sil-btn--primary sil-start-btn"
          onClick={() => {
            setSession((n) => n + 1);
            setPlaying(true);
          }}
        >
          Empezar
        </button>
      </div>
    );
  }

  return (
    <div className="sil-page">
      <h1>¿Quién es ese Pokémon?</h1>
      <SilhouetteGame
        key={session}
        pokedex={pokedex}
        onPlayAgain={() => setSession((n) => n + 1)}
        onExit={() => setPlaying(false)}
      />
    </div>
  );
}
