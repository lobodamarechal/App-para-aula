"use client";

import { useState } from "react";
import {
  PiggyBank,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { AiInsight } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleMarkdown } from "@/components/ai/simple-markdown";

interface Topic {
  key: string;
  label: string;
  desc: string;
  icon: LucideIcon;
}

const TOPICS: Topic[] = [
  { key: "poupanca", label: "Poupança", desc: "Estratégias do dia a dia", icon: PiggyBank },
  { key: "investimento", label: "Investimento", desc: "Noções para iniciantes", icon: TrendingUp },
  { key: "divida", label: "Gestão de dívida", desc: "Reduzir de forma saudável", icon: CreditCard },
  { key: "emergencia", label: "Fundo de emergência", desc: "Construir uma rede", icon: ShieldCheck },
];

export function LiteracyCenter({ recent }: { recent: AiInsight[] }) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [content, setContent] = useState<{ title: string; body: string } | null>(
    recent[0] ? { title: recent[0].title, body: recent[0].content } : null,
  );

  async function generate(topic: Topic) {
    setLoadingKey(topic.key);
    try {
      const res = await fetch("/api/literacy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: topic.key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar conteúdo.");
      setContent({ title: data.insight.title, body: data.insight.content });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar conteúdo.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Tópicos */}
      <div className="space-y-3 lg:col-span-2">
        {TOPICS.map((t) => (
          <button
            key={t.key}
            onClick={() => generate(t)}
            disabled={loadingKey !== null}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-soft disabled:opacity-60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {loadingKey === t.key ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <t.icon className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-3">
        <Card className="min-h-[300px]">
          <CardContent className="py-6">
            {content ? (
              <>
                <h3 className="mb-3 text-lg font-semibold">{content.title}</h3>
                <SimpleMarkdown content={content.body} />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Escolhe um tema à esquerda para a IA gerar um guia
                  personalizado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
