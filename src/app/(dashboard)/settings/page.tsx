import { Sparkles, LogOut } from "lucide-react";

import { getProfile } from "@/lib/data";
import type { Profile } from "@/lib/types";
import { logout } from "@/app/(auth)/actions";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { UpgradeButton } from "@/components/premium/upgrade-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Definições · Family Budget AI Pro" };

export default async function SettingsPage() {
  const profile = (await getProfile()) as Profile;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Definições" description="Gere a tua conta e preferências." />

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm profile={profile} />
        </CardContent>
      </Card>

      {/* Subscrição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Plano
            <Badge variant={profile?.is_premium ? "default" : "secondary"}>
              {profile?.is_premium ? "Premium" : "Gratuito"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O plano Premium desbloqueia previsões, insights semanais, relatórios
            PDF, modo família e o centro de literacia financeira.
          </p>
          {profile?.is_premium ? (
            <UpgradeButton enable={false} variant="outline">
              Desativar Premium
            </UpgradeButton>
          ) : (
            <UpgradeButton enable>
              <Sparkles className="h-4 w-4" /> Ativar Premium (demo)
            </UpgradeButton>
          )}
        </CardContent>
      </Card>

      {/* Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="outline" className="text-destructive">
              <LogOut className="h-4 w-4" /> Terminar sessão
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
