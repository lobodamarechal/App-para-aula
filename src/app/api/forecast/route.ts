import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, demoInsights } from "@/lib/demo";
import { loadContext, runJson } from "@/lib/claude/analyze";
import { forecastSystem } from "@/lib/claude/prompts";

export const maxDuration = 60;

interface ForecastResult {
  in_30_days: number;
  in_6_months: number;
  in_1_year: number;
  assumptions: string;
  confidence: "low" | "medium" | "high";
}

const schema = {
  type: "object",
  properties: {
    in_30_days: { type: "number" },
    in_6_months: { type: "number" },
    in_1_year: { type: "number" },
    assumptions: { type: "string" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["in_30_days", "in_6_months", "in_1_year", "assumptions", "confidence"],
  additionalProperties: false,
};

/** POST /api/forecast — estima o saldo futuro do utilizador. */
export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json({ forecast: demoInsights("forecast")[0].data });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const context = await loadContext(supabase, user.id);
    const result = await runJson<ForecastResult>({
      system: forecastSystem(context),
      user: "Estima a evolução do meu saldo.",
      schema,
    });

    // Persiste como insight do tipo "forecast".
    await supabase.from("ai_insights").insert({
      user_id: user.id,
      type: "forecast",
      title: "Previsão de saldo",
      content: result.assumptions,
      data: result,
    });

    return NextResponse.json({ forecast: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro na previsão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
