import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { typeIcon, type TypeId } from "../../data/types";
import { moveMetaName, categoryIcon, type MoveMeta } from "../../data/moveMeta";
import { useLanguage } from "../../i18n/LanguageContext";
import "./MoveGuessGame.css";

type Status = "playing" | "won" | "lost";

interface Props {
  pokedex: PokemonEntry[];
  target: PokemonEntry;
  moveMeta: Record<string, MoveMeta>;
  storageKey?: string;
  /** Si se define, es el modo reto diario: muestra el boton de compartir con esta fecha. */
  dateLabel?: string;
  onNewPractice?: () => void;
  /** Se llama cuando la partida pasa a estado "ganado". */
  onWin?: () => void;
}

interface StoredState {
  guessedIds: number[];
  status: Status;
}

function loadStored(storageKey: string | undefined): StoredState {
  if (!storageKey) return { guessedIds: [], status: "playing" };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { guessedIds: [], status: "playing" };
    const parsed = JSON.parse(raw);
    return {
      guessedIds: Array.isArray(parsed.guessedIds) ? parsed.guessedIds : [],
      status: parsed.status === "won" || parsed.status === "lost" ? parsed.status : "playing",
    };
  } catch {
    return { guessedIds: [], status: "playing" };
  }
}

// Las formas regionales (id >= 10000) comparten numero_pokedex con su forma base;
// adivinar solo el nombre base tambien cuenta como acierto.
function baseFormOf(target: PokemonEntry, pokedex: PokemonEntry[]): PokemonEntry | null {
  if (target.id < 10000) return null;
  return pokedex.find((p) => p.id < 10000 && p.numero_pokedex === target.numero_pokedex) ?? null;
}

export default function MoveGuessGame({
  pokedex,
  target,
  moveMeta,
  storageKey,
  dateLabel,
  onNewPractice,
  onWin,
}: Props) {
  const { lang, t } = useLanguage();
  const stored = useMemo(() => loadStored(storageKey), [storageKey]);
  const [query, setQuery] = useState("");
  const [guessedIds, setGuessedIds] = useState<number[]>(stored.guessedIds);
  const [status, setStatus] = useState<Status>(stored.status);

  const finished = status !== "playing";
  const base = useMemo(() => baseFormOf(target, pokedex), [target, pokedex]);
  const moveRows = useMemo(
    () => [...target.movimientos_nivel].sort((a, b) => a.nivel - b.nivel),
    [target],
  );

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ guessedIds, status }));
  }, [guessedIds, status, storageKey]);

  useEffect(() => {
    if (status === "won") onWin?.();
  }, [status, onWin]);

  const guessedSet = useMemo(() => new Set(guessedIds), [guessedIds]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return pokedex
      .filter((p) => !guessedSet.has(p.id) && normalize(pokemonName(p, lang)).includes(q))
      .slice(0, 8);
  }, [query, pokedex, guessedSet, lang]);

  function isCorrect(p: PokemonEntry): boolean {
    return p.id === target.id || (base !== null && p.id === base.id);
  }

  function submitGuess(p: PokemonEntry) {
    if (finished || guessedSet.has(p.id)) return;
    setGuessedIds((prev) => [p.id, ...prev]);
    setQuery("");
    if (isCorrect(p)) setStatus("won");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && suggestions.length > 0) {
      submitGuess(suggestions[0]);
    }
  }

  function handleGiveUp() {
    setStatus("lost");
  }

  async function handleShare() {
    const resultLine =
      status === "won"
        ? t.movimix.shareWon(guessedIds.length)
        : t.movimix.shareLost(pokemonName(target, lang));
    const text = `Triviamon - ${t.games.movimix.title}${dateLabel ? ` (${dateLabel})` : ""}\n${resultLine}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
    } catch {
      alert(text);
    }
  }

  const wrongGuesses = guessedIds
    .map((id) => pokedex.find((p) => p.id === id))
    .filter((p): p is PokemonEntry => !!p && !isCorrect(p));

  const showHint = !finished && wrongGuesses.length >= 2;
  const targetTypes = target.tipos.filter((tp): tp is TypeId => !!tp);

  return (
    <div className="mv-game">
      <div className="mv-moves">
        <span className="mv-moves-label">{t.movimix.movesLabel}</span>
        <div className="mv-table-wrap">
          <table className="mv-table">
            <thead>
              <tr>
                <th>{t.movimix.tableLevel}</th>
                <th>{t.movimix.tableMove}</th>
                <th>{t.movimix.tableType}</th>
                <th>{t.movimix.tableCategory}</th>
              </tr>
            </thead>
            <tbody>
              {moveRows.map((row) => {
                const meta = moveMeta[row.move];
                return (
                  <tr key={row.move}>
                    <td className="mv-table-level">{row.nivel === 0 ? t.movimix.evoLevel : row.nivel}</td>
                    <td className="mv-table-move">{meta ? moveMetaName(meta, lang) : row.move}</td>
                    <td className="mv-table-icon">
                      {meta && <img src={typeIcon(meta.tipo)} alt={meta.tipo} />}
                    </td>
                    <td className="mv-table-icon">
                      {meta && <img src={categoryIcon(meta.categoria)} alt={meta.categoria} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!finished && (
        <div className="mv-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.movimix.placeholder}
            className="mv-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="mv-suggestions">
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
        </div>
      )}

      {!finished && (
        <div className="mv-actions-row">
          {showHint && (
            <div className="mv-hint">
              <span className="mv-hint-label">{t.movimix.hintLabel}</span>
              {targetTypes.map((tp) => (
                <img key={tp} src={typeIcon(tp)} alt={tp} className="mv-hint-type" />
              ))}
            </div>
          )}
          <button type="button" className="mv-btn mv-btn--danger" onClick={handleGiveUp}>
            {t.movimix.giveUp}
          </button>
        </div>
      )}

      {finished && (
        <div className="mv-finish">
          <img src={pokemonSprite(target.id)} alt={pokemonName(target, lang)} />
          {status === "won" ? (
            <>
              <h3>{t.movimix.wonTitle(pokemonName(target, lang))}</h3>
              <p>{t.movimix.guessedInAttempts(guessedIds.length)}</p>
            </>
          ) : (
            <h3>{t.movimix.lostTitle(pokemonName(target, lang))}</h3>
          )}
          <div className="mv-finish-actions">
            <button type="button" className="mv-btn mv-btn--primary" onClick={handleShare}>
              {t.common.shareResult}
            </button>
            {onNewPractice && (
              <button type="button" className="mv-btn" onClick={onNewPractice}>
                {t.movimix.anotherPokemon}
              </button>
            )}
          </div>
        </div>
      )}

      {wrongGuesses.length > 0 && (
        <div className="mv-guesses">
          <span className="mv-guesses-label">{t.movimix.previousGuessesLabel}</span>
          <div className="mv-guesses-list">
            {wrongGuesses.map((p) => (
              <span className="mv-guess-chip" key={p.id}>
                {pokemonName(p, lang)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
