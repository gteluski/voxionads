"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PerformanceChartsProps {
  data: Array<{
    date: string
    spend?: number
    conversions?: number
    ctr?: number
    cpa?: number
    roi?: number
    reach?: number
    impressions?: number
  }>
  className?: string
}

type Period = "7d" | "14d" | "30d" | "90d"

export function PerformanceCharts({ data, className }: PerformanceChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d")

  const periodMap = {
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
  }

  // Slice the data to get the specified period length, or fallback if data is shorter
  const filteredData = data.slice(-periodMap[selectedPeriod])

  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: '8px',
    fontSize: '12px'
  };

  const charts = [
    {
      id: "spend-conversions",
      title: "Investimento vs Conversões",
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={2.5} name="Investimento (R$)" dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2.5} name="Conversões" dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "ctr-trend",
      title: "Taxa de Clique (CTR)",
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Area type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCtr)" name="CTR (%)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "cpa-trend",
      title: "Custo por Conversão (CPA)",
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line type="monotone" dataKey="cpa" stroke="#f43f5e" strokeWidth={2.5} name="CPA (R$)" dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "roi",
      title: "ROI por Semana",
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Bar dataKey="roi" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="ROI (%)" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "reach",
      title: "Alcance e Impressões",
      render: () => (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '10px' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="reach" stroke="#06b6d4" strokeWidth={2.5} name="Alcance" dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="impressions" stroke="#14b8a6" strokeWidth={2.5} name="Impressões" dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-6", className)}
    >
      {/* Period Selector */}
      <div className="flex gap-2">
        {(["7d", "14d", "30d", "90d"] as Period[]).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              "text-xs font-semibold h-8",
              selectedPeriod === period 
                ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white" 
                : "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {period === "7d" ? "7 Dias" : period === "14d" ? "14 Dias" : period === "30d" ? "30 Dias" : "90 Dias"}
          </Button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, idx) => (
          <motion.div
            key={chart.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 backdrop-blur-md"
          >
            <h3 className="font-bold text-slate-200 text-sm mb-4">{chart.title}</h3>
            {chart.render()}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
