import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { typeIcon, typeName, type TypeId } from "../../data/types";
import { useLanguage } from "../../i18n/LanguageContext";
import "./ColorGuessGame.css";

type Status = "playing" | "won" | "lost";

interface Props {
  pokedex: PokemonEntry[];
  target: PokemonEntry;
  palette: string[];
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

// Anchos decrecientes para que el color mas dominante ocupe mas espacio en la barra.
const SWATCH_WEIGHTS = [38, 26, 18, 11, 7];

export default function ColorGuessGame({
  pokedex,
  target,
  palette,
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
  const [flash, setFlash] = useState<"wrong" | null>(null);

  const finished = status !== "playing";
  const base = useMemo(() => baseFormOf(target, pokedex), [target, pokedex]);
  const tipos = useMemo(() => target.tipos.filter((tp): tp is TypeId => tp !== null), [target]);

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
    if (isCorrect(p)) {
      setStatus("won");
    } else {
      setFlash("wrong");
      setTimeout(() => setFlash(null), 400);
    }
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
      status === "won" ? t.cromodex.shareWon(guessedIds.length) : t.cromodex.shareLost(pokemonName(target, lang));
    const text = `Triviamon - ${t.games.cromodex.title}${dateLabel ? ` (${dateLabel})` : ""}\n${resultLine}`;
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

  const hintLevel = Math.min(2, Math.max(0, wrongGuesses.length - 1));
  const showHint = !finished && hintLevel > 0;

  return (
    <div className="crd-game">
      <div
        className={`crd-palette-panel ${flash === "wrong" ? "crd-palette-panel--wrong" : ""} ${
          status === "won" ? "crd-palette-panel--won" : ""
        }`}
      >
        <span className="crd-palette-label">{t.cromodex.paletteLabel}</span>
        <div className="crd-palette-bar">
          {palette.map((hex, i) => (
            <div key={i} className="crd-swatch" style={{ backgroundColor: hex, flexGrow: SWATCH_WEIGHTS[i] ?? 1 }} />
          ))}
        </div>
      </div>

      {!finished && (
        <div className="crd-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.cromodex.placeholder}
            className="crd-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="crd-suggestions">
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
        <div className="crd-actions-row">
          {showHint && (
            <div className="crd-hint">
              <span className="crd-hint-title">{t.cromodex.hintTitle}</span>
              <div className="crd-hint-row">
                <span>{t.cromodex.hintTypeLabel}</span>
                <span className="crd-hint-types">
                  {tipos.map((tp) => (
                    <img key={tp} src={typeIcon(tp)} alt={typeName(tp, lang)} className="crd-hint-type-icon" />
                  ))}
                </span>
              </div>
              {hintLevel >= 2 && (
                <div className="crd-hint-row">
                  <span>{t.cromodex.hintGenLabel}</span>
                  <span>{target.generacion}</span>
                </div>
              )}
            </div>
          )}
          <button type="button" className="crd-btn crd-btn--danger" onClick={handleGiveUp}>
            {t.cromodex.giveUp}
          </button>
        </div>
      )}

      {finished && (
        <div className="crd-finish">
          <img src={pokemonSprite(target.id)} alt={pokemonName(target, lang)} />
          {status === "won" ? (
            <>
              <h3>{t.cromodex.wonTitle(pokemonName(target, lang))}</h3>
              <p>{t.cromodex.guessedInAttempts(guessedIds.length)}</p>
            </>
          ) : (
            <h3>{t.cromodex.lostTitle(pokemonName(target, lang))}</h3>
          )}
          <div className="crd-finish-actions">
            <button type="button" className="crd-btn crd-btn--primary" onClick={handleShare}>
              {t.common.shareResult}
            </button>
            {onNewPractice && (
              <button type="button" className="crd-btn" onClick={onNewPractice}>
                {t.cromodex.anotherPokemon}
              </button>
            )}
          </div>
        </div>
      )}

      {wrongGuesses.length > 0 && (
        <div className="crd-guesses">
          <span className="crd-guesses-label">{t.cromodex.previousGuessesLabel}</span>
          <div className="crd-guesses-list">
            {wrongGuesses.map((p) => (
              <span className="crd-guess-chip" key={p.id}>
                {pokemonName(p, lang)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
