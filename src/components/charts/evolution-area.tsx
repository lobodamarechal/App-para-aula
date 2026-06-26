"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

interface Datum {
  label: string;
  income: number;
  expense: number;
  savings: number;
}

/** Gráfico de evolução mensal (receita / despesa / poupança). */
export function EvolutionArea({
  data,
  currency = "EUR",
}: {
  data: Datum[];
  currency?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(v: number) => formatCurrency(v, currency)}
          contentStyle={tooltipStyle}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Receita"
          stroke="hsl(var(--success))"
          fill="url(#gIncome)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Despesa"
          stroke="hsl(var(--destructive))"
          fill="url(#gExpense)"
          strokeWidth={2}
        />
      </AreaChart>
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
