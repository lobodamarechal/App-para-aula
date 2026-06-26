import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE, demoExtracted } from "@/lib/demo";
import {
  extractTransactionsFromPDF,
  extractTransactionsFromText,
} from "@/lib/claude/extract";
import { INCOME_CATEGORIES } from "@/lib/constants";
import type { CategoryName } from "@/lib/constants";

// A extração pode demorar — damos margem ampla ao runtime.
export const maxDuration = 120;

/**
 * POST /api/extract
 * Body: { pdf?: string (base64), text?: string }
 * Extrai transações do extrato com Claude e guarda-as na base de dados.
 */
export async function POST(request: Request) {
  // Modo demonstração: devolve transações de exemplo (sem chamar a IA/BD).
  if (DEMO_MODE) {
    const transactions = demoExtracted();
    return NextResponse.json({ inserted: transactions.length, transactions });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { pdf?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  if (!body.pdf && !body.text) {
    return NextResponse.json(
      { error: "Fornece um PDF (base64) ou texto do extrato." },
      { status: 400 },
    );
  }

  try {
    // 1. Extração via Claude (documento nativo ou texto).
    const extracted = body.pdf
      ? await extractTransactionsFromPDF(body.pdf)
      : await extractTransactionsFromText(body.text!);

    if (extracted.length === 0) {
      return NextResponse.json({ inserted: 0, transactions: [] });
    }

    // 2. Mapa nome→id das categorias (globais + do utilizador).
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name")
      .or(`user_id.is.null,user_id.eq.${user.id}`);
    const catMap = new Map<string, string>(
      (cats ?? []).map((c: { id: string; name: string }) => [c.name, c.id]),
    );

    // 3. Preparar linhas para inserção.
    const rows = extracted.map((t) => {
      const isIncome =
        t.type === "income" ||
        INCOME_CATEGORIES.includes(t.category as CategoryName);
      return {
        user_id: user.id,
        date: t.date,
        description: t.description,
        merchant: t.merchant ?? null,
        amount: t.amount,
        type: isIncome ? "income" : "expense",
        category_id: catMap.get(t.category) ?? null,
        category_name: t.category,
        confidence: t.confidence,
        is_subscription: Boolean(t.is_subscription),
        source: "pdf",
      };
    });

    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Registar/atualizar assinaturas detetadas.
    await upsertSubscriptions(supabase, user.id, extracted);

    return NextResponse.json({
      inserted: inserted?.length ?? 0,
      transactions: inserted ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao processar o extrato.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Cria registos de assinatura a partir das transações marcadas pela IA. */
async function upsertSubscriptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  extracted: Awaited<ReturnType<typeof extractTransactionsFromPDF>>,
) {
  const subs = extracted.filter((t) => t.is_subscription);
  if (subs.length === 0) return;

  // Evita duplicados pelo nome (case-insensitive simples).
  const seen = new Set<string>();
  const rows = subs
    .filter((s) => {
      const key = (s.merchant || s.description).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((s) => ({
      user_id: userId,
      name: s.merchant || s.description,
      amount: s.amount,
      frequency: "monthly",
      category_name: s.category,
      last_charged: s.date,
      annual_cost: s.amount * 12,
      is_active: true,
    }));

  if (rows.length) {
    await supabase.from("subscriptions").insert(rows);
  }
}
