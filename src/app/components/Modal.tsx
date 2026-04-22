import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        className="relative mx-2 w-full min-w-0 max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-[20px] border border-border bg-card shadow-[var(--shadow-elev-2)] animate-in slide-in-from-bottom-4 duration-200 sm:mx-2 sm:max-h-[90vh] sm:rounded-[20px] sm:slide-in-from-bottom-0"
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
            <h2 className="m-0 text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 min-w-11 -mr-2 items-center justify-center rounded-full bg-icon-well text-foreground transition-colors hover:bg-muted"
              aria-label="Zavřít"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
