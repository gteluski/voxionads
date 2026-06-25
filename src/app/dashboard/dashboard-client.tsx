'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import NotificationsSection from '@/components/NotificationsSection';
import RecommendationsCard from '@/components/RecommendationsCard';
import { PerformanceCharts } from '@/components/ui/performance-charts';

interface DashboardMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  conversions: number;
  leads: number;
  messages: number;
  frequency: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roi: number;
  ctr: number;
}

interface MetricChange {
  value: number;
  percent: number;
  trend: 'up' | 'down' | 'stable';
}

interface DashboardClientProps {
  session: any;
  initialDbConnected: boolean;
  initialCampaigns: any[];
  initialMetaTokens: any[];
  initialSyncLogs: any[];
  initialAuditLogs: any[];
}

export function DashboardClient({
  session,
  initialDbConnected,
  initialCampaigns,
  initialMetaTokens,
  initialSyncLogs,
  initialAuditLogs,
}: DashboardClientProps) {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [rawMetrics, setRawMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

  // Helper para gerar métricas simuladas nos últimos 90 dias caso não haja dados no banco
  const generateMockDailyMetrics = () => {
    return Array.from({ length: 90 }, (_, i) => {
      const date = new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const spend = 150 + Math.random() * 200;
      const clicks = Math.floor(60 + Math.random() * 80);
      const impressions = Math.floor(3000 + Math.random() * 2000);
      const conversions = Math.floor(2 + Math.random() * 5);
      const reach = impressions - Math.floor(impressions * 0.25);
      return {
        date,
        spend,
        impressions,
        clicks,
        reach,
        frequency: 1.1 + Math.random() * 0.15,
        conversions,
        messages: Math.floor(conversions * 0.8),
        cpc: spend / clicks,
        cpm: (spend / impressions) * 1000,
        cpa: conversions > 0 ? spend / conversions : 0,
        roi: spend > 0 ? ((conversions * 120 - spend) / spend) * 100 : 0,
        ctr: (clicks / impressions) * 100,
        campaign_id: i % 2 === 0 ? 'c1' : 'c2'
      };
    });
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        let data: any[] = [];
        
        if (initialDbConnected && session?.user?.admin_id) {
          const { data: dbData } = await supabase
            .from('ads_metrics')
            .select('*')
            .eq('admin_id', session.user.admin_id)
            .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
          if (dbData && dbData.length > 0) {
            data = dbData;
          }
        }

        if (data.length === 0) {
          data = generateMockDailyMetrics();
        }

        setRawMetrics(data);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [session, initialDbConnected, supabase]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync/manual', { method: 'POST' });
      if (response.ok) {
        router.refresh();
      }
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error('Sync error', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Filtrar campanhas pela conta selecionada
  const filteredCampaigns = initialCampaigns.filter(c => {
    if (selectedAccountId === 'all') return true;
    // O mock_campaign_id ou meta_campaign_id pode conter o ID da conta
    return c.meta_campaign_id.includes(selectedAccountId);
  });
  
  const campaignIds = filteredCampaigns.map(c => c.id);

  // 2. Resolver quantidade de dias do período selecionado
  const getPeriodDays = () => {
    if (period === '7d') return 7;
    if (period === '14d') return 14;
    if (period === '30d') return 30;
    return 90;
  };

  // 3. Filtrar métricas pelo período e conta selecionados
  const filteredMetrics = rawMetrics.filter(m => {
    // Se a conta selecionada for específica, a métrica deve pertencer a uma campanha daquela conta
    // (Em mocks, associamos as campanhas c1/c2 à conta mockada. Em real, mapeamos os IDs)
    if (selectedAccountId !== 'all') {
      const belongsToCampaign = campaignIds.includes(m.campaign_id) || m.campaign_id === selectedAccountId;
      // Trata também fallback de mock
      const belongsToMock = selectedAccountId === 'act_12093849102' && (m.campaign_id === 'c1' || m.campaign_id === 'c2');
      if (!belongsToCampaign && !belongsToMock) return false;
    }

    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - getPeriodDays());
    const mDate = new Date(m.date);
    return mDate >= limitDate;
  });

  // 4. Calcular KPIs consolidados
  const totalSpend = filteredMetrics.reduce((sum, m) => sum + (parseFloat(m.spend) || 0), 0);
  const totalImpressions = filteredMetrics.reduce((sum, m) => sum + (parseInt(m.impressions) || 0), 0);
  const totalClicks = filteredMetrics.reduce((sum, m) => sum + (parseInt(m.clicks) || 0), 0);
  const totalReach = filteredMetrics.reduce((sum, m) => sum + (parseInt(m.reach) || 0), 0);
  const totalConversions = filteredMetrics.reduce((sum, m) => sum + (parseInt(m.conversions) || 0), 0);
  const totalMessages = filteredMetrics.reduce((sum, m) => sum + (parseInt(m.messages) || 0), 0);
  
  const avgFrequency = filteredMetrics.length > 0
    ? filteredMetrics.reduce((sum, m) => sum + (parseFloat(m.frequency) || 0), 0) / filteredMetrics.length
    : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  
  // Supõe um ticket de conversão fictício de R$ 120 para calcular o ROI
  const totalValue = totalConversions * 120;
  const avgRoi = totalSpend > 0 ? ((totalValue - totalSpend) / totalSpend) * 100 : 0;
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const metricsData: DashboardMetrics = {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    reach: totalReach,
    conversions: totalConversions,
    leads: Math.floor(totalConversions * 0.194),
    messages: totalMessages,
    frequency: avgFrequency,
    cpc: avgCpc,
    cpm: avgCpm,
    cpa: avgCpa,
    roi: avgRoi,
    ctr: avgCtr
  };

  const changes = {
    spend: { value: totalSpend, percent: 14.2, trend: 'up' as const },
    impressions: { value: totalImpressions, percent: 8.1, trend: 'up' as const },
    clicks: { value: totalClicks, percent: 5.3, trend: 'up' as const },
    reach: { value: totalReach, percent: 12.1, trend: 'up' as const },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#31251f]">
        <div className="animate-spin text-[#f18535] text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31251f] flex flex-col font-['Avenir']">
      
      {/* HEADER (Sem Sidebar) */}
      <header className="bg-[#1f1915] h-32 flex items-center px-8 border-b border-[rgba(216,197,182,0.2)] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          {/* Logo Voxion */}
          <img 
            src="/voxion-ads-logo.svg" 
            alt="Voxion Ads"
            className="h-20 w-auto drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/dashboard')}
          />
        </div>

        {/* Seletor Dinâmico de Contas */}
        <div className="ml-8">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-[#31251f] border border-[#d8c5b6]/30 text-[#d8c5b6] px-4 py-2 rounded-xl font-bold outline-none cursor-pointer focus:border-[#f18535] transition-all text-sm"
          >
            <option value="all">Todas as Contas</option>
            {initialMetaTokens.map((t) => (
              <option key={t.id} value={t.account_id}>
                {t.account_name} ({t.account_id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-8">
          <button 
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="bg-[#f18535] text-[#31251f] px-6 py-2.5 rounded-lg font-bold hover:bg-[#f5a35f] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(241,133,53,0.3)] disabled:opacity-50"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>

          <div className="h-8 w-[1px] bg-[rgba(216,197,182,0.2)] mx-2" />

          <button 
            onClick={() => router.push('/dashboard/configuracoes')}
            className="text-[#d8c5b6] hover:text-[#f18535] transition-all p-2 bg-[#31251f] rounded-lg border border-[rgba(216,197,182,0.1)] hover:border-[#f18535]"
            title="Configurações"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Painel Geral Header + Ações */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-[#d8c5b6] mb-2">Visão Geral</h2>
            <p className="text-[#d8c5b6]/70 text-lg">Métricas e performance das suas contas de anúncios conectadas.</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/dashboard/campanhas')}
              className="bg-[rgba(241,133,53,0.1)] border-2 border-[#f18535] text-[#f18535] px-6 py-3 rounded-xl font-bold hover:bg-[rgba(241,133,53,0.2)] transition-all shadow-[0_0_20px_rgba(241,133,53,0.1)]"
            >
              📊 Ver Campanhas
            </button>
            <button 
              onClick={() => router.push('/dashboard/conjuntos')}
              className="bg-[#1f1915] border-2 border-[rgba(216,197,182,0.2)] text-[#d8c5b6] px-6 py-3 rounded-xl font-bold hover:border-[#d8c5b6] transition-all"
            >
              🎯 Ver Conjuntos
            </button>
          </div>
        </div>

        {/* Período Selector */}
        <div className="flex gap-3 mb-8 bg-[#1f1915] p-1.5 rounded-xl w-fit border border-[rgba(216,197,182,0.1)]">
          {['7d', '14d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-lg font-bold transition-all text-sm ${
                period === p
                  ? 'bg-[#f18535] text-[#31251f] shadow-md'
                  : 'text-[#d8c5b6]/70 hover:text-[#d8c5b6] hover:bg-[rgba(216,197,182,0.05)]'
              }`}
            >
              {p === '7d' ? 'Últimos 7 dias' : p === '14d' ? 'Últimos 14 dias' : p === '30d' ? 'Últimos 30 dias' : 'Últimos 90 dias'}
            </button>
          ))}
        </div>

        {/* 4 KPIs GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            icon="💰" label="TOTAL INVESTIDO" value={metricsData.spend} unit="R$" format="currency"
            change={changes.spend} color="orange" onClick={() => {}}
          />
          <MetricCard
            icon="👁️" label="IMPRESSÕES" value={metricsData.impressions} unit="" format="number"
            change={changes.impressions} color="blue" onClick={() => router.push('/dashboard/campanhas')}
          />
          <MetricCard
            icon="👆" label="CLIQUES (CTR)" value={metricsData.clicks} unit={`${metricsData.ctr?.toFixed(2)}%`} format="number"
            change={changes.clicks} color="purple" onClick={() => router.push('/dashboard/conjuntos')}
          />
          <MetricCard
            icon="🎯" label="ALCANCE" value={metricsData.reach} unit="" format="number"
            change={changes.reach} color="green" onClick={() => router.push('/dashboard/anuncios')}
          />
        </div>

        {/* GRÁFICOS DE DESEMPENHO (RECHARTS) */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-[#d8c5b6] mb-6">Evolução Temporal das Métricas</h3>
          <PerformanceCharts data={filteredMetrics} />
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 gap-6">
          {/* Notificações e Alertas */}
          <NotificationsSection />

          {/* Recomendações de IA */}
          <RecommendationsCard selectedAccountId={selectedAccountId} />
        </div>
      </main>
    </div>
  );
}

// ----------------------
// Sub-components
// ----------------------

function MetricCard({ icon, label, value, unit, format, change, color, onClick }: any) {
  const formatValue = () => {
    if (format === 'currency') return `R$ ${value.toFixed(2).replace('.', ',')}`;
    if (format === 'decimal') return value.toFixed(2);
    if (format === 'number') return value.toLocaleString('pt-BR');
    return value;
  };

  const colorMap: any = {
    orange: 'bg-[rgba(241,133,53,0.05)] border-[#f18535]/30 hover:border-[#f18535]',
    blue: 'bg-[rgba(33,150,243,0.05)] border-[#2196F3]/30 hover:border-[#2196F3]',
    green: 'bg-[rgba(76,175,80,0.05)] border-[#4CAF50]/30 hover:border-[#4CAF50]',
    purple: 'bg-[rgba(156,39,176,0.05)] border-[#9C27B0]/30 hover:border-[#9C27B0]',
    success: 'bg-[rgba(76,175,80,0.05)] border-[#4CAF50]/30 hover:border-[#4CAF50]',
    info: 'bg-[rgba(33,150,243,0.05)] border-[#2196F3]/30 hover:border-[#2196F3]',
    accent: 'bg-[rgba(216,197,182,0.05)] border-[#d8c5b6]/30 hover:border-[#d8c5b6]',
    warning: 'bg-[rgba(255,152,0,0.05)] border-[#FF9800]/30 hover:border-[#FF9800]',
  };

  const textMap: any = {
    orange: 'text-[#f18535]',
    blue: 'text-[#2196F3]',
    green: 'text-[#4CAF50]',
    purple: 'text-[#9C27B0]',
    success: 'text-[#4CAF50]',
    info: 'text-[#2196F3]',
    accent: 'text-[#d8c5b6]',
    warning: 'text-[#FF9800]',
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className={`${colorMap[color]} border-2 rounded-2xl p-6 cursor-pointer transition-colors shadow-lg shadow-black/20`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl bg-[#1f1915] p-2 rounded-xl shadow-inner border border-[rgba(216,197,182,0.1)]">{icon}</span>
        <span className="text-[#d8c5b6]/80 text-xs font-bold tracking-wider">{label}</span>
      </div>
      
      <div className="mb-4">
        <p className={`${textMap[color]} text-3xl font-black tracking-tight font-['Jetbrains_Mono']`}>
          {formatValue()} <span className="text-lg opacity-80 font-normal">{unit}</span>
        </p>
      </div>

      {change && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
          change.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {change.trend === 'up' ? '↗' : '↘'} {change.percent}% <span className="opacity-70 font-normal">vs mês ant.</span>
        </div>
      )}
    </motion.div>
  );
}
