import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, demoScore } from "@/lib/demo";
import { loadContext, runJson } from "@/lib/claude/analyze";
import { scoreSystem } from "@/lib/claude/prompts";

export const maxDuration = 60;

interface ScoreResult {
  score: number;
  savings_score: number;
  spending_score: number;
  consistency_score: number;
  budget_score: number;
  summary: string;
}

const schema = {
  type: "object",
  properties: {
    score: { type: "number" },
    savings_score: { type: "number" },
    spending_score: { type: "number" },
    consistency_score: { type: "number" },
    budget_score: { type: "number" },
    summary: { type: "string" },
  },
  required: [
    "score",
    "savings_score",
    "spending_score",
    "consistency_score",
    "budget_score",
    "summary",
  ],
  additionalProperties: false,
};

/** POST /api/score — calcula e guarda o Score Financeiro (0-100). */
export async function POST() {
  if (DEMO_MODE) return NextResponse.json({ score: demoScore });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const context = await loadContext(supabase, user.id);
    const r = await runJson<ScoreResult>({
      system: scoreSystem(context),
      user: "Calcula o meu score financeiro.",
      schema,
    });

    const clampInt = (n: number) =>
      Math.max(0, Math.min(100, Math.round(n || 0)));

    const { data, error } = await supabase
      .from("financial_scores")
      .insert({
        user_id: user.id,
        score: clampInt(r.score),
        savings_score: clampInt(r.savings_score),
        spending_score: clampInt(r.spending_score),
        consistency_score: clampInt(r.consistency_score),
        budget_score: clampInt(r.budget_score),
        summary: r.summary,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ score: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao calcular score.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
