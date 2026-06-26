import { Target } from "lucide-react";

import { getProfile, getGoals } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Metas · Family Budget AI Pro" };

export default async function GoalsPage() {
  const [profile, goals] = await Promise.all([getProfile(), getGoals()]);
  const currency = profile?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas financeiras"
        description="Define objetivos e acompanha o progresso até os alcançar."
      >
        <AddGoalDialog />
      </PageHeader>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Define a tua primeira meta"
          description="Fundo de emergência, uma viagem, um carro ou a entrada para uma casa — começa por aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}
