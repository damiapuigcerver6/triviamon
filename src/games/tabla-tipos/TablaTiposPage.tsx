import TypeChartGame from "./TypeChartGame";
import { useLanguage } from "../../i18n/LanguageContext";
import "./TablaTiposPage.css";

export default function TablaTiposPage() {
  const { t } = useLanguage();
  return (
    <div className="tabla-tipos-page">
      <h1>{t.games.tablaTipos.title}</h1>
      <TypeChartGame />
    </div>
  );
}
