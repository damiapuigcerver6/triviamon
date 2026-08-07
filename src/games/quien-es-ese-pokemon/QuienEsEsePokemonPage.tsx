import { useEffect, useState } from "react";
import { loadPokedex, type PokemonEntry } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import RelatedGames from "../../components/RelatedGames";
import { loadBestScore, loadBestStreak } from "./stats";
import SilhouetteGame from "./SilhouetteGame";
import "./QuienEsEsePokemonPage.css";

export default function QuienEsEsePokemonPage() {
  const { t } = useLanguage();
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    loadPokedex().then(setPokedex);
  }, []);

  if (!pokedex) {
    return (
      <div className="sil-page">
        <h1>{t.games.quienEsEsePokemon.title}</h1>
        <p className="sil-loading">{t.common.loadingPokedex}</p>
      </div>
    );
  }

  if (!playing) {
    return (
      <div className="sil-page">
        <Seo
          title={`${t.games.quienEsEsePokemon.title} · Triviamon`}
          description={t.games.quienEsEsePokemon.description}
        />
        <h1>{t.games.quienEsEsePokemon.title}</h1>
        <p className="sil-subtitle">{t.quienEsEsePokemon.subtitle}</p>
        <div className="sil-start-stats">
          <span>
            {t.quienEsEsePokemon.bestScore} <strong>{loadBestScore()}</strong>
          </span>
          <span>
            {t.quienEsEsePokemon.bestStreak} <strong>{loadBestStreak()}</strong>
          </span>
        </div>
        <button
          type="button"
          className="sil-btn sil-btn--primary sil-start-btn"
          onClick={() => {
            setSession((n) => n + 1);
            setPlaying(true);
          }}
        >
          {t.quienEsEsePokemon.start}
        </button>
        <RelatedGames currentId="quien-es-ese-pokemon" />
      </div>
    );
  }

  return (
    <div className="sil-page">
      <h1>{t.games.quienEsEsePokemon.title}</h1>
      <SilhouetteGame
        key={session}
        pokedex={pokedex}
        onPlayAgain={() => setSession((n) => n + 1)}
        onExit={() => setPlaying(false)}
      />
    </div>
  );
}
