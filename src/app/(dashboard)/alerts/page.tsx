import { Bell } from "lucide-react";

import { getAlerts, getTransactions } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GenerateButton } from "@/components/ai/generate-button";
import { AlertCard } from "@/components/alerts/alert-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alertas · Family Budget AI Pro" };

export default async function AlertsPage() {
  const [alerts, transactions] = await Promise.all([
    getAlerts(),
    getTransactions(1),
  ]);

  const hasData = transactions.length > 0;
  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas inteligentes"
        description={
          unread > 0
            ? `Tens ${unread} ${unread === 1 ? "alerta novo" : "alertas novos"}.`
            : "Avisos gerados pela IA sobre os teus padrões de gastos."
        }
      >
        {hasData && (
          <GenerateButton
            endpoint="/api/alerts"
            label="Analisar agora"
            loadingLabel="A analisar…"
            successMessage="Alertas atualizados!"
          />
        )}
      </PageHeader>

      {!hasData ? (
        <EmptyState
          icon={Bell}
          title="Sem dados para analisar"
          description="Importa um extrato para que a IA possa detetar desvios e despesas anormais."
          actionLabel="Importar extrato"
          actionHref="/upload"
        />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Tudo em ordem ✨"
          description="Ainda não há alertas. Carrega em 'Analisar agora' para a IA verificar os teus gastos."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}
