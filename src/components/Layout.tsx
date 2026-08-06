import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { randomBackground } from "../data/backgrounds";
import { loadTheme, saveTheme, type Theme } from "../data/theme";
import { loadStats, type DailyStats } from "../data/stats";
import { GAMES } from "../games/registry";
import Modal from "./Modal";
import "./Layout.css";

function StatsSection({ title, stats }: { title: string; stats: DailyStats }) {
  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{title} · Reto diario</p>
      {stats.completados === 0 ? (
        <p className="stats-empty">Aún no has completado ningún reto diario.</p>
      ) : (
        <div className="stats-grid">
          <div>
            <strong>{stats.completados}</strong>
            <span>Completados</span>
          </div>
          <div>
            <strong>{stats.rachaActual}</strong>
            <span>Racha actual</span>
          </div>
          <div>
            <strong>{stats.mejorRacha}</strong>
            <span>Mejor racha</span>
          </div>
        </div>
      )}
    </div>
  );
}

const HELP_CONTENT: Record<string, { title: string; body: ReactNode }> = {
  "/juegos/tabla-de-tipos": {
    title: "Cómo jugar: Tabla de tipos",
    body: (
      <>
        <p>
          Rellena de memoria la tabla de efectividades: el tipo de la fila ataca al tipo de la
          columna. Elige un pincel (Neutra, Mitad, Doble o Nula) y haz clic en las celdas para
          pintarlas.
        </p>
        <p>
          Cuando la tengas completa, pulsa "Comprobar" para ver tu puntuación. Las celdas
          incorrectas y las vacías se marcarán para que sepas qué repasar. El cronómetro se
          puede pausar en cualquier momento.
        </p>
      </>
    ),
  },
  "/juegos/detective-pokemon": {
    title: "Cómo jugar: Detective Pokémon",
    body: (
      <>
        <p>
          Escribe nombres de Pokémon para ir adivinando el objetivo. Cada intento compara tipo,
          generación, fase evolutiva, método de evolución, color, altura y peso: verde es acierto
          exacto, amarillo es acierto parcial, y las flechas indican si el valor real es mayor o
          menor.
        </p>
        <p>
          En el <strong>Reto diario</strong> todo el mundo juega el mismo Pokémon cada día y
          puedes compartir tu resultado. En <strong>Práctica libre</strong> tienes pistas cada 4
          fallos y un botón para rendirte y ver la solución.
        </p>
      </>
    ),
  },
  "/juegos/conexiones": {
    title: "Cómo jugar: Conexiones",
    body: (
      <>
        <p>
          Hay 16 Pokémon en la cuadrícula, agrupados en 4 categorías ocultas de 4 miembros cada
          una. Selecciona 4 tarjetas que creas que comparten algo (tipo, generación, cómo
          evolucionan, debilidades...) y pulsa "Comprobar grupo".
        </p>
        <p>
          Si aciertas, el grupo se bloquea arriba con su categoría revelada. Si fallas, pierdes
          una vida: tienes 4 fallos antes de que se acabe la partida y se revelen las categorías
          que te faltaban.
        </p>
      </>
    ),
  },
  "/juegos/mayor-o-menor": {
    title: "Cómo jugar: Mayor o menor",
    body: (
      <>
        <p>
          Elige una estadística (Vida, Ataque, Defensa, Ataque especial, Defensa especial,
          Velocidad o Número de Pokédex). El Pokémon de la izquierda siempre muestra su valor; el
          de la derecha lo tiene oculto.
        </p>
        <p>
          La bola del centro indica qué buscas: la Nido Ball verde pide el Pokémon con el valor
          más alto (HIGHER) y la Poké Ball roja pide el más bajo (LOWER). Haz clic en el Pokémon
          que creas correcto: si aciertas, sigues sumando racha; si fallas, se acaba la partida.
        </p>
      </>
    ),
  },
  "/juegos/quien-es-ese-pokemon": {
    title: "Cómo jugar: ¿Quién es ese Pokémon?",
    body: (
      <>
        <p>
          Verás la silueta negra de un Pokémon y tendrás que escribir su nombre. Empiezas con 15
          segundos en el reloj: cada acierto te suma 5 segundos más, hasta un máximo de 15.
        </p>
        <p>
          No hay opciones entre las que elegir, así que vale cualquier forma de escribir el
          nombre (mayúsculas, acentos o guiones no importan). Cada acierto suma un punto y
          aumenta tu racha; si fallas, la racha se reinicia pero el reloj sigue corriendo. La
          partida termina cuando el tiempo llega a cero.
        </p>
      </>
    ),
  },
  "/juegos/parrilla-pokemon": {
    title: "Cómo jugar: Parrilla Pokémon",
    body: (
      <>
        <p>
          Cada fila y cada columna tiene una categoría (tipo, generación, evolución,
          debilidades, movimientos que puede aprender...). Selecciona una casilla vacía y
          escribe un Pokémon que cumpla a la vez la categoría de su fila y la de su columna.
        </p>
        <p>
          Si aciertas, la casilla se rellena y avanzas a la siguiente. Si fallas, no pasa nada:
          puedes reintentarlo las veces que quieras. Eso sí, no puedes repetir el mismo Pokémon
          en dos casillas de la misma partida.
        </p>
      </>
    ),
  },
};

export default function Layout() {
  const [bg] = useState(randomBackground);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const help = HELP_CONTENT[location.pathname];

  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const guessStats = loadStats("detective-pokemon");
  const connectionsStats = loadStats("conexiones");

  return (
    <div className="layout">
      <div className="bg-layer" style={{ backgroundImage: `url(${bg})` }} />
      <header className="site-header">
        <Link to="/" className="brand">
          <img src="/brand/logo.png" alt="Triviamon" className="brand-icon" />
        </Link>

        <div className="header-actions">
          <div className="games-menu" ref={menuRef}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Juegos"
              title="Juegos"
              onClick={() => setMenuOpen((v) => !v)}
            >
              🎮
            </button>
            {menuOpen && (
              <div className="games-dropdown">
                {GAMES.filter((g) => g.disponible).map((g) => (
                  <Link
                    key={g.id}
                    to={g.path}
                    className="games-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <img src={g.icono ?? "/brand/logo.png"} alt="" />
                    <span>{g.titulo}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label="Estadísticas"
            title="Estadísticas"
            onClick={() => setStatsOpen(true)}
          >
            📊
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label="Cambiar tema"
            title="Cambiar tema"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {help && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Ayuda"
              title="Ayuda"
              onClick={() => setHelpOpen(true)}
            >
              ❓
            </button>
          )}

          {!isHome && (
            <Link to="/" className="icon-btn" aria-label="Volver al inicio" title="Volver al inicio">
              🏠
            </Link>
          )}
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Proyecto de aficionado, sin ánimo de lucro. Pokémon © Nintendo / Game Freak.</p>
        <p>
          Un proyecto de <a href="https://mdlabs.app">MDLabs</a> · descubre
          también <a href="https://linktr.ee/thehoodieapp">HOODIE</a>.
        </p>
      </footer>

      {statsOpen && (
        <Modal title="Estadísticas" onClose={() => setStatsOpen(false)}>
          <StatsSection title="Detective Pokémon" stats={guessStats} />
          <div style={{ height: "1rem" }} />
          <StatsSection title="Conexiones" stats={connectionsStats} />
        </Modal>
      )}

      {helpOpen && help && (
        <Modal title={help.title} onClose={() => setHelpOpen(false)}>
          {help.body}
        </Modal>
      )}
    </div>
  );
}
