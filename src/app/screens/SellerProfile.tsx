import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Star, MapPin, ShieldCheck, MessageCircle } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { getRatingSummaryForUser, getRatingBreakdownForUser, type RatingSummary } from "../../lib/ratings";
import { getUserProfile } from "../../lib/profile";
import { getOffersBySellerId, type BarterOffer } from "../../lib/offers";
import { ensureChatForTrade } from "../../lib/trades";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

function getTrustInfo(average: number): { label: string; colorClass: string } {
  if (average >= 4.7) return { label: "Výborný prodejce", colorClass: "text-green-600 dark:text-green-400" };
  if (average >= 4.3) return { label: "Velmi spolehlivý", colorClass: "text-teal-600 dark:text-teal-400" };
  if (average >= 3.5) return { label: "Dobrá spolehlivost", colorClass: "text-yellow-600 dark:text-yellow-400" };
  if (average >= 2.5) return { label: "Průměrné hodnocení", colorClass: "text-orange-500" };
  return { label: "Nízké hodnocení", colorClass: "text-destructive" };
}

export function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();

  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState("");
  const [sellerBio, setSellerBio] = useState("");
  const [sellerAvatar, setSellerAvatar] = useState("");
  const [completedTrades, setCompletedTrades] = useState(0);
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [rating, setRating] = useState<RatingSummary | null>(null);
  const [breakdown, setBreakdown] = useState<Record<1 | 2 | 3 | 4 | 5, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  });

  useEffect(() => {
    if (!sellerId) return;
    void (async () => {
      setLoading(true);
      const [profile, sellerOffers, ratingSummary, ratingBreakdown] = await Promise.all([
        getUserProfile(sellerId),
        getOffersBySellerId(sellerId),
        getRatingSummaryForUser(sellerId),
        getRatingBreakdownForUser(sellerId),
      ]);
      setSellerName(profile?.name ?? "");
      setSellerBio(profile?.bio ?? "");
      setSellerAvatar(profile?.avatarUrl ?? "");
      setCompletedTrades(profile?.completedTrades ?? 0);
      setOffers(sellerOffers.filter((o) => o.status === "active"));
      setRating(ratingSummary);
      setBreakdown(ratingBreakdown);
      setLoading(false);
    })();
  }, [sellerId]);

  const handleMessage = async () => {
    if (!user?.uid || !sellerId) return;
    const chatId = await ensureChatForTrade(user.uid, sellerId);
    navigate(`/chat/${chatId}`);
  };

  const maxBreakdownCount = Math.max(...Object.values(breakdown), 1);
  const trust = rating ? getTrustInfo(rating.average) : null;

  if (loading) {
    return (
      <div className="app-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 pt-safe backdrop-blur">
          <div className="app-container flex items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] -ml-1 flex shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="min-w-0 flex-1">Profil uživatele</h3>
          </div>
        </div>
        <div className="app-container py-16 text-center text-sm text-muted-foreground">Načítání…</div>
      </div>
    );
  }

  if (!sellerName && offers.length === 0) {
    return (
      <div className="app-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 pt-safe backdrop-blur">
          <div className="app-container flex items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] -ml-1 flex shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="min-w-0 flex-1">Profil uživatele</h3>
          </div>
        </div>
        <div className="app-container py-16 text-center">
          <p className="text-muted-foreground mb-4">Uživatel nebyl nalezen.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Zpět</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2">
          <button type="button" onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] -ml-1 flex shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h3 className="min-w-0 flex-1 line-clamp-1">Profil uživatele</h3>
        </div>
      </div>

      <div className="app-container space-y-5 py-6">
        {/* Identity */}
        <div className="flex flex-col items-center text-center gap-3">
          <Avatar size="xl" src={sellerAvatar || undefined} />
          <div>
            <h2 className="mb-1">{sellerName || "Uživatel"}</h2>
            {sellerBio && <p className="text-sm text-muted-foreground">{sellerBio}</p>}
          </div>
          {user && sellerId && user.uid !== sellerId && (
            <Button variant="outline" size="sm" onClick={() => void handleMessage()}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Napsat zprávu
            </Button>
          )}
        </div>

        {/* Rating card */}
        {rating && trust ? (
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center bg-primary/10 rounded-xl px-4 py-3 shrink-0">
                <Star className="h-5 w-5 fill-primary text-primary mb-1" strokeWidth={0} />
                <span className="text-2xl font-bold tabular-nums leading-none">{rating.label}</span>
                <span className="text-[0.7rem] text-muted-foreground mt-0.5">{rating.count}×</span>
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-base ${trust.colorClass}`}>{trust.label}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Ověřený člen komunity</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              {([5, 4, 3, 2, 1] as const).map((score) => {
                const count = breakdown[score];
                const pct = (count / maxBreakdownCount) * 100;
                return (
                  <div key={score} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right tabular-nums text-muted-foreground">{score}</span>
                    <Star className="h-3 w-3 shrink-0 fill-muted-foreground text-muted-foreground" strokeWidth={0} />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-4 text-right tabular-nums text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-4 text-center text-sm text-muted-foreground">
            Tento uživatel ještě nemá žádné hodnocení.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center sm:p-4">
            <div className="text-2xl font-bold mb-1">{completedTrades}</div>
            <p className="text-xs text-muted-foreground">Dokončené směny</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center sm:p-4">
            <div className="text-2xl font-bold mb-1">{offers.length}</div>
            <p className="text-xs text-muted-foreground">Aktivní nabídky</p>
          </div>
        </div>

        {/* Offers */}
        {offers.length > 0 && (
          <div>
            <h3 className="mb-3">Nabídky</h3>
            <div className="space-y-2">
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/offer/${offer.id}`}
                  className="flex gap-3 bg-card border border-border rounded-xl p-3 hover:bg-secondary transition-colors"
                >
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={offer.image || offer.images[0] || ""}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="font-medium line-clamp-1 mb-0.5">{offer.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{offer.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary" className="text-[0.65rem] py-0 px-2">{offer.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {offer.location}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
