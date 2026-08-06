import TypeChartGame from "./TypeChartGame";
import { useLanguage } from "../../i18n/LanguageContext";
import Seo from "../../components/Seo";
import "./TablaTiposPage.css";

export default function TablaTiposPage() {
  const { t } = useLanguage();
  return (
    <div className="tabla-tipos-page">
      <Seo title={`${t.games.tablaTipos.title} · Triviamon`} description={t.games.tablaTipos.description} />
      <h1>{t.games.tablaTipos.title}</h1>
      <TypeChartGame />
    </div>
  );
}
