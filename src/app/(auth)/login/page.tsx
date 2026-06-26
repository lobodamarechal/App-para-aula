"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { login, type AuthState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthMessage } from "@/components/auth/auth-message";
import { DemoBanner } from "@/components/demo-banner";

const initial: AuthState = {};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initial);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">
          Entra na tua conta para gerir as tuas finanças.
        </p>
      </div>

      <DemoBanner />

      <form action={formAction} className="space-y-4">
        <AuthMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@exemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueceste-te?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        <SubmitButton className="w-full" size="lg">
          Entrar
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Cria uma gratuitamente
        </Link>
      </p>
    </div>
  );
}
