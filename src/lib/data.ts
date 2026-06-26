import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  DEMO_MODE,
  demoProfile,
  demoTransactions,
  demoBudgets,
  demoGoals,
  demoAlerts,
  demoSubscriptions,
  demoInsights,
  demoScore,
} from "@/lib/demo";
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
  if (DEMO_MODE) return { id: demoProfile.id, email: demoProfile.email } as const;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Carrega o perfil do utilizador atual. */
export async function getProfile(): Promise<Profile | null> {
  if (DEMO_MODE) return demoProfile;
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
  if (DEMO_MODE) {
    const txs = demoTransactions();
    return limit ? txs.slice(0, limit) : txs;
  }
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
  if (DEMO_MODE) return demoBudgets;
  const supabase = await createClient();
  const { data } = await supabase.from("budgets").select("*");
  return (data as Budget[]) ?? [];
}

/** Metas financeiras. */
export async function getGoals(): Promise<Goal[]> {
  if (DEMO_MODE) return demoGoals;
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Goal[]) ?? [];
}

/** Alertas (mais recentes primeiro). */
export async function getAlerts(): Promise<Alert[]> {
  if (DEMO_MODE) return demoAlerts;
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
  if (DEMO_MODE) return demoSubscriptions;
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("annual_cost", { ascending: false });
  return (data as Subscription[]) ?? [];
}

/** Insights IA (semanais, previsões, literacia). */
export async function getInsights(type?: string): Promise<AiInsight[]> {
  if (DEMO_MODE) return demoInsights(type);
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
  if (DEMO_MODE) return demoScore;
  const supabase = await createClient();
  const { data } = await supabase
    .from("financial_scores")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as FinancialScore | null;
}
