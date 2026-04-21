import { Link } from "react-router";
import { cn } from "./ui/utils";

/** Značka a textové logo aplikace (PWA, manifest, UI). */
export const APP_NAME = "TrhniSi";

const sizeClass = {
  sm: "text-lg tracking-wide",
  md: "text-xl leading-none tracking-wide sm:text-2xl",
  lg: "text-2xl leading-none tracking-wide sm:text-3xl",
} as const;

type AppLogoProps = {
  className?: string;
  to?: string;
  size?: keyof typeof sizeClass;
};

/**
 * Jednoduché textové logo: „Trhni“ + zvýrazněné „Si“.
 */
export function AppLogo({ className, to = "/", size = "md" }: AppLogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-block rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none",
        className
      )}
      aria-label={`${APP_NAME} — úvod`}
    >
      <span
        className={cn("font-display font-extrabold", sizeClass[size])}
        translate="no"
      >
        <span className="text-foreground">Trhni</span>
        <span className="text-muted-teal">Si</span>
      </span>
    </Link>
  );
}
