/** Lokální preference swipu (do napojení na backend). */

const PASSED_KEY = "trhnisi:swipePassed:v1";
const LIKED_KEY = "trhnisi:swipeLiked:v1";

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function loadPassedIds(): string[] {
  if (typeof window === "undefined") return [];
  return parseStringArray(localStorage.getItem(PASSED_KEY));
}

export function savePassedIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PASSED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function loadLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  return parseStringArray(localStorage.getItem(LIKED_KEY));
}

export function saveLikedIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function isOfferLiked(offerId: string): boolean {
  return loadLikedIds().includes(offerId);
}

/** Přepne oblíbenou nabídku (stejný seznam jako swipe vpravo). Vrací true, pokud je po akci uložená. */
export function toggleLikedOfferId(offerId: string): boolean {
  const cur = loadLikedIds();
  const has = cur.includes(offerId);
  const next = has ? cur.filter((id) => id !== offerId) : [...cur, offerId];
  saveLikedIds(next);
  return !has;
}

/** Smaže všechna přehlédnutí — nabídky se znovu objeví v balíčku (oblíbené zůstanou). */
export function clearPassedIds(): void {
  savePassedIds([]);
}
