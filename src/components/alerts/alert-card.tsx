"use client";

import { useTransition } from "react";
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  TrendingDown,
  Repeat,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate } from "@/lib/utils";
import type { Alert, AlertType } from "@/lib/types";
import { markAlertRead, deleteAlert } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";

const ICONS: Record<AlertType, typeof Info> = {
  deviation_10: TrendingDown,
  deviation_20: AlertTriangle,
  abnormal_expense: AlertTriangle,
  unusual_purchase: ShieldAlert,
  income_drop: TrendingDown,
  subscription: Repeat,
  suspicious: ShieldAlert,
};

const SEVERITY_STYLES = {
  info: "border-info/20 bg-info/5 text-info",
  warning: "border-warning/20 bg-warning/5 text-warning",
  critical: "border-destructive/20 bg-destructive/5 text-destructive",
};

export function AlertCard({ alert }: { alert: Alert }) {
  const [pending, startTransition] = useTransition();
  const Icon = ICONS[alert.type] ?? Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 transition-opacity",
        alert.is_read ? "opacity-60" : "",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
          SEVERITY_STYLES[alert.severity],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{alert.title}</p>
          {!alert.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{alert.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(alert.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        {!alert.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={pending}
            aria-label="Marcar como lido"
            onClick={() =>
              startTransition(async () => {
                await markAlertRead(alert.id);
              })
            }
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          disabled={pending}
          aria-label="Remover"
          onClick={() =>
            startTransition(async () => {
              await deleteAlert(alert.id);
              toast.success("Alerta removido.");
            })
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
