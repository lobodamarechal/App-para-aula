import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Transaction,
  Budget,
  Goal,
  Alert,
  Subscription,
  AiInsight,
  FinancialScore,
  Profile,
} from "@/lib/types";

/** Devolve o utilizador autenticado ou null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Carrega o perfil do utilizador atual. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

/** Todas as transações do utilizador (ordenadas por data desc). */
export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data as Transaction[]) ?? [];
}

/** Orçamentos do utilizador. */
export async function getBudgets(): Promise<Budget[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("budgets").select("*");
  return (data as Budget[]) ?? [];
}

/** Metas financeiras. */
export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Goal[]) ?? [];
}

/** Alertas (mais recentes primeiro). */
export async function getAlerts(): Promise<Alert[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Alert[]) ?? [];
}

/** Assinaturas detetadas. */
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("annual_cost", { ascending: false });
  return (data as Subscription[]) ?? [];
}

/** Insights IA (semanais, previsões, literacia). */
export async function getInsights(type?: string): Promise<AiInsight[]> {
  const supabase = await createClient();
  let query = supabase
    .from("ai_insights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (type) query = query.eq("type", type);
  const { data } = await query;
  return (data as AiInsight[]) ?? [];
}

/** Último score financeiro registado. */
export async function getLatestScore(): Promise<FinancialScore | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("financial_scores")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as FinancialScore | null;
}
