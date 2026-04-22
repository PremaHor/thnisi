import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import confetti from "canvas-confetti";
import { Search, X, Heart, Info, RotateCcw, Sparkles, PartyPopper, MapPin } from "lucide-react";
import { SwipeCard } from "../components/SwipeCard";
import { AppLogo } from "../components/AppLogo";
import { LocationFilterModal } from "../components/LocationFilterModal";
import { SWIPE_OFFERS } from "../data/barterOffers";
import {
  type LocationSettings,
  loadLocationSettings,
  haversineKm,
} from "../data/locationStore";

const CATEGORIES = ["Vše", "Jídlo", "Služby", "Elektronika", "Ostatní"];

function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(12);
  }
}

export function Browse() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Vše");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(() =>
    loadLocationSettings()
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const announcerRef = useRef<HTMLDivElement>(null);

  const locationActive = locationSettings.radiusKm > 0;

  const filteredOffers = SWIPE_OFFERS.filter((offer) => {
    const matchesCategory = selectedCategory === "Vše" || offer.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!locationActive) return true;

    if (offer.isRemote) return locationSettings.showRemote;

    if (offer.lat == null || offer.lng == null) return true;
    const dist = haversineKm(
      locationSettings.lat,
      locationSettings.lng,
      offer.lat,
      offer.lng
    );
    return dist <= locationSettings.radiusKm;
  });

  const getDistanceKm = (offer: (typeof SWIPE_OFFERS)[number]): number | undefined => {
    if (!locationActive || offer.isRemote || offer.lat == null || offer.lng == null)
      return undefined;
    return haversineKm(locationSettings.lat, locationSettings.lng, offer.lat, offer.lng);
  };

  const currentOffer = filteredOffers[currentIndex];
  const total = filteredOffers.length;
  const positionLabel =
    total > 0 && !sessionComplete
      ? `Karta ${currentIndex + 1} z ${total}. ${currentOffer?.title ?? ""}.`
      : "";

  useEffect(() => {
    if (announcerRef.current && positionLabel) {
      announcerRef.current.textContent = positionLabel;
    }
  }, [positionLabel, currentIndex, sessionComplete]);

  const fireConfetti = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ff385c", "#e00b41", "#92174d", "#f7f7f7", "#222222"];
    confetti({
      particleCount: 70,
      spread: 64,
      origin: { y: 0.55 },
      colors,
      ticks: 120,
    });
  }, []);

  useEffect(() => {
    if (!sessionComplete) return;
    const t = window.setTimeout(fireConfetti, 200);
    return () => clearTimeout(t);
  }, [sessionComplete, fireConfetti]);

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setSessionComplete(false);
  };

  const handleLocationChange = (s: LocationSettings) => {
    setLocationSettings(s);
    setCurrentIndex(0);
    setSessionComplete(false);
  };

  const handleSwipe = (_direction: "left" | "right") => {
    if (!currentOffer || sessionComplete) return;
    hapticLight();

    if (currentIndex < filteredOffers.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const handleUndo = () => {
    if (sessionComplete) {
      setSessionComplete(false);
      setCurrentIndex(Math.max(0, filteredOffers.length - 1));
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleInfo = () => {
    if (currentOffer) {
      navigate(`/offer/${currentOffer.id}`);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background pb-[var(--app-bottom-nav)]">
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-2 pt-safe backdrop-blur-md">
        <div className="py-2 sm:py-3">
          <div className="mb-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <AppLogo to="/" size="lg" />
              {/* Location filter button */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[var(--shadow-search-pill)] transition-colors ${
                  locationActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/25"
                }`}
                aria-label="Nastavit lokalitu"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[110px] truncate">
                  {locationActive ? locationSettings.centerLabel : "Celá ČR"}
                </span>
                {locationActive && (
                  <span className="shrink-0 opacity-80">
                    {" "}
                    {locationSettings.radiusKm} km
                  </span>
                )}
              </button>
            </div>
            <h1 className="text-balance text-[clamp(1.2rem,calc(4.5vw+0.3rem),1.625rem)] font-bold leading-[1.3] tracking-tight text-foreground">
              Co dnes hledáš?
            </h1>
            {total > 0 && !sessionComplete && (
              <p
                className="mt-0.5 text-xs font-medium text-muted-foreground"
                aria-hidden
              >
                {currentIndex + 1} / {total} v tomhle filtru
              </p>
            )}
          </div>

          <div
            className="-mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto border-b border-border px-2 pb-0 scrollbar-hide"
            role="group"
            aria-label="Filtrovat podle kategorie"
          >
            {CATEGORIES.map((cat) => {
              const selected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  aria-pressed={selected}
                  className={`min-h-[44px] shrink-0 snap-start border-b-2 px-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] sm:min-h-[48px] sm:py-2.5 sm:text-base ${
                    selected
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 pt-2 sm:px-4 sm:pb-3 sm:pt-3">
        {filteredOffers.length === 0 ? (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center px-2 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[14px] border border-dashed border-border bg-muted">
              {locationActive ? (
                <MapPin className="h-9 w-9 text-muted-foreground" aria-hidden />
              ) : (
                <Search className="h-9 w-9 text-muted-foreground" aria-hidden />
              )}
            </div>
            <h2 className="mb-2 text-lg font-medium text-foreground">
              {locationActive ? "Nic ve tvem okoli" : "Ticho jako v trezoru"}
            </h2>
            <p className="mb-4 max-w-sm text-pretty text-muted-foreground">
              {locationActive
                ? `Ve vzdalenosti ${locationSettings.radiusKm} km od ${locationSettings.centerLabel} zatim nic neni. Zkus rozsirit okruh.`
                : "Tady zatim nic neni. Zkus jiny stitek nahore."}
            </p>
            {locationActive && (
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="min-h-11 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Zmenit okruh
              </button>
            )}
          </div>
        ) : sessionComplete ? (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center px-2 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-foreground">
              <div className="relative">
                <PartyPopper className="h-9 w-9" aria-hidden />
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-primary" aria-hidden />
              </div>
            </div>
            <h2 className="mb-2 text-balance text-lg font-semibold sm:text-xl">
              Hotovo!
            </h2>
            <p className="mb-6 max-w-sm text-pretty text-muted-foreground">
              Chtel bys couvet, nebo stejnou jizdu znovu od prvni karty? Ty volis.
            </p>
            <button
              type="button"
              onClick={restartSession}
              className="min-h-12 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition active:scale-[0.92] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Jdeme znovu
            </button>
          </div>
        ) : (
          <div className="relative mx-auto flex min-h-0 min-w-0 w-full max-w-sm flex-1 touch-none sm:max-w-md md:max-w-2xl lg:my-auto lg:max-h-[560px] lg:max-w-4xl xl:max-h-[620px] xl:max-w-5xl">
            {filteredOffers.slice(currentIndex, currentIndex + 3).map((offer, index) => (
              <SwipeCard
                key={`${offer.id}-${currentIndex + index}`}
                offer={offer}
                onSwipe={index === 0 ? handleSwipe : undefined}
                stackIndex={index}
                onInfo={index === 0 ? handleInfo : undefined}
                distanceKm={index === 0 ? getDistanceKm(offer) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="shrink-0 border-t border-border bg-background/95 px-2 py-2 sm:py-3 backdrop-blur-md">
        <div className="mx-auto flex w-full min-w-0 max-w-md flex-wrap items-center justify-center gap-2 sm:max-w-lg sm:gap-4">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!sessionComplete && currentIndex === 0}
            aria-label="Zpet na predchozi kartu"
            className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-11 sm:min-w-11"
          >
            <RotateCcw className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("left")}
            disabled={!currentOffer || sessionComplete}
            aria-label="Nechci tuto nabidku"
            className="flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-full bg-icon-well text-destructive transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-14 sm:min-w-14"
          >
            <X className="h-6 w-6 text-destructive sm:h-7 sm:w-7" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleInfo}
            disabled={!currentOffer || sessionComplete}
            aria-label="Detail nabidky"
            className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-11 sm:min-w-11"
          >
            <Info className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("right")}
            disabled={!currentOffer || sessionComplete}
            aria-label="Libi se mi"
            className="flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-14 sm:min-w-14"
          >
            <Heart className="h-6 w-6 text-primary-foreground sm:h-7 sm:w-7" fill="currentColor" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Location filter modal */}
      <LocationFilterModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        current={locationSettings}
        onChange={handleLocationChange}
      />
    </div>
  );
}
