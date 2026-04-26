import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowLeftRight } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { getOffersBySellerId, softDeleteOffer, updateOffer, type OfferStatus } from "../../lib/offers";
import { subscribePendingTradeCountsByOffer } from "../../lib/trades";

interface MyOfferRow {
  id: string;
  title: string;
  category: string;
  status: OfferStatus;
  image: string;
  views: number;
  requests: number;
}

const statusPillBase =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold tracking-normal touch-manipulation transition-transform select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:py-1.5 sm:px-2.5";

const statusPillActive =
  "border-border bg-muted text-foreground"; /* stejné vyznění jako Badge success */
const statusPillInactive = "border-border bg-muted text-muted-foreground";

export function MyOffers() {
  const { user } = useFirebaseAuth();
  const [offers, setOffers] = useState<MyOfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeCounts, setTradeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.uid) {
      setOffers([]);
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await getOffersBySellerId(user.uid);
        setOffers(
          rows
            .filter((offer) => offer.status !== "deleted")
            .map((offer) => ({
              id: offer.id,
              title: offer.title,
              category: offer.category,
              status: offer.status,
              image: offer.image || offer.images[0] || "",
              views: 0,
              requests: 0,
            }))
        );
      } catch (e) {
        console.error("My offers load error:", e);
        setError("Nabídky se nepodařilo načíst.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Živý počet pending žádostí per nabídka
  useEffect(() => {
    if (!user?.uid) { setTradeCounts({}); return; }
    const unsub = subscribePendingTradeCountsByOffer(user.uid, setTradeCounts);
    return unsub;
  }, [user?.uid]);

  const toggleStatus = useCallback((id: string) => {
    setOffers((prev) => {
      const target = prev.find((o) => o.id === id);
      if (!target) return prev;
      const nextStatus: OfferStatus = target.status === "active" ? "paused" : "active";
      void updateOffer(id, { status: nextStatus });
      return prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o));
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    void (async () => {
      try {
        await softDeleteOffer(id);
        setOffers((prev) => prev.filter((offer) => offer.id !== id));
      } catch (e) {
        console.error("Offer delete error:", e);
        setError("Smazání nabídky se nezdařilo.");
      }
    })();
  }, []);

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-4 pt-safe backdrop-blur">
        <div className="app-container mb-4 flex min-w-0 flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
          <h1 className="min-w-0">Moje nabídky</h1>
          <Link to="/create" className="w-full min-[400px]:w-auto">
            <Button size="sm" className="w-full min-[400px]:w-auto">
              <Plus className="mr-1.5 h-5 w-5" />
              Nová nabídka
            </Button>
          </Link>
        </div>
      </div>

      <div className="app-container py-4">
        {loading && <p className="mb-3 text-sm text-muted-foreground">Načítání nabídek…</p>}
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Zatím nemáte nabídky</h3>
            <p className="mb-6 text-muted-foreground">
              Vytvořte první nabídku a začněte směňovat
            </p>
            <Link to="/create">
              <Button>Vytvořit nabídku</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const active = offer.status === "active";
              const pendingCount = tradeCounts[offer.id] ?? 0;
              return (
                <div
                  key={offer.id}
                  className={`overflow-hidden rounded-lg border bg-card shadow-sm transition-colors ${
                    pendingCount > 0 ? "border-primary/60 shadow-primary/10" : "border-border"
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <Link
                      to={`/offer/${offer.id}`}
                      className="flex min-w-0 flex-1 gap-3 active:bg-secondary/40"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <ImageWithFallback
                          src={offer.image}
                          alt={offer.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 line-clamp-1 pr-1 text-left">{offer.title}</h4>
                        <Badge variant="primary" className="mb-2">
                          {offer.category}
                        </Badge>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-muted-foreground">{offer.views} zobrazení</span>
                          {pendingCount > 0 ? (
                            <Link
                              to="/trades"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 font-semibold text-primary"
                            >
                              <ArrowLeftRight className="h-3.5 w-3.5" />
                              {pendingCount} {pendingCount === 1 ? "žádost" : pendingCount < 5 ? "žádosti" : "žádostí"}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">0 žádostí</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      aria-pressed={active}
                      aria-label={
                        active
                          ? "Nabídka je aktivní. Klepnutím ji skrýt z výpisu."
                          : "Nabídka je neaktivní. Klepnutím ji znovu zobrazit."
                      }
                      onClick={() => toggleStatus(offer.id)}
                      className={`${statusPillBase} self-start ${active ? statusPillActive : statusPillInactive}`}
                    >
                      {active ? (
                        <>
                          <Eye className="h-3.5 w-3.5 shrink-0 sm:h-3 sm:w-3" aria-hidden />
                          Aktivní
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 shrink-0 sm:h-3 sm:w-3" aria-hidden />
                          Neaktivní
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-border">
                    <Link
                      to={`/edit/${offer.id}`}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 transition-colors hover:bg-secondary"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="text-sm">Upravit</span>
                    </Link>
                    <button
                      type="button"
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 border-l border-border text-destructive transition-colors hover:bg-secondary"
                      onClick={() => deleteOffer(offer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Smazat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
