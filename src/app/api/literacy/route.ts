import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { runText } from "@/lib/claude/analyze";

export const maxDuration = 60;

const TOPICS: Record<string, string> = {
  poupanca: "estratégias práticas de poupança no dia a dia",
  investimento: "noções básicas de investimento para iniciantes (sem recomendar produtos específicos)",
  divida: "gestão e redução de dívida de forma saudável",
  emergencia: "como construir um fundo de emergência",
};

/** POST /api/literacy — gera conteúdo educativo sobre um tema financeiro. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { topic } = (await request.json().catch(() => ({}))) as {
    topic?: string;
  };
  const subject = TOPICS[topic ?? ""] ?? TOPICS.poupanca;

  try {
    const content = await runText({
      system: `És um educador financeiro. Escreve um guia curto e acessível em português europeu (markdown) sobre ${subject}.

Estrutura:
## O essencial
(2-3 frases)
## Passos práticos
(4-5 bullets acionáveis)
## Erro comum a evitar
(1 bullet)

Tom encorajador e claro. Máximo ~250 palavras. Não dês conselhos de investimento específicos nem garantias de retorno.`,
      user: `Ensina-me sobre ${subject}.`,
      maxTokens: 800,
    });

    const titles: Record<string, string> = {
      poupanca: "Como poupar mais",
      investimento: "Investir do zero",
      divida: "Sair das dívidas",
      emergencia: "Fundo de emergência",
    };

    const { data, error } = await supabase
      .from("ai_insights")
      .insert({
        user_id: user.id,
        type: "literacy",
        title: titles[topic ?? "poupanca"] ?? "Literacia financeira",
        content,
        data: { topic },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ insight: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao gerar conteúdo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
