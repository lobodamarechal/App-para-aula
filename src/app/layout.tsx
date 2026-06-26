import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Family Budget AI Pro — Gestão financeira familiar com IA",
  description:
    "Plataforma moderna de gestão financeira familiar alimentada por IA (Claude). Controla despesas, analisa extratos, recebe alertas inteligentes e melhora as tuas decisões financeiras.",
  keywords: [
    "finanças pessoais",
    "orçamento familiar",
    "IA",
    "Claude",
    "gestão de despesas",
  ],
  authors: [{ name: "Family Budget AI Pro" }],
  manifest: undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1115" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
