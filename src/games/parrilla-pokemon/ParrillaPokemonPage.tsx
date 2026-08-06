import { useEffect, useState } from "react";
import { loadPokedex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { hashString } from "../../data/rng";
import { recordDailyWin } from "../../data/stats";
import GridGame from "./GridGame";
import "./ParrillaPokemonPage.css";

type Modo = "diario" | "practica";

const PRACTICE_SEED_KEY = "triviamon:pg:practica:seed";
const PRACTICE_PROGRESS_KEY = "triviamon:pg:practica:progress";

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

function loadOrPickPracticeSeed(): number {
  const raw = localStorage.getItem(PRACTICE_SEED_KEY);
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  const seed = randomSeed();
  localStorage.setItem(PRACTICE_SEED_KEY, String(seed));
  return seed;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}

export default function ParrillaPokemonPage() {
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceSeed, setPracticeSeed] = useState<number | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  useEffect(() => {
    if (practiceSeed === null) setPracticeSeed(loadOrPickPracticeSeed());
  }, [practiceSeed]);

  function handleNewPractice() {
    const next = randomSeed();
    localStorage.setItem(PRACTICE_SEED_KEY, String(next));
    localStorage.removeItem(PRACTICE_PROGRESS_KEY);
    setPracticeSeed(next);
    setPracticeRound((n) => n + 1);
  }

  if (!pokedex) {
    return (
      <div className="pg-page">
        <h1>Parrilla Pokémon</h1>
        <p className="pg-loading">Cargando la Pokédex…</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailySeed = hashString(`parrilla:${dateKey}`);

  return (
    <div className="pg-page">
      <h1>Parrilla Pokémon</h1>

      <div className="pg-tabs" role="tablist">
        <button
          type="button"
          className={`pg-tab ${modo === "diario" ? "pg-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          Reto diario
        </button>
        <button
          type="button"
          className={`pg-tab ${modo === "practica" ? "pg-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          Práctica libre
        </button>
      </div>

      <div className={modo === "diario" ? "pg-mode" : "pg-mode pg-mode--hidden"}>
        <GridGame
          key={dateKey}
          pokedex={pokedex}
          seed={dailySeed}
          storageKey={`triviamon:pg:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onSolved={() => recordDailyWin("parrilla-pokemon", dateKey)}
        />
      </div>

      <div className={modo === "practica" ? "pg-mode" : "pg-mode pg-mode--hidden"}>
        {practiceSeed !== null && (
          <GridGame
            key={practiceRound}
            pokedex={pokedex}
            seed={practiceSeed}
            storageKey={PRACTICE_PROGRESS_KEY}
            onNewPractice={handleNewPractice}
          />
        )}
      </div>
    </div>
  );
}
