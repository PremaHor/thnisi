/** Persistentní nastavení aplikace (ukládá se do localStorage). */

export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = "cs" | "en";

export interface NotificationSettings {
  newTrades: boolean;
  messages: boolean;
  ratings: boolean;
  marketing: boolean;
}

export interface AppSettings {
  theme: ThemePreference;
  language: LanguagePreference;
  notifications: NotificationSettings;
  reduceMotion: boolean;
  hapticFeedback: boolean;
}

const SETTINGS_KEY = "trhnisi:appSettings:v1";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "cs",
  notifications: {
    newTrades: true,
    messages: true,
    ratings: true,
    marketing: false,
  },
  reduceMotion: false,
  hapticFeedback: true,
};

function isThemePreference(v: unknown): v is ThemePreference {
  return v === "light" || v === "dark" || v === "system";
}

function isLanguagePreference(v: unknown): v is LanguagePreference {
  return v === "cs" || v === "en";
}

function sanitize(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const p = raw as Partial<AppSettings> & {
    notifications?: Partial<NotificationSettings>;
  };
  return {
    theme: isThemePreference(p.theme) ? p.theme : DEFAULT_SETTINGS.theme,
    language: isLanguagePreference(p.language)
      ? p.language
      : DEFAULT_SETTINGS.language,
    notifications: {
      newTrades:
        typeof p.notifications?.newTrades === "boolean"
          ? p.notifications.newTrades
          : DEFAULT_SETTINGS.notifications.newTrades,
      messages:
        typeof p.notifications?.messages === "boolean"
          ? p.notifications.messages
          : DEFAULT_SETTINGS.notifications.messages,
      ratings:
        typeof p.notifications?.ratings === "boolean"
          ? p.notifications.ratings
          : DEFAULT_SETTINGS.notifications.ratings,
      marketing:
        typeof p.notifications?.marketing === "boolean"
          ? p.notifications.marketing
          : DEFAULT_SETTINGS.notifications.marketing,
    },
    reduceMotion:
      typeof p.reduceMotion === "boolean"
        ? p.reduceMotion
        : DEFAULT_SETTINGS.reduceMotion,
    hapticFeedback:
      typeof p.hapticFeedback === "boolean"
        ? p.hapticFeedback
        : DEFAULT_SETTINGS.hapticFeedback,
  };
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAppSettings(s: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Vymaže všechna lokálně uložená data aplikace (nastavení, swipy, profil, atd.). */
export function clearAllLocalData(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("trhnisi:")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
