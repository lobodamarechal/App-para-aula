import Anthropic from "@anthropic-ai/sdk";

/**
 * Cliente Anthropic (Claude) partilhado pelas rotas de API do servidor.
 * A chave nunca é exposta ao cliente — vive apenas em ANTHROPIC_API_KEY.
 */
let cached: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não definida. Configura-a no teu .env.local.",
    );
  }
  if (!cached) {
    cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cached;
}
