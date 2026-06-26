"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Botão genérico que aciona um endpoint de IA (POST) e atualiza a página.
 * Reutilizado para alertas, insights, previsão e score.
 */
export function GenerateButton({
  endpoint,
  body,
  label = "Gerar com IA",
  loadingLabel = "A analisar…",
  successMessage = "Análise concluída!",
  onDone,
  ...buttonProps
}: {
  endpoint: string;
  body?: unknown;
  label?: string;
  loadingLabel?: string;
  successMessage?: string;
  onDone?: (data: unknown) => void;
} & ButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na análise.");
      toast.success(successMessage);
      onDone?.(data);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na análise por IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={run} disabled={loading} {...buttonProps}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? loadingLabel : label}
    </Button>
  );
}
