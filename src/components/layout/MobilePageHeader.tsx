import type { ReactNode } from "react";

interface MobilePageHeaderProps {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}

/** Compact page header: title (+ optional small meta text), and an optional right-side action/filter slot. */
export function MobilePageHeader({ title, meta, action }: MobilePageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold leading-tight text-cocoa-700 sm:text-2xl">{title}</h1>
        {meta && <p className="truncate text-xs text-cocoa-400">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
