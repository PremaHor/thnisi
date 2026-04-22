import { useState, useCallback } from "react";
import { Link } from "react-router";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { ImageWithFallback } from "../components/ImageWithFallback";

type OfferStatus = "active" | "inactive";

interface MyOfferRow {
  id: string;
  title: string;
  category: string;
  status: OfferStatus;
  image: string;
  views: number;
  requests: number;
}

const INITIAL_MY_OFFERS: MyOfferRow[] = [
  {
    id: "1",
    title: "Čerstvá bio zelenina",
    category: "Jídlo",
    status: "active",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400",
    views: 42,
    requests: 3,
  },
  {
    id: "2",
    title: "Ruční keramika",
    category: "Ostatní",
    status: "inactive",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400",
    views: 28,
    requests: 1,
  },
];

const statusPillBase =
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold tracking-normal touch-manipulation transition-transform select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:py-1.5 sm:px-2.5";

const statusPillActive =
  "border-border bg-muted text-foreground"; /* stejné vyznění jako Badge success */
const statusPillInactive = "border-border bg-muted text-muted-foreground";

export function MyOffers() {
  const [offers, setOffers] = useState<MyOfferRow[]>(() => INITIAL_MY_OFFERS.map((o) => ({ ...o })));

  const toggleStatus = useCallback((id: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === "active" ? "inactive" : "active" } : o,
      ),
    );
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
              return (
                <div
                  key={offer.id}
                  className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
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
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{offer.views} zobrazení</span>
                          <span>{offer.requests} žádostí</span>
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
