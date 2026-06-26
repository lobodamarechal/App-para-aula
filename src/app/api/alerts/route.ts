import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, demoAlerts } from "@/lib/demo";
import { loadContext, runJson } from "@/lib/claude/analyze";
import { alertsSystem } from "@/lib/claude/prompts";
import type { AlertSeverity, AlertType } from "@/lib/types";

export const maxDuration = 60;

interface GeneratedAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  category_name: string | null;
  amount: number | null;
}

const schema = {
  type: "object",
  properties: {
    alerts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "deviation_10",
              "deviation_20",
              "abnormal_expense",
              "unusual_purchase",
              "income_drop",
              "subscription",
              "suspicious",
            ],
          },
          severity: { type: "string", enum: ["info", "warning", "critical"] },
          title: { type: "string" },
          message: { type: "string" },
          category_name: { type: ["string", "null"] },
          amount: { type: ["number", "null"] },
        },
        required: ["type", "severity", "title", "message"],
        additionalProperties: false,
      },
    },
  },
  required: ["alerts"],
  additionalProperties: false,
};

/** POST /api/alerts — analisa os dados e gera alertas inteligentes. */
export async function POST() {
  if (DEMO_MODE) {
    return NextResponse.json({ inserted: demoAlerts.length, alerts: demoAlerts });
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
    const { alerts } = await runJson<{ alerts: GeneratedAlert[] }>({
      system: alertsSystem(context),
      user: "Analisa os meus dados e gera alertas.",
      schema,
    });

    if (!alerts?.length) {
      return NextResponse.json({ inserted: 0, alerts: [] });
    }

    const rows = alerts.slice(0, 6).map((a) => ({
      user_id: user.id,
      type: a.type,
      severity: a.severity,
      title: a.title,
      message: a.message,
      category_name: a.category_name ?? null,
      amount: a.amount ?? null,
    }));

    const { data, error } = await supabase.from("alerts").insert(rows).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ inserted: data?.length ?? 0, alerts: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar alertas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
