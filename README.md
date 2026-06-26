# 💳 Family Budget AI Pro

Plataforma moderna de **gestão financeira familiar** alimentada por Inteligência
Artificial através da **API Claude (Anthropic)**. Controla despesas, analisa
extratos bancários, recebe alertas inteligentes e toma melhores decisões
financeiras — tudo num design inspirado na Apple (Wallet, Health, Stocks, Card,
iCloud).

> Construído com Next.js 14 (App Router), TypeScript, TailwindCSS, Supabase e a
> API Claude. Mobile-first, com Dark/Light Mode e glassmorphism subtil.

---

## ✨ Funcionalidades

### Núcleo
- 🔐 **Autenticação completa** — registo, login, recuperação de password e sessão persistente (Supabase Auth).
- 📊 **Dashboard principal** — saldo total, receita, despesa, poupança, taxa de poupança e objetivos, em cartões animados estilo Apple Wallet.
- 📄 **Importação de extratos (PDF)** — drag & drop com extração automática via Claude (data, descrição, valor, tipo).
- 🏷️ **Classificação inteligente** — 18 categorias com nível de confiança (ex.: `Uber → Transportes (98%)`).
- 💰 **Gestão de orçamento** — limites mensais por categoria, guardados em Supabase.
- 🔔 **Alertas inteligentes** — desvios > 10%/20%, despesas anormais, compras fora do padrão e quebras de rendimento.
- 📈 **Orçamento vs Real** — gráficos de barras, pizza (donut) e evolução mensal.
- 🤖 **Assistente Financeiro IA** — chat com streaming que responde com base nos teus dados reais.

### Premium
- 🔮 **Previsão financeira** — estimativa de saldo a 30 dias, 6 meses e 1 ano.
- 🎯 **Score financeiro (0–100)** — poupança, controlo de gastos, consistência e cumprimento do orçamento.
- 🏆 **Metas financeiras** — carro, fundo de emergência, viagem, casa — com % concluída e tempo estimado.
- 🔁 **Deteção de assinaturas** — Netflix, Spotify, Prime, Disney+… com custo anual.
- 🕵️ **Deteção de despesas suspeitas** — duplicações e cobranças estranhas.
- 💡 **Insights semanais** — resumos automáticos gerados por IA.
- 📑 **Relatórios PDF** — mensais, trimestrais e anuais (imprimíveis com gráficos + análise IA).
- 👨‍👩‍👧 **Modo Família** — múltiplos membros e orçamento partilhado.
- 🎓 **Centro de Literacia Financeira** — guias IA sobre poupança, investimento, dívida e fundo de emergência.

---

## 🧱 Stack Tecnológica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 18, **Next.js 14 (App Router)**, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion |
| Backend | Node.js, **Next.js API Routes** + Server Actions |
| Base de dados | **Supabase** (PostgreSQL + Row Level Security) |
| Autenticação | **Supabase Auth** |
| IA | **API Claude (Anthropic)** — modelo `claude-opus-4-8` |
| Upload | React Dropzone |
| PDF | pdf.js (`pdfjs-dist`) |
| Gráficos | Recharts |

---

## 📁 Estrutura do Projeto

```
.
├── middleware.ts                # Renova sessão Supabase + protege rotas
├── supabase/
│   └── schema.sql               # Esquema completo (tabelas, RLS, triggers, seed)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (tema, fontes, toaster)
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Design system (tokens light/dark, glass, print)
│   │   ├── (auth)/              # Login, registo, recuperação, reset + actions
│   │   ├── (dashboard)/         # App protegida (layout + páginas + actions)
│   │   │   ├── dashboard/  transactions/  upload/  budget/  alerts/
│   │   │   ├── assistant/  goals/  insights/  reports/  family/
│   │   │   ├── literacy/   settings/
│   │   │   └── actions.ts       # Server actions (CRUD)
│   │   ├── auth/callback/       # Troca de código → sessão
│   │   └── api/                 # Endpoints: extract, assistant, alerts,
│   │                            #   insights, forecast, score, reports, literacy
│   ├── components/
│   │   ├── ui/                  # Primitivos Shadcn/UI
│   │   ├── dashboard/  charts/  transactions/  budget/  goals/
│   │   ├── alerts/  assistant/  reports/  family/  literacy/
│   │   ├── premium/  auth/  ai/  marketing/
│   │   └── brand.tsx · theme-provider.tsx · theme-toggle.tsx
│   └── lib/
│       ├── supabase/            # Clientes (client, server, middleware)
│       ├── claude/              # Cliente, prompts, extração, análise, JSON
│       ├── finance.ts           # Métricas, comparações, contexto IA, assinaturas
│       ├── data.ts              # Fetchers de servidor
│       ├── types.ts · constants.ts · utils.ts
```

---

## 🚀 Começar

### 1. Pré-requisitos
- Node.js **18.17+**
- Conta **Supabase** (gratuita) → https://supabase.com
- Chave da **API Anthropic** → https://console.anthropic.com/settings/keys

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar a base de dados (Supabase)
1. Cria um projeto em https://supabase.com.
2. Abre **SQL Editor** e cola/executa o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   Isto cria todas as tabelas, políticas RLS, triggers e as 18 categorias por omissão.
3. Em **Authentication → Providers**, garante que o *Email* está ativo.
   - Para desenvolvimento rápido podes desativar a confirmação de email
     (**Authentication → Sign In / Providers → Email → Confirm email**: off).

### 4. Variáveis de ambiente
Copia `.env.example` para `.env.local` e preenche:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Project Settings → API
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-8           # opcional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 🔑 Onde encontrar: Supabase Dashboard → **Project Settings → API**
> (`Project URL`, `anon public`, `service_role`).

### 5. Executar localmente
```bash
npm run dev
```
Abre http://localhost:3000.

### Scripts disponíveis
| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos TypeScript |

---

## 🔄 Fluxo de Utilização

```
Login → Dashboard → Importar PDF → Extração Claude → Classificação automática
      → Orçamento → Alertas → Insights IA → Relatórios
```

1. **Regista-te** e inicia sessão.
2. **Importa um extrato** em PDF (página *Importar Extrato*). O Claude extrai e
   categoriza automaticamente cada movimento e guarda-os em Supabase.
3. **Define orçamentos** por categoria.
4. Gera **alertas**, **score**, **previsões** e **insights** com um clique
   (botões "Analisar/Gerar com IA").
5. Conversa com o **Assistente IA** sobre as tuas finanças.
6. Gera **relatórios** e guarda-os em PDF (Imprimir → Guardar como PDF).

---

## 🗄️ Modelo de Dados

Tabelas (todas com **Row Level Security** — cada utilizador só acede aos seus dados):

`profiles` · `categories` · `transactions` · `budgets` · `alerts` ·
`financial_scores` · `goals` · `subscriptions` · `reports` ·
`family_members` · `ai_insights`

- Um **trigger** cria automaticamente o `profile` quando um utilizador se regista.
- As **categorias por omissão** são globais (`user_id IS NULL`) e partilhadas.
- O **Modo Família** usa `household_id` + `family_members`.

Detalhes completos em [`supabase/schema.sql`](supabase/schema.sql).

---

## 🤖 Integração com a API Claude

Toda a IA corre no **servidor** (a chave nunca é exposta ao cliente):

| Endpoint | Função |
| --- | --- |
| `POST /api/extract` | Extrai transações de um PDF (bloco `document` nativo) |
| `POST /api/assistant` | Chat com **streaming**, usando o contexto financeiro real |
| `POST /api/alerts` | Deteta anomalias e gera alertas |
| `POST /api/insights` | Resumo semanal |
| `POST /api/forecast` | Previsão de saldo (30d / 6m / 1a) |
| `POST /api/score` | Score financeiro 0–100 |
| `POST /api/reports` | Relatório com análise IA |
| `POST /api/literacy` | Conteúdo educativo |

- Modelo por omissão: **`claude-opus-4-8`** (configurável via `ANTHROPIC_MODEL`).
- As respostas estruturadas são pedidas em **JSON** e interpretadas com um parser
  tolerante ([`src/lib/claude/json.ts`](src/lib/claude/json.ts)). Com um SDK
  recente podes ativar *structured outputs* (`output_config.format`) para forçar
  o esquema ao nível da API.
- O contexto financeiro enviado à IA é construído em
  [`src/lib/finance.ts`](src/lib/finance.ts) (`buildFinancialContext`).

---

## ☁️ Deploy (Vercel)

1. Faz push do repositório para o GitHub.
2. Em https://vercel.com, **Import Project** e seleciona o repositório.
3. Em **Settings → Environment Variables**, adiciona:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`,
   `NEXT_PUBLIC_SITE_URL` (o domínio final, ex.: `https://o-teu-app.vercel.app`).
4. No **Supabase → Authentication → URL Configuration**, adiciona o domínio do
   Vercel a **Site URL** e a **Redirect URLs**
   (`https://o-teu-app.vercel.app/auth/callback`).
5. **Deploy**. O build (`next build`) corre automaticamente.

> Funciona em qualquer plataforma que suporte Next.js 14 (Vercel recomendado;
> também Netlify, Render, Fly.io, ou Node self-hosted com `npm run build && npm run start`).

### Notas de produção
- As rotas de IA podem demorar — `maxDuration` está definido em cada route handler.
  Em planos Vercel com limites de tempo curtos, considera o plano Pro para
  extrações de extratos longos.
- O worker do `pdf.js` é carregado de CDN (jsDelivr) fixado à versão instalada.

---

## 🎨 Design System

Inspirado na Apple: glassmorphism subtil, cantos arredondados, sombras suaves,
tipografia SF Pro Display (com fallback nativo `-apple-system`), muito espaço
branco, animações suaves (Framer Motion) e **Dark/Light Mode**. Tokens de cor
em HSL definidos em [`src/app/globals.css`](src/app/globals.css) e
[`tailwind.config.ts`](tailwind.config.ts).

---

## 🔒 Segurança
- **Row Level Security** em todas as tabelas.
- A `ANTHROPIC_API_KEY` e a `SUPABASE_SERVICE_ROLE_KEY` vivem apenas no servidor.
- Middleware protege todas as rotas privadas e renova a sessão.

---

## 📝 Licença
Projeto de demonstração. Usa, adapta e aprende à vontade.

---

Feito com ❤️ e IA · **Family Budget AI Pro**
