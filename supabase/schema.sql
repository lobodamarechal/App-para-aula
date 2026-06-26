-- ============================================================================
-- Family Budget AI Pro — Esquema de Base de Dados (Supabase / PostgreSQL)
-- ============================================================================
-- Executa este ficheiro no SQL Editor do Supabase (uma única vez).
-- Inclui: tabelas, índices, Row Level Security (RLS), triggers e dados seed.
--
-- Modelo de segurança: cada utilizador só acede aos seus próprios dados.
-- O Modo Família é suportado via tabela `family_members` + coluna `household_id`.
-- ============================================================================

-- Extensões necessárias ------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES (espelho de auth.users com metadados aplicacionais)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  currency      text not null default 'EUR',
  locale        text not null default 'pt-PT',
  household_id  uuid,                       -- agrupa membros de uma família
  is_premium    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. CATEGORIES (categorias de classificação — globais + personalizadas)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users (id) on delete cascade, -- null = global
  name        text not null,
  slug        text not null,
  icon        text,            -- nome do ícone lucide
  color       text,            -- cor HEX para gráficos
  type        text not null default 'expense' check (type in ('expense', 'income')),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. TRANSACTIONS (movimentos extraídos de extratos ou inseridos manualmente)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  date                  date not null,
  description           text not null,
  merchant              text,
  amount                numeric(14, 2) not null,   -- sempre positivo
  type                  text not null check (type in ('income', 'expense')),
  category_id           uuid references public.categories (id) on delete set null,
  category_name         text,                      -- desnormalizado p/ rapidez
  confidence            numeric(5, 2),             -- 0-100 (confiança da IA)
  is_subscription       boolean not null default false,
  is_suspicious         boolean not null default false,
  notes                 text,
  source                text not null default 'manual' check (source in ('manual', 'pdf', 'import')),
  raw_text              text,                      -- linha original do extrato
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);
create index if not exists idx_transactions_category
  on public.transactions (category_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. BUDGETS (orçamento mensal por categoria)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.budgets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  category_id   uuid references public.categories (id) on delete cascade,
  category_name text not null,
  amount        numeric(14, 2) not null check (amount >= 0),
  period        text not null default 'monthly' check (period in ('monthly', 'yearly')),
  month         int check (month between 1 and 12),  -- null = recorrente
  year          int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, category_name, month, year)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. ALERTS (alertas inteligentes gerados pela IA)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null check (type in (
                 'deviation_10', 'deviation_20', 'abnormal_expense',
                 'unusual_purchase', 'income_drop', 'subscription', 'suspicious'
               )),
  severity     text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title        text not null,
  message      text not null,
  category_name text,
  amount       numeric(14, 2),
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_alerts_user
  on public.alerts (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. FINANCIAL_SCORES (score financeiro 0-100, histórico)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.financial_scores (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  score             int not null check (score between 0 and 100),
  savings_score     int not null default 0,
  spending_score    int not null default 0,
  consistency_score int not null default 0,
  budget_score      int not null default 0,
  summary           text,
  created_at        timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. GOALS (metas financeiras)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  icon            text,
  target_amount   numeric(14, 2) not null check (target_amount > 0),
  current_amount  numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) default 0,
  deadline        date,
  status          text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. SUBSCRIPTIONS (assinaturas recorrentes detetadas)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  amount         numeric(14, 2) not null,
  frequency      text not null default 'monthly' check (frequency in ('monthly', 'yearly', 'weekly')),
  category_name  text,
  last_charged   date,
  next_charge    date,
  annual_cost    numeric(14, 2),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. REPORTS (relatórios PDF gerados)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null check (type in ('monthly', 'quarterly', 'annual')),
  period_label text not null,             -- ex.: "Junho 2026"
  summary      text,                      -- análise IA em markdown
  data         jsonb,                     -- snapshot de métricas
  created_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. FAMILY_MEMBERS (Modo Família — contas partilhadas)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.family_members (
  id            uuid primary key default uuid_generate_v4(),
  household_id  uuid not null,
  owner_id      uuid not null references auth.users (id) on delete cascade,
  member_email  text not null,
  member_id     uuid references auth.users (id) on delete set null,
  role          text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  status        text not null default 'pending' check (status in ('pending', 'active')),
  created_at    timestamptz not null default now(),
  unique (household_id, member_email)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. AI_INSIGHTS (insights semanais e análises geradas pela IA)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_insights (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        text not null default 'weekly' check (type in ('weekly', 'forecast', 'literacy', 'analysis')),
  title       text not null,
  content     text not null,            -- markdown
  data        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_insights_user
  on public.ai_insights (user_id, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Ativa RLS em todas as tabelas e cria políticas "o utilizador só vê o seu".

alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.transactions      enable row level security;
alter table public.budgets           enable row level security;
alter table public.alerts            enable row level security;
alter table public.financial_scores  enable row level security;
alter table public.goals             enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.reports           enable row level security;
alter table public.family_members    enable row level security;
alter table public.ai_insights       enable row level security;

-- PROFILES -------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- CATEGORIES (globais visíveis a todos; personalizadas só ao dono) -----------
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select using (user_id is null or auth.uid() = user_id);

drop policy if exists "categories_modify_own" on public.categories;
create policy "categories_modify_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Macro genérica para as tabelas "user_id = auth.uid()" ----------------------
-- (escrita explícita por tabela para clareza e auditabilidade)

-- TRANSACTIONS
drop policy if exists "transactions_all_own" on public.transactions;
create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- BUDGETS
drop policy if exists "budgets_all_own" on public.budgets;
create policy "budgets_all_own" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ALERTS
drop policy if exists "alerts_all_own" on public.alerts;
create policy "alerts_all_own" on public.alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FINANCIAL_SCORES
drop policy if exists "scores_all_own" on public.financial_scores;
create policy "scores_all_own" on public.financial_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GOALS
drop policy if exists "goals_all_own" on public.goals;
create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SUBSCRIPTIONS
drop policy if exists "subscriptions_all_own" on public.subscriptions;
create policy "subscriptions_all_own" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- REPORTS
drop policy if exists "reports_all_own" on public.reports;
create policy "reports_all_own" on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI_INSIGHTS
drop policy if exists "insights_all_own" on public.ai_insights;
create policy "insights_all_own" on public.ai_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FAMILY_MEMBERS (o dono gere; o membro vê o seu registo) --------------------
drop policy if exists "family_owner_all" on public.family_members;
create policy "family_owner_all" on public.family_members
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "family_member_select" on public.family_members;
create policy "family_member_select" on public.family_members
  for select using (auth.uid() = member_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Atualiza automaticamente updated_at em UPDATE -----------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.transactions;
create trigger set_updated_at before update on public.transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.budgets;
create trigger set_updated_at before update on public.budgets
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.goals;
create trigger set_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();

-- Cria automaticamente um profile quando um utilizador se regista ------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, household_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.id  -- por omissão, cada utilizador é o seu próprio "household"
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- SEED — categorias por omissão (globais, user_id = null)
-- ============================================================================
insert into public.categories (name, slug, icon, color, type, is_default) values
  ('Alimentação',   'alimentacao',   'Utensils',     '#FF9F0A', 'expense', true),
  ('Supermercado',  'supermercado',  'ShoppingCart', '#FF9500', 'expense', true),
  ('Restaurantes',  'restaurantes',  'UtensilsCrossed', '#FF6482', 'expense', true),
  ('Transportes',   'transportes',   'Bus',          '#5E5CE6', 'expense', true),
  ('Combustível',   'combustivel',   'Fuel',         '#BF5AF2', 'expense', true),
  ('Saúde',         'saude',         'HeartPulse',   '#FF375F', 'expense', true),
  ('Educação',      'educacao',      'GraduationCap','#0A84FF', 'expense', true),
  ('Habitação',     'habitacao',     'Home',         '#30B0C7', 'expense', true),
  ('Água',          'agua',          'Droplets',     '#64D2FF', 'expense', true),
  ('Luz',           'luz',           'Zap',          '#FFD60A', 'expense', true),
  ('Internet',      'internet',      'Wifi',         '#32ADE6', 'expense', true),
  ('Streaming',     'streaming',     'Tv',           '#FF2D55', 'expense', true),
  ('Compras',       'compras',       'ShoppingBag',  '#AF52DE', 'expense', true),
  ('Lazer',         'lazer',         'Gamepad2',     '#34C759', 'expense', true),
  ('Viagens',       'viagens',       'Plane',        '#5AC8FA', 'expense', true),
  ('Salário',       'salario',       'Wallet',       '#34C759', 'income',  true),
  ('Investimentos', 'investimentos', 'TrendingUp',   '#30D158', 'income',  true),
  ('Outros',        'outros',        'CircleDashed', '#8E8E93', 'expense', true)
on conflict do nothing;

-- ============================================================================
-- FIM DO ESQUEMA
-- ============================================================================
