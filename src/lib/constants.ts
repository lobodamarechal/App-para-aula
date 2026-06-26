import {
  LayoutDashboard,
  Receipt,
  Upload,
  PiggyBank,
  Bell,
  Sparkles,
  Target,
  FileText,
  Lightbulb,
  Users,
  GraduationCap,
  Settings,
  type LucideIcon,
} from "lucide-react";

/** Modelo Claude a utilizar (sobreponível via ANTHROPIC_MODEL). */
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/**
 * Categorias canónicas usadas pela classificação da IA.
 * Devem manter-se em sincronia com o seed em `supabase/schema.sql`.
 */
export const CATEGORIES = [
  "Alimentação",
  "Supermercado",
  "Restaurantes",
  "Transportes",
  "Combustível",
  "Saúde",
  "Educação",
  "Habitação",
  "Água",
  "Luz",
  "Internet",
  "Streaming",
  "Compras",
  "Lazer",
  "Viagens",
  "Salário",
  "Investimentos",
  "Outros",
] as const;

export type CategoryName = (typeof CATEGORIES)[number];

/** Categorias consideradas receita (as restantes são despesa). */
export const INCOME_CATEGORIES: CategoryName[] = ["Salário", "Investimentos"];

/** Mapa nome → cor HEX (para gráficos e badges). Espelha o seed SQL. */
export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#FF9F0A",
  Supermercado: "#FF9500",
  Restaurantes: "#FF6482",
  Transportes: "#5E5CE6",
  Combustível: "#BF5AF2",
  Saúde: "#FF375F",
  Educação: "#0A84FF",
  Habitação: "#30B0C7",
  Água: "#64D2FF",
  Luz: "#FFD60A",
  Internet: "#32ADE6",
  Streaming: "#FF2D55",
  Compras: "#AF52DE",
  Lazer: "#34C759",
  Viagens: "#5AC8FA",
  Salário: "#34C759",
  Investimentos: "#30D158",
  Outros: "#8E8E93",
};

export function categoryColor(name?: string | null): string {
  if (!name) return CATEGORY_COLORS["Outros"];
  return CATEGORY_COLORS[name] ?? CATEGORY_COLORS["Outros"];
}

/** Serviços de streaming/assinatura conhecidos (deteção rápida no cliente). */
export const KNOWN_SUBSCRIPTIONS = [
  "Netflix",
  "Spotify",
  "Amazon Prime",
  "Disney+",
  "HBO Max",
  "Apple Music",
  "Apple TV+",
  "YouTube Premium",
  "Dazn",
  "iCloud",
  "Google One",
  "Dropbox",
  "Microsoft 365",
  "Adobe",
];

/** Itens de navegação da sidebar do dashboard. */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  premium?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transações", href: "/transactions", icon: Receipt },
  { title: "Importar Extrato", href: "/upload", icon: Upload },
  { title: "Orçamento", href: "/budget", icon: PiggyBank },
  { title: "Alertas", href: "/alerts", icon: Bell },
  { title: "Assistente IA", href: "/assistant", icon: Sparkles },
  { title: "Metas", href: "/goals", icon: Target },
  { title: "Insights", href: "/insights", icon: Lightbulb, premium: true },
  { title: "Relatórios", href: "/reports", icon: FileText, premium: true },
  { title: "Família", href: "/family", icon: Users, premium: true },
  { title: "Literacia", href: "/literacy", icon: GraduationCap, premium: true },
  { title: "Definições", href: "/settings", icon: Settings },
];
