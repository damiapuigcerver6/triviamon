import { useEffect, useState } from "react";
import { loadPokedex, dailyIndex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { loadStats, recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import StreakBadge from "../../components/StreakBadge";
import RelatedGames from "../../components/RelatedGames";
import WeaknessGuessGame from "./WeaknessGuessGame";
import "./DebilidexPage.css";

type Modo = "diario" | "practica";

const PRACTICE_TARGET_KEY = "triviamon:dbx:practica:target";
const PRACTICE_GUESSES_KEY = "triviamon:dbx:practica:guesses";

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

export default function DebilidexPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceTarget, setPracticeTarget] = useState<PokemonEntry | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);
  const [stats, setStats] = useState(() => loadStats("debilidex"));

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
      <div className="dbx-page">
        <h1>{t.games.debilidex.title}</h1>
        <p className="dbx-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailyTarget = pokedex[dailyIndex(pokedex, dateKey)];

  return (
    <div className="dbx-page">
      <Seo title={`${t.games.debilidex.title} · Triviamon`} description={t.games.debilidex.description} />
      <h1>{t.games.debilidex.title}</h1>

      <div className="dbx-tabs" role="tablist">
        <button
          type="button"
          className={`dbx-tab ${modo === "diario" ? "dbx-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`dbx-tab ${modo === "practica" ? "dbx-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <StreakBadge stats={stats} />

      <div className={modo === "diario" ? "dbx-mode" : "dbx-mode dbx-mode--hidden"}>
        <WeaknessGuessGame
          key={dateKey}
          pokedex={pokedex}
          target={dailyTarget}
          storageKey={`triviamon:dbx:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onWin={() => {
            recordDailyWin("debilidex", dateKey);
            setStats(loadStats("debilidex"));
          }}
        />
      </div>

      <div className={modo === "practica" ? "dbx-mode" : "dbx-mode dbx-mode--hidden"}>
        {practiceTarget && (
          <WeaknessGuessGame
            key={practiceRound}
            pokedex={pokedex}
            target={practiceTarget}
            storageKey={PRACTICE_GUESSES_KEY}
            onNewPractice={handleNewPractice}
          />
        )}
      </div>

      <RelatedGames currentId="debilidex" />
    </div>
  );
}
