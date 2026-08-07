import { useEffect, useMemo, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { pokemonName, pokemonSprite } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
import { baseSpecies, pickAnswer, MAX_ATTEMPTS } from "./pokedleBuilder";
import { compareGuess, isExactGuess, letterWord, normalizeGuess, type LetterState } from "./wordCompare";
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
  const answerName = pokemonName(answer, lang);
  const answerLength = useMemo(() => letterWord(answerName).length, [answerName]);
  const candidates = useMemo(() => baseSpecies(pokedex), [pokedex]);
  const pokedexById = useMemo(() => {
    const map = new Map<number, PokemonEntry>();
    for (const p of pokedex) map.set(p.id, p);
    return map;
  }, [pokedex]);

  const initial = useMemo(() => loadProgress(storageKey), [storageKey]);
  const [guessIds, setGuessIds] = useState<number[]>(initial.guessIds);
  const [status, setStatus] = useState<StoredProgress["status"]>(initial.status);
  const [currentGuess, setCurrentGuess] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  function findColdHintIndex(ids: number[]): number | null {
    if (ids.length < 2) return null;
    for (let i = 0; i < answerLength; i++) {
      const neverInformative = ids.every((id) => {
        const p = pokedexById.get(id);
        if (!p) return true;
        return compareGuess(pokemonName(p, lang), answerName)[i] === "absent";
      });
      if (neverInformative) return i;
    }
    return null;
  }

  const [hintIndex, setHintIndex] = useState<number | null>(() => findColdHintIndex(initial.guessIds));

  useEffect(() => {
    if (hintIndex !== null || guessIds.length < 2) return;
    const idx = findColdHintIndex(guessIds);
    if (idx !== null) setHintIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessIds, hintIndex]);

  const gameOver = status !== "playing";

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ guessIds, status }));
  }, [guessIds, status, storageKey]);

  useEffect(() => {
    if (status === "won") onSolved?.();
  }, [status, onSolved]);

  useEffect(() => {
    if (!gameOver) hiddenInputRef.current?.focus();
  }, [gameOver, guessIds.length]);

  const guessedIds = useMemo(() => new Set(guessIds), [guessIds]);

  function triggerInvalid(msg: string) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function focusInput() {
    hiddenInputRef.current?.focus();
  }

  function handleTypedChange(raw: string) {
    setError(null);
    setCurrentGuess(raw.replace(/[^a-zA-Z0-9]/g, "").slice(0, answerLength));
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (gameOver) return;
    if (currentGuess.length < answerLength) {
      triggerInvalid(t.pokedle.notEnoughLetters);
      return;
    }

    const match = candidates.find((p) => normalizeGuess(pokemonName(p, lang)) === normalizeGuess(currentGuess));

    if (!match) {
      triggerInvalid(t.pokedle.notAPokemon);
      return;
    }
    if (guessedIds.has(match.id)) {
      triggerInvalid(t.pokedle.alreadyGuessed(pokemonName(match, lang)));
      return;
    }

    setError(null);
    setCurrentGuess("");
    const nextGuessIds = [...guessIds, match.id];
    setGuessIds(nextGuessIds);

    if (isExactGuess(pokemonName(match, lang), answerName)) {
      setStatus("won");
    } else if (nextGuessIds.length >= MAX_ATTEMPTS) {
      setStatus("lost");
    }
    focusInput();
  }

  function handleReveal() {
    setStatus("lost");
  }

  async function handleShare() {
    const rows = guessIds.map((id) => {
      const p = pokedexById.get(id);
      const states = compareGuess(pokemonName(p!, lang), answerName);
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

      <form onSubmit={handleSubmit}>
        <div className="pk-rows" onClick={focusInput}>
          {Array.from({ length: MAX_ATTEMPTS }, (_, rowIdx) => {
            const id = guessIds[rowIdx];

            if (id !== undefined) {
              const p = pokedexById.get(id)!;
              const name = pokemonName(p, lang);
              const states = compareGuess(name, answerName);
              const letters = [...letterWord(name)];
              return (
                <div className="pk-row" key={id}>
                  {letters.map((ch, i) => (
                    <span key={i} className={`pk-tile pk-tile--${states[i] as LetterState}`}>
                      {ch}
                    </span>
                  ))}
                </div>
              );
            }

            const isActive = !gameOver && rowIdx === guessIds.length;
            const typedLetters = isActive ? [...currentGuess] : [];
            const answerLetters = [...letterWord(answerName)];
            return (
              <div className={`pk-row ${isActive && shake ? "pk-row--shake" : ""}`} key={rowIdx}>
                {Array.from({ length: answerLength }, (_, i) => {
                  const typedChar = typedLetters[i];
                  const isHintCell = !typedChar && hintIndex === i;
                  const tileClass = typedChar
                    ? "pk-tile--typed"
                    : isHintCell
                      ? "pk-tile--hint"
                      : "pk-tile--empty";
                  const display = typedChar?.toUpperCase() ?? (isHintCell ? answerLetters[i].toUpperCase() : "");
                  return (
                    <span key={i} className={`pk-tile ${tileClass}`}>
                      {display}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {!gameOver && (
          <input
            ref={hiddenInputRef}
            type="text"
            value={currentGuess}
            onChange={(e) => handleTypedChange(e.target.value)}
            className="pk-hidden-input"
            autoComplete="off"
            autoCapitalize="characters"
            autoFocus
          />
        )}
      </form>

      {!gameOver && (
        <div className="pk-controls">
          {error && <p className="pk-message">{error}</p>}
          <p className="pk-legend">{t.pokedle.legend}</p>
          <div className="pk-controls-actions">
            <button type="button" className="pk-btn pk-btn--primary" onClick={handleSubmit}>
              {t.pokedle.guessButton}
            </button>
            <button type="button" className="pk-btn pk-btn--danger" onClick={handleReveal}>
              {t.pokedle.giveUp}
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="pk-finish">
          <h3>{status === "won" ? t.pokedle.wonTitle(answerName) : t.pokedle.lostTitle(answerName)}</h3>
          <img className="pk-finish-sprite" src={pokemonSprite(answer.id)} alt={answerName} />
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
