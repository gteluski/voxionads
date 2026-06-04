"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, X, SlidersHorizontal, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterState {
  dateStart: string
  dateEnd: string
  selectedCampaigns: string[]
  selectedAdsets: string[]
  selectedAds: string[]
  status: "all" | "active" | "paused" | "removed"
}

interface AdvancedFilterBarProps {
  campaigns: Array<{ id: string; name: string }>
  adsets: Array<{ id: string; name: string }>
  ads: Array<{ id: string; name: string }>
  onFilter: (filters: FilterState) => void
  onSync?: () => void
  isLoading?: boolean
  className?: string
}

const statusLabels: Record<FilterState["status"], string> = {
  all: "Todos", active: "Ativos", paused: "Pausados", removed: "Removidos",
}

export function AdvancedFilterBar({
  campaigns, adsets, ads,
  onFilter, onSync, isLoading = false, className,
}: AdvancedFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateStart: "", dateEnd: "",
    selectedCampaigns: [], selectedAdsets: [], selectedAds: [],
    status: "all",
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilter(updated)
  }

  const toggleCampaign = (id: string) => {
    const next = filters.selectedCampaigns.includes(id)
      ? filters.selectedCampaigns.filter(c => c !== id)
      : [...filters.selectedCampaigns, id]
    handleFilterChange("selectedCampaigns", next)
  }

  const clearFilters = () => {
    const cleared: FilterState = {
      dateStart: "", dateEnd: "",
      selectedCampaigns: [], selectedAdsets: [], selectedAds: [],
      status: "all",
    }
    setFilters(cleared)
    onFilter(cleared)
  }

  const activeCount = [
    filters.dateStart ? 1 : 0,
    filters.dateEnd ? 1 : 0,
    filters.selectedCampaigns.length,
    filters.selectedAdsets.length,
    filters.selectedAds.length,
    filters.status !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const inputStyle = {
    height: "36px",
    fontSize: "var(--fs-small)",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-xl space-y-3", className)}
      style={{
        background: "var(--color-bg-dark)",
        border: "1px solid var(--color-border)",
        padding: "var(--space-4)",
      }}
    >
      {/* Top Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateStart}
            onChange={e => handleFilterChange("dateStart", e.target.value)}
            className="w-38"
            style={inputStyle}
          />
          <span style={{ fontSize: "var(--fs-small)", color: "var(--color-accent-dim)" }}>até</span>
          <Input
            type="date"
            value={filters.dateEnd}
            onChange={e => handleFilterChange("dateEnd", e.target.value)}
            className="w-38"
            style={inputStyle}
          />
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 rounded-lg font-bold transition-all"
          style={{
            height: "36px",
            fontSize: "var(--fs-small)",
            border: `1px solid ${isExpanded ? "rgba(241,133,53,0.5)" : "var(--color-border-medium)"}`,
            background: isExpanded ? "rgba(241,133,53,0.08)" : "transparent",
            color: isExpanded ? "var(--color-primary)" : "var(--color-accent-muted)",
            transition: "all var(--transition-fast)",
          }}
        >
          <SlidersHorizontal size={13} />
          Filtros avançados
          {activeCount > 0 && (
            <span
              style={{
                background: "var(--color-primary)",
                color: "var(--color-text-dark)",
                fontSize: "var(--fs-tiny)",
                fontWeight: 700,
                borderRadius: "var(--radius-full)",
                padding: "1px 7px",
              }}
            >
              {activeCount}
            </span>
          )}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} />
          </motion.div>
        </button>

        {/* Sync */}
        {onSync && (
          <Button variant="outline" size="sm" onClick={onSync} disabled={isLoading} className="gap-1.5">
            <RefreshCw size={13} className={isLoading ? "vx-spin" : ""} />
            Sincronizar
          </Button>
        )}

        {/* Clear */}
        {activeCount > 0 && (
          <Button variant="destructive" size="sm" onClick={clearFilters} className="gap-1.5">
            <X size={13} />
            Limpar
          </Button>
        )}
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="space-y-4 rounded-lg"
              style={{
                background: "rgba(216,197,182,0.03)",
                border: "1px solid var(--color-border-light)",
                padding: "var(--space-4)",
              }}
            >
              {/* Status filter */}
              <div>
                <label
                  className="block font-bold uppercase tracking-wider mb-2"
                  style={{ fontSize: "var(--fs-tiny)", color: "var(--color-accent-dim)" }}
                >
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "active", "paused", "removed"] as FilterState["status"][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleFilterChange("status", s)}
                      className="px-3 py-1 rounded-lg font-bold transition-all"
                      style={{
                        fontSize: "var(--fs-small)",
                        border: `1px solid ${filters.status === s ? "rgba(241,133,53,0.5)" : "var(--color-border-medium)"}`,
                        background: filters.status === s ? "rgba(241,133,53,0.12)" : "transparent",
                        color: filters.status === s ? "var(--color-primary)" : "var(--color-accent-muted)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaigns */}
              {campaigns.length > 0 && (
                <div>
                  <label
                    className="block font-bold uppercase tracking-wider mb-2"
                    style={{ fontSize: "var(--fs-tiny)", color: "var(--color-accent-dim)" }}
                  >
                    Campanhas
                  </label>
                  <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto pr-1">
                    {campaigns.map((camp) => {
                      const sel = filters.selectedCampaigns.includes(camp.id)
                      return (
                        <button
                          key={camp.id}
                          onClick={() => toggleCampaign(camp.id)}
                          className="px-3 py-1 rounded-lg font-bold transition-all"
                          style={{
                            fontSize: "var(--fs-small)",
                            border: `1px solid ${sel ? "rgba(241,133,53,0.5)" : "var(--color-border-medium)"}`,
                            background: sel ? "rgba(241,133,53,0.12)" : "transparent",
                            color: sel ? "var(--color-primary)" : "var(--color-accent-muted)",
                            transition: "all var(--transition-fast)",
                          }}
                        >
                          {camp.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
