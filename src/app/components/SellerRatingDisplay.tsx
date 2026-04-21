import { Star } from "lucide-react";
import { getUserRatingSummary } from "../data/ratingsStore";
import { cn } from "./ui/utils";

type Props = {
  userKey: string;
  className?: string;
  size?: "sm" | "md";
  /** Přečteme znovu při změně (např. po novém hodnocení) */
  version?: number;
};

export function SellerRatingDisplay({ userKey, className, size = "sm", version = 0 }: Props) {
  void version;
  const s = getUserRatingSummary(userKey);
  if (!s) return null;

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-1 text-muted-foreground",
        size === "sm" ? "text-[0.7rem] sm:text-xs" : "text-sm",
        className
      )}
    >
      <span className="inline-flex text-primary" aria-hidden>
        <Star className="h-3.5 w-3.5 fill-primary text-primary sm:h-4 sm:w-4" strokeWidth={0} />
      </span>
      <span className="font-semibold tabular-nums text-foreground">{s.label}</span>
      <span className="opacity-80">· {s.count} hodn.</span>
    </p>
  );
}
