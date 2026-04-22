import type { BarterOfferPublic, OfferAttachment } from "./barterOffers";

const STORAGE_PREFIX = "trhnisi:offerForm:v1:";

const MAX_DATA_IMAGE_CHARS = 480_000;

/** Povolí http(s) a lokální náhled obrázku (data:image/*) s limitem délky. */
export function sanitizeImageUrl(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  if (t.startsWith("data:")) {
    const comma = t.indexOf(",");
    if (comma < 12) return null;
    const header = t.slice(5, comma).toLowerCase();
    const mime = header.split(";")[0]?.trim() ?? "";
    if (
      mime !== "image/jpeg" &&
      mime !== "image/png" &&
      mime !== "image/webp" &&
      mime !== "image/jpg"
    ) {
      return null;
    }
    if (t.length > MAX_DATA_IMAGE_CHARS) return null;
    return t;
  }
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

function sanitizeAttachmentUrl(url: string): OfferAttachment["url"] | null {
  return sanitizeImageUrl(url);
}

function sanitizeAttachmentName(name: string): string {
  const t = name.trim().slice(0, 200);
  return t.replace(/[/\\]/g, "_") || "soubor";
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
  attachments: OfferAttachment[];
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
    attachments: [],
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
    attachments: [],
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
    let attachments: OfferAttachment[] = [];
    if (Array.isArray(o.attachments)) {
      attachments = o.attachments
        .filter(
          (a): a is Record<string, unknown> =>
            Boolean(a) && typeof a === "object" && typeof (a as Record<string, unknown>).url === "string"
        )
        .map((a) => {
          const url = sanitizeAttachmentUrl(String(a.url));
          const name = sanitizeAttachmentName(
            typeof a.name === "string" ? a.name : "soubor"
          );
          return url ? { name, url } : null;
        })
        .filter((x): x is OfferAttachment => x != null);
    }
    return {
      title: o.title,
      description: o.description,
      wantsInReturn: typeof o.wantsInReturn === "string" ? o.wantsInReturn : "",
      category: o.category,
      tags: o.tags,
      location: o.location,
      images,
      attachments,
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
  const attachments = data.attachments
    .map((a) => {
      const url = sanitizeAttachmentUrl(a.url);
      if (!url) return null;
      return { name: sanitizeAttachmentName(a.name), url };
    })
    .filter((x): x is OfferAttachment => x != null);
  try {
    localStorage.setItem(
      STORAGE_PREFIX + offerId,
      JSON.stringify({ ...data, images, attachments })
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
    image: f.images[0] ?? base.image,
    attachments: f.attachments,
    tags: f.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
