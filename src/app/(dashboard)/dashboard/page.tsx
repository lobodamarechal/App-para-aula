import Link from "next/link";
import { Receipt, Upload, Target, ArrowRight, Sparkles } from "lucide-react";

import {
  getProfile,
  getTransactions,
  getBudgets,
  getGoals,
} from "@/lib/data";
import {
  computeMetrics,
  expenseByCategory,
  monthlyEvolution,
  txInMonth,
} from "@/lib/finance";
import { formatCurrency, clamp } from "@/lib/utils";

import { PageHeader } from "@/components/dashboard/page-header";
import { WalletCards } from "@/components/dashboard/wallet-cards";
import { SubscriptionsCard } from "@/components/dashboard/subscriptions-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { SpendingPie } from "@/components/charts/spending-pie";
import { EvolutionArea } from "@/components/charts/evolution-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Garante dados sempre frescos (dashboard depende de dados do utilizador).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [profile, transactions, budgets, goals] = await Promise.all([
    getProfile(),
    getTransactions(),
    getBudgets(),
    getGoals(),
  ]);

  const currency = profile?.currency ?? "EUR";
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const metrics = computeMetrics(transactions, year, month);
  const currentMonthTx = txInMonth(transactions, year, month);
  const pieData = expenseByCategory(currentMonthTx);
  const evolution = monthlyEvolution(transactions, 6, year, month);
  const recent = transactions.slice(0, 6);
  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // Estado inicial — sem qualquer transação ainda.
  if (transactions.length === 0) {
    return (
      <div>
        <PageHeader
          title={`Olá${firstName ? `, ${firstName}` : ""} 👋`}
          description="Vamos começar a organizar as finanças da tua família."
        />
        <EmptyState
          icon={Upload}
          title="Importa o teu primeiro extrato"
          description="Faz upload de um extrato bancário em PDF e a IA extrai e categoriza automaticamente todas as transações."
          actionLabel="Importar extrato"
          actionHref="/upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá${firstName ? `, ${firstName}` : ""} 👋`}
        description="Aqui está o resumo financeiro da tua família este mês."
      >
        <Button asChild variant="outline">
          <Link href="/upload">
            <Upload className="h-4 w-4" /> Importar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/assistant">
            <Sparkles className="h-4 w-4" /> Assistente
          </Link>
        </Button>
      </PageHeader>

      {/* Cartões de métricas estilo Apple Wallet */}
      <WalletCards metrics={metrics} currency={currency} />

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Evolução dos últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <EvolutionArea data={evolution} currency={currency} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Despesa por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingPie data={pieData} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Transações recentes */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Transações recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/transactions">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} currency={currency} />
            ))}
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Objetivos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/goals">
                Gerir <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Target className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Ainda não tens metas definidas.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/goals">Criar meta</Link>
                </Button>
              </div>
            ) : (
              activeGoals.map((g) => {
                const pct = clamp(
                  (g.current_amount / g.target_amount) * 100,
                  0,
                  100,
                );
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-muted-foreground tabular">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <Progress value={pct} />
                    <p className="mt-1 text-xs text-muted-foreground tabular">
                      {formatCurrency(g.current_amount, currency)} de{" "}
                      {formatCurrency(g.target_amount, currency)}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assinaturas recorrentes detetadas (custo anual) */}
      <SubscriptionsCard transactions={transactions} currency={currency} />

      {/* Atalho para transações se a lista estiver vazia neste mês */}
      {currentMonthTx.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ainda não há transações registadas em{" "}
              {new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(now)}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
