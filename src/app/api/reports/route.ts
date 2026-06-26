import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { runText } from "@/lib/claude/analyze";
import {
  computeMetrics,
  expenseByCategory,
  monthlyEvolution,
  sumIncome,
  sumExpense,
} from "@/lib/finance";
import { monthLabel } from "@/lib/utils";
import type { Transaction, Budget } from "@/lib/types";

export const maxDuration = 60;

type ReportType = "monthly" | "quarterly" | "annual";

/** POST /api/reports — gera um relatório (mensal/trimestral/anual) com análise IA. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { type } = (await request.json().catch(() => ({}))) as {
    type?: ReportType;
  };
  const reportType: ReportType = type ?? "monthly";

  const [{ data: txData }, { data: budgetData }, { data: profile }] =
    await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("budgets").select("*"),
      supabase.from("profiles").select("currency").eq("id", user.id).single(),
    ]);

  const txs = (txData as Transaction[]) ?? [];
  const budgets = (budgetData as Budget[]) ?? [];
  const currency = (profile as { currency?: string })?.currency ?? "EUR";

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  // Filtra transações conforme o período do relatório.
  const { periodTx, label } = filterByPeriod(txs, reportType, year, month);

  const metrics = computeMetrics(txs, year, month);
  const byCategory = expenseByCategory(periodTx);
  const evolution = monthlyEvolution(
    txs,
    reportType === "annual" ? 12 : reportType === "quarterly" ? 3 : 6,
    year,
    month,
  );

  const income = sumIncome(periodTx);
  const expense = sumExpense(periodTx);

  const snapshot = {
    period: label,
    type: reportType,
    income,
    expense,
    savings: income - expense,
    savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    byCategory,
    evolution,
    transactionCount: periodTx.length,
    currency,
  };

  // Resumo analítico gerado pela IA.
  let summary = "";
  try {
    summary = await runText({
      system: `És um analista financeiro. Escreve um relatório ${reportType === "monthly" ? "mensal" : reportType === "quarterly" ? "trimestral" : "anual"} em português europeu (markdown), conciso e profissional.

Estrutura:
## Resumo executivo
(2-3 frases)
## Principais conclusões
(3-4 bullets com números)
## Recomendações
(2-3 bullets acionáveis)

Usa os dados fornecidos. Sê específico com valores em ${currency}.`,
      user: `Período: ${label}\nReceita: ${income} ${currency}\nDespesa: ${expense} ${currency}\nPoupança: ${income - expense} ${currency}\nDespesa por categoria: ${JSON.stringify(
        byCategory.slice(0, 10),
      )}\nEvolução: ${JSON.stringify(evolution)}`,
      maxTokens: 900,
    });
  } catch {
    summary =
      "Não foi possível gerar a análise IA neste momento, mas os dados do relatório estão disponíveis abaixo.";
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      type: reportType,
      period_label: label,
      summary,
      data: snapshot,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ report: data });
}

function filterByPeriod(
  txs: Transaction[],
  type: ReportType,
  year: number,
  month: number,
): { periodTx: Transaction[]; label: string } {
  if (type === "annual") {
    const start = `${year}-01-01`;
    return {
      periodTx: txs.filter((t) => t.date >= start),
      label: `Ano ${year}`,
    };
  }
  if (type === "quarterly") {
    const startDate = new Date(Date.UTC(year, month - 3, 1))
      .toISOString()
      .slice(0, 10);
    return {
      periodTx: txs.filter((t) => t.date >= startDate),
      label: `Últimos 3 meses (${monthLabel(year, month)})`,
    };
  }
  // monthly
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  return {
    periodTx: txs.filter((t) => t.date >= start && t.date < end),
    label: monthLabel(year, month),
  };
}
