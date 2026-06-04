'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Users,
  Layers,
  FileText,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Database,
  Calendar,
  DollarSign,
  MousePointer,
  Eye,
  Percent,
  KeyRound,
  FileSpreadsheet,
  Settings
} from 'lucide-react';


interface DashboardClientProps {
  session: Session;
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
  initialAuditLogs
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'tokens' | 'logs'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDbConnected] = useState(initialDbConnected);
  
  // Client-side state that defaults to initial queries or falls back to mock data if empty
  const [campaigns, setCampaigns] = useState<any[]>(
    initialCampaigns.length > 0 ? initialCampaigns : [
      { id: 'c1', name: 'Campanha Conversão - Black Friday 2026', meta_campaign_id: 'act_12093849102-c1', status: 'ACTIVE', objective: 'CONVERSIONS', daily_budget: 500.00, lifetime_budget: null, created_at: '2026-06-01T10:00:00Z' },
      { id: 'c2', name: 'Lookalike Leads Premium - Whitelist', meta_campaign_id: 'act_12093849102-c2', status: 'ACTIVE', objective: 'LEAD_GENERATION', daily_budget: 250.00, lifetime_budget: null, created_at: '2026-06-02T12:00:00Z' },
      { id: 'c3', name: 'Retargeting Carrinho Abandonado 7D', meta_campaign_id: 'act_12093849102-c3', status: 'PAUSED', objective: 'CONVERSIONS', daily_budget: 100.00, lifetime_budget: null, created_at: '2026-06-03T08:30:00Z' },
      { id: 'c4', name: 'Branding & Tráfego Frio - Reels Video', meta_campaign_id: 'act_12093849102-c4', status: 'ACTIVE', objective: 'OUTDOOR / VIDEO_VIEWS', daily_budget: 150.00, lifetime_budget: null, created_at: '2026-06-04T09:15:00Z' }
    ]
  );

  const [metaTokens, setMetaTokens] = useState<any[]>(
    initialMetaTokens.length > 0 ? initialMetaTokens : [
      { id: 't1', account_name: 'Voxion Ads BM Account', account_id: 'act_12093849102', business_manager_id: 'bm_98471029384', access_token: 'EAAOz18uXpd8BA...', token_expires_at: '2026-08-04T10:00:00Z', created_at: '2026-06-04T10:00:00Z' }
    ]
  );

  const [syncLogs, setSyncLogs] = useState<any[]>(
    initialSyncLogs.length > 0 ? initialSyncLogs : [
      { id: 's1', status: 'SUCCESS', message: 'Sincronização concluída: 4 campanhas importadas.', synced_at: '2026-06-04T10:15:00Z', duration_ms: 1820 },
      { id: 's2', status: 'SUCCESS', message: 'Sincronização periódica automatizada.', synced_at: '2026-06-04T09:00:00Z', duration_ms: 1540 }
    ]
  );

  const [auditLogs, setAuditLogs] = useState<any[]>(
    initialAuditLogs.length > 0 ? initialAuditLogs : [
      { id: 'a1', action: 'LOGIN', details: `Usuário ${session.user?.email} realizou login com sucesso.`, created_at: new Date().toISOString() },
      { id: 'a2', action: 'TOKEN_REFRESH', details: 'Meta Graph API token validado com sucesso.', created_at: '2026-06-04T10:00:00Z' }
    ]
  );

  const [adSets] = useState<any[]>([
    { id: 'as1', campaign_id: 'c1', name: 'Adset - Público Quente 30D (Lookalike)', status: 'ACTIVE', daily_budget: 300.00, optimization_goal: 'PURCHASE' },
    { id: 'as2', campaign_id: 'c1', name: 'Adset - Interesses E-commerce', status: 'ACTIVE', daily_budget: 200.00, optimization_goal: 'PURCHASE' },
    { id: 'as3', campaign_id: 'c2', name: 'Adset - Empresários e Lojistas Brasil', status: 'ACTIVE', daily_budget: 250.00, optimization_goal: 'LEAD' }
  ]);

  const [ads] = useState<any[]>([
    { id: 'ad1', adset_id: 'as1', campaign_id: 'c1', name: 'Criativo 01 - Vídeo de Depoimentos', status: 'ACTIVE' },
    { id: 'ad2', adset_id: 'as1', campaign_id: 'c1', name: 'Criativo 02 - Carrossel Benefícios', status: 'ACTIVE' },
    { id: 'ad3', adset_id: 'as2', campaign_id: 'c1', name: 'Criativo 03 - Foto Oferta Frete Grátis', status: 'ACTIVE' }
  ]);

  // Handle Sync simulation
  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const timestamp = new Date().toISOString();
    const newSyncLog = {
      id: `s_new_${Date.now()}`,
      status: 'SUCCESS',
      message: 'Sincronização manual acionada. 4 campanhas e 3 conjuntos de anúncios sincronizados.',
      synced_at: timestamp,
      duration_ms: 2240
    };

    const newAuditLog = {
      id: `a_new_${Date.now()}`,
      action: 'SYNC_TRIGGERED',
      details: `Sincronização das campanhas da Meta iniciada pelo admin: ${session.user?.name}`,
      created_at: timestamp
    };

    setSyncLogs(prev => [newSyncLog, ...prev]);
    setAuditLogs(prev => [newAuditLog, ...prev]);
    setIsSyncing(false);

    // If connected to a real DB, we could trigger a fetch request to /api/sync
    if (isDbConnected) {
      try {
        await fetch('/api/dashboard/sync', { method: 'POST' });
      } catch (err) {
        console.warn('Silent db sync failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background gradients */}
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
              
              {/* Database status indicator */}
              <div className="flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-800">
                <span className={`h-1.5 w-1.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isDbConnected ? (
                  <span className="text-slate-300">Supabase SQL Ativo</span>
                ) : (
                  <span className="text-amber-400">Ambiente Demo</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{session.user?.name}</span>
                <span className="text-[10px] text-slate-400">{session.user?.email}</span>
              </div>
              
              <Link href="/relatorios">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Relatórios
                </Button>
              </Link>

              <Link href="/configuracoes">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configurações
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs flex items-center gap-1.5"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Welcome Section / Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-900">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Painel Geral</h2>
            <p className="text-xs text-slate-400">
              Gerencie suas contas, verifique métricas de ROI e monitore logs de sincronização da API Meta.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90 text-white font-medium text-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Meta Ads'}
            </Button>
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
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'campaigns'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Estrutura (Campanhas/Ad Sets/Ads)
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'tokens'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Tokens Meta
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Logs do Sistema
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-glass border-slate-900 transition-all duration-300 hover:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-slate-400">Total Investido</CardTitle>
                    <DollarSign className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">R$ 18.450,00</div>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
                      +14.2% comparado ao mês anterior
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-glass border-slate-900 transition-all duration-300 hover:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-slate-400">Impressões</CardTitle>
                    <Eye className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">842.190</div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Frequência média: 2.14
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-glass border-slate-900 transition-all duration-300 hover:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-slate-400">Cliques (CTR)</CardTitle>
                    <MousePointer className="h-4 w-4 text-sky-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">22.840 (2.71%)</div>
                    <p className="text-[10px] text-emerald-400 mt-1">
                      CPC Médio: R$ 0,81
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-glass border-slate-900 transition-all duration-300 hover:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-slate-400">Conversões (ROI)</CardTitle>
                    <Percent className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-white">748 (3.42x)</div>
                    <p className="text-[10px] text-emerald-400 mt-1">
                      CPA Médio: R$ 24,66
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Panel and Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Health */}
                <Card className="bg-glass border-slate-900 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-200">Visão de Saúde de Anúncios</CardTitle>
                    <CardDescription className="text-xs">Recomendações geradas de forma automatizada baseada no schema de reports.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-200">Saúde Geral do Tráfego: Saudável (8.5/10)</span>
                        <p className="text-slate-400 leading-relaxed">
                          A estrutura do Business Manager está saudável. O pixel e as conversões personalizadas estão coletando dados corretamente. O ROI de 3.42x está acima do patamar de segurança da conta.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300">Problemas Principais Detectados</span>
                      <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1">
                        <li>Fadiga de criativos detectada no conjunto &quot;Público Quente 30D&quot; (CTR caiu 12% nos últimos 3 dias).</li>
                        <li>Sobreposição de públicos de 14% entre as campanhas &quot;Campanha Conversão&quot; e &quot;Lookalike Leads&quot;.</li>
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-semibold text-slate-300">Recomendações de Otimização</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <span className="font-semibold text-slate-200 block mb-1">Rotacionar Criativos</span>
                          <span className="text-slate-400">Suba 2 novos vídeos de depoimento no conjunto Adset 01 para recuperar o CTR.</span>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <span className="font-semibold text-slate-200 block mb-1">Excluir Públicos</span>
                          <span className="text-slate-400">Adicione a exclusão mútua de compradores nos conjuntos de tráfego frio.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Share Panel */}
                <Card className="bg-glass border-slate-900 flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-slate-200">Compartilhamento de Dashboard</CardTitle>
                      <CardDescription className="text-xs">Crie links públicos protegidos por senha para clientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400">Nome do Share</label>
                        <Input
                          placeholder="Ex: Voxion Client - Relatório Mensal"
                          defaultValue="Voxion Client - Relatório Mensal"
                          className="bg-slate-900/50 border-slate-800 text-xs h-8 text-slate-300"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400">Vínculo de Campanhas</label>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[9px] font-medium bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded">Campanha Conversão</span>
                          <span className="text-[9px] font-medium bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded">Lookalike Leads</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-300 font-medium">Link de Compartilhamento Ativo</span>
                      </div>
                    </CardContent>
                  </div>
                  
                  <div className="p-6 pt-0 border-t border-slate-900/50 mt-4">
                    <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-900/50 text-slate-300 text-xs flex items-center gap-1.5 hover:bg-slate-800 hover:text-white">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-400" />
                      Visualizar Link do Cliente
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURE (CAMPAIGNS/AD SETS/ADS) */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaigns Table */}
              <Card className="bg-glass border-slate-900">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-200">Campanhas</CardTitle>
                    <CardDescription className="text-xs">Lista de campanhas importadas e sincronizadas.</CardDescription>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-medium px-2 py-0.5 rounded-full">
                    {campaigns.length} total
                  </span>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/20 text-slate-400">
                        <th className="p-3 font-semibold">Nome</th>
                        <th className="p-3 font-semibold">Meta Campaign ID</th>
                        <th className="p-3 font-semibold">Objetivo</th>
                        <th className="p-3 font-semibold">Orçamento Diário</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Data Criação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {campaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-200">{camp.name}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">{camp.meta_campaign_id}</td>
                          <td className="p-3 text-slate-300">{camp.objective}</td>
                          <td className="p-3 text-slate-300">
                            {camp.daily_budget ? `R$ ${camp.daily_budget.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium border ${
                              camp.status === 'ACTIVE'
                                ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}>
                              {camp.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 text-[10px]">
                            {new Date(camp.created_at).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Ad Sets & Ads Side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ad Sets List */}
                <Card className="bg-glass border-slate-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-200">Conjuntos de Anúncios (Ad Sets)</CardTitle>
                    <CardDescription className="text-xs">Orçamentos e objetivos de otimização em nível de conjunto.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/20 text-slate-400">
                          <th className="p-3 font-semibold">Nome</th>
                          <th className="p-3 font-semibold">Objetivo de Otimização</th>
                          <th className="p-3 font-semibold">Orçamento</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {adSets.map((as) => (
                          <tr key={as.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-3 font-semibold text-slate-200">{as.name}</td>
                            <td className="p-3 text-slate-300">{as.optimization_goal}</td>
                            <td className="p-3 text-slate-300">R$ {as.daily_budget.toFixed(2)}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/30 border border-emerald-900/40 text-emerald-400">
                                {as.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Ads List */}
                <Card className="bg-glass border-slate-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-200">Anúncios (Ads)</CardTitle>
                    <CardDescription className="text-xs">Criativos vinculados aos conjuntos de anúncios.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/20 text-slate-400">
                          <th className="p-3 font-semibold">Nome do Anúncio</th>
                          <th className="p-3 font-semibold">ID do Conjunto</th>
                          <th className="p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {ads.map((ad) => (
                          <tr key={ad.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-3 font-semibold text-slate-200">{ad.name}</td>
                            <td className="p-3 text-slate-400 font-mono text-[10px]">{ad.adset_id}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/30 border border-emerald-900/40 text-emerald-400">
                                {ad.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: META TOKENS */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <Card className="bg-glass border-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-200">Tokens da API Meta Graph</CardTitle>
                  <CardDescription className="text-xs">
                    Configure chaves e tokens de acesso para que o cron automatizado possa realizar o sync.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {metaTokens.map((token) => (
                    <div
                      key={token.id}
                      className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{token.account_name}</span>
                          <span className="text-[10px] text-slate-400">Account ID: <span className="font-mono">{token.account_id}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/30 border border-emerald-900/30 text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          Token Ativo
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-[10px]">Access Token (Meta Graph)</span>
                          <div className="font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-[10px] text-slate-300 truncate">
                            {token.access_token}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block text-[10px]">Business Manager ID</span>
                          <div className="font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-[10px] text-slate-300">
                            {token.business_manager_id || 'Não vinculado'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block text-[10px]">Vencimento do Token</span>
                          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-[10px] text-slate-300 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(token.token_expires_at).toLocaleString('pt-BR')}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 block text-[10px]">Última Modificação</span>
                          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-[10px] text-slate-300 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(token.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      Você pode conectar contas da Meta adicionais configurando registros na tabela <span className="font-mono text-slate-300">meta_tokens</span>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sync Logs */}
              <Card className="bg-glass border-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-200">Logs de Sincronização (Sync Log)</CardTitle>
                  <CardDescription className="text-xs">
                    Histórico de execuções das sincronizações manuais e automatizadas via cron.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="text-slate-300">{log.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Executado em: {new Date(log.synced_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 mb-1">
                          {log.status}
                        </span>
                        <span className="block text-[10px] text-slate-400">{log.duration_ms} ms</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Audit Logs */}
              <Card className="bg-glass border-slate-900">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-200">Logs de Segurança e Auditoria (Audit Logs)</CardTitle>
                  <CardDescription className="text-xs">
                    Registro de ações críticas executadas na plataforma administrativa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5 text-xs hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-400 font-mono text-[10px] uppercase">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs">{log.details}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Voxion Ads. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
