import { useEffect, useState } from "react";
import { loadPokedex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { hashString } from "../../data/rng";
import { recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import PokedleGame from "./PokedleGame";
import "./PokedlePage.css";

type Modo = "diario" | "practica";

const PRACTICE_SEED_KEY = "triviamon:pk:practica:seed";
const PRACTICE_PROGRESS_KEY = "triviamon:pk:practica:progress";

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

export default function PokedlePage() {
  const { lang, t } = useLanguage();
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
      <div className="pk-page">
        <h1>{t.games.pokedle.title}</h1>
        <p className="pk-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailySeed = hashString(`pokedle:${dateKey}`);

  return (
    <div className="pk-page">
      <h1>{t.games.pokedle.title}</h1>

      <div className="pk-tabs" role="tablist">
        <button
          type="button"
          className={`pk-tab ${modo === "diario" ? "pk-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`pk-tab ${modo === "practica" ? "pk-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <div className={modo === "diario" ? "pk-mode" : "pk-mode pk-mode--hidden"}>
        <PokedleGame
          key={`${dateKey}-${lang}`}
          pokedex={pokedex}
          seed={dailySeed}
          storageKey={`triviamon:pk:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onSolved={() => recordDailyWin("pokedle", dateKey)}
        />
      </div>

      <div className={modo === "practica" ? "pk-mode" : "pk-mode pk-mode--hidden"}>
        {practiceSeed !== null && (
          <PokedleGame
            key={`${practiceRound}-${lang}`}
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
