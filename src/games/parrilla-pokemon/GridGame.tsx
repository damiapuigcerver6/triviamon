import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonSprite } from "../../data/pokedex";
import { typeBadge, type TypeId } from "../../data/types";
import { buildGridInstance, cellCandidateIds, exampleAnswer } from "./gridBuilder";
import type { Category } from "../../data/categories";
import "./GridGame.css";

function CategoryLabel({ category }: { category: Category }) {
  if (category.id.startsWith("tipo:")) {
    const typeId = category.id.slice("tipo:".length) as TypeId;
    return <img src={typeBadge(typeId)} alt={category.label} className="pg-type-badge" />;
  }
  return <>{category.label}</>;
}

interface Props {
  pokedex: PokemonEntry[];
  seed: number;
  storageKey: string;
  /** Si se define, es el modo reto diario: muestra el boton de compartir. */
  dateLabel?: string;
  onSolved?: () => void;
  onNewPractice?: () => void;
}

interface StoredProgress {
  filled: Record<number, number>; // cellIndex -> pokemonId
  attempts: number;
  revealed: boolean;
}

function loadProgress(storageKey: string): StoredProgress {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { filled: {}, attempts: 0, revealed: false };
    const parsed = JSON.parse(raw);
    return {
      filled: parsed.filled ?? {},
      attempts: parsed.attempts ?? 0,
      revealed: parsed.revealed ?? false,
    };
  } catch {
    return { filled: {}, attempts: 0, revealed: false };
  }
}

export default function GridGame({
  pokedex,
  seed,
  storageKey,
  dateLabel,
  onSolved,
  onNewPractice,
}: Props) {
  const instance = useMemo(() => buildGridInstance(pokedex, seed), [pokedex, seed]);
  const { puzzle } = instance;

  const pokedexById = useMemo(() => {
    const map = new Map<number, PokemonEntry>();
    for (const p of pokedex) map.set(p.id, p);
    return map;
  }, [pokedex]);

  const candidateSets = useMemo(() => {
    const grid: Set<number>[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: Set<number>[] = [];
      for (let c = 0; c < 3; c++) row.push(cellCandidateIds(puzzle, r, c));
      grid.push(row);
    }
    return grid;
  }, [puzzle]);

  const initial = useMemo(() => loadProgress(storageKey), [storageKey]);
  const [filled, setFilled] = useState<Record<number, number>>(initial.filled);
  const [attempts, setAttempts] = useState(initial.attempts);
  const [revealed, setRevealed] = useState(initial.revealed);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [shakeCell, setShakeCell] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filledCount = Object.keys(filled).length;
  const complete = filledCount === 9;
  const gameOver = complete || revealed;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ filled, attempts, revealed }));
  }, [filled, attempts, revealed, storageKey]);

  useEffect(() => {
    if (selectedCell !== null) inputRef.current?.focus();
  }, [selectedCell]);

  useEffect(() => {
    if (complete) onSolved?.();
  }, [complete, onSolved]);

  const usedIds = useMemo(() => new Set(Object.values(filled)), [filled]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q || selectedCell === null) return [];
    return pokedex
      .filter((p) => !usedIds.has(p.id) && normalize(p.nombre).includes(q))
      .slice(0, 8);
  }, [query, pokedex, usedIds, selectedCell]);

  function selectCell(cellIdx: number) {
    if (gameOver || filled[cellIdx] !== undefined) return;
    setSelectedCell(cellIdx);
    setMessage(null);
    setQuery("");
  }

  function submitGuess(pokemon: PokemonEntry) {
    if (selectedCell === null) return;
    const row = Math.floor(selectedCell / 3);
    const col = selectedCell % 3;

    if (usedIds.has(pokemon.id)) {
      setMessage(`Ya has usado a ${pokemon.nombre} en otra casilla.`);
      setShakeCell(selectedCell);
      setTimeout(() => setShakeCell(null), 400);
      return;
    }

    if (candidateSets[row][col].has(pokemon.id)) {
      setFilled((prev) => ({ ...prev, [selectedCell]: pokemon.id }));
      setQuery("");
      setMessage(null);
      const nextEmpty = Array.from({ length: 9 }, (_, i) => i).find(
        (i) => i !== selectedCell && filled[i] === undefined,
      );
      setSelectedCell(nextEmpty ?? null);
    } else {
      setAttempts((prev) => prev + 1);
      setMessage(`${pokemon.nombre} no cumple las dos categorías.`);
      setShakeCell(selectedCell);
      setQuery("");
      setTimeout(() => setShakeCell(null), 400);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && suggestions.length > 0) {
      submitGuess(suggestions[0]);
    }
  }

  function handleReveal() {
    setRevealed(true);
    setSelectedCell(null);
  }

  async function handleShare() {
    const text = `Triviamon - Parrilla Pokémon${dateLabel ? ` (${dateLabel})` : ""}\n${
      revealed ? "Rendido" : `Completado`
    } · Fallos: ${attempts}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("¡Resultado copiado! Pégalo donde quieras.");
    } catch {
      alert(text);
    }
  }

  return (
    <div className="pg-game">
      <div className="pg-topbar">
        <span>
          Casillas: <strong>{filledCount}/9</strong>
        </span>
        <span>
          Fallos: <strong>{attempts}</strong>
        </span>
      </div>

      <div className="pg-grid">
        <div className="pg-cell pg-cell--corner" />
        {puzzle.cols.map((c, i) => (
          <div key={`col-${i}`} className="pg-cell pg-cell--header">
            <CategoryLabel category={c} />
          </div>
        ))}

        {puzzle.rows.map((r, rowIdx) => (
          <Fragment key={`row-${rowIdx}`}>
            <div className="pg-cell pg-cell--header">
              <CategoryLabel category={r} />
            </div>
            {puzzle.cols.map((_, colIdx) => {
              const cellIdx = rowIdx * 3 + colIdx;
              const pokemonId = filled[cellIdx];
              const pokemon = pokemonId !== undefined ? pokedexById.get(pokemonId) : undefined;
              const isSelected = selectedCell === cellIdx;
              const isShaking = shakeCell === cellIdx;
              return (
                <button
                  type="button"
                  key={`cell-${cellIdx}`}
                  className={`pg-cell pg-cell--answer ${pokemon ? "pg-cell--filled" : ""} ${
                    isSelected ? "pg-cell--selected" : ""
                  } ${isShaking ? "pg-cell--shake" : ""}`}
                  onClick={() => selectCell(cellIdx)}
                  disabled={gameOver || pokemon !== undefined}
                >
                  {pokemon && (
                    <>
                      <img src={pokemonSprite(pokemon.id)} alt="" loading="lazy" />
                      <span>{pokemon.nombre}</span>
                    </>
                  )}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>

      {!gameOver && (
        <div className="pg-controls">
          <p className="pg-hint">
            {selectedCell === null
              ? "Selecciona una casilla vacía para responder."
              : "Escribe un Pokémon que cumpla las dos categorías de esa casilla."}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe el nombre de un Pokémon..."
            className="pg-input"
            autoComplete="off"
            disabled={selectedCell === null}
          />
          {suggestions.length > 0 && (
            <ul className="pg-suggestions">
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
          {message && <p className="pg-message">{message}</p>}
          <button type="button" className="pg-btn pg-btn--danger" onClick={handleReveal}>
            Rendirse
          </button>
        </div>
      )}

      {gameOver && (
        <div className="pg-finish">
          <h3>{complete ? "¡Parrilla completada!" : "Parrilla revelada"}</h3>
          <p>
            Casillas acertadas: <strong>{filledCount}/9</strong> · Fallos: <strong>{attempts}</strong>
          </p>
          {revealed && !complete && (
            <div className="pg-solution">
              {Array.from({ length: 9 }, (_, i) => i)
                .filter((i) => filled[i] === undefined)
                .map((i) => {
                  const row = Math.floor(i / 3);
                  const col = i % 3;
                  const answer = exampleAnswer(puzzle, row, col, usedIds);
                  return (
                    <p key={i}>
                      <strong>
                        {puzzle.rows[row].label} + {puzzle.cols[col].label}:
                      </strong>{" "}
                      {answer ? answer.nombre : "—"}
                    </p>
                  );
                })}
            </div>
          )}
          <div className="pg-finish-actions">
            {complete && (
              <button type="button" className="pg-btn pg-btn--primary" onClick={handleShare}>
                Compartir resultado
              </button>
            )}
            {onNewPractice && (
              <button type="button" className="pg-btn" onClick={onNewPractice}>
                Otra parrilla
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
