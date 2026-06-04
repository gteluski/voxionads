'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { ReportCard } from '@/components/ui/report-card';
import { PerformanceCharts } from '@/components/ui/performance-charts';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Percent,
  MessageSquare,
  ShieldCheck,
  FileImage,
  Video
} from 'lucide-react';

interface AdDetailsClientProps {
  adId: string;
}

type Period = '7d' | '30d' | '90d';

export function AdDetailsClient({ adId }: AdDetailsClientProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/ad/${adId}/details`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load ad details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [adId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-xs text-slate-400 font-semibold">Carregando detalhes do anúncio...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.ad) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <p className="text-slate-400 text-sm mb-4">Anúncio não encontrado ou erro no carregamento.</p>
        <Button onClick={() => router.push('/dashboard')} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const { ad, metrics } = data;

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
    issues.push('Criativo com retorno de investimento (ROI) abaixo de 100%.');
    recommendations.push('Este anúncio está consumindo verba sem trazer retorno. Sugerido pausá-lo.');
  } else if (roi < 200) {
    health = 'warning';
    issues.push('ROI mediano detectado para este criativo.');
    recommendations.push('Considere testar uma headline diferente ou alterar a copy primária.');
  } else {
    recommendations.push('Criativo performando acima da média. Duplique com maior orçamento.');
  }

  if (ctr < 1.8) {
    issues.push('CTR abaixo de 1.8%. Baixo engajamento visual.');
    recommendations.push('A imagem/vídeo inicial não está capturando atenção. Substitua a thumbnail ou os primeiros 3 segundos.');
  }

  const isVideoCreative = ad.name.toLowerCase().includes('vídeo') || ad.name.toLowerCase().includes('video');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden pb-12">
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
                onClick={() => router.push(`/detalhes/conjuntos/${ad.adset_id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Conjunto
              </Button>
              <span className="text-slate-700">|</span>
              <span className="font-bold text-sm text-slate-300">Detalhes do Anúncio</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              ID Meta: <span className="text-slate-200 font-mono">{ad.meta_ad_id}</span>
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
              <h2 className="text-xl font-extrabold text-white">{ad.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                ad.status === 'ACTIVE'
                  ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                {ad.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">ID Meta: {ad.meta_ad_id}</p>
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
            icon={<DollarSign className="w-4 h-4 text-indigo-400" />}
            label="Investimento"
            value={`R$ ${totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend="neutral"
            color="info"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
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
            icon={<Percent className="w-4 h-4 text-purple-400" />}
            label="ROI do Anúncio"
            value={`${roi.toFixed(0)}%`}
            trend="neutral"
            color="warning"
          />
        </div>

        {/* Recommendations & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReportCard
              title="Análise de Criativo"
              overallHealth={health}
              trend="stable"
              issues={issues}
              recommendations={recommendations}
            />
          </div>
          <div className="p-5 border border-slate-900 rounded-xl bg-slate-900/20 backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" />
                Informações do Criativo
              </div>
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-lg bg-slate-950/20 text-center gap-2">
                {isVideoCreative ? (
                  <>
                    <Video className="h-8 w-8 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Tipo de Criativo: Vídeo</span>
                    <span className="text-[10px] text-slate-500">Formatos recomendados: 9:16 (Story/Reels) & 1:1 (Feed)</span>
                  </>
                ) : (
                  <>
                    <FileImage className="h-8 w-8 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Tipo de Criativo: Imagem / Carrossel</span>
                    <span className="text-[10px] text-slate-500">Formatos recomendados: 1:1 Feed & 4:5 Feed</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <PerformanceCharts data={filteredMetrics} />

      </main>
    </div>
  );
}
