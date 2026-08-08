import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { randomBackground } from "../data/backgrounds";
import { loadTheme, saveTheme, type Theme } from "../data/theme";
import { loadStats, type DailyStats } from "../data/stats";
import { GAMES } from "../games/registry";
import { useLanguage } from "../i18n/LanguageContext";
import type { Strings } from "../i18n/strings";
import Modal from "./Modal";
import CookieBanner from "./CookieBanner";
import "./Layout.css";

function StatsSection({
  title,
  stats,
  t,
}: {
  title: string;
  stats: DailyStats;
  t: Strings;
}) {
  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
        {title} · {t.stats.dailyChallengeSuffix}
      </p>
      {stats.completados === 0 ? (
        <p className="stats-empty">{t.stats.empty}</p>
      ) : (
        <div className="stats-grid">
          <div>
            <strong>{stats.completados}</strong>
            <span>{t.stats.completed}</span>
          </div>
          <div>
            <strong>{stats.rachaActual}</strong>
            <span>{t.stats.currentStreak}</span>
          </div>
          <div>
            <strong>{stats.mejorRacha}</strong>
            <span>{t.stats.bestStreak}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const HELP_CONTENT_ES: Record<string, { title: string; body: ReactNode }> = {
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
  "/juegos/pokedle": {
    title: "Cómo jugar: Pokédle",
    body: (
      <>
        <p>
          Hay un Pokémon oculto y tienes 6 intentos para adivinarlo. Escribe un Pokémon (con
          autocompletado) y sus letras se colorean: verde si está en el sitio correcto, amarillo
          si está en el nombre pero en otra posición, y gris si no aparece.
        </p>
        <p>
          En el <strong>Reto diario</strong> todo el mundo intenta adivinar el mismo Pokémon cada
          día y puedes compartir tu resultado con la cuadrícula de colores. En{" "}
          <strong>Práctica libre</strong> puedes rendirte para ver la solución y empezar otra
          palabra.
        </p>
      </>
    ),
  },
  "/juegos/movimix": {
    title: "Cómo jugar: Movimix",
    body: (
      <>
        <p>
          Se muestra el conjunto de movimientos que puede aprender un Pokémon oculto. Escribe
          Pokémon (con autocompletado) hasta acertar de quién se trata.
        </p>
        <p>
          Si fallas 2 veces, se revela como pista el tipo del Pokémon oculto. Puedes rendirte en
          cualquier momento para ver la solución.
        </p>
      </>
    ),
  },
  "/juegos/debilidex": {
    title: "Cómo jugar: Debilidex",
    body: (
      <>
        <p>
          Se muestra la tabla de debilidades y resistencias de un Pokémon oculto frente a los 18
          tipos, calculada teniendo en cuenta su(s) tipo(s) y también su habilidad si modifica
          alguna debilidad (por ejemplo, Levitate le quita la debilidad a tierra). Escribe Pokémon
          (con autocompletado) hasta acertar de quién se trata.
        </p>
        <p>
          Cada fallo a partir del segundo revela una pista nueva (generación, categoría y suma de
          estadísticas). Puedes rendirte en cualquier momento para ver la solución.
        </p>
      </>
    ),
  },
  "/juegos/emojidex": {
    title: "Cómo jugar: Emojidex",
    body: (
      <>
        <p>
          Un par de emojis describen a un Pokémon oculto. Escribe Pokémon (con autocompletado)
          hasta acertar de quién se trata.
        </p>
        <p>
          Cada fallo a partir del segundo revela una pista nueva (tipo, generación y primera letra
          del nombre). Puedes rendirte en cualquier momento para ver la solución.
        </p>
      </>
    ),
  },
  "/juegos/piramide": {
    title: "Cómo jugar: Pirámide",
    body: (
      <>
        <p>
          Aparecen 11 Pokémon y una característica al azar (una estadística base o el número de
          Pokédex). Colócalos en la pirámide de forma que el mejor en esa característica quede
          arriba del todo y el peor abajo del todo a la derecha, leyendo la pirámide fila por fila.
        </p>
        <p>
          Arrastra cada Pokémon hasta el hueco donde quieras colocarlo (o arrástralo de vuelta al
          banco para quitarlo). Cuando estén los 11 colocados, pulsa "Comprobar": los huecos
          correctos se ponen en verde y los incorrectos en rojo. No hay límite de intentos ni botón
          de rendirse, solo un contador de intentos.
        </p>
      </>
    ),
  },
};

const HELP_CONTENT_EN: Record<string, { title: string; body: ReactNode }> = {
  "/juegos/tabla-de-tipos": {
    title: "How to play: Type Chart",
    body: (
      <>
        <p>
          Fill in the effectiveness chart from memory: the row's type attacks the column's type.
          Pick a brush (Neutral, Half, Double or None) and click cells to paint them.
        </p>
        <p>
          Once it's complete, click "Check" to see your score. Incorrect and empty cells get
          marked so you know what to review. You can pause the timer at any time.
        </p>
      </>
    ),
  },
  "/juegos/detective-pokemon": {
    title: "How to play: Pokémon Detective",
    body: (
      <>
        <p>
          Type Pokémon names to narrow down the target. Each guess compares type, generation,
          evolutionary stage, evolution method, color, height and weight: green is an exact
          match, yellow is a partial match, and the arrows show whether the real value is higher
          or lower.
        </p>
        <p>
          In the <strong>Daily Challenge</strong> everyone plays the same Pokémon each day and
          you can share your result. In <strong>Free Practice</strong> you get a hint every 4
          misses and a button to give up and see the answer.
        </p>
      </>
    ),
  },
  "/juegos/conexiones": {
    title: "How to play: Connections",
    body: (
      <>
        <p>
          There are 16 Pokémon in the grid, grouped into 4 hidden categories of 4 members each.
          Select 4 cards you think share something (type, generation, how they evolve,
          weaknesses...) and click "Check group".
        </p>
        <p>
          If you're right, the group locks at the top with its category revealed. If you're
          wrong, you lose a life: you get 4 mistakes before the game ends and the categories you
          were missing get revealed.
        </p>
      </>
    ),
  },
  "/juegos/mayor-o-menor": {
    title: "How to play: Higher or Lower",
    body: (
      <>
        <p>
          Pick a stat (HP, Attack, Defense, Special Attack, Special Defense, Speed or Pokédex
          Number). The Pokémon on the left always shows its value; the one on the right keeps it
          hidden.
        </p>
        <p>
          The ball in the middle tells you what to look for: the green Nest Ball asks for the
          Pokémon with the higher value (HIGHER) and the red Poké Ball asks for the lower one
          (LOWER). Click the Pokémon you think is correct: get it right and your streak keeps
          growing; get it wrong and the game ends.
        </p>
      </>
    ),
  },
  "/juegos/quien-es-ese-pokemon": {
    title: "How to play: Who's That Pokémon?",
    body: (
      <>
        <p>
          You'll see a Pokémon's black silhouette and have to type its name. You start with 15
          seconds on the clock: every correct guess adds 5 more seconds, up to a maximum of 15.
        </p>
        <p>
          There are no options to pick from, so any way of typing the name works (capitalization,
          accents or hyphens don't matter). Every correct guess adds a point and increases your
          streak; if you're wrong, the streak resets but the clock keeps running. The game ends
          when the timer hits zero.
        </p>
      </>
    ),
  },
  "/juegos/parrilla-pokemon": {
    title: "How to play: Pokémon Grid",
    body: (
      <>
        <p>
          Each row and column has a category (type, generation, evolution, weaknesses, moves it
          can learn...). Select an empty cell and type a Pokémon that matches both its row's and
          its column's category.
        </p>
        <p>
          If you're right, the cell fills in and you move to the next one. If you're wrong, no
          problem: you can try again as many times as you like. Just remember, you can't reuse
          the same Pokémon in two cells of the same game.
        </p>
      </>
    ),
  },
  "/juegos/pokedle": {
    title: "How to play: Pokédle",
    body: (
      <>
        <p>
          There's a hidden Pokémon and you have 6 tries to guess it. Type a Pokémon (with
          autocomplete) and its letters get colored: green if it's in the right spot, yellow if
          it's in the name but in the wrong spot, and gray if it doesn't appear at all.
        </p>
        <p>
          In the <strong>Daily challenge</strong> everyone tries to guess the same Pokémon each
          day and you can share your result as a grid of colors. In{" "}
          <strong>Free practice</strong> you can give up to see the answer and start another
          word.
        </p>
      </>
    ),
  },
  "/juegos/movimix": {
    title: "How to play: Movimix",
    body: (
      <>
        <p>
          The move set a hidden Pokémon can learn is shown. Type Pokémon names (with autocomplete)
          until you guess who it is.
        </p>
        <p>
          If you miss twice, the hidden Pokémon's type is revealed as a hint. You can give up at
          any time to see the answer.
        </p>
      </>
    ),
  },
  "/juegos/debilidex": {
    title: "How to play: Debilidex",
    body: (
      <>
        <p>
          The weakness/resistance chart of a hidden Pokémon against all 18 types is shown,
          calculated from its type(s) and also its ability if it changes a weakness (for example,
          Levitate removes its weakness to ground). Type Pokémon names (with autocomplete) until
          you guess who it is.
        </p>
        <p>
          Every miss after the second one reveals a new hint (generation, category and total base
          stats). You can give up at any time to see the answer.
        </p>
      </>
    ),
  },
  "/juegos/emojidex": {
    title: "How to play: Emojidex",
    body: (
      <>
        <p>
          A couple of emoji describe a hidden Pokémon. Type Pokémon names (with autocomplete)
          until you guess who it is.
        </p>
        <p>
          Every miss after the second one reveals a new hint (type, generation and the first
          letter of the name). You can give up at any time to see the answer.
        </p>
      </>
    ),
  },
  "/juegos/piramide": {
    title: "How to play: Pyramid",
    body: (
      <>
        <p>
          11 Pokémon and a random characteristic (a base stat or Pokédex number) appear. Place
          them in the pyramid so the best one in that characteristic ends up at the very top and
          the worst one at the bottom right, reading the pyramid row by row.
        </p>
        <p>
          Drag each Pokémon onto the slot where you want to place it (or drag it back to the bank
          to remove it). Once all 11 are placed, hit "Check": correct slots turn green and
          incorrect ones turn red. There's no attempt limit or give-up button, just an attempt
          counter.
        </p>
      </>
    ),
  },
};

export default function Layout() {
  const [bg] = useState(randomBackground);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { lang, setLang, t } = useLanguage();
  const HELP_CONTENT = lang === "en" ? HELP_CONTENT_EN : HELP_CONTENT_ES;
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
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const guessStats = loadStats("detective-pokemon");
  const connectionsStats = loadStats("conexiones");
  const pokedleStats = loadStats("pokedle");
  const movimixStats = loadStats("movimix");
  const debilidexStats = loadStats("debilidex");
  const emojidexStats = loadStats("emojidex");
  const piramideStats = loadStats("piramide");

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
              aria-label={t.header.gamesTooltip}
              title={t.header.gamesTooltip}
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
                    <span>{t.games[g.strKey].title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label={t.header.statsTooltip}
            title={t.header.statsTooltip}
            onClick={() => setStatsOpen(true)}
          >
            📊
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label={t.header.themeTooltip}
            title={t.header.themeTooltip}
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          <button
            type="button"
            className="icon-btn icon-btn--lang"
            aria-label={t.header.languageTooltip}
            title={t.header.languageTooltip}
            onClick={() => setLang(lang === "es" ? "en" : "es")}
          >
            <img
              src={lang === "es" ? "/brand/flag-es.png" : "/brand/flag-en.png"}
              alt={lang === "es" ? "Español" : "English"}
            />
          </button>

          {help && (
            <button
              type="button"
              className="icon-btn"
              aria-label={t.header.helpTooltip}
              title={t.header.helpTooltip}
              onClick={() => setHelpOpen(true)}
            >
              ❓
            </button>
          )}

          {!isHome && (
            <Link
              to="/"
              className="icon-btn"
              aria-label={t.header.homeTooltip}
              title={t.header.homeTooltip}
            >
              🏠
            </Link>
          )}
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>{t.footer.disclaimer}</p>
        <p>
          {t.footer.creditBefore} <a href="https://mdlabs.app">MDLabs</a> · {t.footer.creditAfter}{" "}
          <a href="https://linktr.ee/thehoodieapp">HOODIE</a>.
        </p>
        <p>
          <Link to="/privacidad">{t.footer.privacyLink}</Link>
        </p>
      </footer>

      {statsOpen && (
        <Modal title={t.stats.modalTitle} onClose={() => setStatsOpen(false)}>
          <StatsSection title={t.games.detectivePokemon.title} stats={guessStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.conexiones.title} stats={connectionsStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.pokedle.title} stats={pokedleStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.movimix.title} stats={movimixStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.debilidex.title} stats={debilidexStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.emojidex.title} stats={emojidexStats} t={t} />
          <div style={{ height: "1rem" }} />
          <StatsSection title={t.games.piramide.title} stats={piramideStats} t={t} />
        </Modal>
      )}

      {helpOpen && help && (
        <Modal title={help.title} onClose={() => setHelpOpen(false)}>
          {help.body}
        </Modal>
      )}

      <CookieBanner />
    </div>
  );
}
