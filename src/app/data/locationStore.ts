const LOCATION_KEY = "trhnisi:locationSettings:v1";

export type LocationSettings = {
  /** Zobrazovaný název středu (město nebo "Vaše poloha") */
  centerLabel: string;
  lat: number;
  lng: number;
  /** 0 = bez filtru (zobrazit vše) */
  radiusKm: number;
  /** Zahrnout nabídky označené jako "Na dálku" */
  showRemote: boolean;
};

export const DEFAULT_LOCATION: LocationSettings = {
  centerLabel: "Česká republika (vše)",
  lat: 49.8175,
  lng: 15.473,
  radiusKm: 0,
  showRemote: true,
};

export function loadLocationSettings(): LocationSettings {
  if (typeof window === "undefined") return { ...DEFAULT_LOCATION };
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return { ...DEFAULT_LOCATION };
    const p = JSON.parse(raw) as Partial<LocationSettings>;
    if (
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      typeof p.radiusKm === "number" &&
      typeof p.showRemote === "boolean" &&
      typeof p.centerLabel === "string"
    ) {
      return p as LocationSettings;
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_LOCATION };
}

export function saveLocationSettings(s: LocationSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Vzdálenost dvou bodů na zemském povrchu v km (Haversine). */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Najde nejbližší město ze seznamu k zadaným souřadnicím. */
export function nearestCity(lat: number, lng: number): CzechCity {
  let best = CZECH_CITIES[0];
  let bestDist = Infinity;
  for (const city of CZECH_CITIES) {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

export type CzechCity = { label: string; lat: number; lng: number };

export const CZECH_CITIES: CzechCity[] = [
  { label: "Praha", lat: 50.0755, lng: 14.4378 },
  { label: "Brno", lat: 49.1951, lng: 16.6068 },
  { label: "Ostrava", lat: 49.8209, lng: 18.2625 },
  { label: "Plzeň", lat: 49.7384, lng: 13.3736 },
  { label: "Liberec", lat: 50.7663, lng: 15.0543 },
  { label: "Olomouc", lat: 49.5938, lng: 17.2509 },
  { label: "Hradec Králové", lat: 50.2092, lng: 15.8328 },
  { label: "Pardubice", lat: 50.0343, lng: 15.7812 },
  { label: "Ústí nad Labem", lat: 50.6607, lng: 14.0328 },
  { label: "Havířov", lat: 49.7816, lng: 18.4355 },
  { label: "Zlín", lat: 49.2247, lng: 17.6683 },
  { label: "Kladno", lat: 50.1437, lng: 14.1044 },
  { label: "Most", lat: 50.5024, lng: 13.6365 },
  { label: "Opava", lat: 49.9381, lng: 17.9034 },
  { label: "Karviná", lat: 49.8558, lng: 18.5427 },
  { label: "Jihlava", lat: 49.396, lng: 15.5939 },
  { label: "Chomutov", lat: 50.4611, lng: 13.4189 },
  { label: "Teplice", lat: 50.6404, lng: 13.8246 },
  { label: "Frýdek-Místek", lat: 49.6881, lng: 18.3571 },
  { label: "České Budějovice", lat: 48.9745, lng: 14.4741 },
  { label: "Děčín", lat: 50.7741, lng: 14.2148 },
  { label: "Přerov", lat: 49.4558, lng: 17.4512 },
  { label: "Česká Lípa", lat: 50.6878, lng: 14.5375 },
  { label: "Třebíč", lat: 49.2149, lng: 15.8798 },
  { label: "Znojmo", lat: 48.8553, lng: 16.0491 },
  { label: "Prostějov", lat: 49.4723, lng: 17.1128 },
  { label: "Mladá Boleslav", lat: 50.4149, lng: 14.904 },
  { label: "Šumperk", lat: 49.9681, lng: 16.9718 },
  { label: "Jindřichův Hradec", lat: 49.1429, lng: 15.0012 },
  { label: "Trutnov", lat: 50.5609, lng: 15.9118 },
  { label: "Kroměříž", lat: 49.2972, lng: 17.3937 },
  { label: "Vsetín", lat: 49.3382, lng: 17.9948 },
  { label: "Uherské Hradiště", lat: 49.0709, lng: 17.4577 },
  { label: "Kolín", lat: 50.0276, lng: 15.2011 },
  { label: "Příbram", lat: 49.6913, lng: 14.0088 },
  { label: "Jablonec nad Nisou", lat: 50.7219, lng: 15.17 },
  { label: "Písek", lat: 49.3094, lng: 14.146 },
  { label: "Cheb", lat: 50.08, lng: 12.3706 },
  { label: "Sokolov", lat: 50.1798, lng: 12.6402 },
  { label: "Nový Jičín", lat: 49.5942, lng: 18.0119 },
  { label: "Blansko", lat: 49.3637, lng: 16.6467 },
  { label: "Valašské Meziříčí", lat: 49.4721, lng: 17.9714 },
  { label: "Tábor", lat: 49.4148, lng: 14.6572 },
  { label: "Strakonice", lat: 49.2608, lng: 13.903 },
  { label: "Uherský Brod", lat: 49.0252, lng: 17.6473 },
  { label: "Krnov", lat: 50.0884, lng: 17.7035 },
  { label: "Kopřivnice", lat: 49.5993, lng: 18.1449 },
  { label: "Hodonín", lat: 48.8531, lng: 17.1307 },
  { label: "Česká Třebová", lat: 49.9018, lng: 16.4444 },
  { label: "Litoměřice", lat: 50.5349, lng: 14.131 },
  { label: "Louny", lat: 50.356, lng: 13.7999 },
];
