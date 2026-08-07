import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { typeIcon } from "../../data/types";
import { groupWeaknessChart } from "../../data/weaknessChart";
import { useLanguage } from "../../i18n/LanguageContext";
import "./WeaknessGuessGame.css";

type Status = "playing" | "won" | "lost";

interface Props {
  pokedex: PokemonEntry[];
  target: PokemonEntry;
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

function formatMultiplier(m: number): string {
  return `x${m}`;
}

export default function WeaknessGuessGame({
  pokedex,
  target,
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
  const groups = useMemo(() => groupWeaknessChart(target), [target]);

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
        ? t.debilidex.shareWon(guessedIds.length)
        : t.debilidex.shareLost(pokemonName(target, lang));
    const text = `Triviamon - ${t.games.debilidex.title}${dateLabel ? ` (${dateLabel})` : ""}\n${resultLine}`;
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

  const hintLevel = Math.min(3, Math.max(0, wrongGuesses.length - 1));
  const showHint = !finished && hintLevel > 0;

  const categoryLabel =
    target.categoria === "legendario"
      ? t.debilidex.categoryLegendary
      : target.categoria === "mitico"
        ? t.debilidex.categoryMythic
        : t.debilidex.categoryNormal;
  const targetBst =
    target.vida + target.ataque + target.defensa + target.ataque_especial + target.defensa_especial + target.velocidad;

  function bucketLabel(mult: number): string {
    if (mult === 0) return t.debilidex.bucketImmune;
    if (mult > 1) return t.debilidex.bucketWeak;
    if (mult === 1) return t.debilidex.bucketNormal;
    return t.debilidex.bucketResist;
  }

  return (
    <div className="dbx-game">
      <div className="dbx-chart">
        <span className="dbx-chart-label">{t.debilidex.chartLabel}</span>
        <div className="dbx-chart-panel">
          {groups.map((group) => (
            <div className="dbx-group" key={group.multiplicador}>
              <div className="dbx-group-title">
                {bucketLabel(group.multiplicador)}{" "}
                <span className="dbx-group-mult">({formatMultiplier(group.multiplicador)})</span>
              </div>
              <div className="dbx-group-icons">
                {group.tipos.map((tp) => (
                  <img key={tp} src={typeIcon(tp)} alt={tp} className="dbx-type-icon" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!finished && (
        <div className="dbx-search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.debilidex.placeholder}
            className="dbx-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="dbx-suggestions">
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
        <div className="dbx-actions-row">
          {showHint && (
            <div className="dbx-hint">
              <span className="dbx-hint-title">{t.debilidex.hintTitle}</span>
              <div className="dbx-hint-row">
                <span>{t.debilidex.hintGenLabel}</span>
                <span>{target.generacion}</span>
              </div>
              {hintLevel >= 2 && (
                <div className="dbx-hint-row">
                  <span>{t.debilidex.hintCategoryLabel}</span>
                  <span>{categoryLabel}</span>
                </div>
              )}
              {hintLevel >= 3 && (
                <div className="dbx-hint-row">
                  <span>{t.debilidex.hintBstLabel}</span>
                  <span>{targetBst}</span>
                </div>
              )}
            </div>
          )}
          <button type="button" className="dbx-btn dbx-btn--danger" onClick={handleGiveUp}>
            {t.debilidex.giveUp}
          </button>
        </div>
      )}

      {finished && (
        <div className="dbx-finish">
          <img src={pokemonSprite(target.id)} alt={pokemonName(target, lang)} />
          {status === "won" ? (
            <>
              <h3>{t.debilidex.wonTitle(pokemonName(target, lang))}</h3>
              <p>{t.debilidex.guessedInAttempts(guessedIds.length)}</p>
            </>
          ) : (
            <h3>{t.debilidex.lostTitle(pokemonName(target, lang))}</h3>
          )}
          <div className="dbx-finish-actions">
            <button type="button" className="dbx-btn dbx-btn--primary" onClick={handleShare}>
              {t.common.shareResult}
            </button>
            {onNewPractice && (
              <button type="button" className="dbx-btn" onClick={onNewPractice}>
                {t.debilidex.anotherPokemon}
              </button>
            )}
          </div>
        </div>
      )}

      {wrongGuesses.length > 0 && (
        <div className="dbx-guesses">
          <span className="dbx-guesses-label">{t.debilidex.previousGuessesLabel}</span>
          <div className="dbx-guesses-list">
            {wrongGuesses.map((p) => (
              <span className="dbx-guess-chip" key={p.id}>
                {pokemonName(p, lang)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
