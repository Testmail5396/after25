import type { ComponentType, ReactNode } from "react";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-cream-300 bg-white/60 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blush-100 text-berry-500">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-semibold text-cocoa-700">{title}</h3>
      {description && <p className="max-w-xs text-sm text-cocoa-500">{description}</p>}
      {action}
    </div>
  );
}
