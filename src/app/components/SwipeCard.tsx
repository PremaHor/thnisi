import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  animate,
} from "motion/react";
import { MapPin, Heart, X, ChevronRight } from "lucide-react";
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

  const rotate = useTransform(
    x,
    reduceMotion ? [-300, 0, 300] : [-300, 0, 300],
    reduceMotion ? [0, 0, 0] : [-15, 0, 15]
  );
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 90], [0, 1]);
  const nopeOpacity = useTransform(x, [-90, 0], [1, 0]);
  const likeScale = useTransform(
    x,
    [0, 120],
    reduceMotion ? [1, 1] : [0.82, 1.12]
  );
  const nopeScale = useTransform(
    x,
    [-120, 0],
    reduceMotion ? [1, 1] : [1.12, 0.82]
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
        }
      );
    } else if (swipeLeft && onSwipe) {
      animate(x, -exitX, reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 40 }).then(
        () => {
          onSwipe("left");
          x.set(0);
        }
      );
    } else {
      animate(x, 0, reduceMotion ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 35 });
    }
  };

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 12;
  const zIndex = 10 - stackIndex;

  const isDraggable = stackIndex === 0;

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        x: isDraggable ? x : 0,
        y: yOffset,
        rotate: isDraggable ? rotate : 0,
        opacity: isDraggable ? opacity : 1,
        scale,
        zIndex,
      }}
      drag={isDraggable ? "x" : false}
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
      {/*
        Karta — pevná anatomie: obrázek (pevná výška) → content (flex-1, overflow-hidden)
        → seller pás (shrink-0) → CTA tlačítko (shrink-0).
        Žádné mt-auto, žádné konfliktní basis+max-h+min-h.
      */}
      <div className="flex h-full w-full -rotate-1 select-none flex-col overflow-hidden rounded-[1.4rem] border-[3px] border-border/90 bg-card shadow-cartoon ring-1 ring-inset ring-white/35 motion-reduce:rotate-0 dark:border-border/70 dark:ring-white/10 sm:rotate-0">

        {/* ── 1. OBRÁZEK + TITULEK overlay — shrink-0, pevná výška ── */}
        <div className="relative h-48 w-full shrink-0 sm:h-56">
          <ImageWithFallback
            src={offer.image}
            alt={offer.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Silný gradient zespodu — titulek musí být čitelný */}
          <div
            className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-card/95 via-card/50 to-transparent"
            aria-hidden
          />

          {/* Kategorie badge — vpravo nahoře */}
          <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
            <Badge variant="primary" className="text-[0.7rem] shadow-md backdrop-blur-sm sm:text-xs">
              {offer.category}
            </Badge>
          </div>

          {/* Titulek + lokace — overlay na spodku obrázku, vždy viditelný */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 sm:px-5 sm:pb-4">
            <h2 className="mb-1 line-clamp-2 font-display text-lg font-bold leading-tight text-foreground sm:text-xl">
              {offer.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-foreground/70 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{offer.location}</span>
              {distanceKm != null && (
                <span className="shrink-0 rounded-full bg-black/30 px-1.5 py-0.5 text-[0.65rem] font-bold text-white backdrop-blur-sm">
                  ~{Math.round(distanceKm)} km
                </span>
              )}
              {offer.isRemote && (
                <span className="shrink-0 rounded-full bg-primary/80 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary-foreground backdrop-blur-sm">
                  Na dalku
                </span>
              )}
            </div>
          </div>

          {/* Swipe overlaye — NE / LÍBÍ */}
          {isDraggable && (
            <>
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(80%,16rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-light-coral bg-card/85 px-4 py-2.5 text-center text-stamp-coral backdrop-blur-sm"
                style={{ opacity: nopeOpacity, rotate: "-18deg", scale: nopeScale }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-3xl font-black tracking-wide sm:text-4xl">NE</span>
                  <X className="h-8 w-8 shrink-0" strokeWidth={2.5} aria-hidden />
                </div>
              </motion.div>
              <motion.div
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(80%,16rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-muted-teal bg-card/85 px-4 py-2.5 text-center text-muted-teal backdrop-blur-sm"
                style={{ opacity: likeOpacity, rotate: "16deg", scale: likeScale }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display text-3xl font-black tracking-wide sm:text-4xl">LÍBÍ</span>
                  <Heart className="h-8 w-8 shrink-0 fill-current" aria-hidden />
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ── 2. POPIS + „NA OPLÁTKU" — flex-1, overflow-hidden (ořez, ne squish) ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden px-4 py-3 sm:px-5 sm:py-4">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-4 sm:text-[0.9375rem]">
            {offer.description}
          </p>

          {offer.wantsInReturn?.trim() ? (
            <div className="shrink-0 rounded-xl border border-muted-teal/40 bg-surface-teal-soft/60 px-3.5 py-2.5">
              <p className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-muted-teal sm:text-xs">
                Hledám na oplátku
              </p>
              <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                {offer.wantsInReturn}
              </p>
            </div>
          ) : null}
        </div>

        {/* ── 3. NABÍZEJÍCÍ — vždy shrink-0, nezávisí na flex-1 obsahu ── */}
        <div className="mx-3 mb-3 mt-auto shrink-0 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 sm:mx-4 sm:mb-3.5 sm:px-3.5 sm:py-3">
          <div className="flex items-center gap-3">
            <Avatar src={offer.seller.avatar} size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">Nabízející</p>
              <p className="truncate text-sm font-semibold leading-tight">{offer.seller.name}</p>
              <SellerRatingDisplay userKey={offer.sellerId} className="mt-0.5" size="sm" />
            </div>
          </div>
        </div>

        {/* ── 4. CTA — vždy shrink-0 na spodku ── */}
        {onInfo && isDraggable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInfo();
            }}
            className="flex min-h-[3rem] w-full shrink-0 items-center justify-center gap-1.5 rounded-b-[1.2rem] border-t-2 border-border/50 bg-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground transition-[filter] hover:brightness-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground/40 active:brightness-95 sm:min-h-[3.25rem] sm:text-base"
          >
            Zobrazit detail
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        )}
      </div>
    </motion.div>
  );
}
