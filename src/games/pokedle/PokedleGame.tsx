import { useEffect, useMemo, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
import { baseSpecies, pickAnswer, MAX_ATTEMPTS } from "./pokedleBuilder";
import { compareGuess, isExactGuess, type LetterState } from "./wordCompare";
import "./PokedleGame.css";

interface Props {
  pokedex: PokemonEntry[];
  seed: number;
  storageKey: string;
  dateLabel?: string;
  onSolved?: () => void;
  onNewPractice?: () => void;
}

interface StoredProgress {
  guessIds: number[];
  status: "playing" | "won" | "lost";
}

function loadProgress(storageKey: string): StoredProgress {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { guessIds: [], status: "playing" };
    const parsed = JSON.parse(raw);
    return {
      guessIds: Array.isArray(parsed.guessIds) ? parsed.guessIds : [],
      status: parsed.status === "won" || parsed.status === "lost" ? parsed.status : "playing",
    };
  } catch {
    return { guessIds: [], status: "playing" };
  }
}

export default function PokedleGame({
  pokedex,
  seed,
  storageKey,
  dateLabel,
  onSolved,
  onNewPractice,
}: Props) {
  const { lang, t } = useLanguage();
  const answer = useMemo(() => pickAnswer(pokedex, seed), [pokedex, seed]);
  const candidates = useMemo(() => baseSpecies(pokedex), [pokedex]);
  const pokedexById = useMemo(() => {
    const map = new Map<number, PokemonEntry>();
    for (const p of pokedex) map.set(p.id, p);
    return map;
  }, [pokedex]);

  const initial = useMemo(() => loadProgress(storageKey), [storageKey]);
  const [guessIds, setGuessIds] = useState<number[]>(initial.guessIds);
  const [status, setStatus] = useState<StoredProgress["status"]>(initial.status);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const gameOver = status !== "playing";

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ guessIds, status }));
  }, [guessIds, status, storageKey]);

  useEffect(() => {
    if (status === "won") onSolved?.();
  }, [status, onSolved]);

  const guessedIds = useMemo(() => new Set(guessIds), [guessIds]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return candidates
      .filter((p) => !guessedIds.has(p.id) && normalize(pokemonName(p, lang)).includes(q))
      .slice(0, 8);
  }, [query, candidates, guessedIds, lang]);

  function submitGuess(pokemon: PokemonEntry) {
    if (gameOver || guessedIds.has(pokemon.id)) return;

    const nextGuessIds = [...guessIds, pokemon.id];
    setGuessIds(nextGuessIds);
    setQuery("");

    if (isExactGuess(pokemonName(pokemon, lang), pokemonName(answer, lang))) {
      setStatus("won");
    } else if (nextGuessIds.length >= MAX_ATTEMPTS) {
      setStatus("lost");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && suggestions.length > 0) {
      submitGuess(suggestions[0]);
    }
  }

  function handleReveal() {
    setStatus("lost");
  }

  async function handleShare() {
    const rows = guessIds.map((id) => {
      const p = pokedexById.get(id);
      const states = compareGuess(pokemonName(p!, lang), pokemonName(answer, lang));
      return states.map((s) => (s === "correct" ? "🟩" : s === "present" ? "🟨" : "⬛")).join("");
    });
    const resultLine =
      status === "won" ? t.pokedle.shareWon(guessIds.length, MAX_ATTEMPTS) : t.pokedle.shareLost(MAX_ATTEMPTS);
    const text = `Triviamon - ${t.games.pokedle.title}${dateLabel ? ` (${dateLabel})` : ""}\n${resultLine}\n${rows.join(
      "\n",
    )}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
    } catch {
      alert(text);
    }
  }

  return (
    <div className="pk-game">
      <div className="pk-topbar">
        <span>{t.pokedle.attemptsLabel(guessIds.length, MAX_ATTEMPTS)}</span>
      </div>

      <div className="pk-rows">
        {guessIds.map((id) => {
          const p = pokedexById.get(id);
          if (!p) return null;
          const name = pokemonName(p, lang);
          const states = compareGuess(name, pokemonName(answer, lang));
          const letters = [...name];
          return (
            <div className="pk-row" key={id}>
              {letters.map((ch, i) => (
                <span key={i} className={`pk-tile pk-tile--${states[i] as LetterState}`}>
                  {ch}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {!gameOver && (
        <div className="pk-controls">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.pokedle.placeholder}
            className="pk-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="pk-suggestions">
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
          <p className="pk-legend">{t.pokedle.legend}</p>
          <button type="button" className="pk-btn pk-btn--danger" onClick={handleReveal}>
            {t.pokedle.giveUp}
          </button>
        </div>
      )}

      {gameOver && (
        <div className="pk-finish">
          <h3>
            {status === "won" ? t.pokedle.wonTitle(pokemonName(answer, lang)) : t.pokedle.lostTitle(pokemonName(answer, lang))}
          </h3>
          <img className="pk-finish-sprite" src={pokemonSprite(answer.id)} alt={pokemonName(answer, lang)} />
          {status === "won" && <p>{t.pokedle.guessedInAttempts(guessIds.length, MAX_ATTEMPTS)}</p>}
          <div className="pk-finish-actions">
            <button type="button" className="pk-btn pk-btn--primary" onClick={handleShare}>
              {t.common.shareResult}
            </button>
            {onNewPractice && (
              <button type="button" className="pk-btn" onClick={onNewPractice}>
                {t.pokedle.anotherWord}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
