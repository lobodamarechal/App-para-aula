import Link from "next/link";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

/** Layout partilhado pelas páginas de autenticação (split com painel lateral). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Painel esquerdo — formulário */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/">
            <Brand />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Painel direito — visual (apenas em desktop) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-info lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <blockquote className="max-w-md text-2xl font-medium leading-snug tracking-tight">
            “Pela primeira vez percebo para onde vai o dinheiro da minha família —
            e o assistente IA diz-me exatamente onde poupar.”
          </blockquote>
          <p className="mt-4 text-sm text-primary-foreground/80">
            — Uma família mais tranquila com a Family Budget AI Pro
          </p>
        </div>
      </div>
    </div>
  );
}
