import { useEffect, useState } from "react";
import { loadPokedex, dailyIndex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { recordDailyWin } from "../../data/stats";
import GuessGame from "./GuessGame";
import "./QuienEsEsePokemonPage.css";

type Modo = "diario" | "practica";

const PRACTICE_TARGET_KEY = "triviamon:qp:practica:target";
const PRACTICE_GUESSES_KEY = "triviamon:qp:practica:guesses";

function randomTarget(list: PokemonEntry[]): PokemonEntry {
  return list[Math.floor(Math.random() * list.length)];
}

function loadOrPickPracticeTarget(pokedex: PokemonEntry[]): PokemonEntry {
  try {
    const raw = localStorage.getItem(PRACTICE_TARGET_KEY);
    if (raw) {
      const { id } = JSON.parse(raw) as { id: number };
      const found = pokedex.find((p) => p.id === id);
      if (found) return found;
    }
  } catch {
    // ignora datos corruptos y elige uno nuevo
  }
  const picked = randomTarget(pokedex);
  localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ id: picked.id }));
  return picked;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}

export default function QuienEsEsePokemonPage() {
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceTarget, setPracticeTarget] = useState<PokemonEntry | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  useEffect(() => {
    if (pokedex && !practiceTarget) {
      setPracticeTarget(loadOrPickPracticeTarget(pokedex));
    }
  }, [pokedex, practiceTarget]);

  function handleNewPractice() {
    if (!pokedex) return;
    const next = randomTarget(pokedex);
    localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ id: next.id }));
    localStorage.removeItem(PRACTICE_GUESSES_KEY);
    setPracticeTarget(next);
    setPracticeRound((n) => n + 1);
  }

  if (!pokedex) {
    return (
      <div className="qp-page">
        <h1>¿Quién es ese Pokémon?</h1>
        <p className="qp-loading">Cargando la Pokédex…</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailyTarget = pokedex[dailyIndex(pokedex, dateKey)];

  return (
    <div className="qp-page">
      <h1>¿Quién es ese Pokémon?</h1>

      <div className="qp-tabs" role="tablist">
        <button
          type="button"
          className={`qp-tab ${modo === "diario" ? "qp-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          Reto diario
        </button>
        <button
          type="button"
          className={`qp-tab ${modo === "practica" ? "qp-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          Práctica libre
        </button>
      </div>

      <div className={modo === "diario" ? "qp-mode" : "qp-mode qp-mode--hidden"}>
        <GuessGame
          key={dateKey}
          pokedex={pokedex}
          target={dailyTarget}
          storageKey={`triviamon:qp:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onWin={() => recordDailyWin("quien-es-ese-pokemon", dateKey)}
        />
      </div>

      <div className={modo === "practica" ? "qp-mode" : "qp-mode qp-mode--hidden"}>
        {practiceTarget && (
          <GuessGame
            key={practiceRound}
            pokedex={pokedex}
            target={practiceTarget}
            storageKey={PRACTICE_GUESSES_KEY}
            hintsEnabled
            onNewPractice={handleNewPractice}
          />
        )}
      </div>
    </div>
  );
}
