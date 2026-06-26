import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes Tailwind de forma segura (resolve conflitos). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata um valor monetário no formato local (por omissão EUR / pt-PT). */
export function formatCurrency(
  value: number,
  currency = "EUR",
  locale = "pt-PT",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

/** Versão compacta (1,2 mil €) para cartões com pouco espaço. */
export function formatCompactCurrency(
  value: number,
  currency = "EUR",
  locale = "pt-PT",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

/** Formata percentagem com sinal opcional. */
export function formatPercent(value: number, withSign = false): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${(value ?? 0).toFixed(1)}%`;
}

/** Formata uma data ISO no formato pt-PT (ex.: 25 jun 2026). */
export function formatDate(date: string | Date, locale = "pt-PT"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Devolve o rótulo do mês (ex.: "Junho 2026"). */
export function monthLabel(year: number, month: number, locale = "pt-PT"): string {
  const d = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Iniciais para avatares (ex.: "Vitor Gonçalves" → "VG"). */
export function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Calcula a variação percentual entre dois valores. */
export function pctChange(current: number, previous: number): number {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Agrupa um array por uma chave derivada. */
export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

/** Limita um número a um intervalo. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
