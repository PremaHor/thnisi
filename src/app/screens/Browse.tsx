import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import confetti from "canvas-confetti";
import { Search, X, Heart, Info, RotateCcw, Sparkles, PartyPopper, MapPin } from "lucide-react";
import { SwipeCard, type SwipeCardHandle } from "../components/SwipeCard";
import { AppLogo } from "../components/AppLogo";
import { LocationFilterModal } from "../components/LocationFilterModal";
import {
  type LocationSettings,
  loadLocationSettings,
  haversineKm,
} from "../data/locationStore";
import {
  clearPassedIds,
  loadLikedIds,
  loadPassedIds,
  saveLikedIds,
  savePassedIds,
} from "../data/swipePreferencesStore";
import { getActiveOffers } from "../../lib/offers";
import { getUserProfile } from "../../lib/profile";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

const CATEGORIES = ["Vše", "Jídlo", "Služby", "Elektronika", "Ostatní"];

function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(12);
  }
}

type SwipeAction = { direction: "left" | "right"; id: string };

export function Browse() {
  const navigate = useNavigate();
  const { loading: authLoading, user } = useFirebaseAuth();
  const [selectedCategory, setSelectedCategory] = useState("Vše");
  const [passedIds, setPassedIds] = useState<string[]>(() => loadPassedIds());
  const [likedIds, setLikedIds] = useState<string[]>(() => loadLikedIds());
  const [swipeHistory, setSwipeHistory] = useState<SwipeAction[]>([]);
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(() =>
    loadLocationSettings()
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [offers, setOffers] = useState<
    Array<{
      id: string;
      sellerId: string;
      title: string;
      description: string;
      wantsInReturn: string;
      category: string;
      location: string;
      image: string;
      lat?: number;
      lng?: number;
      isRemote?: boolean;
      seller: { name: string; avatar: string };
    }>
  >([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const topSwipeCardRef = useRef<SwipeCardHandle>(null);

  useEffect(() => {
    if (authLoading) return;
    void (async () => {
      setOffersLoading(true);
      setOffersError(null);
      try {
        const active = await getActiveOffers();
        const sellerIds = [...new Set(active.map((o) => o.sellerId))];
        const profileMap = new Map<string, { name: string; avatarUrl: string }>();
        await Promise.all(
          sellerIds.map(async (uid) => {
            const p = await getUserProfile(uid);
            if (p) profileMap.set(uid, { name: p.name ?? "", avatarUrl: p.avatarUrl ?? "" });
          })
        );
        const rows = active.filter((offer) => offer.sellerId !== user?.uid).map((offer) => {
          const profile = profileMap.get(offer.sellerId);
          const sellerName =
            (offer as unknown as Record<string, unknown>).sellerName as string | undefined;
          const sellerAvatar =
            (offer as unknown as Record<string, unknown>).sellerAvatar as string | undefined;
          const resolvedName =
            profile?.name?.trim() ||
            sellerName?.trim() ||
            "";
          return {
            id: offer.id,
            sellerId: offer.sellerId,
            title: offer.title,
            description: offer.description,
            wantsInReturn: offer.wantsInReturn,
            category: offer.category,
            location: offer.location,
            image: offer.image || offer.images[0] || "",
            lat: offer.lat,
            lng: offer.lng,
            isRemote: offer.isRemote,
            seller: {
              name: resolvedName || `Uživatel ${offer.sellerId.slice(0, 6)}`,
              avatar: profile?.avatarUrl || sellerAvatar || "",
            },
          };
        });
        setOffers(rows);
      } catch (e) {
        console.error("Browse load error:", e);
        setOffersError("Nabídky se nepodařilo načíst.");
      } finally {
        setOffersLoading(false);
      }
    })();
  }, [authLoading]);

  const locationActive = locationSettings.radiusKm > 0;

  const filteredOffers = offers.filter((offer) => {
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

  const passedSet = useMemo(() => new Set(passedIds), [passedIds]);
  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);

  const deckOffers = useMemo(
    () =>
      filteredOffers.filter((offer) => !passedSet.has(offer.id) && !likedSet.has(offer.id)),
    [filteredOffers, passedSet, likedSet]
  );

  const getDistanceKm = (offer: (typeof offers)[number]): number | undefined => {
    if (!locationActive || offer.isRemote || offer.lat == null || offer.lng == null)
      return undefined;
    return haversineKm(locationSettings.lat, locationSettings.lng, offer.lat, offer.lng);
  };

  const currentOffer = deckOffers[0];
  const totalInDeck = deckOffers.length;
  const atEnd = filteredOffers.length > 0 && deckOffers.length === 0;
  const positionLabel =
    totalInDeck > 0 && !atEnd ? `Karta 1 z ${totalInDeck}. ${currentOffer?.title ?? ""}.` : "";

  useEffect(() => {
    if (announcerRef.current && positionLabel) {
      announcerRef.current.textContent = positionLabel;
    }
  }, [positionLabel, atEnd, totalInDeck]);

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

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleLocationChange = (s: LocationSettings) => {
    setLocationSettings(s);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const top = deckOffers[0];
    if (!top || atEnd) return;
    hapticLight();

    const willEmptyDeck = deckOffers.length === 1;

    if (direction === "left") {
      setPassedIds((a) => {
        if (a.includes(top.id)) return a;
        const n = [...a, top.id];
        savePassedIds(n);
        return n;
      });
    } else {
      setLikedIds((a) => {
        const without = a.filter((id) => id !== top.id);
        const n = [...without, top.id];
        saveLikedIds(n);
        return n;
      });
    }

    setSwipeHistory((h) => [...h, { direction, id: top.id }]);

    if (willEmptyDeck) {
      window.setTimeout(fireConfetti, 200);
    }
  };

  const handleUndo = () => {
    setSwipeHistory((hist) => {
      if (hist.length === 0) return hist;
      const last = hist[hist.length - 1];

      if (last.direction === "left") {
        setPassedIds((a) => {
          const n = a.filter((id) => id !== last.id);
          savePassedIds(n);
          return n;
        });
      } else {
        setLikedIds((a) => {
          const i = a.lastIndexOf(last.id);
          if (i < 0) return a;
          const n = [...a.slice(0, i), ...a.slice(i + 1)];
          saveLikedIds(n);
          return n;
        });
      }

      return hist.slice(0, -1);
    });
  };

  const handleInfo = () => {
    if (currentOffer) {
      navigate(`/offer/${currentOffer.id}`);
    }
  };

  const restartSession = () => {
    clearPassedIds();
    setPassedIds([]);
    setSwipeHistory([]);
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
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-3 pt-safe backdrop-blur-md sm:px-4">
        <div className="py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3">
            <AppLogo to="/" size="md" />
            <div className="flex items-center gap-2">
              {totalInDeck > 0 && !atEnd && (
                <span
                  className="hidden shrink-0 text-xs font-medium tabular-nums text-muted-foreground sm:inline"
                  aria-hidden
                >
                  1 / {totalInDeck}
                </span>
              )}
              <Link
                to="/saved"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[var(--shadow-search-pill)] transition-colors hover:border-foreground/25"
                aria-label={
                  likedIds.length
                    ? `Uložené nabídky, ${likedIds.length}`
                    : "Uložené nabídky"
                }
              >
                <Heart className="h-4 w-4" fill={likedIds.length ? "currentColor" : "none"} strokeWidth={2} />
                {likedIds.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                    {likedIds.length > 99 ? "99+" : likedIds.length}
                  </span>
                )}
              </Link>
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
          </div>

          <div
            className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 scrollbar-hide sm:-mx-4 sm:px-4"
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
                  className={`min-h-[40px] shrink-0 snap-start border-b-2 px-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] sm:min-h-[44px] sm:py-2.5 sm:text-base ${
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

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-2 pt-2 sm:px-4 sm:pb-3 sm:pt-3">
        {offersError && (
          <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {offersError}
          </div>
        )}
        {offersLoading && (
          <div className="mb-2 text-sm text-muted-foreground">Načítání nabídek…</div>
        )}
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
        ) : atEnd ? (
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
              Přehlédnuté už se neukazují; líbící se najdeš v Uložených. Chceš znovu projít odmítnuté?
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/saved"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-8 text-base font-medium text-foreground transition active:scale-[0.92] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Uložené
              </Link>
              <button
                type="button"
                onClick={restartSession}
                className="min-h-12 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition active:scale-[0.92] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Jdeme znovu
              </button>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto flex min-h-0 min-w-0 w-full max-w-sm flex-1 touch-none sm:max-w-md md:max-w-2xl lg:my-auto lg:max-h-[560px] lg:max-w-4xl xl:max-h-[620px] xl:max-w-5xl">
            {deckOffers.slice(0, 3).map((offer, index) => (
              <SwipeCard
                key={offer.id}
                ref={index === 0 ? topSwipeCardRef : undefined}
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
      <div className="shrink-0 border-t border-border bg-background/95 px-2 py-1.5 backdrop-blur-md sm:py-3">
        <div className="mx-auto flex w-full min-w-0 max-w-md flex-nowrap items-center justify-center gap-2.5 sm:max-w-lg sm:gap-4">
          <button
            type="button"
            onClick={handleUndo}
            disabled={swipeHistory.length === 0}
            aria-label="Zpet na predchozi kartu"
            className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-11 sm:min-w-11"
          >
            <RotateCcw className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={() => void topSwipeCardRef.current?.swipe("left")}
            disabled={!currentOffer || atEnd}
            aria-label="Nechci tuto nabidku"
            className="flex min-h-[3.25rem] min-w-[3.25rem] items-center justify-center rounded-full bg-icon-well text-destructive transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-14 sm:min-w-14"
          >
            <X className="h-6 w-6 text-destructive sm:h-7 sm:w-7" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleInfo}
            disabled={!currentOffer || atEnd}
            aria-label="Detail nabidky"
            className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] sm:min-h-11 sm:min-w-11"
          >
            <Info className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={() => void topSwipeCardRef.current?.swipe("right")}
            disabled={!currentOffer || atEnd}
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
