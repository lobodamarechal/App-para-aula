import { categoryColor } from "@/lib/constants";
import { pctChange } from "@/lib/utils";
import type {
  Transaction,
  Budget,
  DashboardMetrics,
  BudgetComparison,
} from "@/lib/types";

/** Devolve o intervalo [início, fim) de um mês (ISO date strings). */
export function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/** Filtra transações de um determinado mês/ano. */
export function txInMonth(txs: Transaction[], year: number, month: number) {
  const { start, end } = monthRange(year, month);
  return txs.filter((t) => t.date >= start && t.date < end);
}

export function sumIncome(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
}

export function sumExpense(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
}

/**
 * Calcula as métricas principais do dashboard para o mês corrente,
 * comparando com o mês anterior.
 */
export function computeMetrics(
  allTx: Transaction[],
  year: number,
  month: number,
): DashboardMetrics {
  const current = txInMonth(allTx, year, month);
  const prevDate = new Date(Date.UTC(year, month - 2, 1));
  const previous = txInMonth(
    allTx,
    prevDate.getUTCFullYear(),
    prevDate.getUTCMonth() + 1,
  );

  const monthlyIncome = sumIncome(current);
  const monthlyExpense = sumExpense(current);
  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Saldo total = soma de todas as entradas menos todas as saídas (histórico).
  const totalBalance =
    sumIncome(allTx) - sumExpense(allTx);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    savingsRate,
    incomeChange: pctChange(monthlyIncome, sumIncome(previous)),
    expenseChange: pctChange(monthlyExpense, sumExpense(previous)),
  };
}

/** Agrega despesas por categoria (para gráfico de pizza). */
export function expenseByCategory(
  txs: Transaction[],
): Array<{ name: string; value: number; color: string }> {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = t.category_name ?? "Outros";
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value, color: categoryColor(name) }))
    .sort((a, b) => b.value - a.value);
}

/** Compara o orçamento definido com o gasto real por categoria. */
export function budgetVsActual(
  txs: Transaction[],
  budgets: Budget[],
): BudgetComparison[] {
  const actuals = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = t.category_name ?? "Outros";
    actuals.set(key, (actuals.get(key) ?? 0) + t.amount);
  }

  return budgets
    .map((b) => {
      const actual = actuals.get(b.category_name) ?? 0;
      const deviation = b.amount > 0 ? ((actual - b.amount) / b.amount) * 100 : 0;
      return {
        categoryName: b.category_name,
        color: categoryColor(b.category_name),
        budgeted: b.amount,
        actual,
        deviation,
      };
    })
    .sort((a, b) => b.actual - a.actual);
}

/** Série de evolução mensal (receita / despesa / poupança) dos últimos N meses. */
export function monthlyEvolution(
  allTx: Transaction[],
  months = 6,
  refYear?: number,
  refMonth?: number,
): Array<{ label: string; income: number; expense: number; savings: number }> {
  const now = new Date();
  const baseYear = refYear ?? now.getUTCFullYear();
  const baseMonth = refMonth ?? now.getUTCMonth() + 1;
  const out: Array<{ label: string; income: number; expense: number; savings: number }> =
    [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(baseYear, baseMonth - 1 - i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const monthTx = txInMonth(allTx, y, m);
    const income = sumIncome(monthTx);
    const expense = sumExpense(monthTx);
    out.push({
      label: new Intl.DateTimeFormat("pt-PT", { month: "short" }).format(d),
      income,
      expense,
      savings: income - expense,
    });
  }
  return out;
}

/**
 * Constrói um resumo textual do contexto financeiro do utilizador,
 * usado como contexto para o Assistente IA, alertas, score e previsão.
 * Mantém-se compacto para poupar tokens.
 */
export function buildFinancialContext(
  txs: Transaction[],
  budgets: Budget[],
  opts: { currency?: string } = {},
): string {
  const currency = opts.currency ?? "EUR";
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const metrics = computeMetrics(txs, year, month);
  const current = txInMonth(txs, year, month);
  const byCat = expenseByCategory(current);
  const evolution = monthlyEvolution(txs, 6, year, month);
  const comparison = budgetVsActual(current, budgets);

  const fmt = (n: number) => `${n.toFixed(2)} ${currency}`;

  const lines: string[] = [];
  lines.push(`Moeda: ${currency}`);
  lines.push(`Mês atual: ${month}/${year}`);
  lines.push(
    `Saldo total: ${fmt(metrics.totalBalance)} | Receita mês: ${fmt(
      metrics.monthlyIncome,
    )} | Despesa mês: ${fmt(metrics.monthlyExpense)} | Poupança: ${fmt(
      metrics.monthlySavings,
    )} (taxa ${metrics.savingsRate.toFixed(1)}%)`,
  );
  lines.push(
    `Variação vs mês anterior — receita: ${metrics.incomeChange.toFixed(
      1,
    )}%, despesa: ${metrics.expenseChange.toFixed(1)}%`,
  );

  lines.push("\nDespesa por categoria (mês atual):");
  for (const c of byCat.slice(0, 12)) {
    lines.push(`  - ${c.name}: ${fmt(c.value)}`);
  }

  if (comparison.length) {
    lines.push("\nOrçamento vs Real (mês atual):");
    for (const c of comparison) {
      lines.push(
        `  - ${c.categoryName}: orçado ${fmt(c.budgeted)}, real ${fmt(
          c.actual,
        )} (desvio ${c.deviation.toFixed(0)}%)`,
      );
    }
  }

  lines.push("\nEvolução últimos 6 meses (receita/despesa/poupança):");
  for (const e of evolution) {
    lines.push(
      `  - ${e.label}: ${fmt(e.income)} / ${fmt(e.expense)} / ${fmt(e.savings)}`,
    );
  }

  lines.push(`\nTotal de transações registadas: ${txs.length}`);

  return lines.join("\n");
}

/**
 * Deteta assinaturas recorrentes a partir do histórico de transações.
 * Heurística: descrições semelhantes que se repetem em meses diferentes
 * com valores próximos, ou marcadas como assinatura pela IA.
 */
export function detectSubscriptions(txs: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = (t.merchant || t.description)
      .toLowerCase()
      .replace(/[0-9*#.]/g, "")
      .trim()
      .slice(0, 24);
    if (!key) continue;
    const bucket = groups.get(key) ?? [];
    bucket.push(t);
    groups.set(key, bucket);
  }

  const subs: Array<{
    name: string;
    amount: number;
    months: number;
    annual: number;
    isMarked: boolean;
  }> = [];

  for (const [, items] of groups) {
    const isMarked = items.some((i) => i.is_subscription);
    const monthsSet = new Set(items.map((i) => i.date.slice(0, 7)));
    // Recorrência: marcada pela IA, ou repete-se em ≥ 2 meses distintos.
    if (isMarked || monthsSet.size >= 2) {
      const avg =
        items.reduce((s, i) => s + i.amount, 0) / items.length;
      subs.push({
        name: items[0].merchant || items[0].description,
        amount: avg,
        months: monthsSet.size,
        annual: avg * 12,
        isMarked,
      });
    }
  }

  return subs.sort((a, b) => b.annual - a.annual);
}
