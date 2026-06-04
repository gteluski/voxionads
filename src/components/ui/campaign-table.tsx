"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "removed"
  spend: number
  reach: number
  impressions: number
  messages: number
  linkClicks: number
  cpm: number
  cpc: number
  cpa: number
  roi: number
}

interface CampaignTableProps {
  campaigns: Campaign[]
  onRowClick?: (campaignId: string) => void
  className?: string
}

type SortKey = keyof Campaign
type SortDir = "asc" | "desc"

const statusCfg = {
  active:  { label: "Ativo",    bg: "rgba(76,175,80,0.1)",  border: "rgba(76,175,80,0.35)",  color: "#4CAF50" },
  paused:  { label: "Pausado",  bg: "rgba(255,152,0,0.1)",  border: "rgba(255,152,0,0.35)",  color: "#FF9800" },
  removed: { label: "Removido", bg: "rgba(244,67,54,0.08)", border: "rgba(244,67,54,0.3)",   color: "#F44336" },
}

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name",        label: "Campanha"     },
  { key: "status",      label: "Status"       },
  { key: "spend",       label: "Investimento", align: "right" },
  { key: "reach",       label: "Alcance",      align: "right" },
  { key: "impressions", label: "Impressões",   align: "right" },
  { key: "cpm",         label: "CPM",          align: "right" },
  { key: "cpa",         label: "CPA",          align: "right" },
  { key: "roi",         label: "ROI",          align: "right" },
]

export function CampaignTable({ campaigns, onRowClick, className }: CampaignTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sorted = [...campaigns].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === "string") {
      return sortDir === "asc"
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string)
    }
    return sortDir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage))
  const paginatedData = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-3", className)}
    >
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <table className="w-full border-collapse text-left">
          {/* Header */}
          <thead>
            <tr className="vx-table-header">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn("px-4 py-3 cursor-pointer select-none hover:opacity-80 transition-opacity whitespace-nowrap", col.align === "right" && "text-right")}
                >
                  <div className={cn("flex items-center gap-1", col.align === "right" && "justify-end")}>
                    {col.label}
                    {sortKey === col.key && (
                      <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: sortDir === "asc" ? 0 : 180 }}
                        transition={{ duration: 0.25 }}
                      >
                        {sortDir === "asc"
                          ? <ChevronUp size={12} style={{ color: "var(--color-primary)" }} />
                          : <ChevronDown size={12} style={{ color: "var(--color-primary)" }} />}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((c, idx) => {
                const s = statusCfg[c.status]
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="vx-table-row cursor-pointer group"
                    onClick={() => onRowClick?.(c.id)}
                  >
                    <td className="px-4 py-0 font-bold" style={{ color: "var(--color-accent)" }}>
                      {c.name}
                    </td>
                    <td className="px-4 py-0">
                      <span
                        className="vx-badge"
                        style={{ background: s.bg, borderColor: s.border, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-0 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-small)", color: "var(--color-accent)" }}>
                      R$ {c.spend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-0 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>
                      {c.reach.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-0 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>
                      {c.impressions.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-0 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>
                      R$ {c.cpm.toFixed(2)}
                    </td>
                    <td className="px-4 py-0 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-small)", color: "var(--color-accent-muted)" }}>
                      R$ {c.cpa.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-0 text-right font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-small)",
                        color: c.roi > 0 ? "#4CAF50" : "#F44336",
                      }}
                    >
                      {c.roi.toFixed(0)}%
                    </td>
                    <td className="px-4 py-0">
                      <ArrowRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--color-primary)" }}
                      />
                    </td>
                  </motion.tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10"
                  style={{ color: "var(--color-accent-dim)", fontSize: "var(--fs-small)" }}
                >
                  Nenhuma campanha encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-1"
        style={{ fontSize: "var(--fs-tiny)", fontFamily: "var(--font-mono)", color: "var(--color-accent-dim)" }}
      >
        <span>Página {currentPage} de {totalPages} · {campaigns.length} campanhas</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
