import { createClient } from "@/lib/supabase/server";
import { getClaude } from "@/lib/claude/client";
import { assistantSystem } from "@/lib/claude/prompts";
import { buildFinancialContext } from "@/lib/finance";
import { CLAUDE_MODEL } from "@/lib/constants";
import { DEMO_MODE, demoAssistantReply } from "@/lib/demo";
import type { Transaction, Budget, ChatMessage } from "@/lib/types";

export const maxDuration = 60;

/** Stream de texto simples a partir de uma string (usado no modo demo). */
function textStream(text: string): Response {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/); // mantém espaços para efeito de escrita
  const stream = new ReadableStream({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(encoder.encode(w));
        // Pequena pausa para simular streaming.
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}

/**
 * POST /api/assistant
 * Body: { messages: ChatMessage[] }
 * Responde via streaming usando os dados financeiros reais do utilizador.
 */
export async function POST(request: Request) {
  let body: { messages: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return new Response("Pedido inválido.", { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m) => m.role === "user" || m.role === "assistant",
  );
  if (messages.length === 0) {
    return new Response("Sem mensagens.", { status: 400 });
  }

  // Modo demonstração: resposta simulada (sem chamar a Claude nem a BD).
  if (DEMO_MODE) {
    return textStream(demoAssistantReply(messages));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Não autenticado." }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Constrói o contexto financeiro a partir dos dados do utilizador.
  const [{ data: txs }, { data: budgets }, { data: profile }] =
    await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("budgets").select("*"),
      supabase.from("profiles").select("currency").eq("id", user.id).single(),
    ]);

  const context = buildFinancialContext(
    (txs as Transaction[]) ?? [],
    (budgets as Budget[]) ?? [],
    { currency: (profile as { currency?: string })?.currency ?? "EUR" },
  );

  const claude = getClaude();

  // Stream da resposta para o cliente (text/plain incremental).
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = claude.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 1500,
          system: assistantSystem(context),
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        claudeStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await claudeStream.finalMessage();
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro no assistente.";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
