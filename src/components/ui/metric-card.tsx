"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  icon?: React.ReactNode
  label: string
  value: string | number
  unit?: string
  change?: number
  trend?: "up" | "down" | "neutral"
  /** accent color variant for the card */
  color?: "orange" | "success" | "warning" | "info" | "muted"
  className?: string
  /** stagger index for entrance animation */
  index?: number
}

const colorMap: Record<NonNullable<MetricCardProps["color"]>, {
  iconBg: string;
  valueColor: string;
  borderHover: string;
}> = {
  orange:  { iconBg: "rgba(241,133,53,0.12)",  valueColor: "#f18535",  borderHover: "rgba(241,133,53,0.5)"  },
  success: { iconBg: "rgba(76,175,80,0.12)",   valueColor: "#4CAF50",  borderHover: "rgba(76,175,80,0.5)"   },
  warning: { iconBg: "rgba(255,152,0,0.12)",   valueColor: "#FF9800",  borderHover: "rgba(255,152,0,0.5)"   },
  info:    { iconBg: "rgba(33,150,243,0.12)",  valueColor: "#2196F3",  borderHover: "rgba(33,150,243,0.5)"  },
  muted:   { iconBg: "rgba(216,197,182,0.08)", valueColor: "#d8c5b6",  borderHover: "rgba(216,197,182,0.3)" },
}

const trendConfig = {
  up:      { icon: TrendingUp,   color: "#4CAF50",  label: "alta" },
  down:    { icon: TrendingDown, color: "#F44336",  label: "queda" },
  neutral: { icon: Minus,        color: "#FF9800",  label: "estável" },
}

export function MetricCard({
  icon,
  label,
  value,
  unit = "",
  change = 0,
  trend = "neutral",
  color = "orange",
  className,
  index = 0,
}: MetricCardProps) {
  const c = colorMap[color]
  const TrendIcon = trendConfig[trend].icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0, 0, 0.2, 1] }}
      whileHover={{ scale: 1.015 }}
      className={cn("vx-card cursor-default select-none", className)}
      style={{ padding: "var(--space-5)" }}
    >
      {/* Header: icon + label */}
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: c.iconBg, border: `1px solid ${c.borderHover}` }}
          >
            <span style={{ color: c.valueColor }}>{icon}</span>
          </div>
        )}
        <span
          className="font-bold tracking-wide uppercase text-right"
          style={{
            fontSize: "var(--fs-tiny)",
            letterSpacing: "0.07em",
            color: "var(--color-accent-muted)",
            fontFamily: "var(--font-body)",
            marginLeft: icon ? "auto" : 0,
          }}
        >
          {label}
        </span>
      </div>

      {/* Main value */}
      <motion.div
        className="flex items-baseline gap-1 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.06 + 0.15 }}
      >
        <span
          className="font-black leading-none"
          style={{
            fontSize: "1.75rem",
            color: c.valueColor,
            fontFamily: "var(--font-mono)",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="font-bold"
            style={{ fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}
          >
            {unit}
          </span>
        )}
      </motion.div>

      {/* Trend badge */}
      {change !== 0 && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 + 0.25 }}
        >
          <TrendIcon
            size={12}
            style={{ color: trendConfig[trend].color, flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "var(--fs-tiny)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: trendConfig[trend].color,
            }}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}{Math.abs(change)}%
          </span>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--color-accent-dim)" }}>
            vs. mês anterior
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
