import { Link } from "react-router-dom";
import { GAMES } from "../games/registry";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <section className="hero-text">
        <h1>Pon a prueba lo que sabes de Pokémon</h1>
        <p>
          Minijuegos rápidos para entrenadores que se saben la tabla de tipos
          mejor que la tabla del 7.
        </p>
      </section>

      <section className="game-grid">
        {GAMES.map((game) =>
          game.disponible ? (
            <Link to={game.path} className="game-card" key={game.id}>
              <img src={game.icono} alt="" className="game-card-icon" />
              <h2>{game.titulo}</h2>
              <p>{game.descripcion}</p>
              <span className="game-card-cta">Jugar →</span>
            </Link>
          ) : (
            <div className="game-card game-card--soon" key={game.id}>
              <img src={game.icono} alt="" className="game-card-icon" />
              <h2>{game.titulo}</h2>
              <p>{game.descripcion}</p>
              <span className="game-card-cta">Próximamente</span>
            </div>
          ),
        )}
      </section>
    </div>
  );
}
