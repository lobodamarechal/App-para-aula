import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint de callback da autenticação Supabase.
 * Troca o `code` recebido (confirmação de email / recuperação de password)
 * por uma sessão válida e redireciona para o destino apropriado.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Falha → volta ao login com indicação de erro.
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
