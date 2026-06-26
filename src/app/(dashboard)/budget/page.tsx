import { getProfile, getTransactions, getBudgets } from "@/lib/data";
import { txInMonth, budgetVsActual } from "@/lib/finance";
import { CATEGORIES, INCOME_CATEGORIES, categoryColor } from "@/lib/constants";
import { monthLabel } from "@/lib/utils";
import type { CategoryName } from "@/lib/constants";

import { PageHeader } from "@/components/dashboard/page-header";
import { BudgetManager, type BudgetRow } from "@/components/budget/budget-manager";
import { BudgetBars } from "@/components/charts/budget-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orçamento · Family Budget AI Pro" };

export default async function BudgetPage() {
  const [profile, transactions, budgets] = await Promise.all([
    getProfile(),
    getTransactions(),
    getBudgets(),
  ]);
  const currency = profile?.currency ?? "EUR";

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthTx = txInMonth(transactions, year, month);

  // Gasto real por categoria (mês atual).
  const actualMap = new Map<string, number>();
  for (const t of monthTx) {
    if (t.type !== "expense") continue;
    const key = t.category_name ?? "Outros";
    actualMap.set(key, (actualMap.get(key) ?? 0) + t.amount);
  }

  const budgetMap = new Map(budgets.map((b) => [b.category_name, b.amount]));

  // Linhas: todas as categorias de despesa (com orçamento ou gasto).
  const expenseCategories = CATEGORIES.filter(
    (c) => !INCOME_CATEGORIES.includes(c as CategoryName),
  );

  const rows: BudgetRow[] = expenseCategories.map((c) => ({
    categoryName: c,
    color: categoryColor(c),
    budgeted: budgetMap.get(c) ?? 0,
    actual: actualMap.get(c) ?? 0,
  }));

  // Ordena: primeiro com mais atividade (orçamento ou gasto).
  rows.sort(
    (a, b) =>
      b.budgeted + b.actual - (a.budgeted + a.actual),
  );

  const comparison = budgetVsActual(monthTx, budgets);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalActual = [...actualMap.values()].reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamento"
        description={`Define limites mensais por categoria — ${monthLabel(
          year,
          month,
        )}.`}
      />

      {/* Resumo do orçamento */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Orçamento total" value={totalBudget} currency={currency} />
        <SummaryCard label="Gasto até agora" value={totalActual} currency={currency} />
        <SummaryCard
          label="Disponível"
          value={totalBudget - totalActual}
          currency={currency}
          highlight
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gestão de orçamentos */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Definir orçamentos
          </h2>
          <BudgetManager rows={rows} currency={currency} />
        </div>

        {/* Comparação gráfica */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Orçamento vs Real
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Comparação por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetBars data={comparison} currency={currency} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  currency,
  highlight,
}: {
  label: string;
  value: number;
  currency: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : undefined}>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular">
          {new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency,
          }).format(value)}
        </p>
      </CardContent>
    </Card>
  );
}
