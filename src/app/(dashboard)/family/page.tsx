import { getProfile, getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { FamilyMember } from "@/lib/types";

import { PageHeader } from "@/components/dashboard/page-header";
import { PremiumGate } from "@/components/premium/premium-gate";
import { FamilyManager } from "@/components/family/family-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Família · Family Budget AI Pro" };

export default async function FamilyPage() {
  const [profile, user] = await Promise.all([getProfile(), getUser()]);
  const isPremium = profile?.is_premium ?? false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("*")
    .eq("owner_id", user?.id ?? "")
    .order("created_at", { ascending: false });
  const members = (data as FamilyMember[]) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modo Família"
        description="Partilha o orçamento e acompanha as finanças em conjunto."
      />
      <PremiumGate isPremium={isPremium} feature="Modo Família">
        <FamilyManager members={members} />
      </PremiumGate>
    </div>
  );
}
