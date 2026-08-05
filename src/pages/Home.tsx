import { useState } from "react";
import { Link } from "react-router-dom";
import { GAMES } from "../games/registry";
import { randomTypeIcon } from "../data/types";
import "./Home.css";

export default function Home() {
  const [icons] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const game of GAMES) {
      if (game.iconoAleatorio) map[game.id] = randomTypeIcon();
    }
    return map;
  });

  return (
    <div className="home">
      <section className="hero-banner">
        <img src="/brand/wordmark.png" alt="Triviamon" />
      </section>

      <section className="game-grid">
        {GAMES.map((game) => {
          const icon = game.icono ?? icons[game.id];
          return game.disponible ? (
            <Link to={game.path} className="game-card" key={game.id}>
              <img src={icon} alt="" className="game-card-icon" />
              <h2>{game.titulo}</h2>
              <p>{game.descripcion}</p>
              <span className="game-card-cta">Jugar →</span>
            </Link>
          ) : (
            <div className="game-card game-card--soon" key={game.id}>
              <img src={icon} alt="" className="game-card-icon" />
              <h2>{game.titulo}</h2>
              <p>{game.descripcion}</p>
              <span className="game-card-cta">Próximamente</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
