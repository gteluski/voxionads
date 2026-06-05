'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { ReportCard } from '@/components/ui/report-card';
import { PerformanceCharts } from '@/components/ui/performance-charts';
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
  DollarSign,
  TrendingUp,
  Percent,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';

interface AdsetDetailsClientProps {
  adsetId: string;
}

type Period = '7d' | '30d' | '90d';

export function AdsetDetailsClient({ adsetId }: AdsetDetailsClientProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/adset/${adsetId}/details`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load adset details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [adsetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <span className="text-xs text-slate-400 font-semibold">Carregando detalhes do conjunto...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.adset) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <p className="text-slate-400 text-sm mb-4">Conjunto de anúncios não encontrado ou erro no carregamento.</p>
        <Button onClick={() => router.push('/dashboard')} size="sm" className="bg-orange-600 hover:bg-orange-700">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const { adset, subitems, metrics } = data;

  // Filter metrics based on selected period
  const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
  const filteredMetrics = metrics.slice(-periodMap[selectedPeriod]);

  // Aggregate metrics for cards
  let totalSpend = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalValue = 0;

  for (const m of filteredMetrics) {
    totalSpend += m.spend || 0;
    totalConversions += m.conversions || 0;
    totalClicks += m.clicks || 0;
    totalImpressions += m.impressions || 0;
    totalValue += (m.conversions || 0) * 120;
  }

  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const roi = totalSpend > 0 ? ((totalValue - totalSpend) / totalSpend) * 100 : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Recommendations mapping
  const issues = [];
  const recommendations = [];
  let health: 'good' | 'warning' | 'critical' = 'good';

  if (roi < 100) {
    health = 'critical';
    issues.push('ROI deste conjunto está crítico (abaixo de 100%).');
    recommendations.push('Reduza a verba diária deste conjunto ou altere o criativo principal.');
  } else if (roi < 200) {
    health = 'warning';
    issues.push('Desempenho moderado detectado.');
    recommendations.push('Ajuste a otimização de lance ou adicione exclusões de público comprador.');
  } else {
    recommendations.push('Conjunto performando acima da meta. Considere escalar em 10%.');
  }

  if (ctr < 1.8) {
    issues.push('Taxa de cliques (CTR) está em patamar insatisfatório.');
    recommendations.push('Otimize o CTA da cópia do anúncio principal.');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden pb-12">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-900/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white px-2"
                onClick={() => router.push(`/detalhes/campanha/${adset.campaign_id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Campanha
              </Button>
              <span className="text-slate-700">|</span>
              <span className="font-bold text-sm text-slate-300">Detalhes do Conjunto</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Otimização: <span className="text-slate-200 uppercase">{adset.optimization_goal}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white">{adset.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                adset.status === 'ACTIVE'
                  ? 'bg-green-950/30 border-green-900/40 text-green-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                {adset.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">ID Meta: {adset.meta_adset_id}</p>
          </div>

          {/* Date Selector */}
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as Period[]).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={`text-[10px] font-bold h-7 px-3 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white border-transparent'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                {period === '7d' ? '7 Dias' : period === '30d' ? '30 Dias' : '90 Dias'}
              </Button>
            ))}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign className="w-4 h-4 text-orange-400" />}
            label="Investimento"
            value={`R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="neutral"
            color="info"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4 text-green-400" />}
            label="Conversões"
            value={totalConversions}
            trend="neutral"
            color="success"
          />
          <MetricCard
            icon={<MessageSquare className="w-4 h-4 text-orange-400" />}
            label="CPA Médio"
            value={totalConversions > 0 ? `R$ ${cpa.toFixed(2)}` : 'R$ 0,00'}
            trend="neutral"
            color="orange"
          />
          <MetricCard
            icon={<Percent className="w-4 h-4 text-[#9C27B0]-400" />}
            label="ROI do Conjunto"
            value={`${roi.toFixed(0)}%`}
            trend="neutral"
            color="warning"
          />
        </div>

        {/* Recommendations & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReportCard
              title="Saúde do Conjunto"
              overallHealth={health}
              trend="stable"
              issues={issues}
              recommendations={recommendations}
            />
          </div>
          <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                Configurações do Conjunto
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Orçamento Diário:</span>
                  <span className="text-slate-200 font-bold">
                    {adset.daily_budget ? `R$ ${adset.daily_budget.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meta Otimização:</span>
                  <span className="text-slate-200">{adset.optimization_goal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <PerformanceCharts data={filteredMetrics} />

        {/* Subitems (Ads) Table */}
        <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4.5 w-4.5 text-orange-400" />
              <h3 className="font-bold text-slate-200 text-sm">Anúncios (Ads)</h3>
            </div>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2.5 py-0.5 rounded-full">
              {subitems.length} anúncios
            </span>
          </div>

          <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-900 bg-slate-900/30 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Nome do Anúncio</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-2.5">Status</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs py-2.5 text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-900">
                {subitems.length > 0 ? (
                  subitems.map((ad: any) => (
                    <TableRow key={ad.id} className="hover:bg-slate-900/30 border-slate-900 transition-colors">
                      <TableCell className="font-semibold text-slate-200 py-3">{ad.name}</TableCell>
                      <TableCell className="py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          ad.status === 'ACTIVE'
                            ? 'bg-green-950/30 border-green-900/40 text-green-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {ad.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Link href={`/detalhes/anuncio/${ad.id}`} className="text-xs text-orange-400 hover:text-orange-300 hover:underline inline-flex items-center font-semibold">
                          Métricas do Anúncio
                          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center py-6 text-slate-500 text-xs">
                      Nenhum anúncio vinculado a este conjunto.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </main>
    </div>
  );
}
