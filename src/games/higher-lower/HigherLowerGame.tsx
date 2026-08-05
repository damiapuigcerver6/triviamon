import { useState } from "react";
import { Link } from "react-router-dom";
import type { PokemonEntry } from "../../data/pokedex";
import { pokemonSprite } from "../../data/pokedex";
import { loadBestStreak, saveBestStreakIfHigher, statLabel, statValue, type StatKey } from "./stats";
import "./HigherLowerGame.css";

type BallType = "higher" | "lower";
type Phase = "guessing" | "revealed" | "gameover";
type Side = "left" | "right";

interface RoundState {
  left: PokemonEntry;
  right: PokemonEntry;
  ball: BallType;
}

interface Props {
  pokedex: PokemonEntry[];
  statKey: StatKey;
  onChangeStat: () => void;
  onPlayAgain: () => void;
}

function randomPokemon(pokedex: PokemonEntry[]): PokemonEntry {
  return pokedex[Math.floor(Math.random() * pokedex.length)];
}

function pickMystery(pokedex: PokemonEntry[], known: PokemonEntry, statKey: StatKey): PokemonEntry {
  for (let i = 0; i < 500; i++) {
    const candidate = randomPokemon(pokedex);
    if (candidate.id !== known.id && statValue(candidate, statKey) !== statValue(known, statKey)) {
      return candidate;
    }
  }
  return randomPokemon(pokedex);
}

function randomBall(): BallType {
  return Math.random() < 0.5 ? "higher" : "lower";
}

function newRound(pokedex: PokemonEntry[], statKey: StatKey): RoundState {
  const left = randomPokemon(pokedex);
  const right = pickMystery(pokedex, left, statKey);
  return { left, right, ball: randomBall() };
}

function correctSideFor(round: RoundState, statKey: StatKey): Side {
  const leftVal = statValue(round.left, statKey);
  const rightVal = statValue(round.right, statKey);
  if (round.ball === "higher") return leftVal > rightVal ? "left" : "right";
  return leftVal < rightVal ? "left" : "right";
}

export default function HigherLowerGame({ pokedex, statKey, onChangeStat, onPlayAgain }: Props) {
  const [round, setRound] = useState<RoundState>(() => newRound(pokedex, statKey));
  const [phase, setPhase] = useState<Phase>("guessing");
  const [chosenSide, setChosenSide] = useState<Side | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => loadBestStreak(statKey));
  const [isNewBest, setIsNewBest] = useState(false);

  function handleChoose(side: Side) {
    if (phase !== "guessing") return;
    const correctSide = correctSideFor(round, statKey);
    const isCorrect = side === correctSide;
    setChosenSide(side);
    setPhase("revealed");

    window.setTimeout(() => {
      if (isCorrect) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        const updatedBest = saveBestStreakIfHigher(statKey, nextStreak);
        setIsNewBest(nextStreak >= updatedBest && nextStreak > 0);
        setBest(updatedBest);
        const keep = Math.random() < 0.5 ? round.left : round.right;
        setRound({ left: keep, right: pickMystery(pokedex, keep, statKey), ball: randomBall() });
        setPhase("guessing");
        setChosenSide(null);
      } else {
        setPhase("gameover");
      }
    }, 1400);
  }

  function sideClass(side: Side): string {
    if (phase === "guessing") return "";
    const correctSide = correctSideFor(round, statKey);
    if (side === correctSide) return "hl-side--correct";
    if (side === chosenSide) return "hl-side--wrong";
    return "";
  }

  return (
    <div className="hl-game">
      <div className="hl-topbar">
        <span>
          Racha: <strong>{streak}</strong>
        </span>
        <span>
          Mejor racha: <strong>{best}</strong>
        </span>
        <span className="hl-stat-name">{statLabel(statKey)}</span>
      </div>

      <div className="hl-split">
        <button
          type="button"
          className={`hl-side hl-side--left ${sideClass("left")}`}
          onClick={() => handleChoose("left")}
          disabled={phase !== "guessing"}
        >
          <img src={pokemonSprite(round.left.id)} alt={round.left.nombre} />
          <span className="hl-name">{round.left.nombre}</span>
          <span className="hl-value">{statValue(round.left, statKey)}</span>
        </button>

        <div className="hl-divider" />

        <div className={`hl-ball hl-ball--${round.ball}`}>
          <span className="hl-ball-label">{round.ball === "higher" ? "HIGHER" : "LOWER"}</span>
          <img src={round.ball === "higher" ? "/brand/nestball.png" : "/brand/pokeball.png"} alt="" />
        </div>

        <button
          type="button"
          className={`hl-side hl-side--right ${sideClass("right")}`}
          onClick={() => handleChoose("right")}
          disabled={phase !== "guessing"}
        >
          <img src={pokemonSprite(round.right.id)} alt={round.right.nombre} />
          <span className="hl-name">{round.right.nombre}</span>
          <span className="hl-value">{phase === "guessing" ? "?" : statValue(round.right, statKey)}</span>
        </button>
      </div>

      {phase === "gameover" && (
        <div className="hl-gameover">
          <h3>Has fallado</h3>
          <p>
            Racha final: {streak}
            {isNewBest && " · ¡Nuevo récord!"}
          </p>
          <div className="hl-gameover-actions">
            <button type="button" className="hl-btn hl-btn--primary" onClick={onPlayAgain}>
              Jugar de nuevo
            </button>
            <button type="button" className="hl-btn" onClick={onChangeStat}>
              Cambiar de estadística
            </button>
            <Link to="/" className="hl-btn">
              Volver al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
