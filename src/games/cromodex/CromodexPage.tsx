import { useEffect, useState } from "react";
import { loadPokedex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { loadPalettes, type PaletteMap } from "../../data/palettes";
import { hashString } from "../../data/rng";
import { loadStats, recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import StreakBadge from "../../components/StreakBadge";
import RelatedGames from "../../components/RelatedGames";
import ColorGuessGame from "./ColorGuessGame";
import "./CromodexPage.css";

type Modo = "diario" | "practica";

const PRACTICE_TARGET_KEY = "triviamon:crd:practica:target";
const PRACTICE_GUESSES_KEY = "triviamon:crd:practica:guesses";

function randomTarget(list: PokemonEntry[]): PokemonEntry {
  return list[Math.floor(Math.random() * list.length)];
}

function loadOrPickPracticeTarget(pool: PokemonEntry[]): PokemonEntry {
  try {
    const raw = localStorage.getItem(PRACTICE_TARGET_KEY);
    if (raw) {
      const { id } = JSON.parse(raw) as { id: number };
      const found = pool.find((p) => p.id === id);
      if (found) return found;
    }
  } catch {
    // ignora datos corruptos y elige uno nuevo
  }
  const picked = randomTarget(pool);
  localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ id: picked.id }));
  return picked;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}

function dailyIndexIn(list: PokemonEntry[], dateKey: string): number {
  return hashString(`cromodex:${dateKey}`) % list.length;
}

export default function CromodexPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [palettes, setPalettes] = useState<PaletteMap | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceTarget, setPracticeTarget] = useState<PokemonEntry | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);
  const [stats, setStats] = useState(() => loadStats("cromodex"));

  useEffect(() => {
    loadPokedex().then(setPokedex);
    loadPalettes().then(setPalettes);
  }, []);

  // Solo los Pokemon con paleta calculada pueden salir como objetivo (algunos
  // sprites pueden faltar en el fetch inicial).
  const pool = pokedex && palettes ? pokedex.filter((p) => !!palettes[String(p.id)]) : null;

  useEffect(() => {
    if (pool && !practiceTarget) {
      setPracticeTarget(loadOrPickPracticeTarget(pool));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, practiceTarget]);

  function handleNewPractice() {
    if (!pool) return;
    const next = randomTarget(pool);
    localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ id: next.id }));
    localStorage.removeItem(PRACTICE_GUESSES_KEY);
    setPracticeTarget(next);
    setPracticeRound((n) => n + 1);
  }

  if (!pokedex || !palettes || !pool) {
    return (
      <div className="crd-page">
        <h1>{t.games.cromodex.title}</h1>
        <p className="crd-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailyTarget = pool[dailyIndexIn(pool, dateKey)];
  const dailyPalette = palettes[String(dailyTarget.id)];
  const practicePalette = practiceTarget ? palettes[String(practiceTarget.id)] : undefined;

  return (
    <div className="crd-page">
      <Seo title={`${t.games.cromodex.title} · Triviamon`} description={t.games.cromodex.description} />
      <h1>{t.games.cromodex.title}</h1>

      <div className="crd-tabs" role="tablist">
        <button
          type="button"
          className={`crd-tab ${modo === "diario" ? "crd-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`crd-tab ${modo === "practica" ? "crd-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <StreakBadge stats={stats} />

      <div className={modo === "diario" ? "crd-mode" : "crd-mode crd-mode--hidden"}>
        <ColorGuessGame
          key={dateKey}
          pokedex={pokedex}
          target={dailyTarget}
          palette={dailyPalette}
          storageKey={`triviamon:crd:diario:${dateKey}`}
          dateLabel={formatDateLabel(dateKey)}
          onWin={() => {
            recordDailyWin("cromodex", dateKey);
            setStats(loadStats("cromodex"));
          }}
        />
      </div>

      <div className={modo === "practica" ? "crd-mode" : "crd-mode crd-mode--hidden"}>
        {practiceTarget && practicePalette && (
          <ColorGuessGame
            key={practiceRound}
            pokedex={pokedex}
            target={practiceTarget}
            palette={practicePalette}
            storageKey={PRACTICE_GUESSES_KEY}
            onNewPractice={handleNewPractice}
          />
        )}
      </div>

      <RelatedGames currentId="cromodex" />
    </div>
  );
}
