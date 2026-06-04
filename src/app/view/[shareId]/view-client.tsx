'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/ui/metric-card';
import { ReportCard } from '@/components/ui/report-card';
import { PerformanceCharts } from '@/components/ui/performance-charts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ViewClientProps {
  shareId: string;
}

type TabType = 'overview' | 'structure';

export function ViewClient({ shareId }: ViewClientProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filters
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterCampaignId, setFilterCampaignId] = useState('all');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/share/${shareId}/dashboard`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          
          // Set initial date range from last 30 days of metrics if available
          if (json.metrics && json.metrics.length > 0) {
            setDateStart(json.metrics[0].date);
            setDateEnd(json.metrics[json.metrics.length - 1].date);
          }
        }
      } catch (err) {
        console.error('Failed to load shared dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-xs text-slate-400 font-semibold">Carregando painel de controle...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.share) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-slate-400 text-sm">Não foi possível carregar as informações deste painel.</p>
        </div>
      </div>
    );
  }

  const { share, campaigns, adsets, ads, metrics, reports } = data;

  // Filter metrics based on inputs
  const filteredMetrics = metrics.filter((m: any) => {
    const matchesDate = (!dateStart || m.date >= dateStart) && (!dateEnd || m.date <= dateEnd);
    const matchesCampaign = filterCampaignId === 'all' || m.campaign_id === filterCampaignId;
    return matchesDate && matchesCampaign;
  });

  // Calculate aggregates
  let totalSpend = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalValue = 0;
  let totalMessages = 0;

  for (const m of filteredMetrics) {
    totalSpend += m.spend || 0;
    totalConversions += m.conversions || 0;
    totalClicks += m.clicks || 0;
    totalImpressions += m.impressions || 0;
    totalMessages += m.messages || 0;
    totalValue += (m.conversions || 0) * 120; // Simulated conversion price
  }

  const roi = totalSpend > 0 ? ((totalValue - totalSpend) / totalSpend) * 100 : 0;
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  // Filter lists for tables
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white font-black text-lg shadow-md shadow-indigo-500/10">
                V
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Voxion Ads
              </span>
              
              <div className="flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-800 text-indigo-400">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                Painel do Cliente (Leitura)
              </div>
            </div>

            <div className="text-xs text-slate-400 hidden sm:block">
              BM ID: <span className="font-mono text-slate-200 font-bold">{share.business_manager_id}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Welcome Header */}
        <div className="pb-4 border-b border-slate-900">
          <h2 className="text-2xl font-bold tracking-tight text-white">{share.share_name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualização de desempenho de campanhas vinculadas ao Business Manager {share.business_manager_id}.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-900 bg-slate-900/10 backdrop-blur-md rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-36 bg-slate-950 border-slate-800 text-xs h-8"
              />
              <span className="text-slate-500 text-xs">até</span>
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-36 bg-slate-950 border-slate-800 text-xs h-8"
              />
            </div>

            {/* Campaign restricted filter selector */}
            <select
              value={filterCampaignId}
              onChange={(e) => setFilterCampaignId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none h-8 font-semibold"
            >
              <option value="all">Todas as campanhas</option>
              {campaigns.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Dados filtrados por intervalo
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-900 gap-1 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Visão Geral
          </button>
          
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
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
                  icon={<DollarSign className="w-4 h-4 text-indigo-400" />}
                  label="Total Investido"
                  value={`R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  trend="neutral"
                  color="info"
                />
                <MetricCard
                  icon={<Eye className="w-4 h-4 text-emerald-400" />}
                  label="Impressões"
                  value={totalImpressions.toLocaleString('pt-BR')}
                  trend="neutral"
                  color="success"
                />
                <MetricCard
                  icon={<MousePointer className="w-4 h-4 text-sky-400" />}
                  label="CTR Médio"
                  value={`${ctr.toFixed(2)}%`}
                  trend="neutral"
                  color="orange"
                />
                <MetricCard
                  icon={<Percent className="w-4 h-4 text-purple-400" />}
                  label="Retorno ROI"
                  value={`${roi.toFixed(0)}%`}
                  trend="neutral"
                  color="warning"
                />
              </div>

              {/* Recommendations Health */}
              {reports && reports.length > 0 && (
                <ReportCard
                  title="Saúde das Campanhas"
                  overallHealth={reports[0].overall_health || 'good'}
                  trend={reports[0].performance_trend || 'stable'}
                  issues={reports[0].main_issues || []}
                  recommendations={reports[0].recommendations || []}
                />
              )}

              {/* Performance Charts */}
              {filteredMetrics.length > 0 ? (
                <PerformanceCharts data={filteredMetrics} />
              ) : (
                <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl bg-slate-900/10">
                  Nenhum dado de histórico disponível para os filtros selecionados.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Campaigns Table */}
              <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Campanhas Ativas</h3>
                </div>
                <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-900 bg-slate-900/30 hover:bg-transparent">
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Nome</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Objetivo</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Orçamento Diário</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-900">
                      {displayedCampaigns.map((c: any) => (
                        <TableRow key={c.id} className="hover:bg-slate-900/20 border-slate-900 transition-colors">
                          <TableCell className="font-bold text-slate-200 py-3">{c.name}</TableCell>
                          <TableCell className="text-slate-400 uppercase py-3">{c.objective}</TableCell>
                          <TableCell className="text-right text-slate-300 py-3">
                            {c.daily_budget ? `R$ ${c.daily_budget.toFixed(2)}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-900/30 bg-emerald-950/20 text-emerald-400">
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
              <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Conjuntos de Anúncios (Ad Sets)</h3>
                </div>
                <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-900 bg-slate-900/30 hover:bg-transparent">
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Nome do Conjunto</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Meta Otimização</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Orçamento Diário</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-900">
                      {displayedAdsets.map((as: any) => (
                        <TableRow key={as.id} className="hover:bg-slate-900/20 border-slate-900 transition-colors">
                          <TableCell className="font-bold text-slate-200 py-3">{as.name}</TableCell>
                          <TableCell className="text-slate-400 py-3">{as.optimization_goal}</TableCell>
                          <TableCell className="text-right text-slate-300 py-3">
                            {as.daily_budget ? `R$ ${as.daily_budget.toFixed(2)}` : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-900/30 bg-emerald-950/20 text-emerald-400">
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
              <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Anúncios (Ads)</h3>
                </div>
                <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-900 bg-slate-900/30 hover:bg-transparent">
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Nome do Anúncio</TableHead>
                        <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-900">
                      {displayedAds.map((ad: any) => (
                        <TableRow key={ad.id} className="hover:bg-slate-900/20 border-slate-900 transition-colors">
                          <TableCell className="font-bold text-slate-200 py-3">{ad.name}</TableCell>
                          <TableCell className="text-right py-3">
                            <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-900/30 bg-emerald-950/20 text-emerald-400">
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
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950/80 backdrop-blur-md relative z-10 text-center space-y-1">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Powered by Voxion Studio
        </p>
        <p className="text-[9px] text-slate-650">
          Voxion Ads © 2026. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
