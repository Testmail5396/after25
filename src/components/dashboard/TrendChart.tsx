import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@shared/types";
import { formatCurrency } from "../../lib/format";

interface TrendChartProps {
  data: TrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  const tickInterval = data.length > 8 ? Math.ceil(data.length / 6) : 0;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#F0E0CE" vertical={false} />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fontSize: 11, fill: "#7A5240" }}
            axisLine={{ stroke: "#F0E0CE" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#7A5240" }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="sales" name="Sales" stroke="#8A2E4F" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#DE97A0" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 flex justify-center gap-4 text-xs text-cocoa-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-berry-500" /> Sales
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blush-400" /> Purchases
        </span>
      </div>
    </div>
  );
}
