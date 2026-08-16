import { useEffect, type ComponentType } from "react";
import { useCloseOnBack } from "../../lib/useCloseOnBack";

export interface OverflowAction {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  destructive?: boolean;
}

interface OverflowActionMenuProps {
  open: boolean;
  title: string;
  actions: OverflowAction[];
  onClose: () => void;
}

/** Mobile action-sheet listing Call / WhatsApp / Edit / Delete style actions for a list card. */
export function OverflowActionMenu({ open, title, actions, onClose }: OverflowActionMenuProps) {
  useCloseOnBack(open, onClose);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-800/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] sm:mb-6 sm:rounded-2xl sm:shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="truncate px-4 pt-4 pb-2 text-xs font-medium uppercase tracking-wide text-cocoa-400">{title}</p>
        <div className="flex flex-col">
          {actions.map((action) => {
            const Icon = action.icon;
            const className = `flex h-12 items-center gap-3 px-4 text-sm font-medium ${
              action.destructive ? "text-red-600" : "text-cocoa-700"
            } hover:bg-cream-100 active:bg-cream-100`;

            if (action.href) {
              return (
                <a
                  key={action.key}
                  href={action.href}
                  target={action.target}
                  rel={action.rel}
                  className={className}
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {action.label}
                </a>
              );
            }

            return (
              <button
                key={action.key}
                type="button"
                className={className}
                onClick={() => {
                  onClose();
                  action.onClick?.();
                }}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {action.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 items-center justify-center px-4 text-sm font-semibold text-cocoa-500 border-t border-cream-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
