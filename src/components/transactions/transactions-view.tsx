"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORIES, categoryColor } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { deleteTransaction } from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TypeFilter = "all" | "income" | "expense";

/** Lista interativa de transações com pesquisa, filtros e remoção. */
export function TransactionsView({
  transactions,
  currency = "EUR",
}: {
  transactions: Transaction[];
  currency?: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (category !== "all" && t.category_name !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${t.description} ${t.merchant ?? ""} ${
          t.category_name ?? ""
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, type, category, query]);

  const total = filtered.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
    0,
  );

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteTransaction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Transação removida.");
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar transações…"
            className="pl-10"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as TypeFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo do filtro */}
      <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>
          {filtered.length}{" "}
          {filtered.length === 1 ? "transação" : "transações"}
        </span>
        <span className="tabular">
          Saldo filtrado:{" "}
          <span className={cn(total >= 0 ? "text-success" : "text-destructive")}>
            {formatCurrency(total, currency)}
          </span>
        </span>
      </div>

      {/* Lista */}
      <div className="divide-y divide-border rounded-3xl border border-border bg-card">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nenhuma transação corresponde aos filtros.
          </p>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-3 px-4 py-3"
            >
              <span
                className="h-9 w-9 shrink-0 rounded-xl"
                style={{ background: `${categoryColor(t.category_name)}1a` }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {t.merchant || t.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.category_name ?? "Outros"}</span>
                  <span>·</span>
                  <span>{formatDate(t.date)}</span>
                  {t.source !== "manual" &&
                    typeof t.confidence === "number" && (
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {Math.round(t.confidence)}%
                      </Badge>
                    )}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold tabular",
                  t.type === "income" ? "text-success" : "text-foreground",
                )}
              >
                {t.type === "income" ? "+" : "−"}
                {formatCurrency(t.amount, currency)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() => onDelete(t.id)}
                className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
