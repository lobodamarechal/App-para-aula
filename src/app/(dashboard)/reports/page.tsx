import Link from "next/link";
import { FileText, CalendarDays, ArrowRight } from "lucide-react";

import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/lib/types";

import { PageHeader } from "@/components/dashboard/page-header";
import { PremiumGate } from "@/components/premium/premium-gate";
import { GenerateButton } from "@/components/ai/generate-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Relatórios · Family Budget AI Pro" };

const TYPE_LABEL: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  annual: "Anual",
};

export default async function ReportsPage() {
  const profile = await getProfile();
  const isPremium = profile?.is_premium ?? false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  const reports = (data as Report[]) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gera relatórios mensais, trimestrais ou anuais com análise IA — prontos para PDF."
      />

      <PremiumGate isPremium={isPremium} feature="Relatórios PDF">
        {/* Geradores */}
        <div className="grid gap-4 sm:grid-cols-3">
          {(["monthly", "quarterly", "annual"] as const).map((type) => (
            <Card key={type}>
              <CardContent className="space-y-3 py-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Relatório {TYPE_LABEL[type]}</p>
                  <p className="text-xs text-muted-foreground">
                    Resumo, gráficos e análise IA do período.
                  </p>
                </div>
                <GenerateButton
                  endpoint="/api/reports"
                  body={{ type }}
                  label="Gerar"
                  loadingLabel="A gerar…"
                  successMessage="Relatório gerado!"
                  variant="outline"
                  className="w-full"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lista de relatórios */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Relatórios gerados
          </h2>
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Ainda não geraste relatórios.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {r.period_label}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Criado {formatDate(r.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{TYPE_LABEL[r.type]}</Badge>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/reports/${r.id}`}>
                          Abrir <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PremiumGate>
    </div>
  );
}
