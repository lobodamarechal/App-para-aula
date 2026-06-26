"use client";

import { useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import type { Profile } from "@/lib/types";
import { updateProfile } from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const CURRENCIES = ["EUR", "USD", "GBP", "BRL", "CHF"];

export function SettingsForm({ profile }: { profile: Profile }) {
  const [currency, setCurrency] = useState(profile.currency ?? "EUR");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    formData.set("currency", currency);
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) toast.error(res.error);
      else toast.success("Perfil atualizado.");
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          placeholder="O teu nome"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile.email ?? ""}
          disabled
          className="opacity-70"
        />
        <p className="text-xs text-muted-foreground">
          O email não pode ser alterado.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Moeda</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Guardar alterações
      </Button>
    </form>
  );
}
