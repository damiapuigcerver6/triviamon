import { useState } from "react";
import { Link } from "react-router-dom";
import { GAMES } from "../games/registry";
import { randomTypeIcon } from "../data/types";
import { useLanguage } from "../i18n/LanguageContext";
import Seo from "../components/Seo";
import "./Home.css";

export default function Home() {
  const { t } = useLanguage();
  const [icons] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const game of GAMES) {
      if (game.iconoAleatorio) map[game.id] = randomTypeIcon();
    }
    return map;
  });

  return (
    <div className="home">
      <Seo title={t.home.seoTitle} description={t.home.seoDescription} />
      <section className="hero-banner">
        <img src="/brand/wordmark.png" alt="Triviamon" />
      </section>

      <section className="game-grid">
        {GAMES.map((game) => {
          const icon = game.icono ?? icons[game.id];
          const meta = t.games[game.strKey];
          return game.disponible ? (
            <Link to={game.path} className="game-card" key={game.id}>
              <img src={icon} alt="" className="game-card-icon" />
              <h2>{meta.title}</h2>
              <p>{meta.description}</p>
              <span className="game-card-cta">{t.home.play}</span>
            </Link>
          ) : (
            <div className="game-card game-card--soon" key={game.id}>
              <img src={icon} alt="" className="game-card-icon" />
              <h2>{meta.title}</h2>
              <p>{meta.description}</p>
              <span className="game-card-cta">{t.home.comingSoon}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
