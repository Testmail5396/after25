import type { ComponentType, ReactNode } from "react";
import { useKeyboardInset } from "../../lib/useKeyboardInset";
import { BOTTOM_NAV_HEIGHT } from "../layout/layoutTokens";

interface BottomActionDockProps {
  children: ReactNode;
  actionIcon?: ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Sticky bar just above the bottom nav holding the search field (or other
 * primary control) and, optionally, a circular add action — reachable with
 * one hand. Lifts above the on-screen keyboard using the visual viewport,
 * since a plain `fixed` bar would otherwise sit underneath it on mobile
 * Safari. Omit actionIcon/actionLabel/onAction for a search-only dock.
 */
export function BottomActionDock({ children, actionIcon: Icon, actionLabel, onAction }: BottomActionDockProps) {
  const keyboardInset = useKeyboardInset();
  const bottom = keyboardInset > 0 ? keyboardInset : BOTTOM_NAV_HEIGHT;

  return (
    <div
      className="fixed inset-x-0 z-30 flex items-center gap-2 border-t border-cream-300 bg-white/95 px-3 py-2 backdrop-blur sm:hidden"
      style={{ bottom, paddingBottom: keyboardInset > 0 ? 8 : "calc(env(safe-area-inset-bottom) + 8px)" }}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {Icon && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          title={actionLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-berry-500 text-white active:scale-95"
        >
          <Icon className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
