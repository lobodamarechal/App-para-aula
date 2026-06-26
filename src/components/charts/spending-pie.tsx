"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/utils";

interface Datum {
  name: string;
  value: number;
  color: string;
}

/** Gráfico de pizza (donut) da despesa por categoria. */
export function SpendingPie({
  data,
  currency = "EUR",
}: {
  data: Datum[];
  currency?: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados para mostrar.
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={66}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => formatCurrency(v, currency)}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-semibold tabular">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        {data.slice(0, 8).map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {d.name}
            </span>
            <span className="font-medium tabular">
              {formatCurrency(d.value, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  fontSize: 12,
};
