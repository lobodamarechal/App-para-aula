import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware Next.js — renova a sessão Supabase e protege rotas privadas.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas as rotas exceto:
     * - ficheiros estáticos (_next/static, _next/image)
     * - favicon e imagens
     * - rotas de API (gerem a sua própria autenticação)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
