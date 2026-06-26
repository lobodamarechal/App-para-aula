import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import type { Profile } from "@/lib/types";

/**
 * Layout do dashboard — protegido. Carrega o utilizador e o seu perfil no
 * servidor e monta a aplicação (sidebar fixa + topbar + conteúdo).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const safeProfile: Profile = (profile as Profile) ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? null,
    avatar_url: null,
    currency: "EUR",
    locale: "pt-PT",
    household_id: user.id,
    is_premium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixa (desktop) */}
      <Sidebar className="hidden lg:flex" isPremium={safeProfile.is_premium} />

      {/* Coluna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={safeProfile} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
