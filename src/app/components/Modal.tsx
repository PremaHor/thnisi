import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

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
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative mx-2 w-full min-w-0 max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl border-x-[3px] border-t-[3px] border-border bg-card shadow-cartoon-lg animate-in slide-in-from-bottom-4 duration-200 sm:mx-2 sm:max-h-[90vh] sm:rounded-3xl sm:border-4 sm:shadow-cartoon sm:slide-in-from-bottom-0">
        {title && (
          <div className="sticky top-0 flex items-center justify-between border-b-[3px] border-border bg-card px-6 py-4">
            <h2>{title}</h2>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] -mr-3 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
