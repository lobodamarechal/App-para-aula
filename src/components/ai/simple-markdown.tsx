import { Fragment } from "react";

/**
 * Renderizador de markdown mínimo e seguro (sem dependências externas).
 * Suporta **negrito**, listas com "- " e parágrafos. Texto é escapado por
 * React (não usamos dangerouslySetInnerHTML).
 */
export function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <Fragment key={i} />;

        // Item de lista
        if (/^[-*•]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

/** Processa **negrito** em texto simples. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
