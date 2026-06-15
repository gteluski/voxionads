"use client"

import { useState } from "react"
import { MetricCard, ReportCard, PerformanceCharts, CampaignTable, AdvancedFilterBar, SyncStatus } from "@/components/ui/dashboard-components"
import { DollarSign, Eye, MessageSquare, Link2 } from "lucide-react"

// Mock data
const mockCampaigns = [
  {
    id: "1",
    name: "Summer Sale",
    status: "active" as const,
    spend: 2500,
    reach: 45000,
    impressions: 125000,
    messages: 258,
    linkClicks: 1200,
    cpm: 0.04,
    cpc: 0.12,
    cpa: 15.5,
    roi: 285,
  },
]

const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  spend: 1000 + Math.random() * 2000,
  conversions: 30 + Math.random() * 50,
  ctr: 2 + Math.random() * 1.5,
  cpa: 10 + Math.random() * 15,
  roi: 200 + Math.random() * 150,
  reach: 30000 + Math.random() * 25000,
  impressions: 80000 + Math.random() * 50000,
}))

export default function DashboardDemo() {
  const [lastSync] = useState(new Date())
  
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#d8c5b6]">Dashboard Meta Ads</h1>
        <SyncStatus lastSync={lastSync} status="success" />
      </div>

      {/* Filters */}
      <AdvancedFilterBar
        campaigns={mockCampaigns}
        adsets={[]}
        ads={[]}
        onFilter={console.log}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Investimento" value={5200} unit="R$" change={12} trend="up" color="blue" />
        <MetricCard icon={<Eye className="w-4 h-4" />} label="Alcance" value={45000} unit="" change={5} trend="down" color="green" />
        <MetricCard label="Impressões" value={125000} unit="" change={8} trend="up" color="orange" />
        <MetricCard icon={<MessageSquare className="w-4 h-4" />} label="Mensagens" value={258} unit="" change={15} trend="up" color="purple" />
        <MetricCard icon={<Link2 className="w-4 h-4" />} label="Link Cliques" value={1200} unit="" change={20} trend="up" color="red" />
      </div>

      {/* Report Card */}
      <ReportCard
        title="Summer Sale Campaign"
        overallHealth="good"
        trend="up"
        issues={[]}
        recommendations={["Continue com strategy atual", "Aumentar budget em 10-15%"]}
      />

      {/* Charts */}
      <PerformanceCharts data={mockChartData} />

      {/* Table */}
      <CampaignTable campaigns={mockCampaigns} />
    </div>
  )
}
