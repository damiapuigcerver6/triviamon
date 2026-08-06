import { useEffect, useRef, useState } from "react";
import type { PokemonEntry } from "../../data/pokedex";
import { normalize, pokemonName, pokemonSprite } from "../../data/pokedex";
import { useLanguage } from "../../i18n/LanguageContext";
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
  const { lang, t } = useLanguage();
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

    if (normalizeGuess(query) === normalizeGuess(pokemonName(target, lang))) {
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
          {t.quienEsEsePokemon.score} <strong>{score}</strong>
        </span>
        <span>
          {t.quienEsEsePokemon.streak} <strong>{streak}</strong>
        </span>
        <span>
          {t.quienEsEsePokemon.bestStreak} <strong>{recordStreak}</strong>
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
              alt={phase === "reveal" ? pokemonName(target, lang) : t.games.quienEsEsePokemon.title}
              className={`sil-sprite ${phase === "reveal" ? "sil-sprite--revealed" : "sil-sprite--silhouette"}`}
            />
            {phase === "reveal" && (
              <div className="sil-reveal-label">
                {t.quienEsEsePokemon.revealedBang(pokemonName(target, lang))}{" "}
                <span className="sil-bonus">+{BONUS}s</span>
              </div>
            )}
          </div>

          <form className="sil-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.quienEsEsePokemon.placeholder}
              className={`sil-input ${feedback === "wrong" ? "sil-input--wrong" : ""}`}
              autoComplete="off"
              disabled={phase === "reveal"}
            />
          </form>
        </>
      )}

      {phase === "gameover" && (
        <div className="sil-gameover">
          <img
            src={pokemonSprite(target.id)}
            alt={pokemonName(target, lang)}
            className="sil-gameover-sprite"
          />
          <h3>{t.quienEsEsePokemon.timeUp}</h3>
          <p>{t.quienEsEsePokemon.lastWas(pokemonName(target, lang))}</p>
          <p>{t.quienEsEsePokemon.scoreAndBestStreak(score, bestStreakRun)}</p>
          <p className="sil-gameover-best">{t.quienEsEsePokemon.records(recordScore, recordStreak)}</p>
          <div className="sil-gameover-actions">
            <button type="button" className="sil-btn sil-btn--primary" onClick={onPlayAgain}>
              {t.quienEsEsePokemon.playAgain}
            </button>
            <button type="button" className="sil-btn" onClick={onExit}>
              {t.quienEsEsePokemon.backToMenu}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
