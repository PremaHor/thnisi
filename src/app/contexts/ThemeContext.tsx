import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  ThemePreference,
  loadAppSettings,
  saveAppSettings,
} from "../data/settingsStore";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  settings: AppSettings;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: ThemePreference) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") return systemPrefersDark() ? "dark" : "light";
  return pref;
}

function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

function applyReduceMotion(enabled: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.reduceMotion = enabled ? "1" : "0";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    typeof window === "undefined" ? { ...DEFAULT_SETTINGS } : loadAppSettings(),
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(settings.theme),
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    const resolved = resolveTheme(settings.theme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
    applyReduceMotion(settings.reduceMotion);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveAppSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved: ResolvedTheme = mql.matches ? "dark" : "light";
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [settings.theme]);

  const setTheme = useCallback((t: ThemePreference) => {
    setSettings((s) => ({ ...s, theme: t }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({
      ...s,
      ...patch,
      notifications: patch.notifications
        ? { ...s.notifications, ...patch.notifications }
        : s.notifications,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ settings, resolvedTheme, setTheme, updateSettings, resetSettings }),
    [settings, resolvedTheme, setTheme, updateSettings, resetSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppSettings(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within ThemeProvider");
  }
  return ctx;
}
