'use client';

import { useState } from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { ReportCard } from '@/components/ui/report-card';
import { PerformanceCharts } from '@/components/ui/performance-charts';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Layers,
  CheckCircle,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  Calendar,
  Layers3,
  LayoutGrid,
  AlertCircle
} from 'lucide-react';

interface ReportClientProps {
  share: any;
  campaigns: any[];
  adsets: any[];
  ads: any[];
  metrics: any[];
  reports: any[];
}

type TabType = 'overview' | 'structure';

export function ReportClient({
  share,
  campaigns,
  adsets,
  ads,
  metrics,
  reports
}: ReportClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filtros locais de datas
  const [dateStart, setDateStart] = useState<string>(() => {
    if (metrics.length > 0) {
      return metrics[0].date;
    }
    return '';
  });
  
  const [dateEnd, setDateEnd] = useState<string>(() => {
    if (metrics.length > 0) {
      return metrics[metrics.length - 1].date;
    }
    return '';
  });

  const [filterCampaignId, setFilterCampaignId] = useState<string>('all');

  // Filtragem das métricas com base no intervalo e campanha selecionada
  const filteredMetrics = metrics.filter((m: any) => {
    const matchesDate = (!dateStart || m.date >= dateStart) && (!dateEnd || m.date <= dateEnd);
    const matchesCampaign = filterCampaignId === 'all' || m.campaign_id === filterCampaignId;
    return matchesDate && matchesCampaign;
  });

  // Cálculo de KPIs dinâmicos derivados das métricas filtradas
  let totalSpend = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalValue = 0;

  for (const m of filteredMetrics) {
    totalSpend += parseFloat(m.spend) || 0;
    totalConversions += parseInt(m.conversions) || 0;
    totalClicks += parseInt(m.clicks) || 0;
    totalImpressions += parseInt(m.impressions) || 0;
    totalValue += (parseInt(m.conversions) || 0) * 120; // Valor de conversão estimado
  }

  const roi = totalSpend > 0 ? ((totalValue - totalSpend) / totalSpend) * 100 : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Filtragem de listas para exibição de estrutura
  const displayedCampaigns = campaigns.filter(
    (c: any) => filterCampaignId === 'all' || c.id === filterCampaignId
  );
  
  const campaignIds = displayedCampaigns.map((c: any) => c.id);
  
  const displayedAdsets = adsets.filter(
    (as: any) => campaignIds.includes(as.campaign_id)
  );
  
  const displayedAds = ads.filter(
    (ad: any) => campaignIds.includes(ad.campaign_id)
  );

  return (
    <div className="min-h-screen bg-[#31251f] text-[#d8c5b6] flex flex-col relative overflow-hidden font-['Avenir']">
      
      {/* Background visual accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-950/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-950/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-[#d8c5b6]/10 bg-[#1f1915]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              {/* Logo Voxion */}
              <img 
                src="/voxion-ads-logo.svg" 
                alt="Voxion Ads"
                className="h-12 w-auto drop-shadow"
              />
              <div className="flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#31251f] border border-[#d8c5b6]/25 text-[#f18535]">
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                Painel do Cliente (Read-Only)
              </div>
            </div>

            <div className="text-xs text-[#d8c5b6]/65 font-mono hidden sm:block">
              Gerenciado via BM ID: <span className="font-mono text-slate-200 font-bold">{share.business_manager_id}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Welcome Header */}
        <div className="pb-4 border-b border-[#d8c5b6]/15">
          <h2 className="text-3xl font-black text-white">{share.share_name}</h2>
          <p className="text-sm text-[#d8c5b6]/60 mt-1.5">
            Relatório de desempenho em tempo real consolidado no Business Manager {share.business_manager_id}.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[#d8c5b6]/15 bg-[#1f1915]/30 backdrop-blur-md rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-36 bg-[#1f1915] border-[#d8c5b6]/20 text-[#d8c5b6] text-xs h-9 focus-visible:ring-1 focus-visible:ring-[#f18535]"
              />
              <span className="text-[#d8c5b6]/50 text-xs">até</span>
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-36 bg-[#1f1915] border-[#d8c5b6]/20 text-[#d8c5b6] text-xs h-9 focus-visible:ring-1 focus-visible:ring-[#f18535]"
              />
            </div>

            {/* Selector de Campanhas vinculadas */}
            <select
              value={filterCampaignId}
              onChange={(e) => setFilterCampaignId(e.target.value)}
              className="bg-[#1f1915] border border-[#d8c5b6]/20 rounded-lg px-3 py-1.5 text-xs text-[#d8c5b6] focus:outline-none h-9 font-bold cursor-pointer hover:border-[#f18535] transition-colors"
            >
              <option value="all">Todas as Campanhas</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-[#d8c5b6]/50 font-mono flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#f18535]" />
            Relatório Server-Side Seguro
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#d8c5b6]/10 gap-1 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-[#f18535] text-[#f18535] bg-orange-950/10'
                : 'border-transparent text-[#d8c5b6]/60 hover:text-[#d8c5b6]'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </button>
          
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'border-[#f18535] text-[#f18535] bg-orange-950/10'
                : 'border-transparent text-[#d8c5b6]/60 hover:text-[#d8c5b6]'
            }`}
          >
            <Layers className="h-4 w-4" />
            Estrutura de Anúncios
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={<DollarSign className="w-4 h-4 text-orange-400" />}
                  label="Total Investido"
                  value={`R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  trend="neutral"
                  color="orange"
                />
                <MetricCard
                  icon={<Eye className="w-4 h-4 text-green-400" />}
                  label="Impressões"
                  value={totalImpressions.toLocaleString('pt-BR')}
                  trend="neutral"
                  color="green"
                />
                <MetricCard
                  icon={<MousePointer className="w-4 h-4 text-sky-400" />}
                  label="CTR Médio"
                  value={`${ctr.toFixed(2)}%`}
                  trend="neutral"
                  color="purple"
                />
                <MetricCard
                  icon={<Percent className="w-4 h-4 text-[#9C27B0]-400" />}
                  label="Retorno ROI"
                  value={`${roi.toFixed(0)}%`}
                  trend="neutral"
                  color="warning"
                />
              </div>

              {/* Recommendations IA Health */}
              {reports && reports.length > 0 ? (
                <ReportCard
                  title="Saúde da Campanha (IA)"
                  overallHealth={reports[0].overall_health || 'good'}
                  trend={reports[0].performance_trend || 'stable'}
                  issues={reports[0].main_issues || []}
                  recommendations={reports[0].recommendations || []}
                />
              ) : (
                <div className="p-6 text-center text-[#d8c5b6]/50 border border-[#d8c5b6]/15 rounded-xl bg-[#1f1915]/10">
                  ⚠️ Nenhuma análise de IA disponível para esta seleção.
                </div>
              )}

              {/* Performance Charts Recharts */}
              {filteredMetrics.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#d8c5b6]">Gráficos de Performance</h3>
                  <PerformanceCharts data={filteredMetrics} />
                </div>
              ) : (
                <div className="p-8 text-center text-[#d8c5b6]/40 border border-[#d8c5b6]/10 rounded-xl bg-[#1f1915]/5">
                  Nenhum histórico disponível para exibir gráficos.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Campaigns Table */}
              <div className="p-5 border border-[#d8c5b6]/10 rounded-xl bg-[#1f1915]/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#f18535]" />
                  <h3 className="font-bold text-white text-base">Campanhas Ativas</h3>
                </div>
                <div className="border border-[#d8c5b6]/10 rounded-lg overflow-hidden bg-[#1f1915]/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#d8c5b6]/10 bg-[#31251f]/40 hover:bg-transparent">
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3">Nome</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3">Objetivo</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3 text-right">Orçamento Diário</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#d8c5b6]/10">
                      {displayedCampaigns.map((c: any) => (
                        <TableRow key={c.id} className="hover:bg-[#31251f]/30 border-[#d8c5b6]/10 transition-colors">
                          <TableCell className="font-bold text-white py-3.5">{c.name}</TableCell>
                          <TableCell className="text-[#d8c5b6]/80 uppercase py-3.5">{c.objective}</TableCell>
                          <TableCell className="text-right text-[#d8c5b6] py-3.5">
                            {c.daily_budget ? `R$ ${parseFloat(c.daily_budget).toFixed(2)}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-3.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-green-900/35 bg-green-950/20 text-green-400">
                              {c.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Ad Sets Table */}
              <div className="p-5 border border-[#d8c5b6]/10 rounded-xl bg-[#1f1915]/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-5 w-5 text-[#f18535]" />
                  <h3 className="font-bold text-white text-base">Conjuntos de Anúncios (Ad Sets)</h3>
                </div>
                <div className="border border-[#d8c5b6]/10 rounded-lg overflow-hidden bg-[#1f1915]/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#d8c5b6]/10 bg-[#31251f]/40 hover:bg-transparent">
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3">Nome do Conjunto</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3">Meta Otimização</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3 text-right">Orçamento Diário</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#d8c5b6]/10">
                      {displayedAdsets.map((as: any) => (
                        <TableRow key={as.id} className="hover:bg-[#31251f]/30 border-[#d8c5b6]/10 transition-colors">
                          <TableCell className="font-bold text-white py-3.5">{as.name}</TableCell>
                          <TableCell className="text-[#d8c5b6]/80 py-3.5">{as.optimization_goal}</TableCell>
                          <TableCell className="text-right text-[#d8c5b6] py-3.5">
                            {as.daily_budget ? `R$ ${parseFloat(as.daily_budget).toFixed(2)}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-3.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-green-900/35 bg-green-950/20 text-green-400">
                              {as.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Ads Table */}
              <div className="p-5 border border-[#d8c5b6]/10 rounded-xl bg-[#1f1915]/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5 text-[#f18535]" />
                  <h3 className="font-bold text-white text-base">Anúncios (Ads)</h3>
                </div>
                <div className="border border-[#d8c5b6]/10 rounded-lg overflow-hidden bg-[#1f1915]/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#d8c5b6]/10 bg-[#31251f]/40 hover:bg-transparent">
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3">Nome do Anúncio</TableHead>
                        <TableHead className="text-[#d8c5b6] font-bold text-xs py-3 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#d8c5b6]/10">
                      {displayedAds.map((ad: any) => (
                        <TableRow key={ad.id} className="hover:bg-[#31251f]/30 border-[#d8c5b6]/10 transition-colors">
                          <TableCell className="font-bold text-white py-3.5">{ad.name}</TableCell>
                          <TableCell className="text-right py-3.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-green-900/35 bg-green-950/20 text-green-400">
                              {ad.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* FOOTER BRANDING */}
      <footer className="border-t border-[#d8c5b6]/10 py-6 mt-12 bg-[#1f1915]/80 backdrop-blur-md relative z-10 text-center space-y-1">
        <p className="text-[10px] text-[#f18535] font-bold uppercase tracking-wider">
          Powered by Voxion Ads
        </p>
        <p className="text-[9px] text-[#d8c5b6]/50">
          Voxion Ads © 2026. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
