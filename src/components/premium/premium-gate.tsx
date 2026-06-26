import { Sparkles, Lock } from "lucide-react";

import { UpgradeButton } from "@/components/premium/upgrade-button";

/**
 * Restringe funcionalidades Premium. Se o utilizador não for Premium,
 * mostra um ecrã de upsell (com ativação de demonstração).
 */
export function PremiumGate({
  isPremium,
  feature,
  children,
}: {
  isPremium: boolean;
  feature: string;
  children: React.ReactNode;
}) {
  if (isPremium) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-info/5 px-6 py-16 text-center">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info text-primary-foreground">
        <Lock className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-semibold">{feature} é Premium</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Desbloqueia previsões, insights semanais, relatórios PDF, modo família e
        o centro de literacia financeira — tudo com IA.
      </p>
      <div className="mt-6">
        <UpgradeButton size="lg">
          <Sparkles className="h-4 w-4" /> Ativar Premium (demo)
        </UpgradeButton>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Demonstração — ativa instantaneamente, sem pagamento.
      </p>
    </div>
  );
}
