import { useMemo, useRef, useState } from "react";
import { TYPES, TYPE_IDS, typeIcon, type TypeId } from "../../data/types";
import { getMultiplier, MULTIPLIERS, type Multiplier } from "../../data/typeChart";
import "./TypeChartGame.css";

type Board = Partial<Record<TypeId, Partial<Record<TypeId, Multiplier>>>>;

const TOTAL_CELLS = TYPE_IDS.length * TYPE_IDS.length;

const SYMBOL: Record<Multiplier, string> = {
  0: "0",
  0.5: "½",
  1: "1",
  2: "2",
};

const BRUSH_LABEL: Record<Multiplier, string> = {
  0: "Inmune",
  0.5: "Resiste",
  1: "Normal",
  2: "Débil",
};

function nombreDe(id: TypeId): string {
  return TYPES.find((t) => t.id === id)?.nombre ?? id;
}

export default function TypeChartGame() {
  const [board, setBoard] = useState<Board>({});
  const [brush, setBrush] = useState<Multiplier | null>(1);
  const [checked, setChecked] = useState(false);
  const painting = useRef(false);
  const paintValue = useRef<Multiplier | null>(1);

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
    if (checked) return;
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
    if (checked) return;
    painting.current = true;
    paintValue.current = brush;
    paintCell(atk, def, brush);
  }

  function continuePaint(atk: TypeId, def: TypeId) {
    if (!painting.current || checked) return;
    paintCell(atk, def, paintValue.current);
  }

  function stopPaint() {
    painting.current = false;
  }

  function handleCheck() {
    setChecked(true);
  }

  function handleReset() {
    setBoard({});
    setChecked(false);
  }

  function handleContinueEditing() {
    setChecked(false);
  }

  return (
    <div className="tc-game" onPointerUp={stopPaint} onPointerLeave={stopPaint}>
      <div className="tc-toolbar">
        <div className="tc-palette" role="group" aria-label="Elige un multiplicador">
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              type="button"
              className={`tc-brush tc-brush--${m} ${brush === m ? "tc-brush--active" : ""}`}
              onClick={() => setBrush(m)}
              disabled={checked}
            >
              <span className="tc-brush-symbol">{SYMBOL[m]}</span>
              <span className="tc-brush-label">{BRUSH_LABEL[m]}</span>
            </button>
          ))}
          <button
            type="button"
            className={`tc-brush tc-brush--eraser ${brush === null ? "tc-brush--active" : ""}`}
            onClick={() => setBrush(null)}
            disabled={checked}
          >
            <span className="tc-brush-symbol">⌫</span>
            <span className="tc-brush-label">Borrar</span>
          </button>
        </div>

        <div className="tc-actions">
          {!checked ? (
            <>
              <span className="tc-progress">
                {filledCount}/{TOTAL_CELLS} celdas
              </span>
              <button type="button" className="tc-btn tc-btn--primary" onClick={handleCheck}>
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

      <div className="tc-table-wrap">
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
                  let content: string = value !== undefined ? SYMBOL[value] : "";
                  let title: string | undefined;

                  if (checked) {
                    const correctValue = getMultiplier(atk, def);
                    if (value === undefined) {
                      cls += " tc-cell--missing";
                      content = "?";
                      title = `Sin responder. Correcto: ${SYMBOL[correctValue]}`;
                    } else if (value === correctValue) {
                      cls += " tc-cell--correct";
                      title = "¡Correcto!";
                    } else {
                      cls += " tc-cell--wrong";
                      title = `Tu respuesta: ${SYMBOL[value]}. Correcto: ${SYMBOL[correctValue]}`;
                    }
                  } else if (value !== undefined) {
                    cls += ` tc-cell--${value}`;
                  }

                  return (
                    <td
                      key={def}
                      className={cls}
                      title={title}
                      onPointerDown={() => startPaint(atk, def)}
                      onPointerEnter={() => continuePaint(atk, def)}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
