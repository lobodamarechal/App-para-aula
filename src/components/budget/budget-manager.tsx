"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { cn, formatCurrency, formatPercent, clamp } from "@/lib/utils";
import { upsertBudget } from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface BudgetRow {
  categoryName: string;
  color: string;
  budgeted: number;
  actual: number;
}

/** Gestão editável de orçamentos por categoria com progresso vs gasto real. */
export function BudgetManager({
  rows,
  currency = "EUR",
}: {
  rows: BudgetRow[];
  currency?: string;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <BudgetItem key={row.categoryName} row={row} currency={currency} />
      ))}
    </div>
  );
}

function BudgetItem({
  row,
  currency,
}: {
  row: BudgetRow;
  currency: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(row.budgeted || ""));
  const [pending, startTransition] = useTransition();

  const budgeted = Number(value) || 0;
  const pct = budgeted > 0 ? clamp((row.actual / budgeted) * 100, 0, 100) : 0;
  const over = budgeted > 0 && row.actual > budgeted;
  const deviation =
    budgeted > 0 ? ((row.actual - budgeted) / budgeted) * 100 : 0;

  function save() {
    startTransition(async () => {
      const res = await upsertBudget(row.categoryName, budgeted);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Orçamento de ${row.categoryName} guardado.`);
        setEditing(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="h-9 w-9 shrink-0 rounded-xl"
          style={{ background: `${row.color}1a` }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {row.categoryName}
            </span>
            {budgeted > 0 && (
              <Badge
                variant={over ? "destructive" : "success"}
                className="shrink-0"
              >
                {formatPercent(deviation, true)}
              </Badge>
            )}
          </div>

          {editing ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="h-9 pl-7"
                  autoFocus
                />
              </div>
              <Button size="icon" className="h-9 w-9" onClick={save} disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              <Progress
                value={pct}
                indicatorClassName={over ? "bg-destructive" : undefined}
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground tabular">
                  {formatCurrency(row.actual, currency)} de{" "}
                  {budgeted > 0
                    ? formatCurrency(budgeted, currency)
                    : "—"}
                </span>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  {budgeted > 0 ? "Editar" : "Definir"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
