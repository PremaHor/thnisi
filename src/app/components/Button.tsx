import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-2xl border-2 border-ink/20 font-display font-semibold transition-[transform,box-shadow,filter] duration-150 active:translate-y-px active:shadow-cartoon-sm disabled:pointer-events-none disabled:opacity-50 dark:border-foreground/20";

    const variants = {
      primary:
        "bg-primary text-primary-foreground shadow-cartoon hover:-translate-y-0.5 hover:shadow-cartoon-lg hover:brightness-105",
      secondary:
        "bg-secondary text-secondary-foreground shadow-cartoon-sm hover:-translate-y-0.5 hover:shadow-cartoon hover:brightness-105",
      outline: "border-2 border-border bg-card/80 shadow-cartoon-sm hover:-translate-y-0.5 hover:bg-secondary/90 hover:shadow-cartoon",
      ghost: "border-transparent shadow-none hover:translate-y-0 hover:shadow-none hover:bg-secondary/60",
      destructive:
        "border-ink/25 bg-destructive text-destructive-foreground shadow-cartoon hover:-translate-y-0.5 hover:shadow-cartoon-lg hover:brightness-110",
    };

    const sizes = {
      sm: "min-h-[36px] px-3 py-2",
      md: "min-h-[44px] px-4 py-2.5",
      lg: "min-h-[48px] px-6 py-3",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
