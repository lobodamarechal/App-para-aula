"use client";

import { useState, useTransition } from "react";
import {
  Target,
  ShieldCheck,
  Car,
  Plane,
  Home,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatCurrency, clamp } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { updateGoalAmount, deleteGoal } from "@/app/(dashboard)/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<string, LucideIcon> = {
  Target,
  ShieldCheck,
  Car,
  Plane,
  Home,
};

export function GoalCard({
  goal,
  currency = "EUR",
}: {
  goal: Goal;
  currency?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  const Icon = ICONS[goal.icon ?? "Target"] ?? Target;
  const pct = clamp((goal.current_amount / goal.target_amount) * 100, 0, 100);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const complete = goal.current_amount >= goal.target_amount;

  // Tempo estimado restante (meses) com base na poupança mensal.
  const monthly = goal.monthly_contribution ?? 0;
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : null;

  function contribute() {
    const value = Number(amount);
    if (!value) return;
    startTransition(async () => {
      const res = await updateGoalAmount(goal.id, goal.current_amount + value);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Progresso atualizado!");
        setAmount("");
        setAdding(false);
      }
    });
  }

  return (
    <Card className={cn(complete && "border-success/30 bg-success/5")}>
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl",
                complete
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary",
              )}
            >
              {complete ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="font-semibold">{goal.name}</p>
              <p className="text-xs text-muted-foreground tabular">
                {formatCurrency(goal.current_amount, currency)} de{" "}
                {formatCurrency(goal.target_amount, currency)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={pending}
            aria-label="Remover meta"
            onClick={() =>
              startTransition(async () => {
                await deleteGoal(goal.id);
                toast.success("Meta removida.");
              })
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium tabular">{Math.round(pct)}%</span>
            {complete ? (
              <Badge variant="success">Concluída 🎉</Badge>
            ) : monthsLeft !== null ? (
              <span className="text-xs text-muted-foreground">
                ~{monthsLeft} {monthsLeft === 1 ? "mês" : "meses"} restantes
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Faltam {formatCurrency(remaining, currency)}
              </span>
            )}
          </div>
          <Progress
            value={pct}
            indicatorClassName={complete ? "bg-success" : undefined}
          />
        </div>

        {!complete &&
          (adding ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Valor a adicionar (€)"
                className="h-9"
                autoFocus
              />
              <Button size="sm" onClick={contribute} disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setAdding(true)}
            >
              <Plus className="h-4 w-4" /> Adicionar poupança
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}
