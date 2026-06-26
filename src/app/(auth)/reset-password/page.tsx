"use client";

import { useFormState } from "react-dom";

import { updatePassword, type AuthState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthMessage } from "@/components/auth/auth-message";

const initial: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(updatePassword, initial);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Nova password</h1>
        <p className="text-sm text-muted-foreground">
          Define a tua nova password de acesso.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <AuthMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="password">Nova password</Label>
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
          Guardar nova password
        </SubmitButton>
      </form>
    </div>
  );
}
