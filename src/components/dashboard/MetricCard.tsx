import type { ComponentType } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "positive" | "negative";
}

const toneClasses = {
  default: "text-cocoa-700",
  positive: "text-green-700",
  negative: "text-red-600",
};

export function MetricCard({ label, value, icon: Icon, tone = "default" }: MetricCardProps) {
  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2 text-cocoa-400">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`font-display text-xl font-bold leading-tight ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}
