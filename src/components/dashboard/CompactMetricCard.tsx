import type { ComponentType } from "react";

interface CompactMetricCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}

/** Smaller metric tile for secondary dashboard/customer stats, packed 3-up on mobile. */
export function CompactMetricCard({ label, value, icon: Icon, onClick }: CompactMetricCardProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex min-w-0 flex-col items-start gap-1 rounded-xl bg-white p-3 shadow-card text-left ${
        onClick ? "active:bg-cream-100" : ""
      }`}
    >
      <Icon className="h-4 w-4 text-cocoa-400" aria-hidden />
      <p className="w-full truncate font-display text-base font-bold leading-tight text-cocoa-700">{value}</p>
      <p className="w-full truncate text-[11px] font-medium text-cocoa-400">{label}</p>
    </Tag>
  );
}
