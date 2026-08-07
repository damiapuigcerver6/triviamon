import { useEffect, useState } from "react";
import { loadPokedex, type PokemonEntry } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import RelatedGames from "../../components/RelatedGames";
import { statOptions, loadBestStreak, type StatKey } from "./stats";
import HigherLowerGame from "./HigherLowerGame";
import "./HigherLowerPage.css";

export default function HigherLowerPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [statKey, setStatKey] = useState<StatKey | null>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  if (!pokedex) {
    return (
      <div className="hl-page">
        <h1>{t.games.mayorMenor.title}</h1>
        <p className="hl-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  if (!statKey) {
    return (
      <div className="hl-page">
        <Seo title={`${t.games.mayorMenor.title} · Triviamon`} description={t.games.mayorMenor.description} />
        <h1>{t.games.mayorMenor.title}</h1>
        <p className="hl-subtitle">{t.mayorMenor.subtitle}</p>
        <div className="hl-stat-grid">
          {statOptions(t).map((s) => (
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
              <span className="hl-stat-card-best">
                {t.mayorMenor.bestStreakCard(loadBestStreak(s.key))}
              </span>
            </button>
          ))}
        </div>
        <RelatedGames currentId="mayor-o-menor" />
      </div>
    );
  }

  return (
    <div className="hl-page">
      <h1>{t.games.mayorMenor.title}</h1>
      <HigherLowerGame
        key={session}
        pokedex={pokedex}
        statKey={statKey}
        onChangeStat={() => setStatKey(null)}
        onPlayAgain={() => setSession((n) => n + 1)}
      />
      <RelatedGames currentId="mayor-o-menor" />
    </div>
  );
}
