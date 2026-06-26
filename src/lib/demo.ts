/**
 * ───────────────────────────────────────────────────────────────────────────
 * MODO DEMONSTRAÇÃO
 * ───────────────────────────────────────────────────────────────────────────
 * Ativa-se automaticamente quando NÃO existem variáveis de ambiente Supabase.
 * Permite explorar a app inteira sem qualquer backend: login simulado, dados
 * de exemplo já carregados e respostas de IA simuladas (sem chamar a Claude).
 *
 * Assim que configurares NEXT_PUBLIC_SUPABASE_URL (+ chave Anthropic), a app
 * passa automaticamente a usar dados reais.
 */
import {
  expenseByCategory,
  monthlyEvolution,
  sumIncome,
  sumExpense,
  txInMonth,
} from "@/lib/finance";
import { DEMO_MODE } from "@/lib/demo-mode";
import type {
  Profile,
  Transaction,
  Budget,
  Goal,
  Alert,
  Subscription,
  AiInsight,
  FinancialScore,
  Report,
  ExtractedTransaction,
  ChatMessage,
} from "@/lib/types";

/** Verdadeiro quando a app corre sem backend configurado (re-exportado). */
export { DEMO_MODE };

const UID = "demo-user";
const NOW = new Date();

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function monthYear(offset: number) {
  const d = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() + offset, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
}

// Modelo de um mês típico (valores em EUR).
interface TplItem {
  day: number;
  desc: string;
  merchant: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  sub?: boolean;
  suspicious?: boolean;
}

const MONTH_TEMPLATE: TplItem[] = [
  { day: 1, desc: "Ordenado mensal", merchant: "Empresa XYZ", amount: 2200, type: "income", category: "Salário" },
  { day: 11, desc: "Renda da casa", merchant: "Senhorio", amount: 750, type: "expense", category: "Habitação" },
  { day: 3, desc: "Continente", merchant: "Continente", amount: 92.4, type: "expense", category: "Supermercado" },
  { day: 8, desc: "Pingo Doce", merchant: "Pingo Doce", amount: 64.1, type: "expense", category: "Supermercado" },
  { day: 15, desc: "Continente Online", merchant: "Continente", amount: 78.25, type: "expense", category: "Supermercado" },
  { day: 23, desc: "Lidl", merchant: "Lidl", amount: 41.3, type: "expense", category: "Supermercado" },
  { day: 5, desc: "Galp Energia", merchant: "Galp", amount: 60, type: "expense", category: "Combustível" },
  { day: 19, desc: "BP Combustíveis", merchant: "BP", amount: 55, type: "expense", category: "Combustível" },
  { day: 6, desc: "Uber *trip", merchant: "Uber", amount: 12.4, type: "expense", category: "Transportes" },
  { day: 12, desc: "Metro de Lisboa", merchant: "Metro", amount: 40, type: "expense", category: "Transportes" },
  { day: 9, desc: "Restaurante O Prato", merchant: "O Prato", amount: 38.5, type: "expense", category: "Restaurantes" },
  { day: 25, desc: "Telepizza", merchant: "Telepizza", amount: 22.9, type: "expense", category: "Restaurantes" },
  { day: 2, desc: "NETFLIX.COM", merchant: "Netflix", amount: 13.99, type: "expense", category: "Streaming", sub: true },
  { day: 2, desc: "Spotify P0F2A", merchant: "Spotify", amount: 6.99, type: "expense", category: "Streaming", sub: true },
  { day: 4, desc: "EDP Comercial", merchant: "EDP", amount: 58.3, type: "expense", category: "Luz" },
  { day: 4, desc: "EPAL Águas", merchant: "EPAL", amount: 24.1, type: "expense", category: "Água" },
  { day: 4, desc: "MEO Fibra", merchant: "MEO", amount: 39.99, type: "expense", category: "Internet", sub: true },
  { day: 16, desc: "Farmácia Central", merchant: "Farmácia", amount: 18.75, type: "expense", category: "Saúde" },
  { day: 20, desc: "Zara", merchant: "Zara", amount: 49.95, type: "expense", category: "Compras" },
  { day: 27, desc: "Cinema NOS", merchant: "NOS Cinemas", amount: 16, type: "expense", category: "Lazer" },
];

let cachedTx: Transaction[] | null = null;

/** Gera ~6 meses de transações realistas (determinístico). */
export function demoTransactions(): Transaction[] {
  if (cachedTx) return cachedTx;
  const out: Transaction[] = [];
  let i = 0;

  for (let offset = -5; offset <= 0; offset++) {
    const { y, m } = monthYear(offset);
    // Fator de variação por mês para os gráficos parecerem naturais.
    const f = 1 + ((Math.abs(offset) % 3) - 1) * 0.07;

    for (const t of MONTH_TEMPLATE) {
      // No mês atual, só inclui movimentos até ao dia de hoje.
      if (offset === 0 && t.day > NOW.getUTCDate()) continue;
      const amount =
        t.type === "income" ? t.amount : Math.round(t.amount * f * 100) / 100;
      out.push({
        id: `demo-tx-${i++}`,
        user_id: UID,
        date: `${y}-${pad(m)}-${pad(t.day)}`,
        description: t.desc,
        merchant: t.merchant,
        amount,
        type: t.type,
        category_id: null,
        category_name: t.category,
        confidence: t.type === "income" ? 99 : 90 + ((i % 9)),
        is_subscription: Boolean(t.sub),
        is_suspicious: Boolean(t.suspicious),
        notes: null,
        source: "pdf",
        raw_text: null,
        created_at: `${y}-${pad(m)}-${pad(t.day)}T10:00:00Z`,
        updated_at: `${y}-${pad(m)}-${pad(t.day)}T10:00:00Z`,
      });
    }
  }

  // Uma despesa "suspeita" (duplicação) no mês atual.
  const { y, m } = monthYear(0);
  if (NOW.getUTCDate() >= 3) {
    out.push({
      id: `demo-tx-${i++}`,
      user_id: UID,
      date: `${y}-${pad(m)}-03`,
      description: "Continente (duplicado?)",
      merchant: "Continente",
      amount: 92.4,
      type: "expense",
      category_id: null,
      category_name: "Supermercado",
      confidence: 88,
      is_subscription: false,
      is_suspicious: true,
      notes: null,
      source: "pdf",
      raw_text: null,
      created_at: `${y}-${pad(m)}-03T11:00:00Z`,
      updated_at: `${y}-${pad(m)}-03T11:00:00Z`,
    });
  }

  cachedTx = out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return cachedTx;
}

export const demoProfile: Profile = {
  id: UID,
  email: "demo@familybudget.ai",
  full_name: "Utilizador Demo",
  avatar_url: null,
  currency: "EUR",
  locale: "pt-PT",
  household_id: UID,
  is_premium: true, // demo desbloqueia todas as funcionalidades
  created_at: NOW.toISOString(),
  updated_at: NOW.toISOString(),
};

export const demoBudgets: Budget[] = [
  ["Supermercado", 320],
  ["Restaurantes", 90],
  ["Combustível", 130],
  ["Lazer", 80],
  ["Compras", 100],
  ["Habitação", 750],
].map(([name, amount], idx) => {
  const { y, m } = monthYear(0);
  return {
    id: `demo-budget-${idx}`,
    user_id: UID,
    category_id: null,
    category_name: String(name),
    amount: Number(amount),
    period: "monthly",
    month: m,
    year: y,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
  };
});

export const demoGoals: Goal[] = [
  { name: "Fundo de emergência", icon: "ShieldCheck", target: 6000, current: 3800, monthly: 300 },
  { name: "Viagem ao Japão", icon: "Plane", target: 4000, current: 1500, monthly: 250 },
  { name: "Entrada para casa", icon: "Home", target: 25000, current: 9000, monthly: 500 },
].map((g, idx) => ({
  id: `demo-goal-${idx}`,
  user_id: UID,
  name: g.name,
  icon: g.icon,
  target_amount: g.target,
  current_amount: g.current,
  monthly_contribution: g.monthly,
  deadline: null,
  status: "active",
  created_at: NOW.toISOString(),
  updated_at: NOW.toISOString(),
}));

export const demoAlerts: Alert[] = [
  {
    id: "demo-alert-0",
    user_id: UID,
    type: "deviation_20",
    severity: "warning",
    title: "Restauração acima do habitual",
    message: "Este mês gastaste 37% acima do habitual em restaurantes.",
    category_name: "Restaurantes",
    amount: 61.4,
    is_read: false,
    created_at: NOW.toISOString(),
  },
  {
    id: "demo-alert-1",
    user_id: UID,
    type: "suspicious",
    severity: "critical",
    title: "Possível cobrança duplicada",
    message: "Detetámos duas compras iguais no Continente (92,40 €) no mesmo dia.",
    category_name: "Supermercado",
    amount: 92.4,
    is_read: false,
    created_at: NOW.toISOString(),
  },
  {
    id: "demo-alert-2",
    user_id: UID,
    type: "subscription",
    severity: "info",
    title: "Assinaturas a somar",
    message: "As tuas assinaturas (Netflix, Spotify, MEO) custam ~733 €/ano.",
    category_name: "Streaming",
    amount: 60.97,
    is_read: true,
    created_at: NOW.toISOString(),
  },
];

export const demoSubscriptions: Subscription[] = [
  ["Netflix", 13.99, "Streaming"],
  ["Spotify", 6.99, "Streaming"],
  ["MEO Fibra", 39.99, "Internet"],
].map(([name, amount, cat], idx) => ({
  id: `demo-sub-${idx}`,
  user_id: UID,
  name: String(name),
  amount: Number(amount),
  frequency: "monthly",
  category_name: String(cat),
  last_charged: null,
  next_charge: null,
  annual_cost: Number(amount) * 12,
  is_active: true,
  created_at: NOW.toISOString(),
}));

export const demoScore: FinancialScore = {
  id: "demo-score-0",
  user_id: UID,
  score: 78,
  savings_score: 82,
  spending_score: 75,
  consistency_score: 80,
  budget_score: 70,
  summary:
    "Boa saúde financeira! Poupas cerca de 37% do rendimento. O principal ponto a melhorar é manter os gastos em restaurantes dentro do orçamento.",
  created_at: NOW.toISOString(),
};

export function demoInsights(type?: string): AiInsight[] {
  const all: AiInsight[] = [
    {
      id: "demo-ins-weekly",
      user_id: UID,
      type: "weekly",
      title: "Resumo semanal",
      content:
        "**Esta semana gastaste menos 14% em alimentação** 🎉\n\n- Supermercado: 64,10 € (abaixo da média semanal)\n- Restaurantes: 38,50 € — atenção, já perto do limite mensal\n- Poupança da semana: +180 €\n\nSugestão: se mantiveres este ritmo, fechas o mês com ~820 € poupados.",
      data: null,
      created_at: NOW.toISOString(),
    },
    {
      id: "demo-ins-forecast",
      user_id: UID,
      type: "forecast",
      title: "Previsão de saldo",
      content:
        "Com base na tua poupança média de ~820 €/mês, o saldo deverá crescer de forma estável.",
      data: {
        in_30_days: 4900,
        in_6_months: 9800,
        in_1_year: 14700,
        assumptions:
          "Assume receita estável de 2200 €/mês e despesa média de ~1380 €/mês, mantendo a taxa de poupança atual (~37%).",
        confidence: "medium",
      },
      created_at: NOW.toISOString(),
    },
  ];
  return type ? all.filter((i) => i.type === type) : all;
}

export function demoReports(): Report[] {
  const txs = demoTransactions();
  const { y, m } = monthYear(0);
  const periodTx = txInMonth(txs, y, m);
  const income = sumIncome(periodTx);
  const expense = sumExpense(periodTx);
  const monthName = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
  const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return [
    {
      id: "demo-report-0",
      user_id: UID,
      type: "monthly",
      period_label: label,
      summary:
        "## Resumo executivo\nO mês fechou com uma taxa de poupança saudável de cerca de 37%. As maiores despesas foram Habitação e Supermercado.\n\n## Principais conclusões\n- Receita de 2200 € e despesa de ~1380 €.\n- Supermercado representa a maior fatia das despesas variáveis.\n- Assinaturas recorrentes somam ~61 €/mês.\n\n## Recomendações\n- Define um teto para restaurantes e revê assinaturas pouco usadas.\n- Automatiza a transferência mensal para o fundo de emergência.",
      data: {
        period: label,
        type: "monthly",
        income,
        expense,
        savings: income - expense,
        savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
        byCategory: expenseByCategory(periodTx),
        evolution: monthlyEvolution(txs, 6, y, m),
        transactionCount: periodTx.length,
        currency: "EUR",
      },
      created_at: NOW.toISOString(),
    },
  ];
}

// ── Respostas de IA simuladas (sem chamar a Claude) ──────────────────────────

/** Resposta canned do assistente, ligeiramente sensível à pergunta. */
export function demoAssistantReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  if (last.includes("reduzir") || last.includes("poupar")) {
    return "Com base nos teus dados (modo demonstração), aqui está onde podes poupar:\n\n• **Restaurantes** — estás 37% acima do habitual. Reduzir para o orçamento de 90 €/mês poupa ~35 €.\n• **Assinaturas** — Netflix + Spotify + MEO somam ~733 €/ano. Reveres o que usas pode libertar ~14 €/mês.\n• **Supermercado** — concentrar compras numa ida semanal costuma reduzir 10–15%.\n\nNo total, estimo uma poupança extra de ~70–90 €/mês sem grande esforço.";
  }
  if (last.includes("gastar") || last.includes("demasiado")) {
    return "No geral estás bem! 👏 Poupas cerca de **37%** do teu rendimento (≈820 €/mês).\n\nO único sinal de alerta é a **restauração**, que este mês está acima do habitual. Tirando isso, os teus gastos estão alinhados com o orçamento.";
  }
  if (last.includes("orçamento") || last.includes("analisa")) {
    return "Análise do teu orçamento (demonstração):\n\n• **Habitação** 750 € — dentro do esperado.\n• **Supermercado** ~276 € de 320 € — ok.\n• **Restaurantes** acima do limite de 90 €.\n• **Combustível** ~115 € de 130 € — ok.\n\nRecomendação: manter o teto da restauração e canalizar a folga (~70 €) para o fundo de emergência.";
  }
  return "Estou em **modo demonstração**, por isso respondo com base nos dados de exemplo. Poupas ~820 €/mês (taxa de 37%), tens 3 metas ativas e algumas assinaturas recorrentes. Pergunta-me, por exemplo, *“como reduzir despesas?”* ou *“analisa o meu orçamento”*.\n\n_Para respostas reais e personalizadas, configura a chave da API Claude._";
}

export function demoLiteracy(topic?: string): { title: string; content: string } {
  const map: Record<string, { title: string; content: string }> = {
    poupanca: {
      title: "Como poupar mais",
      content:
        "## O essencial\nPoupar é pagares a ti próprio primeiro: separa uma quantia assim que recebes, antes de gastar.\n\n## Passos práticos\n- Define uma transferência automática para poupança no dia do ordenado.\n- Usa a regra 50/30/20 (necessidades/desejos/poupança).\n- Revê assinaturas e cancela o que não usas.\n- Compara preços no supermercado e evita compras por impulso.\n- Estabelece um teto mensal para restaurantes e lazer.\n\n## Erro comum a evitar\n- Esperar pelo “que sobra” ao fim do mês — raramente sobra. Automatiza.",
    },
    investimento: {
      title: "Investir do zero",
      content:
        "## O essencial\nInvestir é pôr o dinheiro a trabalhar a longo prazo. Começa só depois de teres um fundo de emergência.\n\n## Passos práticos\n- Garante 3–6 meses de despesas em poupança antes de investir.\n- Aprende sobre diversificação e horizonte temporal.\n- Investe de forma regular e automática (custo médio).\n- Mantém os custos baixos.\n- Não tentes adivinhar o mercado.\n\n## Erro comum a evitar\n- Investir dinheiro de que vais precisar a curto prazo.",
    },
    divida: {
      title: "Sair das dívidas",
      content:
        "## O essencial\nNem todas as dívidas são iguais — ataca primeiro as de juro mais alto.\n\n## Passos práticos\n- Lista todas as dívidas com valor e taxa de juro.\n- Usa o método avalanche (maior juro primeiro) ou bola de neve (menor valor primeiro).\n- Negoceia taxas com o credor.\n- Evita novo crédito enquanto pagas.\n- Cria um pequeno fundo para emergências e não recorrer a crédito.\n\n## Erro comum a evitar\n- Pagar apenas o mínimo do cartão de crédito.",
    },
    emergencia: {
      title: "Fundo de emergência",
      content:
        "## O essencial\nUm fundo de emergência é a tua rede de segurança para imprevistos (saúde, carro, desemprego).\n\n## Passos práticos\n- Objetivo: 3 a 6 meses de despesas essenciais.\n- Guarda-o numa conta separada e acessível.\n- Começa pequeno: 50–100 € por mês já conta.\n- Repõe o fundo sempre que o usares.\n- Não o uses para desejos, só emergências.\n\n## Erro comum a evitar\n- Misturar o fundo com a conta do dia a dia.",
    },
  };
  return map[topic ?? "poupanca"] ?? map.poupanca;
}

/** Transações de exemplo devolvidas pela "extração" simulada. */
export function demoExtracted(): ExtractedTransaction[] {
  const { y, m } = monthYear(0);
  return [
    { date: `${y}-${pad(m)}-02`, description: "NETFLIX.COM", merchant: "Netflix", amount: 13.99, type: "expense", category: "Streaming", confidence: 99, is_subscription: true },
    { date: `${y}-${pad(m)}-05`, description: "Galp Energia", merchant: "Galp", amount: 60, type: "expense", category: "Combustível", confidence: 96 },
    { date: `${y}-${pad(m)}-06`, description: "Uber *trip", merchant: "Uber", amount: 12.4, type: "expense", category: "Transportes", confidence: 98 },
    { date: `${y}-${pad(m)}-03`, description: "Continente", merchant: "Continente", amount: 92.4, type: "expense", category: "Supermercado", confidence: 95 },
    { date: `${y}-${pad(m)}-01`, description: "Ordenado mensal", merchant: "Empresa XYZ", amount: 2200, type: "income", category: "Salário", confidence: 99 },
  ];
}
