import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { typeBadge, type TypeId } from "../../data/types";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Lang } from "../../data/language";
import { buildGridInstance, cellCandidateIds, exampleAnswer } from "./gridBuilder";
import type { Category } from "../../data/categories";
import "./GridGame.css";

function CategoryLabel({ category, lang }: { category: Category; lang: Lang }) {
  if (category.id.startsWith("tipo:")) {
    const typeId = category.id.slice("tipo:".length) as TypeId;
    return <img src={typeBadge(typeId, lang)} alt={category.label} className="pg-type-badge" />;
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
  const { lang, t } = useLanguage();
  const instance = useMemo(() => buildGridInstance(pokedex, seed, lang), [pokedex, seed, lang]);
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
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, number>>({});
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
      .filter((p) => !usedIds.has(p.id) && normalize(pokemonName(p, lang)).includes(q))
      .slice(0, 8);
  }, [query, pokedex, usedIds, selectedCell, lang]);

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
      setMessage(t.parrillaPokemon.alreadyUsed(pokemonName(pokemon, lang)));
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
      setMessage(t.parrillaPokemon.doesntMatch(pokemonName(pokemon, lang)));
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

  useEffect(() => {
    if (!revealed) return;
    const used = new Set(usedIds);
    const answers: Record<number, number> = {};
    for (let i = 0; i < 9; i++) {
      if (filled[i] !== undefined) continue;
      const row = Math.floor(i / 3);
      const col = i % 3;
      const answer = exampleAnswer(puzzle, row, col, used);
      if (answer) {
        answers[i] = answer.id;
        used.add(answer.id);
      }
    }
    setRevealedAnswers(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, puzzle]);

  async function handleShare() {
    const text = `Triviamon - ${t.games.parrillaPokemon.title}${dateLabel ? ` (${dateLabel})` : ""}\n${
      revealed ? t.parrillaPokemon.shareGaveUp : t.parrillaPokemon.shareCompleted
    } · ${t.parrillaPokemon.shareMistakesLine(attempts)}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
    } catch {
      alert(text);
    }
  }

  return (
    <div className="pg-game">
      <div className="pg-topbar">
        <span>
          {t.parrillaPokemon.cells} <strong>{filledCount}/9</strong>
        </span>
        <span>
          {t.parrillaPokemon.mistakes} <strong>{attempts}</strong>
        </span>
      </div>

      <div className="pg-grid">
        <div className="pg-cell pg-cell--corner" />
        {puzzle.cols.map((c, i) => (
          <div key={`col-${i}`} className="pg-cell pg-cell--header">
            <CategoryLabel category={c} lang={lang} />
          </div>
        ))}

        {puzzle.rows.map((r, rowIdx) => (
          <Fragment key={`row-${rowIdx}`}>
            <div className="pg-cell pg-cell--header">
              <CategoryLabel category={r} lang={lang} />
            </div>
            {puzzle.cols.map((_, colIdx) => {
              const cellIdx = rowIdx * 3 + colIdx;
              const pokemonId = filled[cellIdx];
              const isRevealed = pokemonId === undefined && revealedAnswers[cellIdx] !== undefined;
              const displayId = pokemonId ?? revealedAnswers[cellIdx];
              const pokemon = displayId !== undefined ? pokedexById.get(displayId) : undefined;
              const isSelected = selectedCell === cellIdx;
              const isShaking = shakeCell === cellIdx;
              return (
                <button
                  type="button"
                  key={`cell-${cellIdx}`}
                  className={`pg-cell pg-cell--answer ${pokemonId !== undefined ? "pg-cell--filled" : ""} ${
                    isRevealed ? "pg-cell--revealed" : ""
                  } ${isSelected ? "pg-cell--selected" : ""} ${isShaking ? "pg-cell--shake" : ""}`}
                  onClick={() => selectCell(cellIdx)}
                  disabled={gameOver || pokemonId !== undefined}
                >
                  {pokemon && (
                    <>
                      <img src={pokemonSprite(pokemon.id)} alt="" loading="lazy" />
                      <span>{pokemonName(pokemon, lang)}</span>
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
              ? t.parrillaPokemon.selectEmptyCell
              : t.parrillaPokemon.typeMatchingPokemon}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.parrillaPokemon.placeholder}
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
                    <span>{pokemonName(p, lang)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {message && <p className="pg-message">{message}</p>}
          <button type="button" className="pg-btn pg-btn--danger" onClick={handleReveal}>
            {t.parrillaPokemon.giveUp}
          </button>
        </div>
      )}

      {gameOver && (
        <div className="pg-finish">
          <h3>{complete ? t.parrillaPokemon.completedTitle : t.parrillaPokemon.revealedTitle}</h3>
          <p>{t.parrillaPokemon.cellsSolved(filledCount, attempts)}</p>
          <div className="pg-finish-actions">
            {complete && (
              <button type="button" className="pg-btn pg-btn--primary" onClick={handleShare}>
                {t.common.shareResult}
              </button>
            )}
            {onNewPractice && (
              <button type="button" className="pg-btn" onClick={onNewPractice}>
                {t.parrillaPokemon.anotherGrid}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
