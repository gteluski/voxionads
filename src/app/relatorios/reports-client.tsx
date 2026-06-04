'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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
  ArrowLeft,
  FileText,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface ReportsClientProps {
  session: Session;
  initialDbConnected: boolean;
  initialReports: any[];
  initialCampaigns: any[];
}

export function ReportsClient({
  session,
  initialDbConnected,
  initialReports,
  initialCampaigns
}: ReportsClientProps) {
  const router = useRouter();
  const [isDbConnected] = useState(initialDbConnected);
  const [reports, setReports] = useState<any[]>(
    initialReports.length > 0 ? initialReports : [
      {
        id: 'mock-rep-1',
        campaign_id: 'c1',
        campaign_name: 'Campanha Conversão - Black Friday 2026',
        overall_health: 'good',
        performance_trend: '⬆️',
        main_issues: [],
        recommendations: ['Desempenho excelente. Considere escalar o orçamento diário em 15-20%.'],
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString()
      },
      {
        id: 'mock-rep-2',
        campaign_id: 'c2',
        campaign_name: 'Lookalike Leads Premium - Whitelist',
        overall_health: 'warning',
        performance_trend: '➡️',
        main_issues: ['Taxa de cliques (CTR) de 1.10% está abaixo do esperado.'],
        recommendations: ['CTR baixa - revise creative/copy', 'Teste público de interesse aberto.'],
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'mock-rep-3',
        campaign_id: 'c3',
        campaign_name: 'Retargeting Carrinho Abandonado 7D',
        overall_health: 'critical',
        performance_trend: '⬇️',
        main_issues: ['CPA aumentou 35% comparado a semana anterior.', 'ROI está negativo.'],
        recommendations: ['CPA alto - considere pausar anúncios com pior performance', 'ROI negativo - aumente budget ou optimize landing page'],
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  );

  const [campaigns] = useState<any[]>(
    initialCampaigns.length > 0 ? initialCampaigns : [
      { id: 'c1', name: 'Campanha Conversão - Black Friday 2026' },
      { id: 'c2', name: 'Lookalike Leads Premium - Whitelist' },
      { id: 'c3', name: 'Retargeting Carrinho Abandonado 7D' },
      { id: 'c4', name: 'Branding & Tráfego Frio - Reels Video' }
    ]
  );

  // Filters
  const [filterCampaignId, setFilterCampaignId] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // States
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Generate new reports
  const handleGenerateReports = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/reports/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (err) {
      console.warn('Manual reports trigger failed. Simulating locally.');
      // Simulate generating mock reports locally
      const simulatedReports = campaigns.map((c) => {
        const healths = ['good', 'warning', 'critical'] as const;
        const selectedHealth = healths[Math.floor(Math.random() * healths.length)];
        const trends = ['⬆️', '➡️', '⬇️'] as const;
        return {
          id: `sim-rep-${c.id}-${Date.now()}`,
          campaign_id: c.id,
          campaign_name: c.name,
          overall_health: selectedHealth,
          performance_trend: trends[Math.floor(Math.random() * trends.length)],
          main_issues: selectedHealth === 'critical' ? ['ROI negativo.', 'CPA aumentou > 20%.'] : selectedHealth === 'warning' ? ['CTR abaixo de 1.4%.'] : [],
          recommendations: selectedHealth === 'critical' ? ['ROI negativo - aumente budget ou optimize landing page'] : selectedHealth === 'warning' ? ['CTR baixa - revise creative/copy'] : ['Desempenho excelente. Escalar orçamento em 15%.'],
          date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_range_end: new Date().toISOString().split('T')[0],
          generated_at: new Date().toISOString()
        };
      });

      // Update mock registry
      const globalReports = (window as any).mockReports || {};
      simulatedReports.forEach(r => {
        globalReports[r.id] = r;
      });
      (window as any).mockReports = globalReports;

      setReports(simulatedReports);
    } finally {
      setIsGenerating(false);
    }
  };

  // Open details and load metrics snapshot on-the-fly
  const handleOpenReportDetails = async (report: any) => {
    setActiveReport(report);
    setDrawerOpen(true);
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/reports/${report.id}`);
      if (res.ok) {
        const json = await res.json();
        setActiveReport(json.report);
      }
    } catch (err) {
      console.warn('Failed to load dynamic report details. Using mock fallback snapshots.');
      // Seed fallback metrics snapshot if missing in state
      if (!report.metrics) {
        setActiveReport({
          ...report,
          metrics: {
            current: { spend: 500, impressions: 10000, clicks: 230, ctr: 2.3, roi: 120, conversions: 10, cpa: 50, cpm: 50 },
            diff7d: { spend: 400, impressions: 8000, clicks: 190, ctr: 2.37, roi: 150, conversions: 8, cpa: 50, cpm: 50 },
            diff30d: { spend: 300, impressions: 6000, clicks: 130, ctr: 2.17, roi: 200, conversions: 9, cpa: 33.3, cpm: 50 }
          }
        });
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter list
  const filteredReports = reports.filter((r) => {
    const matchesCampaign = filterCampaignId === 'all' || r.campaign_id === filterCampaignId;
    const matchesHealth = filterHealth === 'all' || r.overall_health === filterHealth;
    const matchesDate = (!dateStart || r.generated_at >= dateStart) && (!dateEnd || r.generated_at <= dateEnd);
    return matchesCampaign && matchesHealth && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden pb-12">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white px-2"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Painel
              </Button>
              <span className="text-slate-700">|</span>
              <span className="font-bold text-sm text-slate-300">Análise e Relatórios</span>
              <span className="text-slate-700">|</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white px-2 text-xs"
                onClick={() => router.push('/configuracoes')}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Configurações
              </Button>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-800">
              <span className={`h-1.5 w-1.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isDbConnected ? (
                <span className="text-slate-300">SQL Ativo</span>
              ) : (
                <span className="text-amber-400">Offline / Demo</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-900 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-400" />
              Motor de Análise Automática
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Consulte e gere relatórios de métricas. O algoritmo avalia desvios de CPA, CTR, ROI e alcance de campanhas.
            </p>
          </div>

          <Button
            onClick={handleGenerateReports}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 py-1.5 h-8 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Reanalisando...' : 'Reanalisar Campanhas'}
          </Button>
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

            {/* Campaign Filter */}
            <select
              value={filterCampaignId}
              onChange={(e) => setFilterCampaignId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none h-8 font-semibold"
            >
              <option value="all">Todas as campanhas</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Health Filter */}
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none h-8 font-semibold"
            >
              <option value="all">Todos os Status</option>
              <option value="good">🟢 Saudável (Good)</option>
              <option value="warning">🟡 Alerta (Warning)</option>
              <option value="critical">🔴 Crítico (Critical)</option>
            </select>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Filtros Ativos
          </div>
        </div>

        {/* Reports Table List */}
        <Card className="bg-glass border-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-200">Relatórios Gerados</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Clique em qualquer relatório da lista para abrir a análise detalhada e o quadro comparativo histórico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReports.length > 0 ? (
              <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400">
                      <th className="p-3 font-semibold">Campanha</th>
                      <th className="p-3 font-semibold">Saúde</th>
                      <th className="p-3 font-semibold">Tendência</th>
                      <th className="p-3 font-semibold">Problemas</th>
                      <th className="p-3 font-semibold">Intervalo de Análise</th>
                      <th className="p-3 font-semibold">Gerado em</th>
                      <th className="p-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        onClick={() => handleOpenReportDetails(report)}
                        className="hover:bg-slate-900/40 cursor-pointer transition-all"
                      >
                        <td className="p-3 font-bold text-slate-200">{report.campaign_name}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            report.overall_health === 'good'
                              ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                              : report.overall_health === 'warning'
                              ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                              : 'bg-red-950/20 border-red-900/30 text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              report.overall_health === 'good'
                                ? 'bg-emerald-400'
                                : report.overall_health === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`} />
                            {report.overall_health === 'good' ? 'Saudável' : report.overall_health === 'warning' ? 'Alerta' : 'Crítico'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300 font-bold">{report.performance_trend}</td>
                        <td className="p-3 text-slate-400">
                          {report.main_issues && report.main_issues.length > 0 ? (
                            <span className="text-red-400 font-semibold">
                              {report.main_issues.length} detectado{report.main_issues.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-500">Sem problemas</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {report.date_range_start ? new Date(report.date_range_start).toLocaleDateString('pt-BR') : 'N/A'} - {report.date_range_end ? new Date(report.date_range_end).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(report.generated_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3 text-right">
                          <ChevronRight className="h-4.5 w-4.5 text-indigo-400 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-900 rounded-lg">
                Nenhum relatório gerado corresponde aos filtros configurados.
              </div>
            )}
          </CardContent>
        </Card>

      </main>

      {/* DETAILED OVERLAY DRAWER */}
      {drawerOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    activeReport.overall_health === 'good'
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                      : activeReport.overall_health === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                      : 'bg-red-950/20 border-red-900/30 text-red-400'
                  }`}>
                    {activeReport.overall_health === 'good' ? 'Saudável' : activeReport.overall_health === 'warning' ? 'Alerta' : 'Crítico'}
                  </span>
                  <h3 className="text-md font-bold text-white mt-1.5">{activeReport.campaign_name}</h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <span className="text-xs text-slate-500 font-semibold">Carregando comparativo histórico...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Snapshot Comparisons Table */}
                  {activeReport.metrics && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comparativo Histórico</h4>
                      <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/40">
                        <table className="w-full text-[11px] text-left">
                          <thead>
                            <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400">
                              <th className="p-2.5 font-semibold">Métrica</th>
                              <th className="p-2.5 font-semibold text-right">Atual</th>
                              <th className="p-2.5 font-semibold text-right">7d Atrás</th>
                              <th className="p-2.5 font-semibold text-right">30d Atrás</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {/* ROI */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">ROI</td>
                              <td className="p-2.5 text-right font-bold text-white">{(parseFloat(activeReport.metrics.current?.roi) || 0).toFixed(0)}%</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? `${(parseFloat(activeReport.metrics.diff7d.roi) || 0).toFixed(0)}%` : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? `${(parseFloat(activeReport.metrics.diff30d.roi) || 0).toFixed(0)}%` : '-'}</td>
                            </tr>
                            {/* CPA */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">CPA (Custo Conversão)</td>
                              <td className="p-2.5 text-right font-bold text-white">R$ {(parseFloat(activeReport.metrics.current?.cpa) || 0).toFixed(2)}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? `R$ ${(parseFloat(activeReport.metrics.diff7d.cpa) || 0).toFixed(2)}` : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? `R$ ${(parseFloat(activeReport.metrics.diff30d.cpa) || 0).toFixed(2)}` : '-'}</td>
                            </tr>
                            {/* CTR */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">CTR</td>
                              <td className="p-2.5 text-right font-bold text-white">{(parseFloat(activeReport.metrics.current?.ctr) || 0).toFixed(2)}%</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? `${(parseFloat(activeReport.metrics.diff7d.ctr) || 0).toFixed(2)}%` : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? `${(parseFloat(activeReport.metrics.diff30d.ctr) || 0).toFixed(2)}%` : '-'}</td>
                            </tr>
                            {/* Spend */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">Investimento</td>
                              <td className="p-2.5 text-right font-bold text-white">R$ {(parseFloat(activeReport.metrics.current?.spend) || 0).toFixed(2)}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? `R$ ${(parseFloat(activeReport.metrics.diff7d.spend) || 0).toFixed(2)}` : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? `R$ ${(parseFloat(activeReport.metrics.diff30d.spend) || 0).toFixed(2)}` : '-'}</td>
                            </tr>
                            {/* Impressions */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">Impressões</td>
                              <td className="p-2.5 text-right font-bold text-white">{(parseInt(activeReport.metrics.current?.impressions) || 0).toLocaleString()}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? (parseInt(activeReport.metrics.diff7d.impressions) || 0).toLocaleString() : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? (parseInt(activeReport.metrics.diff30d.impressions) || 0).toLocaleString() : '-'}</td>
                            </tr>
                            {/* CPM */}
                            <tr className="hover:bg-slate-900/20 text-slate-350">
                              <td className="p-2.5 font-bold">CPM</td>
                              <td className="p-2.5 text-right font-bold text-white">R$ {(parseFloat(activeReport.metrics.current?.cpm) || 0).toFixed(2)}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff7d ? `R$ ${(parseFloat(activeReport.metrics.diff7d.cpm) || 0).toFixed(2)}` : '-'}</td>
                              <td className="p-2.5 text-right">{activeReport.metrics.diff30d ? `R$ ${(parseFloat(activeReport.metrics.diff30d.cpm) || 0).toFixed(2)}` : '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Issues List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problemas Encontrados</h4>
                    {activeReport.main_issues && activeReport.main_issues.length > 0 ? (
                      <ul className="space-y-1.5">
                        {activeReport.main_issues.map((issue: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-xs p-3 rounded-lg border border-red-950/40 bg-red-950/10 text-red-300 flex items-start gap-2 animate-in slide-in-from-left duration-200"
                          >
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs p-3 rounded-lg border border-emerald-950/40 bg-emerald-950/10 text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Nenhum problema encontrado. O desempenho desta campanha está ideal.</span>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recomendações de Ação</h4>
                    {activeReport.recommendations && activeReport.recommendations.length > 0 ? (
                      <ul className="space-y-1.5">
                        {activeReport.recommendations.map((rec: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-xs p-3 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-350 flex items-start gap-2.5"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 font-bold shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-slate-500 italic p-1">
                        Nenhuma recomendação disponível.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <Button
                onClick={() => setDrawerOpen(false)}
                className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold h-8"
              >
                Voltar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
