import { ArrowDownLeft, ArrowUpRight, Repeat, AlertTriangle } from "lucide-react";

import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { categoryColor } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

/** Linha de uma transação (lista do dashboard e da página de transações). */
export function TransactionRow({
  tx,
  currency = "EUR",
  showDate = true,
}: {
  tx: Transaction;
  currency?: string;
  showDate?: boolean;
}) {
  const isIncome = tx.type === "income";
  const color = categoryColor(tx.category_name);

  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-accent/60">
      {/* Ícone tipo + cor da categoria */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}1a`, color }}
      >
        {isIncome ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">
            {tx.merchant || tx.description}
          </p>
          {tx.is_subscription && (
            <Repeat className="h-3 w-3 shrink-0 text-info" aria-label="Assinatura" />
          )}
          {tx.is_suspicious && (
            <AlertTriangle
              className="h-3 w-3 shrink-0 text-warning"
              aria-label="Suspeita"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{tx.category_name ?? "Outros"}</span>
          {showDate && (
            <>
              <span>·</span>
              <span className="shrink-0">{formatDate(tx.date)}</span>
            </>
          )}
          {typeof tx.confidence === "number" && tx.source !== "manual" && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {Math.round(tx.confidence)}%
            </Badge>
          )}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 text-sm font-semibold tabular",
          isIncome ? "text-success" : "text-foreground",
        )}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(tx.amount, currency)}
      </div>
    </div>
  );
}
