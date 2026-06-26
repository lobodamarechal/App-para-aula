"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Brand } from "@/components/brand";

/**
 * Barra lateral de navegação. Reutilizada no desktop (fixa) e dentro do
 * menu móvel. `onNavigate` permite fechar o drawer ao clicar num item.
 */
export function Sidebar({
  className,
  isPremium,
  onNavigate,
}: {
  className?: string;
  isPremium: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" onClick={onNavigate}>
          <Brand />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const locked = item.premium && !isPremium;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.title}</span>
              {locked && (
                <Lock className="h-3.5 w-3.5 opacity-60" aria-label="Premium" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-info/10 p-4">
          <p className="text-xs font-semibold">Family Budget AI Pro</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Análise financeira inteligente com a API Claude.
          </p>
        </div>
      </div>
    </aside>
  );
}
