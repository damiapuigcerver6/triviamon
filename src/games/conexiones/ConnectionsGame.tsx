import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { pokemonName, pokemonSprite } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  buildInstance,
  categoryColorIndex,
  GROUP_EMOJI,
  type Category,
} from "./categories";
import "./ConnectionsGame.css";

const MAX_MISTAKES = 4;

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
  solved: string[];
  mistakes: number;
  revealed: boolean;
  history: string[][];
}

function loadProgress(storageKey: string): StoredProgress {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { solved: [], mistakes: 0, revealed: false, history: [] };
    const parsed = JSON.parse(raw);
    return {
      solved: parsed.solved ?? [],
      mistakes: parsed.mistakes ?? 0,
      revealed: parsed.revealed ?? false,
      history: parsed.history ?? [],
    };
  } catch {
    return { solved: [], mistakes: 0, revealed: false, history: [] };
  }
}

export default function ConnectionsGame({
  pokedex,
  seed,
  storageKey,
  dateLabel,
  onSolved,
  onNewPractice,
}: Props) {
  const { lang, t } = useLanguage();
  const instance = useMemo(() => buildInstance(pokedex, seed, lang), [pokedex, seed, lang]);
  const { puzzle } = instance;

  const groupByPokemonId = useMemo(() => {
    const map = new Map<number, Category>();
    for (const g of puzzle.groups) for (const p of g.members) map.set(p.id, g.category);
    return map;
  }, [puzzle]);

  const cardsById = useMemo(() => {
    const map = new Map<number, PokemonEntry>();
    for (const g of puzzle.groups) for (const p of g.members) map.set(p.id, p);
    return map;
  }, [puzzle]);

  const initial = useMemo(() => loadProgress(storageKey), [storageKey]);
  const [solved, setSolved] = useState<string[]>(initial.solved);
  const [mistakes, setMistakes] = useState<number>(initial.mistakes);
  const [revealed, setRevealed] = useState<boolean>(initial.revealed);
  const [history, setHistory] = useState<string[][]>(initial.history);
  const [selected, setSelected] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>(instance.cardOrder);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const allSolved = solved.length === 4;
  const gameOver = allSolved || revealed;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ solved, mistakes, revealed, history }));
  }, [solved, mistakes, revealed, history, storageKey]);

  useEffect(() => {
    if (allSolved) onSolved?.();
  }, [allSolved, onSolved]);

  function toggleSelect(id: number) {
    if (gameOver) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function shuffle() {
    setOrder((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  }

  function submitGroup() {
    if (selected.length !== 4 || gameOver) return;
    const counts = new Map<string, number>();
    for (const id of selected) {
      const catId = groupByPokemonId.get(id)!.id;
      counts.set(catId, (counts.get(catId) ?? 0) + 1);
    }
    const [bestCatId, bestCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    setHistory((prev) => [...prev, selected.map((id) => groupByPokemonId.get(id)!.id)]);

    if (bestCount === 4) {
      setSolved((prev) => [...prev, bestCatId]);
      setSelected([]);
      setMessage(null);
      return;
    }

    setShake(true);
    setSelected([]);
    setMessage(bestCount === 3 ? t.conexiones.oneAway : null);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setMessage(null), 2500);
    setMistakes((prev) => {
      const next = prev + 1;
      if (next >= MAX_MISTAKES) setRevealed(true);
      return next;
    });
  }

  async function handleShare() {
    const idx = new Map(puzzle.groups.map((g, i) => [g.category.id, i]));
    const lines = history.map((attempt) => attempt.map((catId) => GROUP_EMOJI[idx.get(catId)!]).join(""));
    const text = `Triviamon - ${t.games.conexiones.title} (${dateLabel})\n${t.conexiones.shareMistakesLine(mistakes, MAX_MISTAKES)}\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
    } catch {
      alert(text);
    }
  }

  const remainingIds = order.filter((id) => !solved.includes(groupByPokemonId.get(id)!.id));
  const unsolvedGroups = puzzle.groups.filter((g) => !solved.includes(g.category.id));

  return (
    <div className="cx-game">
      <div className="cx-solved-groups">
        {solved.map((catId) => {
          const group = puzzle.groups.find((g) => g.category.id === catId)!;
          const colorIdx = categoryColorIndex(puzzle, catId);
          return (
            <div key={catId} className={`cx-group cx-group--${colorIdx}`}>
              <span className="cx-group-label">{group.category.label}</span>
              <span className="cx-group-members">
                {group.members.map((p) => pokemonName(p, lang)).join(", ")}
              </span>
            </div>
          );
        })}
      </div>

      {!gameOver && (
        <>
          <div className={`cx-grid ${shake ? "cx-grid--shake" : ""}`}>
            {remainingIds.map((id) => {
              const p = cardsById.get(id)!;
              const isSelected = selected.includes(id);
              return (
                <button
                  type="button"
                  key={id}
                  className={`cx-card ${isSelected ? "cx-card--selected" : ""}`}
                  onClick={() => toggleSelect(id)}
                >
                  <img src={pokemonSprite(p.id)} alt="" loading="lazy" />
                  <span>{pokemonName(p, lang)}</span>
                </button>
              );
            })}
          </div>

          <div className="cx-controls">
            <div className="cx-mistakes" aria-label={t.conexiones.mistakesRemaining}>
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <span key={i} className={`cx-mistake-dot ${i < mistakes ? "cx-mistake-dot--used" : ""}`} />
              ))}
            </div>
            {message && <span className="cx-message">{message}</span>}
            <div className="cx-buttons">
              <button type="button" className="cx-btn" onClick={shuffle}>
                {t.conexiones.shuffle}
              </button>
              <button type="button" className="cx-btn" onClick={() => setSelected([])} disabled={selected.length === 0}>
                {t.conexiones.deselect}
              </button>
              <button
                type="button"
                className="cx-btn cx-btn--primary"
                onClick={submitGroup}
                disabled={selected.length !== 4}
              >
                {t.conexiones.checkGroup}
              </button>
            </div>
          </div>
        </>
      )}

      {gameOver && (
        <div className="cx-end">
          {revealed && unsolvedGroups.length > 0 && (
            <div className="cx-solved-groups">
              {unsolvedGroups.map((g) => {
                const colorIdx = categoryColorIndex(puzzle, g.category.id);
                return (
                  <div key={g.category.id} className={`cx-group cx-group--${colorIdx} cx-group--revealed`}>
                    <span className="cx-group-label">{g.category.label}</span>
                    <span className="cx-group-members">
                      {g.members.map((p) => pokemonName(p, lang)).join(", ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <h3>{allSolved ? t.conexiones.solvedTitle : t.conexiones.outOfAttemptsTitle}</h3>
          <p>{t.conexiones.mistakesCount(mistakes, MAX_MISTAKES)}</p>

          <div className="cx-end-actions">
            {dateLabel !== undefined && (
              <button type="button" className="cx-btn cx-btn--primary" onClick={handleShare}>
                {t.common.shareResult}
              </button>
            )}
            {onNewPractice && (
              <button type="button" className="cx-btn" onClick={onNewPractice}>
                {t.conexiones.newGame}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
