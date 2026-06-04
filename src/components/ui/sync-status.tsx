"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Activity, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncStatusProps {
  lastSync: Date
  nextSync?: Date
  status: "success" | "pending" | "error"
  errorMessage?: string
  className?: string
}

export function SyncStatus({
  lastSync,
  nextSync,
  status,
  errorMessage,
  className,
}: SyncStatusProps) {
  const formatTime = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "agora mesmo"
    if (diffMins < 60) return `${diffMins}min atrás`
    const hours = Math.floor(diffMins / 60)
    if (hours < 24) return `${hours}h atrás`
    return `${Math.floor(hours / 24)}d atrás`
  }

  const cfg = {
    success: {
      icon: CheckCircle,
      color: "#4CAF50",
      border: "rgba(76,175,80,0.35)",
      bg: "rgba(76,175,80,0.08)",
      label: "Sucesso",
    },
    pending: {
      icon: Activity,
      color: "#FF9800",
      border: "rgba(255,152,0,0.35)",
      bg: "rgba(255,152,0,0.08)",
      label: "Sincronizando...",
    },
    error: {
      icon: AlertCircle,
      color: "#F44336",
      border: "rgba(244,67,54,0.35)",
      bg: "rgba(244,67,54,0.08)",
      label: "Erro de Sync",
    },
  }[status]

  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center gap-3 flex-wrap", className)}
    >
      {/* Status Pill */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
        style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <motion.div
          animate={status === "pending" ? { rotate: 360 } : { rotate: 0 }}
          transition={status === "pending"
            ? { duration: 1.5, repeat: Infinity, ease: "linear" }
            : {}}
        >
          <Icon size={15} style={{ color: cfg.color }} />
        </motion.div>
        <div>
          <p
            className="font-bold leading-none"
            style={{ fontSize: "var(--fs-small)", color: cfg.color, fontFamily: "var(--font-body)" }}
          >
            {cfg.label}
          </p>
          <p
            className="mt-0.5"
            style={{
              fontSize: "var(--fs-tiny)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-dim)",
            }}
          >
            Última sync: {formatTime(lastSync)}
          </p>
        </div>
      </div>

      {/* Next Sync */}
      {nextSync && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-1.5"
          style={{ fontSize: "var(--fs-tiny)", fontFamily: "var(--font-mono)", color: "var(--color-accent-dim)" }}
        >
          <Clock size={12} style={{ color: "var(--color-primary)" }} />
          Próxima: {formatTime(nextSync)}
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && status === "error" && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-3 py-2 rounded-lg"
          style={{
            background: "rgba(244,67,54,0.08)",
            border: "1px solid rgba(244,67,54,0.3)",
            fontSize: "var(--fs-tiny)",
            fontFamily: "var(--font-mono)",
            color: "#F44336",
          }}
        >
          {errorMessage}
        </motion.div>
      )}
    </motion.div>
  )
}
