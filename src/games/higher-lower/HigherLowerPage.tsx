import { useEffect, useState } from "react";
import { loadPokedex, type PokemonEntry } from "../../data/pokedex";
import { STAT_OPTIONS, loadBestStreak, type StatKey } from "./stats";
import HigherLowerGame from "./HigherLowerGame";
import "./HigherLowerPage.css";

export default function HigherLowerPage() {
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [statKey, setStatKey] = useState<StatKey | null>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  if (!pokedex) {
    return (
      <div className="hl-page">
        <h1>Mayor o menor</h1>
        <p className="hl-loading">Cargando la Pokédex…</p>
      </div>
    );
  }

  if (!statKey) {
    return (
      <div className="hl-page">
        <h1>Mayor o menor</h1>
        <p className="hl-subtitle">Elige una estadística para empezar a jugar.</p>
        <div className="hl-stat-grid">
          {STAT_OPTIONS.map((s) => (
            <button
              type="button"
              key={s.key}
              className="hl-stat-card"
              onClick={() => {
                setStatKey(s.key);
                setSession((n) => n + 1);
              }}
            >
              <span className="hl-stat-card-label">{s.label}</span>
              <span className="hl-stat-card-best">Mejor racha: {loadBestStreak(s.key)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hl-page">
      <h1>Mayor o menor</h1>
      <HigherLowerGame
        key={session}
        pokedex={pokedex}
        statKey={statKey}
        onChangeStat={() => setStatKey(null)}
        onPlayAgain={() => setSession((n) => n + 1)}
      />
    </div>
  );
}
