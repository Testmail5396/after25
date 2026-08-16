import type { DateRangePreset } from "@shared/types";

interface DateRangeFilterProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

const presets: { value: DateRangePreset; label: string }[] = [
  { value: "last7days", label: "Last 7 days" },
  { value: "thisMonth", label: "This month" },
  { value: "last6months", label: "Last 6 months" },
  { value: "last1year", label: "Last 1 year" },
  { value: "custom", label: "Custom" },
];

export function DateRangeFilter({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select date range">
        {presets.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPresetChange(p.value)}
            aria-pressed={preset === p.value}
            className={`h-11 rounded-xl text-sm font-medium ${
              preset === p.value ? "bg-berry-500 text-white" : "border border-cream-300 bg-white text-cocoa-500"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-cocoa-500">
            From
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="h-10 rounded-lg border border-cream-300 bg-white px-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-cocoa-500">
            To
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="h-10 rounded-lg border border-cream-300 bg-white px-2 text-sm"
            />
          </label>
        </div>
      )}
    </div>
  );
}
