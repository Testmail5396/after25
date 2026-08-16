import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../lib/format";

interface CategoryChartProps {
  cakeRevenue: number;
  brownieRevenue: number;
}

export function CategoryChart({ cakeRevenue, brownieRevenue }: CategoryChartProps) {
  const data = [
    { name: "Cake", value: cakeRevenue, color: "#8A2E4F" },
    { name: "Brownie", value: brownieRevenue, color: "#5C3A2C" },
  ];

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F0E0CE" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#7A5240" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
          />
          <YAxis type="category" dataKey="name" width={56} tick={{ fontSize: 12, fill: "#4A2E23" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: 12, border: "1px solid #F0E0CE", fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
