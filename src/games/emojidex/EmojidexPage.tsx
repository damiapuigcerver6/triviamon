import { useEffect, useState } from "react";
import { loadPokedex, todayKey, type PokemonEntry } from "../../data/pokedex";
import { loadEmojiRiddles, type EmojiRiddle } from "../../data/emojiRiddles";
import { hashString } from "../../data/rng";
import { loadStats, recordDailyWin } from "../../data/stats";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import StreakBadge from "../../components/StreakBadge";
import RelatedGames from "../../components/RelatedGames";
import EmojiGuessGame from "./EmojiGuessGame";
import "./EmojidexPage.css";

type Modo = "diario" | "practica";

const PRACTICE_TARGET_KEY = "triviamon:ej:practica:target";
const PRACTICE_GUESSES_KEY = "triviamon:ej:practica:guesses";

function randomRiddle(list: EmojiRiddle[]): EmojiRiddle {
  return list[Math.floor(Math.random() * list.length)];
}

function loadOrPickPracticeRiddle(riddles: EmojiRiddle[]): EmojiRiddle {
  try {
    const raw = localStorage.getItem(PRACTICE_TARGET_KEY);
    if (raw) {
      const { numero_pokedex } = JSON.parse(raw) as { numero_pokedex: number };
      const found = riddles.find((r) => r.numero_pokedex === numero_pokedex);
      if (found) return found;
    }
  } catch {
    // ignora datos corruptos y elige uno nuevo
  }
  const picked = randomRiddle(riddles);
  localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ numero_pokedex: picked.numero_pokedex }));
  return picked;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
}

function targetOf(riddle: EmojiRiddle, pokedex: PokemonEntry[]): PokemonEntry | undefined {
  return pokedex.find((p) => p.numero_pokedex === riddle.numero_pokedex && p.id < 10000);
}

export default function EmojidexPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [riddles, setRiddles] = useState<EmojiRiddle[] | null>(null);
  const [modo, setModo] = useState<Modo>("diario");
  const [practiceRiddle, setPracticeRiddle] = useState<EmojiRiddle | null>(null);
  const [practiceRound, setPracticeRound] = useState(0);
  const [stats, setStats] = useState(() => loadStats("emojidex"));

  useEffect(() => {
    loadPokedex().then(setPokedex);
    loadEmojiRiddles().then(setRiddles);
  }, []);

  useEffect(() => {
    if (riddles && !practiceRiddle) {
      setPracticeRiddle(loadOrPickPracticeRiddle(riddles));
    }
  }, [riddles, practiceRiddle]);

  function handleNewPractice() {
    if (!riddles) return;
    const next = randomRiddle(riddles);
    localStorage.setItem(PRACTICE_TARGET_KEY, JSON.stringify({ numero_pokedex: next.numero_pokedex }));
    localStorage.removeItem(PRACTICE_GUESSES_KEY);
    setPracticeRiddle(next);
    setPracticeRound((n) => n + 1);
  }

  if (!pokedex || !riddles) {
    return (
      <div className="ej-page">
        <h1>{t.games.emojidex.title}</h1>
        <p className="ej-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  const dateKey = todayKey();
  const dailyRiddle = riddles[hashString(`emojidex:${dateKey}`) % riddles.length];
  const dailyTarget = targetOf(dailyRiddle, pokedex);
  const practiceTarget = practiceRiddle ? targetOf(practiceRiddle, pokedex) : undefined;

  return (
    <div className="ej-page">
      <Seo title={`${t.games.emojidex.title} · Triviamon`} description={t.games.emojidex.description} />
      <h1>{t.games.emojidex.title}</h1>

      <div className="ej-tabs" role="tablist">
        <button
          type="button"
          className={`ej-tab ${modo === "diario" ? "ej-tab--active" : ""}`}
          onClick={() => setModo("diario")}
        >
          {t.common.dailyChallengeTab}
        </button>
        <button
          type="button"
          className={`ej-tab ${modo === "practica" ? "ej-tab--active" : ""}`}
          onClick={() => setModo("practica")}
        >
          {t.common.freePracticeTab}
        </button>
      </div>

      <StreakBadge stats={stats} />

      <div className={modo === "diario" ? "ej-mode" : "ej-mode ej-mode--hidden"}>
        {dailyTarget && (
          <EmojiGuessGame
            key={dateKey}
            pokedex={pokedex}
            target={dailyTarget}
            emojis={dailyRiddle.emojis}
            storageKey={`triviamon:ej:diario:${dateKey}`}
            dateLabel={formatDateLabel(dateKey)}
            onWin={() => {
              recordDailyWin("emojidex", dateKey);
              setStats(loadStats("emojidex"));
            }}
          />
        )}
      </div>

      <div className={modo === "practica" ? "ej-mode" : "ej-mode ej-mode--hidden"}>
        {practiceRiddle && practiceTarget && (
          <EmojiGuessGame
            key={practiceRound}
            pokedex={pokedex}
            target={practiceTarget}
            emojis={practiceRiddle.emojis}
            storageKey={PRACTICE_GUESSES_KEY}
            onNewPractice={handleNewPractice}
          />
        )}
      </div>

      <RelatedGames currentId="emojidex" />
    </div>
  );
}
