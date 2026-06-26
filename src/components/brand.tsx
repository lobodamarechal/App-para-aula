import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logótipo da aplicação — ícone com gradiente + nome. */
export function Brand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-soft">
        <Wallet className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">
            Family Budget
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-primary">
            AI Pro
          </span>
        </div>
      )}
    </div>
  );
}
