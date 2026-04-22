import { HTMLAttributes } from "react";
import { User } from "lucide-react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt = "User", size = "md", className = "", ...props }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center overflow-hidden rounded-full border border-border bg-muted ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className={`${iconSizes[size]} text-muted-foreground`} />
      )}
    </div>
  );
}
