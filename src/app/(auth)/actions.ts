"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  success?: string;
}

/** Início de sessão com email + password. */
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preenche o email e a password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: traduzErro(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Registo de novo utilizador. O trigger SQL cria o profile automaticamente. */
export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preenche todos os campos." };
  }
  if (password.length < 8) {
    return { error: "A password deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: traduzErro(error.message) };
  }

  // Se a confirmação de email estiver desativada, a sessão já existe.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    success:
      "Conta criada! Verifica o teu email para confirmar a conta antes de entrar.",
  };
}

/** Envia email de recuperação de password. */
export async function forgotPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Indica o teu email." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: traduzErro(error.message) };

  return {
    success: "Enviámos-te um email com instruções para redefinir a password.",
  };
}

/** Define uma nova password (após clicar no link de recuperação). */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    return { error: "A password deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: traduzErro(error.message) };

  redirect("/dashboard");
}

/** Termina a sessão. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/** Traduz mensagens de erro comuns do Supabase para português. */
function traduzErro(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email ou password incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este email já está registado. Tenta entrar.";
  if (m.includes("email not confirmed"))
    return "Confirma o teu email antes de entrar.";
  if (m.includes("rate limit"))
    return "Demasiadas tentativas. Aguarda um momento.";
  return message;
}
