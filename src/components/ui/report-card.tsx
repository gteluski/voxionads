"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Lightbulb, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ReportCardProps {
  title: string
  overallHealth: "good" | "warning" | "critical"
  trend: "up" | "down" | "stable"
  issues: string[]
  recommendations: string[]
  onViewReport?: () => void
  className?: string
}

const healthConfig = {
  good: {
    color: "bg-emerald-950/15 border-emerald-900/30 text-emerald-300",
    badge: "🟢 Bom desempenho",
    badgeColor: "bg-emerald-950/50 border-emerald-800/40 text-emerald-400",
  },
  warning: {
    color: "bg-amber-950/15 border-amber-900/30 text-amber-300",
    badge: "🟡 Precisa otimizar",
    badgeColor: "bg-amber-950/50 border-amber-800/40 text-amber-400",
  },
  critical: {
    color: "bg-rose-950/15 border-rose-900/30 text-rose-300",
    badge: "🔴 Crítico",
    badgeColor: "bg-rose-950/50 border-rose-800/40 text-rose-400",
  },
}

const trendConfig = {
  up: { icon: TrendingUp, text: "Melhorando", color: "text-emerald-400" },
  down: { icon: TrendingDown, text: "Piorando", color: "text-rose-400" },
  stable: { icon: Minus, text: "Estável", color: "text-slate-400" },
}

export function ReportCard({
  title,
  overallHealth,
  trend,
  issues,
  recommendations,
  onViewReport,
  className,
}: ReportCardProps) {
  const health = healthConfig[overallHealth]
  const TrendIcon = trendConfig[trend].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className={cn(
        "p-5 rounded-xl border bg-slate-900/30 backdrop-blur-md",
        health.color,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-white text-base">{title}</h3>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", health.badgeColor)}>
          {health.badge}
        </span>
      </div>

      {/* Trend */}
      <div className={cn("flex items-center gap-1.5 text-xs font-semibold mb-4", trendConfig[trend].color)}>
        <TrendIcon className="w-4 h-4" />
        <span>{trendConfig[trend].text}</span>
      </div>

      {/* Issues */}
      <AnimatePresence>
        {issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Problemas detectados
            </div>
            <ul className="space-y-1.5 pl-1">
              {issues.slice(0, 3).map((issue, idx) => (
                <motion.li
                  key={idx}
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className="text-xs text-slate-300 ml-4 list-disc marker:text-rose-400"
                >
                  {issue}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 p-3.5 bg-indigo-950/20 rounded-lg border border-indigo-900/35"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
              <Lightbulb className="w-4 h-4" />
              Recomendações
            </div>
            <ul className="space-y-1.5 pl-1">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className="text-xs text-slate-200 ml-4 list-disc marker:text-indigo-400"
                >
                  {rec}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Report Button */}
      {onViewReport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewReport}
          className="w-full justify-between text-xs border border-transparent hover:border-slate-800/80 hover:bg-slate-900/60 text-slate-300 hover:text-white"
        >
          Ver relatório completo
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  )
}
