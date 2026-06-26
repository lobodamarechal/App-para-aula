"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { DEMO_MODE } from "@/lib/demo";
import { INCOME_CATEGORIES } from "@/lib/constants";
import type { CategoryName } from "@/lib/constants";

/** Mensagem padrão devolvida quando se tenta escrever em modo demonstração. */
const DEMO_BLOCK = {
  error:
    "Modo demonstração — configura o Supabase para guardar alterações reais.",
} as const;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

// ── Transações ──────────────────────────────────────────────────────────────

export async function addTransaction(formData: FormData) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();

  const category = String(formData.get("category_name") || "Outros");
  const amount = Math.abs(Number(formData.get("amount")) || 0);
  const isIncome = INCOME_CATEGORIES.includes(category as CategoryName);

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    description: String(formData.get("description") || "Transação"),
    merchant: (formData.get("description") as string) || null,
    amount,
    type: isIncome ? "income" : "expense",
    category_name: category,
    confidence: 100,
    source: "manual",
  });

  if (error) return { error: error.message };
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { success: true };
}

// ── Orçamentos ──────────────────────────────────────────────────────────────

export async function upsertBudget(categoryName: string, amount: number) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();
  const now = new Date();

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: user.id,
      category_name: categoryName,
      amount: Math.max(0, amount),
      period: "monthly",
      month: now.getUTCMonth() + 1,
      year: now.getUTCFullYear(),
    },
    { onConflict: "user_id,category_name,month,year" },
  );

  if (error) return { error: error.message };
  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/budget");
  return { success: true };
}

// ── Metas ───────────────────────────────────────────────────────────────────

export async function addGoal(formData: FormData) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: String(formData.get("name") || "Nova meta"),
    icon: String(formData.get("icon") || "Target"),
    target_amount: Math.abs(Number(formData.get("target_amount")) || 0),
    current_amount: Math.abs(Number(formData.get("current_amount")) || 0),
    monthly_contribution: Math.abs(
      Number(formData.get("monthly_contribution")) || 0,
    ),
    deadline: (formData.get("deadline") as string) || null,
    status: "active",
  });
  if (error) return { error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGoalAmount(id: string, currentAmount: number) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("goals")
    .update({ current_amount: Math.max(0, currentAmount) })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGoal(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/goals");
  return { success: true };
}

// ── Alertas ─────────────────────────────────────────────────────────────────

export async function markAlertRead(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  await supabase.from("alerts").update({ is_read: true }).eq("id", id);
  revalidatePath("/alerts");
  return { success: true };
}

export async function deleteAlert(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  await supabase.from("alerts").delete().eq("id", id);
  revalidatePath("/alerts");
  return { success: true };
}

// ── Perfil / Definições ──────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") || ""),
      currency: String(formData.get("currency") || "EUR"),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

/** Ativa/desativa o modo Premium (demonstração — sem pagamento real). */
export async function togglePremium(enabled: boolean) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: enabled })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

// ── Modo Família ──────────────────────────────────────────────────────────────

export async function inviteFamilyMember(formData: FormData) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase, user } = await requireUser();
  const email = String(formData.get("member_email") || "").trim();
  if (!email) return { error: "Indica o email do membro." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("family_members").insert({
    household_id: (profile as { household_id: string })?.household_id ?? user.id,
    owner_id: user.id,
    member_email: email,
    role: "member",
    status: "pending",
  });
  if (error) return { error: error.message };
  revalidatePath("/family");
  return { success: true };
}

export async function removeFamilyMember(id: string) {
  if (DEMO_MODE) return DEMO_BLOCK;
  const { supabase } = await requireUser();
  await supabase.from("family_members").delete().eq("id", id);
  revalidatePath("/family");
  return { success: true };
}
