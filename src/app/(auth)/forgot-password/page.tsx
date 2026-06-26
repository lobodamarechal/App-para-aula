"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { forgotPassword, type AuthState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthMessage } from "@/components/auth/auth-message";

const initial: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPassword, initial);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Recuperar password
        </h1>
        <p className="text-sm text-muted-foreground">
          Indica o teu email e enviamos-te um link para criar uma nova password.
        </p>
      </div>

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

        <SubmitButton className="w-full" size="lg">
          Enviar link de recuperação
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Lembraste-te?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
