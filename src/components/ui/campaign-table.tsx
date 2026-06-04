"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
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

export function CampaignTable({
  campaigns,
  onRowClick,
  className,
}: CampaignTableProps) {
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
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return null
    return sortDir === "asc" ? 
      <ChevronUp className="w-3.5 h-3.5 ml-1 text-indigo-400" /> : 
      <ChevronDown className="w-3.5 h-3.5 ml-1 text-indigo-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-4", className)}
    >
      <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-900 hover:bg-transparent bg-slate-900/40">
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Campanha
                  <SortIcon active={sortKey === "name"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  Status
                  <SortIcon active={sortKey === "status"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("spend")}>
                <div className="flex items-center justify-end">
                  Investimento
                  <SortIcon active={sortKey === "spend"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("reach")}>
                <div className="flex items-center justify-end">
                  Alcance
                  <SortIcon active={sortKey === "reach"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("impressions")}>
                <div className="flex items-center justify-end">
                  Impressões
                  <SortIcon active={sortKey === "impressions"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("cpm")}>
                <div className="flex items-center justify-end">
                  CPM
                  <SortIcon active={sortKey === "cpm"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("cpa")}>
                <div className="flex items-center justify-end">
                  CPA
                  <SortIcon active={sortKey === "cpa"} />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-slate-300 font-semibold text-xs py-3 text-right hover:bg-slate-900/60 select-none transition-colors" onClick={() => handleSort("roi")}>
                <div className="flex items-center justify-end">
                  ROI
                  <SortIcon active={sortKey === "roi"} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-900">
            {paginatedData.length > 0 ? (
              paginatedData.map((campaign, idx) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => onRowClick?.(campaign.id)}
                  className="hover:bg-slate-900/40 cursor-pointer transition-colors border-slate-900"
                >
                  <TableCell className="font-semibold text-slate-200 py-3">{campaign.name}</TableCell>
                  <TableCell className="py-3">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                      campaign.status === "active" ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400" :
                      campaign.status === "paused" ? "bg-amber-950/30 border-amber-900/40 text-amber-400" :
                      "bg-slate-900 border-slate-800 text-slate-400"
                    )}>
                      {campaign.status === "active" ? "Ativo" : campaign.status === "paused" ? "Pausado" : "Removido"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-slate-300 py-3">R$ {campaign.spend.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-slate-300 py-3">{campaign.reach.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-slate-300 py-3">{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-slate-300 py-3">R$ {campaign.cpm.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-slate-300 py-3">R$ {campaign.cpa.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-slate-300 py-3 font-semibold">{campaign.roi.toFixed(0)}%</TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Página {currentPage} de {totalPages}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs h-8"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs h-8"
          >
            Próxima
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
