import { Link } from "react-router-dom";
import TypeChartGame from "./TypeChartGame";
import "./TablaTiposPage.css";

export default function TablaTiposPage() {
  return (
    <div className="tabla-tipos-page">
      <Link to="/" className="back-link">
        ← Volver
      </Link>
      <h1>Tabla de tipos</h1>
      <p className="intro">
        Elige un multiplicador en la paleta y pinta cada celda del tablero:
        fila = tipo atacante, columna = tipo defensor. Cuando la tengas
        completa, pulsa <strong>Comprobar</strong> para ver tu puntuación.
      </p>
      <TypeChartGame />
    </div>
  );
}
