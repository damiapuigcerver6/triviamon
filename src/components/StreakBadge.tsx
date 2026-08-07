import type { DailyStats } from "../data/stats";
import { useLanguage } from "../i18n/LanguageContext";
import "./StreakBadge.css";

export default function StreakBadge({ stats }: { stats: DailyStats }) {
  const { t } = useLanguage();
  return (
    <div className="streak-badge" title={`${t.stats.bestStreak}: ${stats.mejorRacha}`}>
      <span className="streak-badge-icon" aria-hidden="true">
        🔥
      </span>
      <span className="streak-badge-label">{t.stats.currentStreak}</span>
      <strong className="streak-badge-value">{stats.rachaActual}</strong>
    </div>
  );
}
