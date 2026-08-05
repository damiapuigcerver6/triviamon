import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonSprite } from "../../data/pokedex";
import { typeIcon } from "../../data/types";
import {
  compareGuess,
  shareGrid,
  ATTRIBUTE_ORDER,
  type AttributeKey,
  type GuessResult,
} from "./compare";
import "./GuessGame.css";

const ATTR_LABEL: Record<AttributeKey, string> = {
  tipo1: "Tipo 1",
  tipo2: "Tipo 2",
  generacion: "Gen.",
  fase: "Fase evol.",
  metodo: "Método evol.",
  color: "Color",
  altura: "Altura",
  peso: "Peso",
};

const HINT_EVERY = 4;

interface Props {
  pokedex: PokemonEntry[];
  target: PokemonEntry;
  storageKey?: string;
  /** Si se define, es el modo reto diario: muestra el boton de compartir con esta fecha. */
  dateLabel?: string;
  /** Modo practica: activa pistas cada 4 fallos y el boton de solucionar. */
  hintsEnabled?: boolean;
  onNewPractice?: () => void;
  /** Se llama cada vez que la partida esta en estado "ganado" (modo reto diario). */
  onWin?: () => void;
}

interface StoredState {
  guesses: GuessResult[];
  gaveUp: boolean;
}

function loadStored(
  storageKey: string | undefined,
  pokedex: PokemonEntry[],
  target: PokemonEntry,
): StoredState {
  if (!storageKey) return { guesses: [], gaveUp: false };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { guesses: [], gaveUp: false };
    const parsed = JSON.parse(raw);
    const ids: number[] = Array.isArray(parsed) ? parsed : (parsed.ids ?? []);
    const gaveUp: boolean = Array.isArray(parsed) ? false : !!parsed.gaveUp;
    const guesses = ids
      .map((id) => pokedex.find((p) => p.id === id))
      .filter((p): p is PokemonEntry => !!p)
      .map((p) => compareGuess(p, target));
    return { guesses, gaveUp };
  } catch {
    return { guesses: [], gaveUp: false };
  }
}

export default function GuessGame({
  pokedex,
  target,
  storageKey,
  dateLabel,
  hintsEnabled,
  onNewPractice,
  onWin,
}: Props) {
  const [query, setQuery] = useState("");
  const [guesses, setGuesses] = useState<GuessResult[]>(
    () => loadStored(storageKey, pokedex, target).guesses,
  );
  const [gaveUp, setGaveUp] = useState<boolean>(
    () => loadStored(storageKey, pokedex, target).gaveUp,
  );

  const won = guesses.some((g) => g.isWin);
  const finished = won || gaveUp;

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ids: guesses.map((g) => g.pokemon.id), gaveUp }),
    );
  }, [guesses, gaveUp, storageKey]);

  useEffect(() => {
    if (won) onWin?.();
  }, [won, onWin]);

  const guessedIds = useMemo(() => new Set(guesses.map((g) => g.pokemon.id)), [guesses]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return pokedex
      .filter((p) => !guessedIds.has(p.id) && normalize(p.nombre).includes(q))
      .slice(0, 8);
  }, [query, pokedex, guessedIds]);

  const solvedAttrs = useMemo(() => {
    const s = new Set<AttributeKey>();
    for (const g of guesses) {
      for (const k of ATTRIBUTE_ORDER) {
        if (g.attrs[k].match === "match") s.add(k);
      }
    }
    return s;
  }, [guesses]);

  const wrongGuesses = won ? guesses.length - 1 : guesses.length;
  const hintCount = hintsEnabled ? Math.floor(wrongGuesses / HINT_EVERY) : 0;
  const hints = useMemo(
    () => ATTRIBUTE_ORDER.filter((k) => !solvedAttrs.has(k)).slice(0, hintCount),
    [solvedAttrs, hintCount],
  );

  function submitGuess(pokemon: PokemonEntry) {
    if (finished) return;
    setGuesses((prev) => [compareGuess(pokemon, target), ...prev]);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && suggestions.length > 0) {
      submitGuess(suggestions[0]);
    }
  }

  async function handleShare() {
    const ordered = [...guesses].reverse();
    const text = shareGrid(ordered, dateLabel ?? "");
    try {
      await navigator.clipboard.writeText(text);
      alert("¡Resultado copiado! Pégalo donde quieras.");
    } catch {
      alert(text);
    }
  }

  return (
    <div className="qp-game">
      {!finished && (
        <div className="qp-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe el nombre de un Pokémon..."
            className="qp-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="qp-suggestions">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => submitGuess(p)}>
                    <img src={pokemonSprite(p.id)} alt="" loading="lazy" />
                    <span>{p.nombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!finished && hints.length > 0 && (
        <div className="qp-hints">
          <span className="qp-hints-label">💡 Pistas:</span>
          {hints.map((k) => (
            <span className="qp-hint-chip" key={k}>
              <strong>{ATTR_LABEL[k]}:</strong> {renderAttrContent(k, target)}
            </span>
          ))}
          <button type="button" className="qp-btn qp-btn--danger" onClick={() => setGaveUp(true)}>
            Solucionar
          </button>
        </div>
      )}

      {finished && (
        <div className="qp-win">
          <img src={pokemonSprite(target.id)} alt={target.nombre} />
          {won ? (
            <>
              <h3>¡Es {target.nombre}!</h3>
              <p>
                Lo adivinaste en {guesses.length} intento{guesses.length === 1 ? "" : "s"}.
              </p>
            </>
          ) : (
            <h3>La respuesta era {target.nombre}</h3>
          )}
          <div className="qp-win-actions">
            {won && dateLabel !== undefined && (
              <button type="button" className="qp-btn qp-btn--primary" onClick={handleShare}>
                Compartir resultado
              </button>
            )}
            {onNewPractice && (
              <button type="button" className="qp-btn" onClick={onNewPractice}>
                Otro Pokémon
              </button>
            )}
          </div>
        </div>
      )}

      {guesses.length > 0 && (
        <div className="qp-table-wrap">
          <table className="qp-table">
            <thead>
              <tr>
                <th>Pokémon</th>
                {ATTRIBUTE_ORDER.map((k) => (
                  <th key={k}>{ATTR_LABEL[k]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guesses.map((g) => (
                <tr key={g.pokemon.id}>
                  <td className="qp-cell qp-cell--name">
                    <img src={pokemonSprite(g.pokemon.id)} alt="" loading="lazy" />
                    <span>{g.pokemon.nombre}</span>
                  </td>
                  {ATTRIBUTE_ORDER.map((k) => {
                    const attr = g.attrs[k];
                    const dirArrow =
                      attr.direction === "up" ? "↑" : attr.direction === "down" ? "↓" : "";
                    return (
                      <td key={k} className={`qp-cell qp-cell--${attr.match}`}>
                        {renderAttrContent(k, g.pokemon)}
                        {dirArrow && <span className="qp-arrow">{dirArrow}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function renderAttrContent(key: AttributeKey, p: PokemonEntry) {
  switch (key) {
    case "tipo1":
    case "tipo2": {
      const t = key === "tipo1" ? p.tipos[0] : p.tipos[1];
      return t ? <img src={typeIcon(t)} alt={t} className="qp-type-icon" /> : <span>—</span>;
    }
    case "generacion":
      return <span>{p.generacion}</span>;
    case "fase":
      return <span>{p.fase}</span>;
    case "metodo":
      return <span>{p.metodo}</span>;
    case "color":
      return <span>{p.color}</span>;
    case "altura":
      return <span>{p.altura} m</span>;
    case "peso":
      return <span>{p.peso} kg</span>;
  }
}
