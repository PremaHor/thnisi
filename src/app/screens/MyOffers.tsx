import { Link } from "react-router";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { ImageWithFallback } from "../components/ImageWithFallback";

const MOCK_MY_OFFERS = [
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

export function MyOffers() {
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
        {MOCK_MY_OFFERS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Zatím nemáte nabídky</h3>
            <p className="text-muted-foreground mb-6">
              Vytvořte první nabídku a začněte směňovat
            </p>
            <Link to="/create">
              <Button>Vytvořit nabídku</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_MY_OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm"
              >
                <Link to={`/offer/${offer.id}`} className="flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h4 className="flex-1 line-clamp-1">{offer.title}</h4>
                      <Badge variant={offer.status === "active" ? "success" : "default"}>
                        {offer.status === "active" ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Aktivní
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Neaktivní
                          </>
                        )}
                      </Badge>
                    </div>
                    <Badge variant="primary" className="mb-2">
                      {offer.category}
                    </Badge>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{offer.views} zobrazení</span>
                      <span>{offer.requests} žádostí</span>
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="border-t border-border flex">
                  <Link
                    to={`/edit/${offer.id}`}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[44px] hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">Upravit</span>
                  </Link>
                  <button className="flex-1 flex items-center justify-center gap-2 min-h-[44px] hover:bg-secondary transition-colors border-l border-border text-destructive">
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Smazat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
