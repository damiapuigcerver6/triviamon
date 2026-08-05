import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout">
      <header className="site-header">
        <Link to="/" className="brand">
          <img src="/tipos/icons/electrico.svg" alt="" className="brand-icon" />
          <span>
            Trivia<span className="brand-accent">mon</span>
          </span>
        </Link>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Proyecto de aficionado, sin ánimo de lucro. Pokémon © Nintendo / Game Freak.</p>
      </footer>
    </div>
  );
}
