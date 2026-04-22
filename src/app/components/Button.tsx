import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-transform duration-150 active:scale-[0.92] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";

    const variants = {
      primary: "bg-primary text-primary-foreground shadow-none hover:bg-primary/90 border-0",
      secondary: "bg-secondary text-secondary-foreground border-0 shadow-none hover:bg-secondary/80",
      outline:
        "border border-border bg-background text-foreground shadow-none hover:bg-muted",
      ghost: "border-0 shadow-none hover:bg-muted",
      destructive:
        "border-0 bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90",
    };

    const sizes = {
      sm: "min-h-9 px-4 py-2 text-sm",
      md: "min-h-11 px-6 py-3.5 text-base",
      lg: "min-h-12 px-8 py-3.5 text-base",
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
  },
);

Button.displayName = "Button";
