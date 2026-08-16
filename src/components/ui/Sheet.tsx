import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, title, onClose, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-cocoa-800/40" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex h-full w-full max-w-lg flex-col bg-cream-100 sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-2xl sm:shadow-soft">
        <div className="flex items-center justify-between border-b border-cream-300 px-4 py-3.5">
          <h2 className="font-display text-lg font-semibold text-cocoa-700">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-cocoa-500 hover:bg-cream-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="border-t border-cream-300 px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
