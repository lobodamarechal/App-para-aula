"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import { DEMO_MODE } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";

/**
 * Banner mostrado apenas em modo demonstração (sem backend configurado).
 * Permite entrar diretamente, sem criar conta.
 */
export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Modo demonstração.</span>{" "}
          Sem necessidade de conta — entra com dados de exemplo.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/dashboard">
          Entrar na demo <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
