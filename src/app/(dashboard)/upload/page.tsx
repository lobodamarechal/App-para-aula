import { Brain, ShieldCheck, Tags } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Importar extrato · Family Budget AI Pro" };

const STEPS = [
  {
    icon: Brain,
    title: "Extração com IA",
    desc: "O Claude lê o teu extrato e identifica data, descrição, valor e tipo.",
  },
  {
    icon: Tags,
    title: "Classificação automática",
    desc: "Cada transação recebe uma categoria e um nível de confiança.",
  },
  {
    icon: ShieldCheck,
    title: "Privado e seguro",
    desc: "Os dados ficam associados apenas à tua conta, protegidos por RLS.",
  },
];

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar extrato"
        description="Faz upload de um extrato bancário em PDF e deixa a IA fazer o resto."
      />

      <UploadDropzone />

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <Card key={s.title}>
            <CardContent className="space-y-2 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
