import type { ComponentType } from "react";
import { FAB_BOTTOM } from "../layout/layoutTokens";

interface FloatingActionButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}

/** Circular mobile FAB, fixed above the bottom nav. On desktop this is not rendered — use a header button instead. */
export function FloatingActionButton({ icon: Icon, label, onClick, className = "" }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-berry-500 text-white shadow-soft transition-transform hover:bg-berry-600 active:scale-95 sm:hidden ${FAB_BOTTOM} ${className}`}
    >
      <Icon className="h-6 w-6" aria-hidden />
    </button>
  );
}
