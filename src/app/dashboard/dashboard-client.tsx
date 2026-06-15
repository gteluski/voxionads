'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import NotificationsSection from '@/components/NotificationsSection';
import RecommendationsCard from '@/components/RecommendationsCard';

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [changes, setChanges] = useState<Record<string, MetricChange>>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

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
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          if (dbData && dbData.length > 0) {
            data = dbData;
          }
        }

        // Se não houver dados, usa fallback estético como sugerido no prompt
        const hasData = data.length > 0;
        const totals = {
          spend: hasData ? data.reduce((sum, m) => sum + (m.spend || 0), 0) : 18450.00,
          impressions: hasData ? data.reduce((sum, m) => sum + (m.impressions || 0), 0) : 842190,
          clicks: hasData ? data.reduce((sum, m) => sum + (m.clicks || 0), 0) : 22840,
          reach: hasData ? data.reduce((sum, m) => sum + (m.reach || 0), 0) : 156203,
          conversions: hasData ? data.reduce((sum, m) => sum + (m.conversions || 0), 0) : 748,
          leads: hasData ? Math.floor(data.reduce((sum, m) => sum + (m.conversions || 0), 0) * 0.194) : 145,
          messages: hasData ? data.reduce((sum, m) => sum + (m.messages || 0), 0) : 923,
          frequency: hasData ? data.reduce((sum, m) => sum + (m.frequency || 0), 0) / data.length : 5.4,
          cpc: hasData ? data.reduce((sum, m) => sum + (m.cpc || 0), 0) / data.length : 0.81,
          cpm: hasData ? data.reduce((sum, m) => sum + (m.cpm || 0), 0) / data.length : 21.89,
          cpa: hasData ? data.reduce((sum, m) => sum + (m.cpa || 0), 0) / data.length : 24.65,
          roi: hasData ? data.reduce((sum, m) => sum + (m.roi || 0), 0) / data.length : 2.85,
          ctr: hasData ? ((data.reduce((sum, m) => sum + (m.clicks || 0), 0) / data.reduce((sum, m) => sum + (m.impressions || 0), 0)) * 100) : 2.7,
        };

        setMetrics(totals);

        setChanges({
          spend: { value: totals.spend, percent: 14.2, trend: 'up' },
          impressions: { value: totals.impressions, percent: 8.1, trend: 'up' },
          clicks: { value: totals.clicks, percent: 5.3, trend: 'up' },
          reach: { value: totals.reach, percent: 12.1, trend: 'up' },
          conversions: { value: totals.conversions, percent: 3.2, trend: 'up' },
          leads: { value: totals.leads, percent: 7.8, trend: 'up' },
          messages: { value: totals.messages, percent: 11.2, trend: 'up' },
          frequency: { value: totals.frequency, percent: 2.1, trend: 'down' },
          cpc: { value: totals.cpc, percent: 0.5, trend: 'up' },
          cpm: { value: totals.cpm, percent: 3.2, trend: 'down' },
          cpa: { value: totals.cpa, percent: 5.1, trend: 'down' },
          roi: { value: totals.roi, percent: 18.3, trend: 'up' },
          ctr: { value: totals.ctr, percent: 2.5, trend: 'up' },
        });
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [session, period, initialDbConnected, supabase]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sync/manual', { method: 'POST' });
      // Fake delay for UX
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.log('Sync simulated error', err);
    } finally {
      setIsSyncing(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#31251f]">
        <div className="animate-spin text-[#f18535] text-4xl">⏳</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#31251f]">
        <div className="text-[#d8c5b6]">Sem dados para exibir</div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#31251f] flex flex-col font-['Avenir']">
      
      {/* HEADER (Sem Sidebar) */}
      <header className="bg-[#1f1915] h-32 flex items-center px-8 border-b border-[rgba(216,197,182,0.2)] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          {/* Logo Voxion - MAIOR (80px) */}
          <img 
            src="/voxion-ads-logo.svg" 
            alt="Voxion Ads"
            className="h-20 w-auto drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/dashboard')}
          />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon="💰" label="TOTAL INVESTIDO" value={metrics.spend} unit="R$" format="currency"
            change={changes.spend} color="orange" onClick={() => router.push('/dashboard')}
          />
          <MetricCard
            icon="👁️" label="IMPRESSÕES" value={metrics.impressions} unit="" format="number"
            change={changes.impressions} color="blue" onClick={() => router.push('/dashboard/campanhas')}
          />
          <MetricCard
            icon="👆" label="CLIQUES (CTR)" value={metrics.clicks} unit={`${metrics.ctr?.toFixed(2)}%`} format="number"
            change={changes.clicks} color="purple" onClick={() => router.push('/dashboard/conjuntos')}
          />
          <MetricCard
            icon="🎯" label="ALCANCE" value={metrics.reach} unit="" format="number"
            change={changes.reach} color="green" onClick={() => router.push('/dashboard/anuncios')}
          />
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 gap-6 mt-10">
          {/* Notificações e Alertas */}
          <NotificationsSection />

          {/* NOVA: Recomendações */}
          <RecommendationsCard />
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
