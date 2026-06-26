"use client";

import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Report } from "@/lib/types";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingPie } from "@/components/charts/spending-pie";
import { EvolutionArea } from "@/components/charts/evolution-area";
import { SimpleMarkdown } from "@/components/ai/simple-markdown";

interface Snapshot {
  period: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  byCategory: Array<{ name: string; value: number; color: string }>;
  evolution: Array<{
    label: string;
    income: number;
    expense: number;
    savings: number;
  }>;
  transactionCount: number;
  currency: string;
}

/** Documento de relatório imprimível (Guardar como PDF via diálogo do browser). */
export function ReportDocument({ report }: { report: Report }) {
  const data = (report.data as unknown as Snapshot) ?? null;
  const currency = data?.currency ?? "EUR";

  return (
    <div className="space-y-4">
      {/* Barra de ações (não impressa) */}
      <div className="no-print flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Área imprimível */}
      <div id="print-area" className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Relatório financeiro
            </h1>
            <p className="text-muted-foreground">{report.period_label}</p>
          </div>
          <Brand />
        </div>

        {data && (
          <>
            {/* Métricas */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric label="Receita" value={formatCurrency(data.income, currency)} />
              <Metric label="Despesa" value={formatCurrency(data.expense, currency)} />
              <Metric label="Poupança" value={formatCurrency(data.savings, currency)} />
              <Metric label="Taxa de poupança" value={formatPercent(data.savingsRate)} />
            </div>

            {/* Análise IA */}
            {report.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Análise IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleMarkdown content={report.summary} />
                </CardContent>
              </Card>
            )}

            {/* Gráficos */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Despesa por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingPie data={data.byCategory} currency={currency} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Evolução</CardTitle>
                </CardHeader>
                <CardContent>
                  <EvolutionArea data={data.evolution} currency={currency} />
                </CardContent>
              </Card>
            </div>

            {/* Tabela de categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhe por categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 font-medium">Categoria</th>
                      <th className="py-2 text-right font-medium">Valor</th>
                      <th className="py-2 text-right font-medium">% do total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byCategory.map((c) => (
                      <tr key={c.name} className="border-b border-border/50">
                        <td className="flex items-center gap-2 py-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: c.color }}
                          />
                          {c.name}
                        </td>
                        <td className="py-2 text-right tabular">
                          {formatCurrency(c.value, currency)}
                        </td>
                        <td className="py-2 text-right tabular text-muted-foreground">
                          {data.expense > 0
                            ? ((c.value / data.expense) * 100).toFixed(1)
                            : "0"}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              Gerado por Family Budget AI Pro · {data.transactionCount} transações
              analisadas
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular">{value}</p>
    </div>
  );
}
