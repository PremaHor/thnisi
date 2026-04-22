import { Link } from "react-router";
import { cn } from "./ui/utils";

/** Značka a textové logo aplikace (PWA, manifest, UI). */
export const APP_NAME = "TrhniSi";
export const APP_ICON_SRC = "/app-icon.png";

const sizeClass = {
  sm: "text-lg",
  md: "text-xl leading-none sm:text-2xl",
  lg: "text-2xl leading-none sm:text-3xl",
} as const;

const markSizeClass = {
  sm: "h-6 w-6",
  md: "h-7 w-7 sm:h-8 sm:w-8",
  lg: "h-8 w-8 sm:h-9 sm:w-9",
} as const;

type AppLogoProps = {
  className?: string;
  to?: string;
  size?: keyof typeof sizeClass;
  /** Zobrazit ikonu vedle textu (default true). */
  withMark?: boolean;
  /** Zobrazit pouze ikonu bez textu. */
  markOnly?: boolean;
};

/**
 * Logo aplikace: ikona (jahoda-cyklus) + wordmark „Trhni" + akcent „Si".
 */
export function AppLogo({
  className,
  to = "/",
  size = "md",
  withMark = true,
  markOnly = false,
}: AppLogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${APP_NAME} — úvod`}
    >
      {(withMark || markOnly) && (
        <img
          src={APP_ICON_SRC}
          alt=""
          aria-hidden="true"
          className={cn(
            "shrink-0 rounded-[20%] object-contain",
            markSizeClass[size],
          )}
          decoding="async"
          loading="eager"
        />
      )}
      {!markOnly && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            sizeClass[size],
          )}
          translate="no"
        >
          Trhni
          <span className="text-primary">Si</span>
        </span>
      )}
    </Link>
  );
}
