"use client";

import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon, Sparkles } from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { logout } from "@/app/(auth)/actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        {/* Botão de menu (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="lg:hidden">
          <Brand compact />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {profile.is_premium ? (
            <Badge variant="default" className="hidden gap-1 sm:inline-flex">
              <Sparkles className="h-3 w-3" /> Premium
            </Badge>
          ) : null}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="truncate">{profile.full_name ?? "Utilizador"}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings">
                  <UserIcon /> Definições
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={logout}>
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <LogOut /> Terminar sessão
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Drawer de navegação (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full animate-fade-in",
            )}
          >
            <div className="relative h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </Button>
              <Sidebar
                className="flex h-full"
                isPremium={profile.is_premium}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
