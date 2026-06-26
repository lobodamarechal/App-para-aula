import type Anthropic from "@anthropic-ai/sdk";

import { getClaude } from "./client";
import { parseJsonLoose, firstText } from "./json";
import { EXTRACTION_SYSTEM, CLASSIFY_SYSTEM } from "./prompts";
import { CATEGORIES, CLAUDE_MODEL } from "@/lib/constants";
import type { ExtractedTransaction } from "@/lib/types";

/**
 * Instrução de formato anexada aos pedidos de extração/classificação.
 * Pedimos JSON puro e fazemos parsing tolerante (ver json.ts), o que torna a
 * integração robusta em qualquer versão do SDK. (Com um SDK recente poderias
 * usar `output_config: { format: { type: "json_schema", schema } }` para
 * forçar o esquema ao nível da API.)
 */
const JSON_FORMAT_HINT = `

Responde APENAS com um objeto JSON válido, sem texto antes ou depois e sem blocos de código markdown, no formato:
{"transactions": [{"date": "YYYY-MM-DD", "description": "...", "merchant": "... ou null", "amount": 0.00, "type": "income|expense", "category": "...", "confidence": 0-100, "is_subscription": false}]}`;

/**
 * Extrai transações de um extrato bancário em PDF (base64) usando Claude.
 * O documento é enviado como bloco `document` nativo da Messages API.
 */
export async function extractTransactionsFromPDF(
  base64Pdf: string,
): Promise<ExtractedTransaction[]> {
  const claude = getClaude();

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system: EXTRACTION_SYSTEM + JSON_FORMAT_HINT,
    messages: [
      {
        role: "user",
        // Bloco `document` (PDF nativo). Convertido via unknown para ser
        // compatível com qualquer versão dos tipos do SDK.
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text: "Extrai todas as transações deste extrato bancário.",
          },
        ] as unknown as Anthropic.MessageParam["content"],
      },
    ],
  });

  const parsed = parseJsonLoose<{ transactions?: unknown[] }>(
    firstText(response.content),
  );
  return normalize(parsed.transactions ?? []);
}

/**
 * Extrai transações a partir de texto simples (fallback quando o PDF já foi
 * convertido para texto no cliente via pdf.js).
 */
export async function extractTransactionsFromText(
  text: string,
): Promise<ExtractedTransaction[]> {
  const claude = getClaude();

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system: EXTRACTION_SYSTEM + JSON_FORMAT_HINT,
    messages: [
      {
        role: "user",
        content: `Extrai todas as transações deste texto de extrato bancário:\n\n${text}`,
      },
    ],
  });

  const parsed = parseJsonLoose<{ transactions?: unknown[] }>(
    firstText(response.content),
  );
  return normalize(parsed.transactions ?? []);
}

/**
 * (Re)classifica uma lista de transações simples (descrição + valor).
 * Usado para recategorizar ou classificar movimentos importados.
 */
export async function classifyTransactions(
  items: Array<{ description: string; amount: number; date?: string }>,
): Promise<ExtractedTransaction[]> {
  if (items.length === 0) return [];
  const claude = getClaude();

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    system: CLASSIFY_SYSTEM + JSON_FORMAT_HINT,
    messages: [
      {
        role: "user",
        content: `Classifica estas transações e devolve-as no formato pedido:\n${JSON.stringify(
          items,
          null,
          2,
        )}`,
      },
    ],
  });

  const parsed = parseJsonLoose<{ transactions?: unknown[] }>(
    firstText(response.content),
  );
  return normalize(parsed.transactions ?? []);
}

/** Normaliza e valida os campos devolvidos pela IA. */
function normalize(raw: unknown[]): ExtractedTransaction[] {
  const allowed = new Set<string>(CATEGORIES);
  return raw
    .map((r) => {
      const t = r as Record<string, unknown>;
      const amount = Math.abs(Number(t.amount) || 0);
      const category = allowed.has(String(t.category))
        ? String(t.category)
        : "Outros";
      return {
        date: String(t.date ?? new Date().toISOString().slice(0, 10)),
        description: String(t.description ?? "Transação"),
        merchant: t.merchant ? String(t.merchant) : undefined,
        amount,
        type: t.type === "income" ? "income" : "expense",
        category,
        confidence: Math.min(100, Math.max(0, Number(t.confidence) || 50)),
        is_subscription: Boolean(t.is_subscription),
      } as ExtractedTransaction;
    })
    .filter((t) => t.amount > 0 && t.description);
}
