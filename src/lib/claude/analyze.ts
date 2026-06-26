import "server-only";

import { getClaude } from "./client";
import { parseJsonLoose, firstText } from "./json";
import { CLAUDE_MODEL } from "@/lib/constants";
import { buildFinancialContext } from "@/lib/finance";
import type { createClient } from "@/lib/supabase/server";
import type { Transaction, Budget } from "@/lib/types";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Carrega o contexto financeiro textual de um utilizador para a IA. */
export async function loadContext(
  supabase: SupabaseServer,
  userId: string,
): Promise<string> {
  const [{ data: txs }, { data: budgets }, { data: profile }] =
    await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("budgets").select("*"),
      supabase.from("profiles").select("currency").eq("id", userId).single(),
    ]);

  return buildFinancialContext(
    (txs as Transaction[]) ?? [],
    (budgets as Budget[]) ?? [],
    { currency: (profile as { currency?: string })?.currency ?? "EUR" },
  );
}

/**
 * Executa um prompt que devolve JSON e faz parse tolerante.
 * Os prompts já descrevem o formato esperado; o `schema` documenta a forma
 * e poderia ser passado a `output_config.format` com um SDK recente.
 */
export async function runJson<T>(opts: {
  system: string;
  user: string;
  schema?: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const claude = getClaude();
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 2000,
    system:
      opts.system +
      "\n\nResponde APENAS com JSON válido, sem texto adicional nem blocos de código markdown.",
    messages: [{ role: "user", content: opts.user }],
  });
  return parseJsonLoose<T>(firstText(response.content));
}

/** Executa um prompt que devolve texto/markdown livre. */
export async function runText(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const claude = getClaude();
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 1200,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return firstText(response.content);
}
