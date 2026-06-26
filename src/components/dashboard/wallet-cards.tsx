"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { DashboardMetrics } from "@/lib/types";

/**
 * Cartões animados estilo Apple Wallet com as métricas principais.
 * O primeiro cartão (Saldo Total) tem destaque com gradiente.
 */
export function WalletCards({
  metrics,
  currency = "EUR",
}: {
  metrics: DashboardMetrics;
  currency?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Saldo Total — cartão de destaque */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="wallet-card bg-gradient-to-br from-primary to-info p-5 text-primary-foreground sm:col-span-2 lg:col-span-1"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Wallet className="h-4 w-4" /> Saldo Total
        </div>
        <p className="mt-3 text-3xl font-semibold tabular">
          {formatCurrency(metrics.totalBalance, currency)}
        </p>
        <p className="mt-1 text-xs text-primary-foreground/70">
          Poupança do mês {formatCurrency(metrics.monthlySavings, currency)}
        </p>
      </motion.div>

      <MetricCard
        delay={0.05}
        icon={ArrowDownLeft}
        label="Receita Mensal"
        value={formatCurrency(metrics.monthlyIncome, currency)}
        change={metrics.incomeChange}
        positiveIsGood
        accent="text-success"
        accentBg="bg-success/10"
      />

      <MetricCard
        delay={0.1}
        icon={ArrowUpRight}
        label="Despesa Mensal"
        value={formatCurrency(metrics.monthlyExpense, currency)}
        change={metrics.expenseChange}
        positiveIsGood={false}
        accent="text-destructive"
        accentBg="bg-destructive/10"
      />

      <MetricCard
        delay={0.15}
        icon={PiggyBank}
        label="Taxa de Poupança"
        value={formatPercent(metrics.savingsRate)}
        subtitle={`${formatCurrency(metrics.monthlySavings, currency)} este mês`}
        accent="text-primary"
        accentBg="bg-primary/10"
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  subtitle,
  positiveIsGood = true,
  accent,
  accentBg,
  delay = 0,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  change?: number;
  subtitle?: string;
  positiveIsGood?: boolean;
  accent: string;
  accentBg: string;
  delay?: number;
}) {
  const hasChange = typeof change === "number" && isFinite(change);
  const isUp = (change ?? 0) >= 0;
  // "Bom" = subida na receita ou descida na despesa.
  const good = positiveIsGood ? isUp : !isUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-3xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            accentBg,
            accent,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular">{value}</p>
      {hasChange ? (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            good ? "text-success" : "text-destructive",
          )}
        >
          {isUp ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {formatPercent(change!, true)} vs mês anterior
        </p>
      ) : subtitle ? (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </motion.div>
  );
}
