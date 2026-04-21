import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, X, Search, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import {
  type LocationSettings,
  type CzechCity,
  CZECH_CITIES,
  DEFAULT_LOCATION,
  saveLocationSettings,
  nearestCity,
} from "../data/locationStore";

const RADIUS_STEPS = [5, 10, 20, 30, 50, 75, 100, 150];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  current: LocationSettings;
  onChange: (s: LocationSettings) => void;
}

export function LocationFilterModal({ isOpen, onClose, current, onChange }: Props) {
  const [draft, setDraft] = useState<LocationSettings>(current);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CzechCity[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(current);
      setQuery("");
      setSuggestions([]);
      setGpsError(null);
    }
  }, [isOpen, current]);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (v.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    const q = v.toLowerCase();
    setSuggestions(
      CZECH_CITIES.filter((c) => c.label.toLowerCase().startsWith(q)).slice(0, 6)
    );
  };

  const selectCity = (city: CzechCity) => {
    setDraft((d) => ({ ...d, centerLabel: city.label, lat: city.lat, lng: city.lng }));
    setQuery(city.label);
    setSuggestions([]);
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Váš prohlížeč nepodporuje geolokaci.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = nearestCity(latitude, longitude);
        setDraft((d) => ({
          ...d,
          centerLabel: `${city.label} (GPS)`,
          lat: latitude,
          lng: longitude,
        }));
        setQuery(`${city.label} (GPS)`);
        setSuggestions([]);
        setGpsLoading(false);
      },
      () => {
        setGpsError("Přístup k poloze byl zamítnut nebo selhal.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSave = () => {
    saveLocationSettings(draft);
    onChange(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_LOCATION });
    setQuery("");
    setSuggestions([]);
  };

  const isFiltered = draft.radiusKm > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lokalita pro Objevování">
      <div className="space-y-5 pb-2">

        {/* City search */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Střed hledání
          </label>
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Zadejte město, např. Olomouc…"
                className="w-full min-h-[44px] pl-9 pr-10 py-2.5 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                autoComplete="off"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setSuggestions([]); }}
                  className="absolute right-2 p-1 rounded hover:bg-muted transition-colors"
                  aria-label="Smazat"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-card shadow-cartoon-sm overflow-hidden">
                {suggestions.map((city) => (
                  <button
                    key={city.label}
                    type="button"
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectCity(city);
                    }}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {city.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS button */}
          <button
            type="button"
            onClick={handleGps}
            disabled={gpsLoading}
            className="mt-2 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-60 transition-colors"
          >
            <Navigation className="h-4 w-4 shrink-0" />
            {gpsLoading ? "Zjišťuji polohu…" : "Použít moji aktuální polohu"}
          </button>
          {gpsError && (
            <p className="mt-1.5 text-xs text-destructive">{gpsError}</p>
          )}
          {draft.centerLabel && !query && (
            <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              Aktuální střed: <span className="font-medium text-foreground">{draft.centerLabel}</span>
            </p>
          )}
        </div>

        {/* Radius selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">
              Poloměr hledání
            </label>
            <span className="text-sm font-bold text-primary">
              {draft.radiusKm === 0 ? "Celá ČR" : `${draft.radiusKm} km`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, radiusKm: 0 }))}
              className={`min-h-[40px] rounded-xl border-2 text-sm font-bold transition-all ${
                draft.radiusKm === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-muted-teal/50"
              }`}
            >
              Vše
            </button>
            {RADIUS_STEPS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, radiusKm: r }))}
                className={`min-h-[40px] rounded-xl border-2 text-sm font-bold transition-all ${
                  draft.radiusKm === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-muted-teal/50"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Remote offers toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="min-w-0 pr-3">
            <p className="text-sm font-semibold">Dálkové nabídky</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Služby a digitální nabídky „Na dálku"
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={draft.showRemote}
            onClick={() => setDraft((d) => ({ ...d, showRemote: !d.showRemote }))}
            className={`relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200 ${
              draft.showRemote ? "bg-primary" : "bg-muted border border-border"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                draft.showRemote ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Preview info */}
        {isFiltered && (
          <div className="rounded-xl border border-muted-teal/40 bg-surface-teal-soft/40 px-4 py-3 text-sm">
            <p className="font-semibold text-muted-teal mb-0.5">Aktivní filtr</p>
            <p className="text-foreground">
              Zobrazím nabídky do <span className="font-bold">{draft.radiusKm} km</span> od{" "}
              <span className="font-bold">{draft.centerLabel}</span>
              {draft.showRemote && " + dálkové nabídky"}.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1"
          >
            Zrušit filtr
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex-1"
          >
            Uložit a použít
          </Button>
        </div>
      </div>
    </Modal>
  );
}
