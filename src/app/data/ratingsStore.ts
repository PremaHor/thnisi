const SCORES_KEY = "trhnisi:userRatingScores:v1";
const TRADE_DONE_KEY = "trhnisi:tradeRatingSubmitted:v1";
const TRADE_COMPLETE_KEY = "trhnisi:tradeCompletedLocal:v1";

export const CURRENT_RATER_ID = "jan";

/** Výchozí „historická“ skóre pro demo, při prvním načtení se zapíšou do úložiště. */
const SEED_SCORES: Record<string, number[]> = {
  jan: [5, 4, 5, 4, 5, 4, 4, 5, 4, 4, 4, 4],
  "jana-k": [5, 5, 4, 5, 4, 4, 4, 4],
  "petr-m": [5, 4, 5, 4, 4, 5, 4, 4, 4, 4],
  "martin-s": [4, 4, 4, 5, 3],
  "eva-n": [5, 5, 4, 4, 4],
  "jakub-v": [4, 5, 4],
  "tomas-l": [5, 4, 4, 4, 4],
  "marie-p": [4, 4, 5, 4],
  "david-k": [5, 4, 5, 4, 4, 4, 4],
};

export type UserRatingSummary = {
  /** Průměr 1–5 */
  average: number;
  count: number;
  /** Např. "4,8" */
  label: string;
};

function readScores(): Record<string, number[]> {
  if (typeof window === "undefined") return { ...SEED_SCORES };
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (p && typeof p === "object") {
        const out: Record<string, number[]> = {};
        for (const [k, v] of Object.entries(p)) {
          if (Array.isArray(v) && v.every((n) => typeof n === "number" && n >= 1 && n <= 5)) {
            out[k] = v;
          }
        }
        if (Object.keys(out).length > 0) return out;
      }
    }
  } catch {
    /* chyba parsování */
  }
  return { ...SEED_SCORES };
}

function writeScores(map: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

let seeded = false;
function ensureSeeded() {
  if (typeof window === "undefined" || seeded) return;
  if (!localStorage.getItem(SCORES_KEY)) {
    writeScores({ ...SEED_SCORES });
  }
  seeded = true;
}

function averageLabel(scores: number[]): UserRatingSummary | null {
  if (scores.length === 0) return null;
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {
    average,
    count: scores.length,
    label: average.toFixed(1).replace(".", ","),
  };
}

export function getUserRatingSummary(ratedKey: string): UserRatingSummary | null {
  ensureSeeded();
  const map = readScores();
  return averageLabel(map[ratedKey] ?? []);
}

export function getRatingBreakdown(ratedKey: string): Record<1 | 2 | 3 | 4 | 5, number> {
  ensureSeeded();
  const map = readScores();
  const scores = map[ratedKey] ?? [];
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of scores) {
    if (s >= 1 && s <= 5) breakdown[s as 1 | 2 | 3 | 4 | 5]++;
  }
  return breakdown;
}

export function hasRatedTrade(tradeId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(TRADE_DONE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw) as Record<string, unknown>;
    return Boolean(p[tradeId]);
  } catch {
    return false;
  }
}

export function isTradeMarkedComplete(tradeId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(TRADE_COMPLETE_KEY);
    if (!raw) return false;
    const a = JSON.parse(raw) as string[];
    return Array.isArray(a) && a.includes(tradeId);
  } catch {
    return false;
  }
}

export function markTradeComplete(tradeId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TRADE_COMPLETE_KEY);
    const a: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!Array.isArray(a)) return;
    if (!a.includes(tradeId)) a.push(tradeId);
    localStorage.setItem(TRADE_COMPLETE_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

/**
 * Přidá jedno hodnocení protistraně a označí směnu jako „hodnocenou v této simulaci“.
 */
export function submitTradeRating(
  tradeId: string,
  ratedPeerKey: string,
  score: 1 | 2 | 3 | 4 | 5
): boolean {
  if (typeof window === "undefined") return false;
  if (hasRatedTrade(tradeId)) return false;
  ensureSeeded();
  const map = readScores();
  if (!map[ratedPeerKey]) map[ratedPeerKey] = [];
  map[ratedPeerKey].push(score);
  writeScores(map);
  try {
    const raw = localStorage.getItem(TRADE_DONE_KEY);
    const p: Record<string, { at: string }> = raw
      ? (JSON.parse(raw) as Record<string, { at: string }>)
      : {};
    p[tradeId] = { at: new Date().toISOString() };
    localStorage.setItem(TRADE_DONE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
  return true;
}

export function getCompletedTradeIdsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRADE_COMPLETE_KEY);
    const a = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}
