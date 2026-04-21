import type { BarterOfferPublic } from "./barterOffers";

const STORAGE_PREFIX = "trhnisi:offerForm:v1:";

/** Povolí jen http(s) – blokuje javascript:, data: atd. */
function sanitizeImageUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  let parsed: URL;
  try {
    parsed = new URL(t);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }
  return t;
}

export type UserOfferFormData = {
  title: string;
  description: string;
  /** Co má zájemce na oplátku; orientačně, domluvou. */
  wantsInReturn: string;
  category: string;
  tags: string;
  location: string;
  images: string[];
};

const SEED: Record<string, UserOfferFormData> = {
  "1": {
    title: "Čerstvá bio zelenina",
    description:
      "Pěstuji bio zeleninu na zahradě a mám letos přebytek. Rád/a bych směnil/a za domácí zavařeniny, pečivo nebo řemeslné výrobky. Bez pesticidů.",
    wantsInReturn:
      "Nejlépe jídlo (zavařeniny, chléb) nebo pár hodin výměnou za sečení trávy nebo běžné práce kolem zahrady. Domluvou.",
    category: "Jídlo",
    tags: "bio, čerstvé, sezónní",
    location: "Praha 3",
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800",
    ],
  },
  "2": {
    title: "Ruční keramika",
    description:
      "Hrníčky, mísy a dárkové sady z vlastní dílny. Glazování a motiv dle domluvy, předání osobně v Brně nebo odeslání zabalené.",
    wantsInReturn:
      "Hodí se třeba drobné šití, domácí pečivo, nebo můžu vzít třeba drobnou opravu (malování) – napište, co dáte do směny.",
    category: "Ostatní",
    tags: "keramika, dárky, ruční výroba",
    location: "Brno",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400",
    ],
  },
};

function parseStored(json: string | null): UserOfferFormData | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as unknown;
    if (!p || typeof p !== "object") return null;
    const o = p as Record<string, unknown>;
    if (typeof o.title !== "string" || typeof o.description !== "string") return null;
    if (typeof o.category !== "string" || typeof o.tags !== "string" || typeof o.location !== "string")
      return null;
    if (!Array.isArray(o.images) || !o.images.every((u) => typeof u === "string")) return null;
    const images = o.images.map((u) => sanitizeImageUrl(u)).filter((u): u is string => u != null);
    return {
      title: o.title,
      description: o.description,
      wantsInReturn: typeof o.wantsInReturn === "string" ? o.wantsInReturn : "",
      category: o.category,
      tags: o.tags,
      location: o.location,
      images,
    };
  } catch {
    return null;
  }
}

export function loadUserOfferForm(offerId: string): UserOfferFormData | null {
  if (typeof window === "undefined") return SEED[offerId] ?? null;
  const raw = localStorage.getItem(STORAGE_PREFIX + offerId);
  const fromStore = parseStored(raw);
  if (fromStore) return fromStore;
  return SEED[offerId] ? { ...SEED[offerId] } : null;
}

export function saveUserOfferForm(offerId: string, data: UserOfferFormData): void {
  if (typeof window === "undefined") return;
  const images = data.images.map((u) => sanitizeImageUrl(u)).filter((u): u is string => u != null);
  try {
    localStorage.setItem(
      STORAGE_PREFIX + offerId,
      JSON.stringify({ ...data, images })
    );
  } catch {
    /* plný úložiště atd. */
  }
}

/** Převezme data z editovacího formuláře, zachová např. profil nabízejícího z veřejného záznamu. */
export function mergeFormIntoPublicOffer(
  f: UserOfferFormData,
  base: BarterOfferPublic
): BarterOfferPublic {
  return {
    ...base,
    title: f.title,
    description: f.description,
    wantsInReturn: f.wantsInReturn.trim() ? f.wantsInReturn : base.wantsInReturn,
    category: f.category,
    location: f.location,
    images: f.images,
    tags: f.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
