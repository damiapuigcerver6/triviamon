export interface DailyStats {
  completados: number;
  rachaActual: number;
  mejorRacha: number;
  ultimaFecha: string | null;
}

function keyFor(gameId: string): string {
  return `triviamon:stats:${gameId}`;
}

function vacio(): DailyStats {
  return { completados: 0, rachaActual: 0, mejorRacha: 0, ultimaFecha: null };
}

export function loadStats(gameId: string): DailyStats {
  try {
    const raw = localStorage.getItem(keyFor(gameId));
    if (!raw) return vacio();
    return { ...vacio(), ...JSON.parse(raw) };
  } catch {
    return vacio();
  }
}

function esDiaSiguiente(fechaAnterior: string, fecha: string): boolean {
  const anterior = new Date(`${fechaAnterior}T00:00:00`).getTime();
  const actual = new Date(`${fecha}T00:00:00`).getTime();
  return Math.round((actual - anterior) / 86_400_000) === 1;
}

export function recordDailyWin(gameId: string, dateKey: string): void {
  const stats = loadStats(gameId);
  if (stats.ultimaFecha === dateKey) return;
  const racha =
    stats.ultimaFecha && esDiaSiguiente(stats.ultimaFecha, dateKey) ? stats.rachaActual + 1 : 1;
  const next: DailyStats = {
    completados: stats.completados + 1,
    rachaActual: racha,
    mejorRacha: Math.max(stats.mejorRacha, racha),
    ultimaFecha: dateKey,
  };
  localStorage.setItem(keyFor(gameId), JSON.stringify(next));
}
