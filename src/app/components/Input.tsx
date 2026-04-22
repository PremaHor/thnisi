import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`min-h-11 w-full rounded-lg border border-border bg-input-background px-4 py-3.5 font-medium focus:outline-none focus:ring-2 focus:ring-ring ${
            error ? "border-destructive" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
