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
  color?: "blue" | "green" | "orange" | "purple" | "red"
  className?: string
}

const colorMap = {
  blue: "from-blue-500/20 to-blue-400/10 border-blue-900/30 text-blue-400",
  green: "from-green-500/20 to-green-400/10 border-green-900/30 text-green-400",
  orange: "from-orange-500/20 to-orange-400/10 border-orange-900/30 text-orange-400",
  purple: "from-purple-500/20 to-purple-400/10 border-purple-900/30 text-purple-400",
  red: "from-red-500/20 to-red-400/10 border-red-900/30 text-red-400",
}

const trendColorMap = {
  up: "text-emerald-500",
  down: "text-rose-500",
  neutral: "text-slate-500",
}

export function MetricCard({
  icon,
  label,
  value,
  unit = "",
  change = 0,
  trend = "neutral",
  color = "blue",
  className,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col p-4 rounded-xl border bg-gradient-to-br bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:border-slate-700/50 hover:bg-slate-900/60",
        colorMap[color],
        className
      )}
    >
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            {icon}
          </div>
        )}
        <span className="text-xs text-slate-400 font-semibold">{label}</span>
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-1 mb-2">
        <motion.span
          className="text-2xl sm:text-3xl font-extrabold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {value}
        </motion.span>
        {unit && (
          <span className="text-xs font-semibold text-slate-400">{unit}</span>
        )}
      </div>

      {/* Change % with trend */}
      {change !== 0 && (
        <motion.div
          className={cn("flex items-center gap-1 text-[11px] font-bold", trendColorMap[trend])}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
          {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
          {trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
          <span>{Math.abs(change)}%</span>
        </motion.div>
      )}
    </motion.div>
  )
}
