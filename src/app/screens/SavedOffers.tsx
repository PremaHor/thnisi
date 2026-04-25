import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { Badge } from "../components/Badge";
import { getOfferById, type BarterOffer } from "../../lib/offers";
import { getSavedOfferIds, unsaveOffer } from "../../lib/savedOffers";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { loadLikedIds } from "../data/swipePreferencesStore";

export function SavedOffers() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Počkej na dokončení auth, pak načti z Firestore nebo localStorage
  useEffect(() => {
    if (authLoading) return;
    void (async () => {
      setLoading(true);
      let ids: string[];
      if (user?.uid) {
        ids = await getSavedOfferIds(user.uid);
      } else {
        ids = loadLikedIds();
      }
      setLikedIds(ids);
      if (ids.length === 0) {
        setOffers([]);
        setLoading(false);
        return;
      }
      const results = await Promise.all(ids.map((id) => getOfferById(id)));
      setOffers(results.filter((o): o is BarterOffer => o != null && o.status !== "deleted"));
      setLoading(false);
    })();
  }, [authLoading, user?.uid]);

  const removeLike = useCallback((id: string) => {
    setLikedIds((prev) => prev.filter((x) => x !== id));
    setOffers((prev) => prev.filter((o) => o.id !== id));
    if (user?.uid) {
      void unsaveOffer(user.uid, id);
    }
  }, [user?.uid]);

  const notFoundCount = likedIds.length - offers.length;

  return (
    <div className="app-screen pb-[var(--app-bottom-nav)]">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted sm:-ml-2"
            aria-label="Zpět"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h1 className="min-w-0 flex-1 text-lg font-semibold leading-tight sm:text-xl">Uložené</h1>
          <span className="shrink-0 tabular-nums text-sm text-muted-foreground">{offers.length}</span>
        </div>
      </div>

      <div className="app-container py-4">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Načítání…</div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-2 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <h2 className="mb-2 text-lg font-medium">Zatím nic uloženého</h2>
            <p className="mb-6 max-w-sm text-pretty text-muted-foreground">
              Na hlavní stránce potáhni kartu doprava — uloží se sem.
            </p>
            <Link
              to="/"
              className="min-h-11 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition active:scale-[0.98] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Objevovat
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <Link to={`/offer/${offer.id}`} className="flex gap-3 p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <ImageWithFallback
                      src={offer.image || offer.images?.[0] || ""}
                      alt={offer.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-medium leading-snug">{offer.title}</h3>
                    <Badge variant="primary" className="mt-2">
                      {offer.category}
                    </Badge>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{offer.location}</p>
                  </div>
                </Link>
                <div className="border-t border-border px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeLike(offer.id)}
                    className="text-sm font-medium text-muted-foreground transition hover:text-destructive"
                  >
                    Odebrat z uložených
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && notFoundCount > 0 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Některé uložené nabídky už nejsou dostupné ({notFoundCount}).
          </p>
        )}
      </div>
    </div>
  );
}
