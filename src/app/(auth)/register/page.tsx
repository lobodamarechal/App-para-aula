"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { register, type AuthState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthMessage } from "@/components/auth/auth-message";

const initial: AuthState = {};

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, initial);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Cria a tua conta</h1>
        <p className="text-sm text-muted-foreground">
          Começa a controlar as finanças da tua família em segundos.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <AuthMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Vitor Gonçalves"
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>

        <SubmitButton className="w-full" size="lg">
          Criar conta
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tens conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entra aqui
        </Link>
      </p>
    </div>
  );
}
