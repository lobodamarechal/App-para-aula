"use client";

import { useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { togglePremium } from "@/app/(dashboard)/actions";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Ativa o modo Premium (demonstração — sem pagamento real).
 * Em produção, isto seria substituído por um fluxo de checkout (ex.: Stripe).
 */
export function UpgradeButton({
  enable = true,
  children,
  ...props
}: { enable?: boolean } & ButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await togglePremium(enable);
          if (res?.error) toast.error(res.error);
          else
            toast.success(
              enable ? "Premium ativado! ✨" : "Premium desativado.",
            );
        })
      }
      {...props}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {children}
    </Button>
  );
}
