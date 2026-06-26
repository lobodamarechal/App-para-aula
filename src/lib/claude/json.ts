/**
 * Parser tolerante de JSON devolvido pela IA.
 * Remove blocos de código markdown (```json … ```) e extrai o primeiro
 * objeto/array JSON válido, tornando o parsing robusto independentemente da
 * versão do SDK ou de pequenas variações de formatação.
 */
export function parseJsonLoose<T = unknown>(raw: string): T {
  if (!raw) throw new Error("Resposta vazia da IA.");

  let text = raw.trim();

  // Remove cercas de código markdown.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Tenta parse direto.
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fallback: extrai do primeiro { ou [ até ao último } ou ].
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as T;
    }
    throw new Error("Não foi possível interpretar a resposta da IA como JSON.");
  }
}

/** Extrai o primeiro bloco de texto de uma resposta Claude. */
export function firstText(
  content: Array<{ type: string; text?: string }>,
): string {
  const block = content.find((b) => b.type === "text" && "text" in b);
  return (block as { text?: string })?.text ?? "";
}
