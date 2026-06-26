import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { loadContext, runText } from "@/lib/claude/analyze";
import { weeklyInsightSystem } from "@/lib/claude/prompts";

export const maxDuration = 60;

/** POST /api/insights — gera um insight semanal e guarda-o. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const context = await loadContext(supabase, user.id);
    const content = await runText({
      system: weeklyInsightSystem(context),
      user: "Gera o meu resumo semanal.",
      maxTokens: 600,
    });

    const title = `Resumo semanal · ${new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "short",
    }).format(new Date())}`;

    const { data, error } = await supabase
      .from("ai_insights")
      .insert({ user_id: user.id, type: "weekly", title, content })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ insight: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar insight.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
