"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

import { getInitials } from "@/lib/utils";
import type { FamilyMember } from "@/lib/types";
import {
  inviteFamilyMember,
  removeFamilyMember,
} from "@/app/(dashboard)/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function FamilyManager({ members }: { members: FamilyMember[] }) {
  const [pending, startTransition] = useTransition();

  function onInvite(formData: FormData) {
    startTransition(async () => {
      const res = await inviteFamilyMember(formData);
      if (res?.error) toast.error(res.error);
      else toast.success("Convite enviado!");
    });
  }

  return (
    <div className="space-y-6">
      {/* Formulário de convite */}
      <Card>
        <CardContent className="py-5">
          <form
            action={onInvite}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <label htmlFor="member_email" className="text-sm font-medium">
                Convidar membro da família
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member_email"
                  name="member_email"
                  type="email"
                  placeholder="email@familia.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Convidar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de membros */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ainda não convidaste ninguém. Os membros partilham o orçamento da
            família.
          </p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Avatar>
                <AvatarFallback>{getInitials(m.member_email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.member_email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {m.role}
                </p>
              </div>
              <Badge
                variant={m.status === "active" ? "success" : "secondary"}
              >
                {m.status === "active" ? "Ativo" : "Pendente"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={pending}
                aria-label="Remover membro"
                onClick={() =>
                  startTransition(async () => {
                    await removeFamilyMember(m.id);
                    toast.success("Membro removido.");
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
