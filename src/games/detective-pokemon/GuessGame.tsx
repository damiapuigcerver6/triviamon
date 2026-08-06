import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite, colorLabel, metodoLabel } from "../../data/pokedex";
import { typeIcon } from "../../data/types";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Lang } from "../../data/language";
import {
  compareGuess,
  shareGrid,
  ATTRIBUTE_ORDER,
  type AttributeKey,
  type GuessResult,
} from "./compare";
import "./GuessGame.css";

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
  const { lang, t } = useLanguage();
  const ATTR_LABEL: Record<AttributeKey, string> = {
    tipo1: t.detectivePokemon.attrTipo1,
    tipo2: t.detectivePokemon.attrTipo2,
    generacion: t.detectivePokemon.attrGen,
    fase: t.detectivePokemon.attrFase,
    metodo: t.detectivePokemon.attrMetodo,
    color: t.detectivePokemon.attrColor,
    altura: t.detectivePokemon.attrAltura,
    peso: t.detectivePokemon.attrPeso,
  };

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
      .filter((p) => !guessedIds.has(p.id) && normalize(pokemonName(p, lang)).includes(q))
      .slice(0, 8);
  }, [query, pokedex, guessedIds, lang]);

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
    const text = shareGrid(
      ordered,
      dateLabel ?? "",
      t.games.detectivePokemon.title,
      t.detectivePokemon.shareGuessesLabel,
    );
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
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
            placeholder={t.detectivePokemon.placeholder}
            className="qp-input"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className="qp-suggestions">
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

      {!finished && hints.length > 0 && (
        <div className="qp-hints">
          <span className="qp-hints-label">{t.detectivePokemon.hintsLabel}</span>
          {hints.map((k) => (
            <span className="qp-hint-chip" key={k}>
              <strong>{ATTR_LABEL[k]}:</strong> {renderAttrContent(k, target, lang)}
            </span>
          ))}
          <button type="button" className="qp-btn qp-btn--danger" onClick={() => setGaveUp(true)}>
            {t.detectivePokemon.giveUp}
          </button>
        </div>
      )}

      {finished && (
        <div className="qp-win">
          <img src={pokemonSprite(target.id)} alt={pokemonName(target, lang)} />
          {won ? (
            <>
              <h3>{t.detectivePokemon.wonTitle(pokemonName(target, lang))}</h3>
              <p>{t.detectivePokemon.guessedInAttempts(guesses.length)}</p>
            </>
          ) : (
            <h3>{t.detectivePokemon.lostTitle(pokemonName(target, lang))}</h3>
          )}
          <div className="qp-win-actions">
            {won && dateLabel !== undefined && (
              <button type="button" className="qp-btn qp-btn--primary" onClick={handleShare}>
                {t.common.shareResult}
              </button>
            )}
            {onNewPractice && (
              <button type="button" className="qp-btn" onClick={onNewPractice}>
                {t.detectivePokemon.anotherPokemon}
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
                    <span>{pokemonName(g.pokemon, lang)}</span>
                  </td>
                  {ATTRIBUTE_ORDER.map((k) => {
                    const attr = g.attrs[k];
                    const dirArrow =
                      attr.direction === "up" ? "↑" : attr.direction === "down" ? "↓" : "";
                    return (
                      <td key={k} className={`qp-cell qp-cell--${attr.match}`}>
                        {renderAttrContent(k, g.pokemon, lang)}
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

function renderAttrContent(key: AttributeKey, p: PokemonEntry, lang: Lang) {
  switch (key) {
    case "tipo1":
    case "tipo2": {
      const type = key === "tipo1" ? p.tipos[0] : p.tipos[1];
      return type ? (
        <img src={typeIcon(type)} alt={type} className="qp-type-icon" />
      ) : (
        <span>—</span>
      );
    }
    case "generacion":
      return <span>{p.generacion}</span>;
    case "fase":
      return <span>{p.fase}</span>;
    case "metodo":
      return <span>{metodoLabel(p.metodo, lang)}</span>;
    case "color":
      return <span>{colorLabel(p.color, lang)}</span>;
    case "altura":
      return <span>{p.altura} m</span>;
    case "peso":
      return <span>{p.peso} kg</span>;
  }
}
