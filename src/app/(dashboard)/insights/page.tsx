import { Lightbulb, TrendingUp, Calendar, CalendarRange } from "lucide-react";

import {
  getProfile,
  getInsights,
  getLatestScore,
  getTransactions,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { PageHeader } from "@/components/dashboard/page-header";
import { PremiumGate } from "@/components/premium/premium-gate";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GenerateButton } from "@/components/ai/generate-button";
import { SimpleMarkdown } from "@/components/ai/simple-markdown";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights · Family Budget AI Pro" };

interface ForecastData {
  in_30_days: number;
  in_6_months: number;
  in_1_year: number;
  assumptions: string;
  confidence: string;
}

export default async function InsightsPage() {
  const [profile, transactions] = await Promise.all([
    getProfile(),
    getTransactions(1),
  ]);
  const isPremium = profile?.is_premium ?? false;
  const currency = profile?.currency ?? "EUR";
  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights IA"
        description="Previsões, score financeiro e resumos semanais gerados por IA."
      />

      <PremiumGate isPremium={isPremium} feature="Insights IA">
        {!hasData ? (
          <EmptyState
            icon={Lightbulb}
            title="Sem dados para analisar"
            description="Importa um extrato para desbloquear previsões e insights personalizados."
            actionLabel="Importar extrato"
            actionHref="/upload"
          />
        ) : (
          <PremiumInsights currency={currency} />
        )}
      </PremiumGate>
    </div>
  );
}

async function PremiumInsights({ currency }: { currency: string }) {
  const [score, forecastInsights, weeklyInsights] = await Promise.all([
    getLatestScore(),
    getInsights("forecast"),
    getInsights("weekly"),
  ]);

  const forecast = (forecastInsights[0]?.data ?? undefined) as unknown as
    | ForecastData
    | undefined;

  return (
    <div className="space-y-6">
      {/* Score + Previsão */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Score Financeiro */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Score financeiro</CardTitle>
            <GenerateButton
              endpoint="/api/score"
              label="Calcular"
              loadingLabel="A calcular…"
              successMessage="Score atualizado!"
              variant="outline"
              size="sm"
            />
          </CardHeader>
          <CardContent>
            {score ? (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <ScoreGauge value={score.score} />
                <div className="w-full flex-1 space-y-3">
                  <ScoreBar label="Poupança" value={score.savings_score} />
                  <ScoreBar label="Controlo de gastos" value={score.spending_score} />
                  <ScoreBar label="Consistência" value={score.consistency_score} />
                  <ScoreBar label="Cumprimento do orçamento" value={score.budget_score} />
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ainda não calculaste o teu score. Carrega em “Calcular”.
              </p>
            )}
            {score?.summary && (
              <p className="mt-4 rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
                {score.summary}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Previsão financeira */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Previsão de saldo</CardTitle>
            <GenerateButton
              endpoint="/api/forecast"
              label="Prever"
              loadingLabel="A prever…"
              successMessage="Previsão gerada!"
              variant="outline"
              size="sm"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {forecast ? (
              <>
                <ForecastRow
                  icon={Calendar}
                  label="Daqui a 30 dias"
                  value={formatCurrency(forecast.in_30_days, currency)}
                />
                <ForecastRow
                  icon={CalendarRange}
                  label="Daqui a 6 meses"
                  value={formatCurrency(forecast.in_6_months, currency)}
                />
                <ForecastRow
                  icon={TrendingUp}
                  label="Daqui a 1 ano"
                  value={formatCurrency(forecast.in_1_year, currency)}
                />
                <p className="rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  {forecast.assumptions}
                </p>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Gera uma previsão do teu saldo futuro com base no histórico.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights semanais */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Resumos semanais</CardTitle>
          <GenerateButton
            endpoint="/api/insights"
            label="Gerar resumo"
            loadingLabel="A gerar…"
            successMessage="Resumo gerado!"
            variant="outline"
            size="sm"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyInsights.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Ainda não há resumos. Carrega em “Gerar resumo” para a IA analisar a
              tua semana.
            </p>
          ) : (
            weeklyInsights.map((ins) => (
              <div
                key={ins.id}
                className="rounded-2xl border border-border p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">{ins.title}</h4>
                </div>
                <SimpleMarkdown content={ins.content} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular">{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function ForecastRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="text-lg font-semibold tabular">{value}</span>
    </div>
  );
}
