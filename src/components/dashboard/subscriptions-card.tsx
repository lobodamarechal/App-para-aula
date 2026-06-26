import { Repeat } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { detectSubscriptions } from "@/lib/finance";
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Mostra assinaturas recorrentes detetadas e o respetivo custo anual.
 * Não renderiza nada se nenhuma assinatura for detetada.
 */
export function SubscriptionsCard({
  transactions,
  currency = "EUR",
}: {
  transactions: Transaction[];
  currency?: string;
}) {
  const subs = detectSubscriptions(transactions).slice(0, 6);
  if (subs.length === 0) return null;

  const totalAnnual = subs.reduce((s, x) => s + x.annual, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-info" /> Assinaturas detetadas
        </CardTitle>
        <Badge variant="secondary">
          {formatCurrency(totalAnnual, currency)}/ano
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1">
        {subs.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between rounded-xl px-2 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(s.amount, currency)}/mês · {s.months}{" "}
                {s.months === 1 ? "mês" : "meses"}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular">
              {formatCurrency(s.annual, currency)}/ano
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
