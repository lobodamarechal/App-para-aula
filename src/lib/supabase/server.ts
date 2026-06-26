import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Cliente Supabase para o servidor (Server Components, Route Handlers, Actions).
 * Lê/escreve a sessão a partir dos cookies do Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` chamado a partir de um Server Component — pode ser
            // ignorado se existir middleware a renovar a sessão.
          }
        },
      },
    },
  );
}

/**
 * Cliente "admin" com a service role key — usado apenas em rotas de servidor
 * para operações privilegiadas (ex.: inserir transações extraídas pela IA
 * em nome do utilizador autenticado). NUNCA importar em código de cliente.
 */
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
