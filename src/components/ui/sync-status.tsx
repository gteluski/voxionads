"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
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
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "agora mesmo"
    if (diffMins < 60) return `${diffMins}min atrás`
    
    const hours = Math.floor(diffMins / 60)
    if (hours < 24) return `${hours}h atrás`
    
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-950/20 border-emerald-900/35",
      label: "Sucesso",
    },
    pending: {
      icon: Activity,
      color: "text-indigo-400",
      bg: "bg-indigo-950/20 border-indigo-900/35",
      label: "Sincronizando...",
    },
    error: {
      icon: AlertCircle,
      color: "text-rose-400",
      bg: "bg-rose-950/20 border-rose-900/35",
      label: "Erro de Sync",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center gap-4 flex-wrap", className)}
    >
      {/* Status Badge */}
      <div className={cn("px-4 py-2.5 rounded-xl border flex items-center gap-2.5 bg-slate-900/20 backdrop-blur-md", config.bg)}>
        <motion.div
          animate={status === "pending" ? { rotate: 360 } : {}}
          transition={status === "pending" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </motion.div>
        <div className="text-xs">
          <p className={cn("font-bold", config.color)}>{config.label}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Última sincronização: {formatTime(lastSync)}
          </p>
        </div>
      </div>

      {/* Next Sync */}
      {nextSync && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Próximo: {formatTime(nextSync)}</span>
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && status === "error" && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="text-xs text-rose-400 px-3 py-2 bg-rose-950/20 rounded-xl border border-rose-900/35"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
