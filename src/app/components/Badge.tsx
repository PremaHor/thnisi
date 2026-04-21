import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default:
      "border-2 border-foreground/10 bg-muted text-muted-foreground shadow-cartoon-xs",
    primary:
      "border-2 border-ink/20 bg-primary text-primary-foreground shadow-cartoon-sm dark:border-foreground/20",
    secondary:
      "border-2 border-foreground/12 bg-secondary text-secondary-foreground shadow-cartoon-xs",
    success:
      "border-2 border-on-teal/30 bg-surface-teal-soft text-on-teal shadow-cartoon-sm dark:border-muted-teal/50 dark:bg-muted-teal/35 dark:text-foreground",
    warning:
      "border-2 border-on-honey/40 bg-surface-honey-soft text-on-honey shadow-cartoon-sm dark:border-honey-bronze/50 dark:bg-honey-bronze/35 dark:text-foreground",
    destructive:
      "border-2 border-destructive/35 bg-destructive/10 text-destructive shadow-cartoon-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
