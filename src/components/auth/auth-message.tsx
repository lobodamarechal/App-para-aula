import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Banner de erro ou sucesso usado nos formulários de autenticação. */
export function AuthMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm",
        error
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-success/20 bg-success/10 text-success",
      )}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{error || success}</span>
    </div>
  );
}
