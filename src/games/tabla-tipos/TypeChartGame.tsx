import { useEffect, useMemo, useRef, useState } from "react";
import { TYPES, TYPE_IDS, typeIcon, type TypeId } from "../../data/types";
import { getMultiplier, type Multiplier } from "../../data/typeChart";
import "./TypeChartGame.css";

type Board = Partial<Record<TypeId, Partial<Record<TypeId, Multiplier>>>>;

const TOTAL_CELLS = TYPE_IDS.length * TYPE_IDS.length;

// Orden de la paleta: neutra, mitad, doble, nula
const PALETTE: Multiplier[] = [1, 0.5, 2, 0];

const LABEL: Record<Multiplier, string> = {
  1: "Neutra",
  0.5: "Mitad",
  2: "Doble",
  0: "Nula",
};

function nombreDe(id: TypeId): string {
  return TYPES.find((t) => t.id === id)?.nombre ?? id;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TypeChartGame() {
  const [board, setBoard] = useState<Board>({});
  const [brush, setBrush] = useState<Multiplier>(1);
  const [checked, setChecked] = useState(false);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const painting = useRef(false);
  const paintValue = useRef<Multiplier | null>(1);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const filledCount = useMemo(() => {
    let n = 0;
    for (const atk of TYPE_IDS) {
      const row = board[atk];
      if (!row) continue;
      n += Object.keys(row).length;
    }
    return n;
  }, [board]);

  const result = useMemo(() => {
    if (!checked) return null;
    let correct = 0;
    for (const atk of TYPE_IDS) {
      for (const def of TYPE_IDS) {
        const value = board[atk]?.[def];
        if (value !== undefined && value === getMultiplier(atk, def)) {
          correct += 1;
        }
      }
    }
    return { correct, total: TOTAL_CELLS, pct: Math.round((correct / TOTAL_CELLS) * 100) };
  }, [checked, board]);

  function paintCell(atk: TypeId, def: TypeId, value: Multiplier | null) {
    if (checked || paused) return;
    if (!started) setStarted(true);
    setRunning(true);
    setBoard((prev) => {
      const row = { ...(prev[atk] ?? {}) };
      if (value === null) {
        delete row[def];
      } else {
        row[def] = value;
      }
      return { ...prev, [atk]: row };
    });
  }

  function startPaint(atk: TypeId, def: TypeId) {
    if (checked || paused) return;
    painting.current = true;
    const value = board[atk]?.[def] !== undefined ? null : brush;
    paintValue.current = value;
    paintCell(atk, def, value);
  }

  function continuePaint(atk: TypeId, def: TypeId) {
    if (!painting.current || checked || paused) return;
    paintCell(atk, def, paintValue.current);
  }

  function stopPaint() {
    painting.current = false;
  }

  function handleCheck() {
    if (paused) return;
    setChecked(true);
    setRunning(false);
  }

  function handleReset() {
    setBoard({});
    setChecked(false);
    setStarted(false);
    setRunning(false);
    setPaused(false);
    setElapsed(0);
  }

  function handleContinueEditing() {
    setChecked(false);
  }

  function togglePause() {
    if (!started || checked) return;
    if (paused) {
      setPaused(false);
      setRunning(true);
    } else {
      setPaused(true);
      setRunning(false);
    }
  }

  return (
    <div className="tc-game" onPointerUp={stopPaint} onPointerLeave={stopPaint}>
      <div className="tc-toolbar">
        <div className="tc-palette" role="group" aria-label="Leyenda de colores">
          {PALETTE.map((m) => (
            <button
              key={m}
              type="button"
              className={`tc-swatch tc-swatch--${m} ${brush === m ? "tc-swatch--active" : ""}`}
              onClick={() => setBrush(m)}
              disabled={checked || paused}
            >
              <span className="tc-swatch-color" />
              <span className="tc-swatch-label">{LABEL[m]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`tc-table-wrap ${paused ? "tc-table-wrap--paused" : ""}`}>
        <table className="tc-table">
          <thead>
            <tr>
              <th className="tc-corner">
                <span className="tc-corner-label">Atacante ↓ / Defensor →</span>
              </th>
              {TYPE_IDS.map((def) => (
                <th key={def} className="tc-col-head" title={nombreDe(def)}>
                  <img src={typeIcon(def)} alt={nombreDe(def)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPE_IDS.map((atk) => (
              <tr key={atk}>
                <th className="tc-row-head" title={nombreDe(atk)}>
                  <img src={typeIcon(atk)} alt={nombreDe(atk)} />
                </th>
                {TYPE_IDS.map((def) => {
                  const value = board[atk]?.[def];
                  let cls = "tc-cell";
                  let title: string | undefined;

                  if (checked) {
                    const correctValue = getMultiplier(atk, def);
                    if (value === undefined) {
                      cls += " tc-cell--missing";
                      title = `Sin responder. Correcto: ${LABEL[correctValue]}`;
                    } else if (value === correctValue) {
                      cls += ` tc-cell--${value} tc-cell--correct`;
                      title = "¡Correcto!";
                    } else {
                      cls += ` tc-cell--${value} tc-cell--wrong`;
                      title = `Tu respuesta: ${LABEL[value]}. Correcto: ${LABEL[correctValue]}`;
                    }
                  } else if (value !== undefined && !paused) {
                    cls += ` tc-cell--${value}`;
                  }

                  return (
                    <td
                      key={def}
                      className={cls}
                      title={title}
                      onPointerDown={() => startPaint(atk, def)}
                      onPointerEnter={() => continuePaint(atk, def)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {paused && (
          <div className="tc-pause-overlay">
            <p className="tc-pause-text">Juego pausado</p>
            <button type="button" className="tc-btn tc-btn--primary" onClick={togglePause}>
              Seguir jugando
            </button>
          </div>
        )}
      </div>

      <div className="tc-footer">
        <div className="tc-timer">
          <span className="tc-timer-value">{formatTime(elapsed)}</span>
          <button
            type="button"
            className="tc-btn"
            onClick={togglePause}
            disabled={!started || checked}
          >
            {paused ? "Reanudar" : "Pausar"}
          </button>
        </div>

        <div className="tc-actions">
          {!checked ? (
            <>
              <span className="tc-progress">
                {filledCount}/{TOTAL_CELLS} celdas
              </span>
              <button
                type="button"
                className="tc-btn tc-btn--primary"
                onClick={handleCheck}
                disabled={paused}
              >
                Comprobar
              </button>
              <button type="button" className="tc-btn" onClick={handleReset}>
                Reiniciar
              </button>
            </>
          ) : (
            <>
              <span className="tc-score">
                {result!.correct}/{result!.total} correctas ({result!.pct}%)
              </span>
              <button type="button" className="tc-btn tc-btn--primary" onClick={handleContinueEditing}>
                Seguir editando
              </button>
              <button type="button" className="tc-btn" onClick={handleReset}>
                Reiniciar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
