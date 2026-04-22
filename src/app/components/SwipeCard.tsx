import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  animate,
} from "motion/react";
import { MapPin, Heart, X, ChevronRight, Info } from "lucide-react";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { ImageWithFallback } from "./ImageWithFallback";
import { SellerRatingDisplay } from "./SellerRatingDisplay";

interface Offer {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  wantsInReturn: string;
  category: string;
  location: string;
  isRemote?: boolean;
  image: string;
  seller: { name: string; avatar: string };
}

interface SwipeCardProps {
  offer: Offer;
  onSwipe?: (direction: "left" | "right") => void;
  stackIndex: number;
  onInfo?: () => void;
  /** Vzdálenost od středu uživatele v km (pokud je lokální filtr aktivní) */
  distanceKm?: number;
}

const EXIT_X = 520;
const EXIT_X_REDUCED = 120;
const OFFSET_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function SwipeCard({ offer, onSwipe, stackIndex, onInfo, distanceKm }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const exitX = reduceMotion ? EXIT_X_REDUCED : EXIT_X;
  const x = useMotionValue(0);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const rotate = useTransform(
    x,
    reduceMotion ? [-300, 0, 300] : [-300, 0, 300],
    reduceMotion ? [0, 0, 0] : [-15, 0, 15],
  );
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 90], [0, 1]);
  const nopeOpacity = useTransform(x, [-90, 0], [1, 0]);
  const likeScale = useTransform(
    x,
    [0, 120],
    reduceMotion ? [1, 1] : [0.82, 1.12],
  );
  const nopeScale = useTransform(
    x,
    [-120, 0],
    reduceMotion ? [1, 1] : [1.12, 0.82],
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const vx = info.velocity.x;
    const ox = info.offset.x;

    const swipeRight =
      ox > OFFSET_THRESHOLD || (ox > 40 && vx > VELOCITY_THRESHOLD);
    const swipeLeft =
      ox < -OFFSET_THRESHOLD || (ox < -40 && vx < -VELOCITY_THRESHOLD);

    if (swipeRight && onSwipe) {
      animate(x, exitX, reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 40 }).then(
        () => {
          onSwipe("right");
          x.set(0);
        },
      );
    } else if (swipeLeft && onSwipe) {
      animate(x, -exitX, reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 40 }).then(
        () => {
          onSwipe("left");
          x.set(0);
        },
      );
    } else {
      animate(x, 0, reduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 35 });
    }
  };

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 12;
  const zIndex = 10 - stackIndex;

  const isDraggable = stackIndex === 0;
  const hasWants = !!offer.wantsInReturn?.trim();

  return (
    <>
      <motion.div
        ref={cardRef}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          x: isDraggable ? x : 0,
          y: yOffset,
          rotate: isDraggable ? rotate : 0,
          opacity: isDraggable ? opacity : 1,
          scale,
          zIndex,
          touchAction: isDraggable ? "none" : undefined,
        }}
        drag={isDraggable ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -exitX, right: exitX }}
        dragElastic={0.85}
        onDragEnd={isDraggable ? handleDragEnd : undefined}
        animate={{
          scale,
          y: yOffset,
        }}
        transition={{
          scale: { duration: 0.2 },
          y: { duration: 0.2 },
        }}
      >
        {/* pointer-events-none: tahy jdou na motion.div (Tinder swipe). Výjimky: pointer-events-auto. */}
        <div className="pointer-events-none flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-search-pill)] lg:flex-row">
          {/* ======== FOTKA ======== */}
          <div className="relative min-h-[160px] w-full flex-1 overflow-hidden rounded-t-2xl bg-muted sm:min-h-0 sm:flex-[11] lg:w-auto lg:min-w-0 lg:flex-[13] lg:rounded-l-2xl lg:rounded-tr-none">
            <ImageWithFallback
              src={offer.image}
              alt={offer.title}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Horní chips: kategorie + meta */}
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="primary"
                className="shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              >
                {offer.category}
              </Badge>
              {offer.isRemote && (
                <span className="rounded-full bg-background/95 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm sm:text-xs">
                  Na dálku
                </span>
              )}
              {distanceKm != null && (
                <span className="rounded-full bg-background/95 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur-sm sm:text-xs">
                  ~{Math.round(distanceKm)} km
                </span>
              )}
            </div>

            {/* Swipe overlays Ne/Líbí */}
            {isDraggable && (
              <>
                <motion.div
                  className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-lg border border-border bg-background/95 px-2.5 py-1.5 text-destructive shadow-[var(--shadow-search-pill)] sm:left-4 sm:px-3 sm:py-2"
                  style={{ opacity: nopeOpacity, scale: nopeScale }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold sm:text-base">Ne</span>
                    <X className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
                  </div>
                </motion.div>
                <motion.div
                  className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-lg border border-border bg-background/95 px-2.5 py-1.5 text-primary shadow-[var(--shadow-search-pill)] sm:right-4 sm:px-3 sm:py-2"
                  style={{ opacity: likeOpacity, scale: likeScale }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold sm:text-base">Líbí</span>
                    <Heart className="h-4 w-4 shrink-0 fill-current sm:h-5 sm:w-5" aria-hidden />
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* ======== OBSAH ======== */}
          <div className="flex shrink-0 min-w-0 flex-col gap-1.5 p-2.5 sm:shrink sm:min-h-0 sm:flex-[9] sm:gap-3 sm:p-5 lg:flex-[10] lg:gap-4 lg:p-7 xl:p-8">
            {/* Titulek + místo */}
            <div className="min-w-0 shrink-0">
              <h2 className="line-clamp-1 text-[0.9375rem] font-semibold leading-tight text-foreground sm:line-clamp-2 sm:text-xl lg:text-[1.5rem] lg:leading-[1.2] lg:tracking-[-0.01em]">
                {offer.title}
              </h2>
              <div className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-muted-foreground sm:mt-1 sm:text-sm lg:mt-1.5 lg:gap-1.5 lg:text-[0.9375rem]">
                <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" aria-hidden />
                <span className="line-clamp-1">{offer.location}</span>
              </div>
            </div>

            {/* Desktop: popis + hledám inline */}
            <div className="hidden min-h-0 flex-1 flex-col gap-3 overflow-hidden sm:flex lg:gap-4">
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground lg:line-clamp-5 lg:text-[0.9375rem] lg:leading-[1.55]">
                {offer.description}
              </p>
              {hasWants && (
                <div className="rounded-lg border border-border bg-muted/60 px-3 py-2 lg:rounded-xl lg:px-4 lg:py-3">
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:mb-1 lg:tracking-[0.06em]">
                    Hledám na oplátku
                  </p>
                  <p className="line-clamp-2 text-sm font-medium text-foreground lg:text-[0.9375rem] lg:leading-[1.4]">
                    {offer.wantsInReturn}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile: kompaktní řádek prodejce + info tlačítko */}
            <div className="flex shrink-0 items-center gap-2 sm:hidden">
              <Avatar src={offer.seller.avatar} size="sm" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight text-foreground">
                  {offer.seller.name}
                </p>
                <SellerRatingDisplay
                  userKey={offer.sellerId}
                  className="mt-0 text-[0.65rem]"
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileSheetOpen(true);
                }}
                className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92]"
                aria-label="Zobrazit více informací"
              >
                <Info className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden />
              </button>
            </div>

            {/* Prodejce (desktop / tablet ≥ sm) */}
            <div className="hidden min-w-0 shrink-0 items-center gap-3 border-t border-border pt-3 sm:flex lg:gap-3.5 lg:pt-4">
              <Avatar src={offer.seller.avatar} size="sm" className="shrink-0 lg:hidden" />
              <Avatar src={offer.seller.avatar} size="md" className="hidden shrink-0 lg:block" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted-foreground lg:text-[0.7rem]">
                  Nabízí
                </p>
                <p className="truncate text-sm font-semibold leading-tight text-foreground lg:text-[0.9375rem]">
                  {offer.seller.name}
                </p>
                <SellerRatingDisplay
                  userKey={offer.sellerId}
                  className="mt-0.5 text-xs"
                  size="sm"
                />
              </div>
            </div>

            {/* CTA */}
            {onInfo && isDraggable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInfo();
                }}
                className="pointer-events-auto mt-auto flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] sm:min-h-11 sm:py-2.5 lg:min-h-[3.25rem] lg:gap-2 lg:rounded-xl lg:text-base"
              >
                Zobrazit detail
                <ChevronRight className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ======== MOBILNÍ BOTTOM SHEET (rozklik karty) ======== */}
      {mobileSheetOpen && isDraggable && (
        <MobileInfoSheet
          offer={offer}
          distanceKm={distanceKm}
          hasWants={hasWants}
          onClose={() => setMobileSheetOpen(false)}
          onShowDetail={() => {
            setMobileSheetOpen(false);
            onInfo?.();
          }}
        />
      )}
    </>
  );
}

/* ======================================================================== */
/*  MobileInfoSheet — spodní modální karta s plnou informací (jen mobil)     */
/* ======================================================================== */

interface MobileInfoSheetProps {
  offer: Offer;
  distanceKm?: number;
  hasWants: boolean;
  onClose: () => void;
  onShowDetail: () => void;
}

function MobileInfoSheet({
  offer,
  distanceKm,
  hasWants,
  onClose,
  onShowDetail,
}: MobileInfoSheetProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Zavřít"
      />

      <div className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-[20px] border border-border bg-card shadow-[var(--shadow-elev-2)] animate-in slide-in-from-bottom duration-200">
        {/* drag handle */}
        <div className="flex justify-center pt-2">
          <span aria-hidden className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-3 pt-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="primary">{offer.category}</Badge>
              {offer.isRemote && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-foreground">
                  Na dálku
                </span>
              )}
              {distanceKm != null && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                  ~{Math.round(distanceKm)} km
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold leading-tight text-foreground">{offer.title}</h2>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{offer.location}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Popis
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {offer.description || "Bez popisu."}
            </p>
          </section>

          {hasWants && (
            <section className="mt-5">
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hledám na oplátku
              </h3>
              <div className="rounded-lg border border-border bg-muted/60 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{offer.wantsInReturn}</p>
              </div>
            </section>
          )}

          <section className="mt-5">
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nabízí
            </h3>
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Avatar src={offer.seller.avatar} size="md" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {offer.seller.name}
                </p>
                <SellerRatingDisplay
                  userKey={offer.sellerId}
                  className="mt-0.5 text-xs"
                  size="sm"
                />
              </div>
            </div>
          </section>
        </div>

        {/* footer CTA */}
        <div className="border-t border-border bg-card px-5 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <button
            type="button"
            onClick={onShowDetail}
            className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            Zobrazit detail
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
