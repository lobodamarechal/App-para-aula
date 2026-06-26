/**
 * Tipos de domínio partilhados entre cliente e servidor.
 * Espelham as tabelas Supabase definidas em `supabase/schema.sql`.
 */

export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "pdf" | "import";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  locale: string;
  household_id: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string; // ISO date
  description: string;
  merchant: string | null;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  category_name: string | null;
  confidence: number | null;
  is_subscription: boolean;
  is_suspicious: boolean;
  notes: string | null;
  source: TransactionSource;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  category_name: string;
  amount: number;
  period: "monthly" | "yearly";
  month: number | null;
  year: number | null;
  created_at: string;
  updated_at: string;
}

export type AlertType =
  | "deviation_10"
  | "deviation_20"
  | "abnormal_expense"
  | "unusual_purchase"
  | "income_drop"
  | "subscription"
  | "suspicious";

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  user_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  category_name: string | null;
  amount: number | null;
  is_read: boolean;
  created_at: string;
}

export interface FinancialScore {
  id: string;
  user_id: string;
  score: number;
  savings_score: number;
  spending_score: number;
  consistency_score: number;
  budget_score: number;
  summary: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number | null;
  deadline: string | null;
  status: "active" | "completed" | "paused";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly" | "weekly";
  category_name: string | null;
  last_charged: string | null;
  next_charge: string | null;
  annual_cost: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  type: "monthly" | "quarterly" | "annual";
  period_label: string;
  summary: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  household_id: string;
  owner_id: string;
  member_email: string;
  member_id: string | null;
  role: "owner" | "member" | "viewer";
  status: "pending" | "active";
  created_at: string;
}

export interface AiInsight {
  id: string;
  user_id: string;
  type: "weekly" | "forecast" | "literacy" | "analysis";
  title: string;
  content: string;
  data: Record<string, unknown> | null;
  created_at: string;
}

// ── Tipos derivados / DTO ───────────────────────────────────────────────────

/** Resultado da extração de uma transação a partir de um extrato (Claude). */
export interface ExtractedTransaction {
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  type: TransactionType;
  category: string;
  confidence: number;
  is_subscription?: boolean;
  raw_text?: string;
}

/** Métricas agregadas apresentadas no dashboard. */
export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
}

/** Comparação orçamento vs real por categoria. */
export interface BudgetComparison {
  categoryName: string;
  color: string;
  budgeted: number;
  actual: number;
  deviation: number; // %
}

/** Mensagem do chat com o assistente IA. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
