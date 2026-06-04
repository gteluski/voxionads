"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, X } from "lucide-react"
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

export function AdvancedFilterBar({
  campaigns,
  adsets,
  ads,
  onFilter,
  onSync,
  isLoading = false,
  className,
}: AdvancedFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateStart: "",
    dateEnd: "",
    selectedCampaigns: [],
    selectedAdsets: [],
    selectedAds: [],
    status: "all",
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleToggleCampaign = (id: string) => {
    const newSelected = filters.selectedCampaigns.includes(id)
      ? filters.selectedCampaigns.filter(c => c !== id)
      : [...filters.selectedCampaigns, id]
    handleFilterChange("selectedCampaigns", newSelected)
  }

  const clearFilters = () => {
    const cleared = {
      dateStart: "",
      dateEnd: "",
      selectedCampaigns: [],
      selectedAdsets: [],
      selectedAds: [],
      status: "all" as const,
    }
    setFilters(cleared)
    onFilter(cleared)
  }

  const activeFilterCount = [
    filters.dateStart ? 1 : 0,
    filters.dateEnd ? 1 : 0,
    filters.selectedCampaigns.length,
    filters.selectedAdsets.length,
    filters.selectedAds.length,
    filters.status !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-3 p-4 rounded-xl border border-slate-900 bg-slate-900/10 backdrop-blur-md", className)}
    >
      {/* Top Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={filters.dateStart}
            onChange={(e) => handleFilterChange("dateStart", e.target.value)}
            placeholder="Data inicial"
            className="w-40 bg-slate-900/50 border-slate-800 focus-visible:ring-indigo-500 text-xs h-9 text-slate-200"
          />
          <span className="text-xs text-slate-500 font-medium">até</span>
          <Input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => handleFilterChange("dateEnd", e.target.value)}
            placeholder="Data final"
            className="w-40 bg-slate-900/50 border-slate-800 focus-visible:ring-indigo-500 text-xs h-9 text-slate-200"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9",
            isExpanded && "border-indigo-500 text-indigo-400 bg-indigo-950/20"
          )}
        >
          Filtros avançados
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isLoading}
            className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9 gap-1.5"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Sincronizar agora
          </Button>
        )}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs h-9"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 border border-slate-900 rounded-lg space-y-4 bg-slate-900/30 overflow-hidden"
        >
          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Status</label>
            <div className="flex gap-2 flex-wrap">
              {["all", "active", "paused", "removed"].map((status) => (
                <Button
                  key={status}
                  variant={filters.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("status", status)}
                  className={cn(
                    "text-xs h-8",
                    filters.status === status 
                      ? "bg-indigo-500 text-white hover:bg-indigo-600" 
                      : "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300"
                  )}
                >
                  {status === "all" ? "Todos" : status === "active" ? "Ativos" : status === "paused" ? "Pausados" : "Removidos"}
                </Button>
              ))}
            </div>
          </div>

          {/* Campaign Filter */}
          {campaigns.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">Campanhas</label>
              <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto pr-1">
                {campaigns.map((campaign) => {
                  const isSelected = filters.selectedCampaigns.includes(campaign.id);
                  return (
                    <Button
                      key={campaign.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCampaign(campaign.id)}
                      className={cn(
                        "text-xs h-8",
                        isSelected 
                          ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                          : "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300"
                      )}
                    >
                      {campaign.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
