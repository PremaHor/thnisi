import { useState, useLayoutEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, MapPin, Tag, MessageCircle, Heart, Handshake, Paperclip } from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Avatar } from "../components/Avatar";
import { Modal } from "../components/Modal";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { BARTER_OFFERS, getBarterOfferById, type BarterOfferPublic } from "../data/barterOffers";
import { loadUserOfferForm, mergeFormIntoPublicOffer } from "../data/userOfferForms";
import { isOfferLiked, toggleLikedOfferId } from "../data/swipePreferencesStore";
import { SellerRatingDisplay } from "../components/SellerRatingDisplay";
import { cn } from "../components/ui/utils";

export function OfferDetail() {
  const { id: routeId } = useParams();
  const id = routeId ?? "1";
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [liked, setLiked] = useState(() =>
    typeof window !== "undefined" ? isOfferLiked(id) : false,
  );
  const [offer, setOffer] = useState<BarterOfferPublic>(
    () => getBarterOfferById(id) ?? BARTER_OFFERS[0]
  );

  useLayoutEffect(() => {
    const base = getBarterOfferById(id) ?? BARTER_OFFERS[0];
    const f = loadUserOfferForm(id);
    setOffer(f ? mergeFormIntoPublicOffer(f, base) : base);
    setCurrentImageIndex(0);
    setLiked(isOfferLiked(id));
  }, [id]);

  const handleRequestTrade = () => {
    setShowMatchModal(true);
  };

  const handleToggleLike = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setLiked(toggleLikedOfferId(id));
  };

  return (
    <div className="flex w-full min-w-0 flex-1 min-h-0 flex-col bg-background overflow-y-auto overflow-x-hidden pb-[calc(var(--app-bottom-nav)+8.25rem)] min-[360px]:pb-[calc(var(--app-bottom-nav)+6.25rem)]">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 py-3 pt-safe backdrop-blur">
        <div className="app-container flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="-ml-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted sm:-ml-2"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h3 className="min-w-0 flex-1 line-clamp-1">Detail nabídky</h3>
          <button
            type="button"
            onClick={handleToggleLike}
            aria-pressed={liked}
            aria-label={liked ? "Odebrat z oblíbených" : "Uložit do oblíbených"}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              liked
                ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                : "bg-icon-well text-foreground hover:bg-muted",
            )}
          >
            <Heart
              className="h-5 w-5"
              strokeWidth={2}
              fill={liked ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:mx-4 sm:mt-2 sm:rounded-[20px]">
        <ImageWithFallback
          src={offer.images[currentImageIndex] ?? offer.images[0]}
          alt={offer.title}
          className="h-full w-full object-cover sm:rounded-[20px]"
        />
        {offer.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {offer.images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentImageIndex ? "w-6 bg-white" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="app-container space-y-6 py-4">
        <div>
          <div className="mb-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between">
            <h2 className="min-w-0 flex-1 pr-0 sm:pr-2">{offer.title}</h2>
            <Badge variant="primary" className="w-fit shrink-0">
              {offer.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{offer.location}</span>
          </div>
        </div>

        <div>
          <h4 className="mb-2">Popis</h4>
          <p className="text-muted-foreground leading-relaxed">{offer.description}</p>
        </div>

        {offer.wantsInReturn?.trim() ? (
          <div className="rounded-[14px] border border-border bg-muted/40 p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <Handshake className="h-5 w-5 shrink-0" aria-hidden />
              <h4 className="m-0">Hledám na oplátku</h4>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-foreground sm:text-base">
              {offer.wantsInReturn}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Představa výměny — můžete dál vše v klidu dořešit v chatu.
            </p>
          </div>
        ) : null}

        {offer.tags.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h4>Štítky</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {offer.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {offer.attachments && offer.attachments.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <h4>Přílohy</h4>
            </div>
            <ul className="space-y-2">
              {offer.attachments.map((a) => (
                <li key={a.url}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    <span className="min-w-0 flex-1 truncate">{a.name}</span>
                    <span className="shrink-0 text-muted-foreground">Otevřít</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          to={`/user/${offer.sellerId}`}
          className="block rounded-[14px] border border-border bg-background p-3 transition-colors hover:bg-muted/50 sm:p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4>Nabízející</h4>
            <span className="text-xs text-muted-foreground">Zobrazit profil →</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={offer.seller.avatar} size="lg" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="mb-0.5">{offer.seller.name}</h4>
              <SellerRatingDisplay userKey={offer.sellerId} size="md" className="mb-1 text-foreground" />
              <p className="text-sm text-muted-foreground mb-1">{offer.seller.bio}</p>
              <p className="text-sm">{offer.seller.completedTrades} dokončených směn</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="app-sticky-bottom bg-transparent p-3 pb-safe sm:p-4">
        <div className="app-container flex flex-col gap-2 min-[360px]:flex-row">
          <Button
            variant="outline"
            className="min-h-[48px] w-full min-w-0 min-[360px]:flex-1 !bg-card/95 !shadow-sm hover:!bg-secondary/80"
            onClick={() => navigate(`/chat/seller-${id}`)}
          >
            <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
            <span className="truncate">Napsat zprávu</span>
          </Button>
          <Button
            className="min-h-[48px] w-full min-w-0 min-[360px]:flex-1"
            onClick={handleRequestTrade}
          >
            <span className="truncate">Požádat o směnu</span>
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title="Žádost o směnu odeslána!"
      >
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h3 className="mb-2">Žádost odeslána uživateli {offer.seller.name}</h3>
          <p className="mb-6 text-muted-foreground">Až odpoví, dáme vám vědět.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowMatchModal(false)}>
              Zavřít
            </Button>
            <Button fullWidth onClick={() => navigate("/trades")}>
              Zobrazit žádosti
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
