import { useState } from "react";
import { Link } from "react-router-dom";
import { GAMES, type GameMeta } from "../games/registry";
import { randomTypeIcon } from "../data/types";
import { useLanguage } from "../i18n/LanguageContext";
import "./RelatedGames.css";

export default function RelatedGames({ currentId }: { currentId: string }) {
  const { t } = useLanguage();
  const others = GAMES.filter((g) => g.id !== currentId && g.disponible);
  const [icons] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const game of others as GameMeta[]) {
      if (game.iconoAleatorio) map[game.id] = randomTypeIcon();
    }
    return map;
  });

  if (others.length === 0) return null;

  return (
    <div className="related-games">
      <span className="related-games-label">{t.common.otherGamesLabel}</span>
      <div className="related-games-grid">
        {others.map((game) => {
          const meta = t.games[game.strKey];
          const icon = game.icono ?? icons[game.id];
          return (
            <Link to={game.path} className="related-game-card" key={game.id}>
              <img src={icon} alt="" />
              <span>{meta.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
