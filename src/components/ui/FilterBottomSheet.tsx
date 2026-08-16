import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useCloseOnBack } from "../../lib/useCloseOnBack";
import { Button } from "./Button";

interface FilterBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onApply: () => void;
  onReset?: () => void;
  resetLabel?: string;
  applyLabel?: string;
  children: ReactNode;
}

/** A compact, partial-height bottom sheet for filters — distinct from the full-screen add/edit Sheet. */
export function FilterBottomSheet({
  open,
  title,
  onClose,
  onApply,
  onReset,
  resetLabel = "Reset",
  applyLabel = "Apply",
  children,
}: FilterBottomSheetProps) {
  useCloseOnBack(open, onClose);

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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-800/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-cream-100 pb-[env(safe-area-inset-bottom)] sm:mb-6 sm:rounded-2xl sm:shadow-soft">
        <div className="flex items-center justify-between border-b border-cream-300 px-4 py-3">
          <h2 className="font-display text-base font-semibold text-cocoa-700">{title}</h2>
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
        <div className="flex gap-3 border-t border-cream-300 px-4 py-3">
          {onReset && (
            <Button variant="secondary" className="flex-1" onClick={onReset}>
              {resetLabel}
            </Button>
          )}
          <Button className="flex-1" onClick={onApply}>
            {applyLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
