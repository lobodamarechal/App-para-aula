import { getProfile, getInsights } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { PremiumGate } from "@/components/premium/premium-gate";
import { LiteracyCenter } from "@/components/literacy/literacy-center";

export const dynamic = "force-dynamic";
export const metadata = { title: "Literacia · Family Budget AI Pro" };

export default async function LiteracyPage() {
  const [profile, recent] = await Promise.all([
    getProfile(),
    getInsights("literacy"),
  ]);
  const isPremium = profile?.is_premium ?? false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro de Literacia Financeira"
        description="Aprende a poupar, investir e gerir dívida — com guias gerados por IA."
      />
      <PremiumGate isPremium={isPremium} feature="Centro de Literacia">
        <LiteracyCenter recent={recent} />
      </PremiumGate>
    </div>
  );
}
