import { useEffect, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonSprite } from "../../data/pokedex";
import {
  loadBestStreak,
  loadBestScore,
  saveBestStreakIfHigher,
  saveBestScoreIfHigher,
} from "./stats";
import "./SilhouetteGame.css";

const START_TIME = 15;
const MAX_TIME = 15;
const BONUS = 5;
const TICK_MS = 100;
const REVEAL_MS = 900;
const WRONG_FLASH_MS = 400;

type Phase = "playing" | "reveal" | "gameover";

function normalizeGuess(text: string): string {
  return normalize(text).replace(/[^a-z0-9]/g, "");
}

function randomTarget(list: PokemonEntry[], excludeId?: number): PokemonEntry {
  if (list.length <= 1) return list[0];
  let pick: PokemonEntry;
  do {
    pick = list[Math.floor(Math.random() * list.length)];
  } while (pick.id === excludeId);
  return pick;
}

interface Props {
  pokedex: PokemonEntry[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export default function SilhouetteGame({ pokedex, onPlayAgain, onExit }: Props) {
  const [target, setTarget] = useState<PokemonEntry>(() => randomTarget(pokedex));
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [phase, setPhase] = useState<Phase>("playing");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreakRun, setBestStreakRun] = useState(0);
  const [recordScore, setRecordScore] = useState(loadBestScore);
  const [recordStreak, setRecordStreak] = useState(loadBestStreak);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - TICK_MS / 1000;
        if (next <= 0) {
          clearInterval(id);
          setPhase("gameover");
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "gameover") {
      setRecordScore(saveBestScoreIfHigher(score));
      setRecordStreak(saveBestStreakIfHigher(bestStreakRun));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, target]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "playing" || !query.trim()) return;

    if (normalizeGuess(query) === normalizeGuess(target.nombre)) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setBestStreakRun((b) => Math.max(b, newStreak));
      setFeedback("correct");
      setTimeLeft((t) => Math.min(MAX_TIME, t + BONUS));
      setQuery("");
      setPhase("reveal");
      setTimeout(() => {
        setTarget((prev) => randomTarget(pokedex, prev.id));
        setFeedback(null);
        setPhase("playing");
      }, REVEAL_MS);
    } else {
      setStreak(0);
      setFeedback("wrong");
      setQuery("");
      setTimeout(() => setFeedback(null), WRONG_FLASH_MS);
    }
  }

  const pct = Math.max(0, Math.min(100, (timeLeft / MAX_TIME) * 100));

  return (
    <div className="sil-game">
      <div className="sil-topbar">
        <span>
          Puntuación: <strong>{score}</strong>
        </span>
        <span>
          Racha: <strong>{streak}</strong>
        </span>
        <span>
          Mejor racha: <strong>{recordStreak}</strong>
        </span>
      </div>

      {phase !== "gameover" && (
        <>
          <div className="sil-timerbar">
            <div
              className={`sil-timerbar-fill ${timeLeft <= 5 ? "sil-timerbar-fill--danger" : ""}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="sil-timeleft">{timeLeft.toFixed(1)}s</p>

          <div className={`sil-stage ${feedback === "wrong" ? "sil-stage--wrong" : ""}`}>
            <img
              key={target.id}
              src={pokemonSprite(target.id)}
              alt={phase === "reveal" ? target.nombre : "¿Quién es ese Pokémon?"}
              className={`sil-sprite ${phase === "reveal" ? "sil-sprite--revealed" : "sil-sprite--silhouette"}`}
            />
            {phase === "reveal" && (
              <div className="sil-reveal-label">
                ¡Es {target.nombre}! <span className="sil-bonus">+{BONUS}s</span>
              </div>
            )}
          </div>

          <form className="sil-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe el nombre del Pokémon..."
              className={`sil-input ${feedback === "wrong" ? "sil-input--wrong" : ""}`}
              autoComplete="off"
              disabled={phase === "reveal"}
            />
          </form>
        </>
      )}

      {phase === "gameover" && (
        <div className="sil-gameover">
          <img src={pokemonSprite(target.id)} alt={target.nombre} className="sil-gameover-sprite" />
          <h3>¡Se acabó el tiempo!</h3>
          <p>
            El último era <strong>{target.nombre}</strong>.
          </p>
          <p>
            Puntuación: <strong>{score}</strong> · Mejor racha de la partida:{" "}
            <strong>{bestStreakRun}</strong>
          </p>
          <p className="sil-gameover-best">
            Récords: <strong>{recordScore}</strong> puntos · <strong>{recordStreak}</strong> de
            racha
          </p>
          <div className="sil-gameover-actions">
            <button type="button" className="sil-btn sil-btn--primary" onClick={onPlayAgain}>
              Jugar de nuevo
            </button>
            <button type="button" className="sil-btn" onClick={onExit}>
              Volver al menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
