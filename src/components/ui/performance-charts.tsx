"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
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

// Voxion dark tooltip
const VxTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#31251f",
      border: "1px solid #f18535",
      borderRadius: "8px",
      padding: "10px 14px",
      boxShadow: "0 10px 20px rgba(241,133,53,0.2)",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "11px",
      color: "#d8c5b6",
      minWidth: 120,
    }}>
      <p style={{ color: "#f18535", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('pt-BR') : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export function PerformanceCharts({ data, className }: PerformanceChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d")

  const periodMap: Record<Period, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 }
  const filteredData = data.slice(-periodMap[selectedPeriod])

  const axisStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fill: "#d8c5b6",
    opacity: 0.7,
  };
  const gridStroke = "rgba(216,197,182,0.1)";

  const charts = [
    {
      id: "spend-conv",
      title: "Investimento vs Conversões",
      render: () => (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={filteredData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<VxTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#d8c5b6", paddingTop: 8 }} />
            <Line type="monotone" dataKey="spend" stroke="#f18535" strokeWidth={2.5} name="Investimento (R$)" dot={false} activeDot={{ r: 5, fill: "#f18535" }} />
            <Line type="monotone" dataKey="conversions" stroke="#4CAF50" strokeWidth={2.5} name="Conversões" dot={false} activeDot={{ r: 5, fill: "#4CAF50" }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "ctr",
      title: "Taxa de Clique (CTR %)",
      render: () => (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="vxCtr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<VxTooltip />} />
            <Area type="monotone" dataKey="ctr" stroke="#2196F3" strokeWidth={2.5} fill="url(#vxCtr)" name="CTR (%)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "cpa",
      title: "Custo por Conversão (CPA)",
      render: () => (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={filteredData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<VxTooltip />} />
            <Line type="monotone" dataKey="cpa" stroke="#FF9800" strokeWidth={2.5} name="CPA (R$)" dot={false} activeDot={{ r: 5, fill: "#FF9800" }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "roi",
      title: "ROI por Período",
      render: () => (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={filteredData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<VxTooltip />} />
            <Bar dataKey="roi" fill="#f18535" radius={[4, 4, 0, 0]} name="ROI (%)" opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      id: "reach",
      title: "Alcance e Impressões",
      render: () => (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="vxReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d8c5b6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d8c5b6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vxImpr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f18535" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f18535" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<VxTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#d8c5b6", paddingTop: 8 }} />
            <Area type="monotone" dataKey="reach" stroke="#d8c5b6" strokeWidth={2} fill="url(#vxReach)" name="Alcance" />
            <Area type="monotone" dataKey="impressions" stroke="#f18535" strokeWidth={2} fill="url(#vxImpr)" name="Impressões" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={cn("space-y-6", className)}
    >
      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {(["7d", "14d", "30d", "90d"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={cn("vx-period-btn", selectedPeriod === p && "active")}
          >
            {p === "7d" ? "7 Dias" : p === "14d" ? "14 Dias" : p === "30d" ? "30 Dias" : "90 Dias"}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="wait">
          {charts.map((chart, idx) => (
            <motion.div
              key={`${chart.id}-${selectedPeriod}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={cn(idx === 4 ? "lg:col-span-2" : "")}
              style={{
                background: "var(--color-bg-dark)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
              }}
            >
              <h3
                className="font-bold mb-4"
                style={{
                  fontSize: "var(--fs-body)",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {chart.title}
              </h3>
              {chart.render()}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
