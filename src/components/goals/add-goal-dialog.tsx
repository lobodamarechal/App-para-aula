"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { addGoal } from "@/app/(dashboard)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PRESETS = [
  { name: "Fundo de emergência", icon: "ShieldCheck" },
  { name: "Comprar carro", icon: "Car" },
  { name: "Viagem", icon: "Plane" },
  { name: "Casa", icon: "Home" },
  { name: "Outro objetivo", icon: "Target" },
];

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState(PRESETS[0].name);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const chosen = PRESETS.find((p) => p.name === preset);
    formData.set("icon", chosen?.icon ?? "Target");
    startTransition(async () => {
      const res = await addGoal(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Meta criada!");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nova meta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova meta financeira</DialogTitle>
          <DialogDescription>
            Define um objetivo e acompanha o teu progresso.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da meta</Label>
            <Input
              id="name"
              name="name"
              defaultValue={preset}
              key={preset}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor alvo (€)</Label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                min="1"
                step="50"
                placeholder="5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_amount">Já tens (€)</Label>
              <Input
                id="current_amount"
                name="current_amount"
                type="number"
                min="0"
                step="50"
                placeholder="0"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_contribution">Poupança/mês (€)</Label>
              <Input
                id="monthly_contribution"
                name="monthly_contribution"
                type="number"
                min="0"
                step="10"
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input id="deadline" name="deadline" type="date" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
