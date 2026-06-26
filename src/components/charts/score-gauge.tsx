"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Medidor circular animado para o Score Financeiro (0-100). */
export function ScoreGauge({
  value,
  size = 180,
}: {
  value: number;
  size?: number;
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75
      ? "hsl(var(--success))"
      : clamped >= 50
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  const label =
    clamped >= 80
      ? "Excelente"
      : clamped >= 65
        ? "Muito bom"
        : clamped >= 50
          ? "Razoável"
          : clamped >= 30
            ? "A melhorar"
            : "Frágil";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={12}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-4xl font-semibold tabular")}>{clamped}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
