import { useEffect, useMemo, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { pokemonName, pokemonSprite } from "../../data/pokedex";
import { statLabel } from "../higher-lower/stats";
import { PYRAMID_ROWS, PYRAMID_SIZE, type PyramidPuzzle } from "./pyramidBuilder";
import { useLanguage } from "../../i18n/LanguageContext";
import "./PyramidGame.css";

interface Props {
  pokedex: PokemonEntry[];
  puzzle: PyramidPuzzle;
  storageKey?: string;
  /** Si se define, es el modo reto diario: muestra el boton de compartir con esta fecha. */
  dateLabel?: string;
  onNewPractice?: () => void;
  /** Se llama cuando el tablero queda totalmente resuelto. */
  onWin?: () => void;
}

type Placements = (number | null)[];
type CheckedResult = boolean[] | null;

interface StoredState {
  placements: Placements;
  attempts: number;
  checkedResult: CheckedResult;
  solved: boolean;
}

function emptyPlacements(): Placements {
  return Array<number | null>(PYRAMID_SIZE).fill(null);
}

function loadStored(storageKey: string | undefined): StoredState {
  const fallback: StoredState = {
    placements: emptyPlacements(),
    attempts: 0,
    checkedResult: null,
    solved: false,
  };
  if (!storageKey) return fallback;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.placements) || parsed.placements.length !== PYRAMID_SIZE) return fallback;
    return {
      placements: parsed.placements,
      attempts: typeof parsed.attempts === "number" ? parsed.attempts : 0,
      checkedResult: Array.isArray(parsed.checkedResult) ? parsed.checkedResult : null,
      solved: parsed.solved === true,
    };
  } catch {
    return fallback;
  }
}

export default function PyramidGame({ pokedex, puzzle, storageKey, dateLabel, onNewPractice, onWin }: Props) {
  const { lang, t } = useLanguage();
  const stored = useMemo(() => loadStored(storageKey), [storageKey]);
  const [placements, setPlacements] = useState<Placements>(stored.placements);
  const [attempts, setAttempts] = useState(stored.attempts);
  const [checkedResult, setCheckedResult] = useState<CheckedResult>(stored.checkedResult);
  const [solved, setSolved] = useState(stored.solved);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const byId = useMemo(() => {
    const map = new Map<number, PokemonEntry>();
    for (const p of pokedex) map.set(p.id, p);
    return map;
  }, [pokedex]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ placements, attempts, checkedResult, solved }));
  }, [placements, attempts, checkedResult, solved, storageKey]);

  useEffect(() => {
    if (solved) onWin?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  const placedSet = useMemo(() => new Set(placements.filter((id): id is number => id !== null)), [placements]);
  const bankIds = puzzle.displayIds.filter((id) => !placedSet.has(id));
  const allFilled = placements.every((id) => id !== null);

  function clearCheck() {
    if (checkedResult) setCheckedResult(null);
  }

  function selectBank(id: number) {
    if (solved) return;
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function clickSlot(slotIndex: number) {
    if (solved) return;
    const occupant = placements[slotIndex];

    if (selectedId !== null) {
      setPlacements((prev) => {
        const next = [...prev];
        next[slotIndex] = selectedId;
        return next;
      });
      setSelectedId(null);
      clearCheck();
      return;
    }

    if (occupant !== null) {
      setPlacements((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setSelectedId(occupant);
      clearCheck();
    }
  }

  function handleCheck() {
    if (!allFilled || solved) return;
    const result = placements.map((id, i) => id === puzzle.correctOrder[i]);
    setCheckedResult(result);
    setAttempts((a) => a + 1);
    if (result.every(Boolean)) setSolved(true);
  }

  async function handleShare() {
    const text = `Triviamon - ${t.games.piramide.title}${dateLabel ? ` (${dateLabel})` : ""}\n${t.piramide.shareWon(attempts)}`;
    try {
      await navigator.clipboard.writeText(text);
      alert(t.common.shareCopied);
    } catch {
      alert(text);
    }
  }

  let cursor = 0;

  return (
    <div className="pyr-game">
      <p className="pyr-characteristic">{t.piramide.orderBy(statLabel(puzzle.statKey, t))}</p>

      <div className="pyr-pyramid">
        {PYRAMID_ROWS.map((count, rowIndex) => {
          const row = [];
          for (let i = 0; i < count; i++) {
            const slotIndex = cursor++;
            const occupantId = placements[slotIndex];
            const occupant = occupantId !== null ? byId.get(occupantId) : undefined;
            const result = checkedResult ? checkedResult[slotIndex] : null;
            const slotClass = [
              "pyr-slot",
              occupant ? "pyr-slot--filled" : "pyr-slot--empty",
              result === true ? "pyr-slot--correct" : "",
              result === false ? "pyr-slot--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");
            row.push(
              <button
                type="button"
                key={slotIndex}
                className={slotClass}
                onClick={() => clickSlot(slotIndex)}
                disabled={solved}
                aria-label={occupant ? pokemonName(occupant, lang) : t.piramide.emptySlot}
              >
                {occupant && <img src={pokemonSprite(occupant.id)} alt="" />}
              </button>,
            );
          }
          return (
            <div className="pyr-row" key={rowIndex}>
              {row}
            </div>
          );
        })}
      </div>

      {bankIds.length > 0 && (
        <div className="pyr-bank">
          {bankIds.map((id) => {
            const p = byId.get(id);
            if (!p) return null;
            return (
              <button
                type="button"
                key={id}
                className={`pyr-bank-item ${selectedId === id ? "pyr-bank-item--selected" : ""}`}
                onClick={() => selectBank(id)}
              >
                <img src={pokemonSprite(p.id)} alt={pokemonName(p, lang)} />
              </button>
            );
          })}
        </div>
      )}

      {!solved && (
        <div className="pyr-actions-row">
          <span className="pyr-attempts">{t.piramide.attemptsLabel(attempts)}</span>
          <button type="button" className="pyr-btn pyr-btn--primary" onClick={handleCheck} disabled={!allFilled}>
            {t.piramide.check}
          </button>
        </div>
      )}

      {solved && (
        <div className="pyr-finish">
          <h3>{t.piramide.wonTitle}</h3>
          <p>{t.piramide.guessedInAttempts(attempts)}</p>
          <div className="pyr-finish-actions">
            <button type="button" className="pyr-btn pyr-btn--primary" onClick={handleShare}>
              {t.common.shareResult}
            </button>
            {onNewPractice && (
              <button type="button" className="pyr-btn" onClick={onNewPractice}>
                {t.piramide.anotherPyramid}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
