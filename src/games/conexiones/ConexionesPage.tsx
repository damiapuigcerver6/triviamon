import { useEffect, useState } from "react";
import { loadPokedex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { hashString } from "../../data/rng";
import { recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import ConnectionsGame from "./ConnectionsGame";
import "./ConexionesPage.css";

type Modo = "diario" | "practica";

const PRACTICE_SEED_KEY = "triviamon:cx:practica:seed";
const PRACTICE_PROGRESS_KEY = "triviamon:cx:practica:progress";

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

export default function ConexionesPage() {
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
      <div className="cx-page">
        <h1>{t.games.conexiones.title}</h1>
        <p className="cx-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailySeed = hashString(`conexiones:${dateKey}`);

  return (
    <div className="cx-page">
      <h1>{t.games.conexiones.title}</h1>
      <p className="cx-subtitle">{t.conexiones.subtitle}</p>

      <div className="cx-tabs" role="tablist">
        <button
          type="button"
          className={`cx-tab ${modo === "diario" ? "cx-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`cx-tab ${modo === "practica" ? "cx-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <div className={modo === "diario" ? "cx-mode" : "cx-mode cx-mode--hidden"}>
        <ConnectionsGame
          key={`${dateKey}-${lang}`}
          pokedex={pokedex}
          seed={dailySeed}
          storageKey={`triviamon:cx:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onSolved={() => recordDailyWin("conexiones", dateKey)}
        />
      </div>

      <div className={modo === "practica" ? "cx-mode" : "cx-mode cx-mode--hidden"}>
        {practiceSeed !== null && (
          <ConnectionsGame
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
