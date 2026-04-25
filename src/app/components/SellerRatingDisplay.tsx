import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getRatingSummaryForUser, type RatingSummary } from "../../lib/ratings";
import { cn } from "./ui/utils";

type Props = {
  userKey: string;
  className?: string;
  size?: "sm" | "md";
  /** Zvýšení hodnoty vynutí re-fetch (po novém hodnocení). */
  version?: number;
};

export function SellerRatingDisplay({
  userKey,
  className,
  size = "sm",
  version = 0,
}: Props) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);

  useEffect(() => {
    if (!userKey) return;
    void getRatingSummaryForUser(userKey).then(setSummary);
  }, [userKey, version]);

  if (!summary) return null;

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
      <span className="font-semibold tabular-nums text-foreground">{summary.label}</span>
      <span className="opacity-80">· {summary.count} hodn.</span>
    </p>
  );
}
