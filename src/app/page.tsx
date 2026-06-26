import Link from "next/link";
import {
  Sparkles,
  Upload,
  PiggyBank,
  Bell,
  LineChart,
  ShieldCheck,
  ArrowRight,
  Target,
  Brain,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/marketing/reveal";
import { DemoBanner } from "@/components/demo-banner";

const FEATURES = [
  {
    icon: Upload,
    title: "Análise de extratos com IA",
    desc: "Faz upload do teu extrato em PDF e o Claude extrai e categoriza cada movimento automaticamente.",
  },
  {
    icon: Brain,
    title: "Classificação inteligente",
    desc: "Cada transação recebe uma categoria e um nível de confiança. Uber → Transportes (98%).",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    desc: "Avisos quando gastas acima do habitual, deteção de despesas anormais e cobranças suspeitas.",
  },
  {
    icon: PiggyBank,
    title: "Orçamento por categoria",
    desc: "Define limites mensais e acompanha orçamento vs real com gráficos claros.",
  },
  {
    icon: Target,
    title: "Metas financeiras",
    desc: "Fundo de emergência, viagem, casa ou carro — acompanha o progresso e o tempo estimado.",
  },
  {
    icon: LineChart,
    title: "Previsão & Score",
    desc: "Estima o teu saldo futuro e recebe um Score Financeiro de 0 a 100 com sugestões.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fundo com gradientes suaves estilo Apple */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-success/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Começar grátis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm font-medium shadow-soft backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Alimentado pela API Claude da Anthropic
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            As finanças da tua família,{" "}
            <span className="bg-gradient-to-br from-primary to-info bg-clip-text text-transparent">
              finalmente claras.
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-pretty text-lg text-muted-foreground">
            Controla despesas, analisa extratos bancários com IA, recebe alertas
            inteligentes e toma melhores decisões financeiras — tudo num design
            que parece da Apple.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Criar conta gratuita <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            Os teus dados são privados e protegidos com encriptação ao nível da linha.
          </p>
        </Reveal>

        <div className="w-full max-w-md">
          <DemoBanner />
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-3xl border border-border bg-card/70 p-6 shadow-soft backdrop-blur transition-all hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="container pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-info p-10 text-center text-primary-foreground shadow-soft-lg md:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Começa hoje a poupar de forma inteligente.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
              Cria a tua conta em segundos. Sem cartão de crédito.
            </p>
            <Button
              size="lg"
              variant="glass"
              asChild
              className="mt-6 text-foreground"
            >
              <Link href="/register">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <Brand />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Family Budget AI Pro. Feito com IA.
          </p>
        </div>
      </footer>
    </div>
  );
}
