const BEST_STREAK_KEY = "triviamon:silueta:mejor-racha";
const BEST_SCORE_KEY = "triviamon:silueta:mejor-puntuacion";

export function loadBestStreak(): number {
  return Number(localStorage.getItem(BEST_STREAK_KEY)) || 0;
}

export function saveBestStreakIfHigher(streak: number): number {
  const current = loadBestStreak();
  if (streak > current) {
    localStorage.setItem(BEST_STREAK_KEY, String(streak));
    return streak;
  }
  return current;
}

export function loadBestScore(): number {
  return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
}

export function saveBestScoreIfHigher(score: number): number {
  const current = loadBestScore();
  if (score > current) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
    return score;
  }
  return current;
}
