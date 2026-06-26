"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import type { ExtractedTransaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Phase = "idle" | "reading" | "extracting" | "done" | "error";

/**
 * Componente de upload de extratos. Lê o PDF no browser (com pdf.js para
 * extração de texto de reserva) e envia-o para /api/extract, onde a IA
 * extrai e categoriza as transações.
 */
export function UploadDropzone() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{
    inserted: number;
    transactions: Array<ExtractedTransaction & { amount: number }>;
  } | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Por favor, envia um ficheiro PDF.");
      return;
    }

    setFileName(file.name);
    setResult(null);
    setPhase("reading");

    try {
      const base64 = await fileToBase64(file);
      // Texto de reserva via pdf.js (caso o PDF nativo seja demasiado grande).
      let text = "";
      try {
        text = await extractPdfText(file);
      } catch {
        // pdf.js opcional — ignoramos falhas e usamos o PDF nativo.
      }

      setPhase("extracting");

      // Preferimos o PDF nativo; se for muito grande, enviamos o texto.
      const tooBig = base64.length > 5_500_000; // ~5.5MB base64
      const payload =
        tooBig && text ? { text } : { pdf: base64 };

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na extração.");

      setResult(data);
      setPhase("done");
      toast.success(`${data.inserted} transações importadas com sucesso!`);
      router.refresh();
    } catch (err) {
      setPhase("error");
      toast.error(
        err instanceof Error ? err.message : "Não foi possível processar o PDF.",
      );
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: phase === "reading" || phase === "extracting",
  });

  const busy = phase === "reading" || phase === "extracting";

  if (phase === "done" && result) {
    return (
      <Card>
        <CardContent className="space-y-5 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold">
              {result.inserted} transações importadas
            </h3>
            <p className="text-sm text-muted-foreground">
              A IA extraiu e categorizou os movimentos de {fileName}.
            </p>
          </div>

          {result.transactions?.length > 0 && (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-border p-2">
              {result.transactions.slice(0, 12).map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category}
                      {typeof t.confidence === "number"
                        ? ` · ${Math.round(t.confidence)}%`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular",
                      t.type === "income" ? "text-success" : "text-foreground",
                    )}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPhase("idle");
                setResult(null);
              }}
            >
              Importar outro
            </Button>
            <Button className="flex-1" onClick={() => router.push("/transactions")}>
              Ver transações <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-card/50 hover:border-primary/50 hover:bg-accent/40",
        busy && "pointer-events-none opacity-80",
      )}
    >
      <input {...getInputProps()} />

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <UploadCloud className="h-8 w-8" />
        )}
      </div>

      {phase === "reading" && (
        <p className="text-sm font-medium">A ler o ficheiro…</p>
      )}
      {phase === "extracting" && (
        <p className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          A IA está a extrair e categorizar as transações…
        </p>
      )}
      {(phase === "idle" || phase === "error") && (
        <>
          <p className="text-base font-semibold">
            {isDragActive
              ? "Larga o PDF aqui"
              : "Arrasta o teu extrato bancário"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ou clica para selecionar · apenas PDF
          </p>
          {fileName && phase === "error" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
              <FileText className="h-3.5 w-3.5" /> Falha ao processar {fileName}.
              Tenta novamente.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Converte um ficheiro em string base64 (sem o prefixo data:). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Extrai texto de um PDF no browser usando pdf.js (import dinâmico). */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Worker carregado de CDN, fixado à versão instalada (evita problemas de
  // bundling do worker ESM e garante compatibilidade da API).
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += "\n";
  }
  return text;
}
