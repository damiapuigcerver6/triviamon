import { useEffect, useState } from "react";
import { loadPokedex, dailyIndex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { loadMoveMeta, type MoveMeta } from "../../data/moveMeta";
import { loadStats, recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import StreakBadge from "../../components/StreakBadge";
import RelatedGames from "../../components/RelatedGames";
import MoveGuessGame from "./MoveGuessGame";
import "./MovimixPage.css";

type Modo = "diario" | "practica";

const PRACTICE_TARGET_KEY = "triviamon:mv:practica:target";
const PRACTICE_GUESSES_KEY = "triviamon:mv:practica:guesses";

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

export default function MovimixPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [moveMeta, setMoveMeta] = useState<Record<string, MoveMeta> | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceTarget, setPracticeTarget] = useState<PokemonEntry | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);
  const [stats, setStats] = useState(() => loadStats("movimix"));

  useEffect(() => {
    loadPokedex().then(setPokedex);
    loadMoveMeta().then(setMoveMeta);
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

  if (!pokedex || !moveMeta) {
    return (
      <div className="mv-page">
        <h1>{t.games.movimix.title}</h1>
        <p className="mv-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailyTarget = pokedex[dailyIndex(pokedex, dateKey)];

  return (
    <div className="mv-page">
      <Seo title={`${t.games.movimix.title} · Triviamon`} description={t.games.movimix.description} />
      <h1>{t.games.movimix.title}</h1>

      <div className="mv-tabs" role="tablist">
        <button
          type="button"
          className={`mv-tab ${modo === "diario" ? "mv-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`mv-tab ${modo === "practica" ? "mv-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <StreakBadge stats={stats} />

      <div className={modo === "diario" ? "mv-mode" : "mv-mode mv-mode--hidden"}>
        <MoveGuessGame
          key={dateKey}
          pokedex={pokedex}
          target={dailyTarget}
          moveMeta={moveMeta}
          storageKey={`triviamon:mv:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onWin={() => {
            recordDailyWin("movimix", dateKey);
            setStats(loadStats("movimix"));
          }}
        />
      </div>

      <div className={modo === "practica" ? "mv-mode" : "mv-mode mv-mode--hidden"}>
        {practiceTarget && (
          <MoveGuessGame
            key={practiceRound}
            pokedex={pokedex}
            target={practiceTarget}
            moveMeta={moveMeta}
            storageKey={PRACTICE_GUESSES_KEY}
            onNewPractice={handleNewPractice}
          />
        )}
      </div>

      <RelatedGames currentId="movimix" />
    </div>
  );
}
