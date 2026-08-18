import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useCloseOnBack } from "../../lib/useCloseOnBack";

interface SidePanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Slides in from the right on desktop (list stays visible alongside it);
 * becomes a full-screen sheet on mobile, where a narrow side panel would
 * not be usable.
 */
export function SidePanel({ open, title, onClose, children }: SidePanelProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end bg-cocoa-800/40" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex h-full w-full flex-col bg-cream-100 shadow-soft sm:w-full sm:max-w-md">
        <div className="flex items-center justify-between border-b border-cream-300 px-4 py-3.5 pt-[calc(env(safe-area-inset-top)+0.875rem)]">
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
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">{children}</div>
      </div>
    </div>
  );
}
