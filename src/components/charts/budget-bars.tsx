"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import { formatCurrency } from "@/lib/utils";
import type { BudgetComparison } from "@/lib/types";

/** Gráfico de barras: Orçamentado vs Real por categoria. */
export function BudgetBars({
  data,
  currency = "EUR",
}: {
  data: BudgetComparison[];
  currency?: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Define orçamentos para comparar com os gastos reais.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    Orçamentado: d.budgeted,
    Real: d.actual,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ left: -10, right: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          formatter={(v: number) => formatCurrency(v, currency)}
          contentStyle={tooltipStyle}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Orçamentado" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Real" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
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
