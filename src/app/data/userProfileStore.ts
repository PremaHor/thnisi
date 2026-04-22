import { sanitizeImageUrl } from "./userOfferForms";

const KEY = "trhnisi:userProfile:v1";

export type UserProfileStored = {
  name: string;
  email: string;
  bio: string;
  location: string;
  /** URL avatara (https nebo data:image) */
  avatarUrl: string;
};

const DEFAULTS: UserProfileStored = {
  name: "Jan Novák",
  email: "jan.novak@example.com",
  bio: "Zahradničení a směna domácích dobrot",
  location: "Praha, Česká republika",
  avatarUrl: "",
};

function parse(raw: string | null): UserProfileStored | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (!o || typeof o !== "object") return null;
    if (typeof o.name !== "string" || typeof o.email !== "string") return null;
    const avatarRaw = typeof o.avatarUrl === "string" ? o.avatarUrl : "";
    const avatarUrl = sanitizeImageUrl(avatarRaw) ?? "";
    return {
      name: o.name,
      email: o.email,
      bio: typeof o.bio === "string" ? o.bio : "",
      location: typeof o.location === "string" ? o.location : "",
      avatarUrl,
    };
  } catch {
    return null;
  }
}

export function loadUserProfile(): UserProfileStored {
  if (typeof window === "undefined") return DEFAULTS;
  return parse(localStorage.getItem(KEY)) ?? DEFAULTS;
}

export function saveUserProfile(data: UserProfileStored): void {
  if (typeof window === "undefined") return;
  const avatarUrl = sanitizeImageUrl(data.avatarUrl.trim()) ?? "";
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...data,
        avatarUrl,
      })
    );
  } catch {
    /* úložiště plné */
  }
}
