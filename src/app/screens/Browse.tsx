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
    const colors = ["#F6BD60", "#84A59D", "#F28482", "#F5CAC3", "#F7EDE2"];
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
    <div className="flex min-h-0 flex-1 flex-col bg-transparent">
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-card/80 px-2 pt-safe shadow-sm backdrop-blur-md">
        <div className="py-3 sm:py-4">
          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <AppLogo to="/" size="lg" />
              {/* Location filter button */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                  locationActive
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-md"
                    : "border-border/40 bg-card/80 text-foreground shadow-sm hover:border-muted-teal/50"
                }`}
                aria-label="Nastavit lokalitu"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="max-w-[110px] truncate">
                  {locationActive ? locationSettings.centerLabel : "Cela CR"}
                </span>
                {locationActive && (
                  <span className="shrink-0 opacity-80">
                    {" "}
                    {locationSettings.radiusKm} km
                  </span>
                )}
              </button>
            </div>
            <p className="mb-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-muted-teal/90">
              Dnes na trh
            </p>
            <h1 className="text-balance font-display font-extrabold leading-tight tracking-tight text-foreground [font-size:clamp(1.375rem,calc(5.2vw+0.35rem),1.875rem)]">
              Co dnes hledas?
            </h1>
            {total > 0 && !sessionComplete && (
              <p
                className="mt-1.5 text-sm font-semibold text-muted-foreground"
                aria-hidden
              >
                {currentIndex + 1} / {total} v tomhle filtru
              </p>
            )}
          </div>

          <div
            className="-mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1 scrollbar-hide"
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
                  className={`min-h-[44px] min-w-[44px] shrink-0 snap-start rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 ${
                    selected
                      ? "border-primary/40 bg-primary text-primary-foreground shadow-md"
                      : "border-border/40 bg-card/80 text-foreground shadow-sm hover:scale-105 hover:border-muted-teal/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
        {filteredOffers.length === 0 ? (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center px-2 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-muted-teal/50 bg-surface-teal-soft">
              {locationActive ? (
                <MapPin className="h-9 w-9 text-muted-teal" aria-hidden />
              ) : (
                <Search className="h-9 w-9 text-muted-teal" aria-hidden />
              )}
            </div>
            <h2 className="mb-2 font-display text-lg font-bold">
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
                className="min-h-[44px] rounded-2xl border-2 border-primary/20 bg-primary px-6 font-display text-sm font-bold text-primary-foreground shadow-md transition active:scale-[0.98]"
              >
                Zmenit okruh
              </button>
            )}
          </div>
        ) : sessionComplete ? (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center px-2 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-primary/30 bg-surface-honey-soft text-on-honey shadow-inner">
              <div className="relative">
                <PartyPopper className="h-9 w-9" aria-hidden />
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-primary" aria-hidden />
              </div>
            </div>
            <h2 className="mb-2 text-balance font-display text-lg font-extrabold sm:text-xl">
              Hotovo, sefe!
            </h2>
            <p className="mb-6 max-w-sm text-pretty text-muted-foreground">
              Chtel bys couvet, nebo stejnou jizdu znovu od prvni karty? Ty volis.
            </p>
            <button
              type="button"
              onClick={restartSession}
              className="min-h-12 rounded-2xl border-2 border-primary/20 bg-primary px-8 font-display text-base font-bold text-primary-foreground shadow-lg transition active:scale-[0.98] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Jdeme znovu
            </button>
          </div>
        ) : (
          <div className="relative mx-auto h-full w-full min-w-0 max-w-sm sm:max-w-md lg:max-w-lg">
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
      <div className="shrink-0 border-t-2 border-border/50 bg-card/80 px-2 py-3 pb-safe shadow-[0_-8px_30px_-12px_rgba(42,38,35,0.1)] backdrop-blur-md">
        <div className="mx-auto flex w-full min-w-0 max-w-md flex-wrap items-center justify-center gap-2 sm:max-w-lg sm:gap-4">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!sessionComplete && currentIndex === 0}
            aria-label="Zpet na predchozi kartu"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-35 disabled:pointer-events-none transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="w-6 h-6 text-foreground" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("left")}
            disabled={!currentOffer || sessionComplete}
            aria-label="Nechci tuto nabidku"
            className="min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-35 disabled:pointer-events-none transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleInfo}
            disabled={!currentOffer || sessionComplete}
            aria-label="Detail nabidky"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 disabled:opacity-35 disabled:pointer-events-none transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="w-6 h-6 text-foreground" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("right")}
            disabled={!currentOffer || sessionComplete}
            aria-label="Libi se mi"
            className="min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 disabled:opacity-35 disabled:pointer-events-none transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" fill="currentColor" strokeWidth={2.5} />
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
