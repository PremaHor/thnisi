import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default: "border border-border bg-muted text-muted-foreground",
    primary: "border-0 bg-primary text-primary-foreground",
    secondary: "border border-border bg-background text-foreground",
    success: "border border-border bg-muted text-foreground",
    warning: "border border-border bg-muted text-foreground",
    destructive: "border border-destructive/30 bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-normal ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
