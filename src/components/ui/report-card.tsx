"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Lightbulb, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
    borderColor: "#4CAF50",
    bg:          "rgba(76,175,80,0.04)",
    badge:       "🟢 Bom desempenho",
    badgeBg:     "rgba(76,175,80,0.12)",
    badgeBorder: "rgba(76,175,80,0.35)",
    badgeText:   "#4CAF50",
  },
  warning: {
    borderColor: "#FF9800",
    bg:          "rgba(255,152,0,0.04)",
    badge:       "🟡 Precisa otimizar",
    badgeBg:     "rgba(255,152,0,0.12)",
    badgeBorder: "rgba(255,152,0,0.35)",
    badgeText:   "#FF9800",
  },
  critical: {
    borderColor: "#F44336",
    bg:          "rgba(244,67,54,0.04)",
    badge:       "🔴 Crítico",
    badgeBg:     "rgba(244,67,54,0.12)",
    badgeBorder: "rgba(244,67,54,0.35)",
    badgeText:   "#F44336",
  },
}

const trendConfig = {
  up:     { icon: TrendingUp,   text: "Melhorando", color: "#4CAF50"  },
  down:   { icon: TrendingDown, text: "Piorando",   color: "#F44336"  },
  stable: { icon: Minus,        text: "Estável",    color: "#FF9800"  },
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
  const h = healthConfig[overallHealth]
  const t = trendConfig[trend]
  const TrendIcon = t.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.05 }}
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        background: h.bg,
        border: `1.5px solid ${h.borderColor}`,
        boxShadow: `0 0 16px ${h.borderColor}22`,
        padding: "var(--space-5)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <h3
          className="font-bold leading-snug"
          style={{
            fontSize: "var(--fs-h4)",
            color: "var(--color-accent-light)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {title}
        </h3>
        <span
          className="vx-badge whitespace-nowrap"
          style={{
            background: h.badgeBg,
            borderColor: h.badgeBorder,
            color: h.badgeText,
          }}
        >
          {h.badge}
        </span>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5 mb-4">
        <TrendIcon size={14} style={{ color: t.color }} />
        <span
          className="font-bold"
          style={{
            fontSize: "var(--fs-small)",
            color: t.color,
            fontFamily: "var(--font-body)",
          }}
        >
          {t.text}
        </span>
      </div>

      {/* Issues */}
      <AnimatePresence>
        {issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 rounded-lg overflow-hidden"
            style={{
              background: "rgba(244,67,54,0.06)",
              border: "1px solid rgba(244,67,54,0.2)",
              padding: "var(--space-3)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle size={13} style={{ color: "#F44336" }} />
              <span
                className="font-bold uppercase tracking-wider"
                style={{ fontSize: "var(--fs-tiny)", color: "#F44336" }}
              >
                Problemas detectados
              </span>
            </div>
            <ul className="space-y-1">
              {issues.slice(0, 3).map((issue, idx) => (
                <motion.li
                  key={idx}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex items-start gap-2"
                >
                  <span style={{ color: "#F44336", fontSize: "var(--fs-small)", lineHeight: 1.8 }}>•</span>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>{issue}</span>
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
            className="mb-4 rounded-lg overflow-hidden"
            style={{
              background: "rgba(241,133,53,0.06)",
              border: "1px solid rgba(241,133,53,0.2)",
              padding: "var(--space-3)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb size={13} style={{ color: "var(--color-primary)" }} />
              <span
                className="font-bold uppercase tracking-wider"
                style={{ fontSize: "var(--fs-tiny)", color: "var(--color-primary)" }}
              >
                Recomendações
              </span>
            </div>
            <ul className="space-y-1">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.07 }}
                  className="flex items-start gap-2"
                >
                  <span style={{ color: "var(--color-primary)", fontSize: "var(--fs-small)", lineHeight: 1.8 }}>•</span>
                  <span style={{ fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      {onViewReport && (
        <button
          onClick={onViewReport}
          className="flex items-center gap-1.5 font-bold w-full justify-center py-2 rounded-lg transition-all"
          style={{
            fontSize: "var(--fs-small)",
            color: "var(--color-primary)",
            fontFamily: "var(--font-body)",
            background: "rgba(241,133,53,0.08)",
            border: "1px solid rgba(241,133,53,0.25)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(241,133,53,0.15)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--glow-orange-sm)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(241,133,53,0.08)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          Ver relatório completo
          <ArrowRight size={13} />
        </button>
      )}
    </motion.div>
  )
}
