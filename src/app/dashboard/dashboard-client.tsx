'use client';

import { useState } from 'react';
// removed Session import
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { ReportCard } from '@/components/ui/report-card';
import { SyncStatus } from '@/components/ui/sync-status';
import { Sidebar } from '@/components/layout/sidebar';
import { PageHeader } from '@/components/layout/page-header';
import { AppFooter } from '@/components/layout/app-footer';
import {
  TrendingUp, Layers, FileText, KeyRound,
  DollarSign, Eye, MousePointer, Percent,
  CheckCircle, Calendar, ArrowRight,
  Activity, Zap,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'tokens' | 'logs'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDbConnected] = useState(initialDbConnected);

  const [campaigns, setCampaigns] = useState<any[]>(
    initialCampaigns.length > 0 ? initialCampaigns : [
      { id: 'c1', name: 'Campanha Conversão - Black Friday 2026', meta_campaign_id: 'act_12093849102-c1', status: 'ACTIVE', objective: 'CONVERSIONS', daily_budget: 500.00, created_at: '2026-06-01T10:00:00Z' },
      { id: 'c2', name: 'Lookalike Leads Premium - Whitelist', meta_campaign_id: 'act_12093849102-c2', status: 'ACTIVE', objective: 'LEAD_GENERATION', daily_budget: 250.00, created_at: '2026-06-02T12:00:00Z' },
      { id: 'c3', name: 'Retargeting Carrinho Abandonado 7D', meta_campaign_id: 'act_12093849102-c3', status: 'PAUSED', objective: 'CONVERSIONS', daily_budget: 100.00, created_at: '2026-06-03T08:30:00Z' },
      { id: 'c4', name: 'Branding & Tráfego Frio - Reels Video', meta_campaign_id: 'act_12093849102-c4', status: 'ACTIVE', objective: 'VIDEO_VIEWS', daily_budget: 150.00, created_at: '2026-06-04T09:15:00Z' },
    ]
  );

  const [metaTokens] = useState<any[]>(
    initialMetaTokens.length > 0 ? initialMetaTokens : [
      { id: 't1', account_name: 'Voxion Ads BM Account', account_id: 'act_12093849102', business_manager_id: 'bm_98471029384', access_token: 'EAAOz18uXpd8BA...', token_expires_at: '2026-08-04T10:00:00Z', created_at: '2026-06-04T10:00:00Z' },
    ]
  );

  const [syncLogs, setSyncLogs] = useState<any[]>(
    initialSyncLogs.length > 0 ? initialSyncLogs : [
      { id: 's1', status: 'SUCCESS', message: 'Sincronização concluída: 4 campanhas importadas.', synced_at: '2026-06-04T10:15:00Z', duration_ms: 1820 },
      { id: 's2', status: 'SUCCESS', message: 'Sincronização periódica automatizada.', synced_at: '2026-06-04T09:00:00Z', duration_ms: 1540 },
    ]
  );

  const [auditLogs, setAuditLogs] = useState<any[]>(
    initialAuditLogs.length > 0 ? initialAuditLogs : [
      { id: 'a1', action: 'LOGIN', details: `Usuário ${session.user?.email} realizou login.`, created_at: new Date().toISOString() },
      { id: 'a2', action: 'TOKEN_REFRESH', details: 'Meta Graph API token validado.', created_at: '2026-06-04T10:00:00Z' },
    ]
  );

  const [adSets] = useState<any[]>([
    { id: 'as1', campaign_id: 'c1', name: 'Adset - Público Quente 30D', status: 'ACTIVE', daily_budget: 300.00, optimization_goal: 'PURCHASE' },
    { id: 'as2', campaign_id: 'c1', name: 'Adset - Interesses E-commerce', status: 'ACTIVE', daily_budget: 200.00, optimization_goal: 'PURCHASE' },
    { id: 'as3', campaign_id: 'c2', name: 'Adset - Empresários Brasil', status: 'ACTIVE', daily_budget: 250.00, optimization_goal: 'LEAD' },
  ]);

  const [ads] = useState<any[]>([
    { id: 'ad1', adset_id: 'as1', name: 'Criativo 01 - Vídeo Depoimentos', status: 'ACTIVE' },
    { id: 'ad2', adset_id: 'as1', name: 'Criativo 02 - Carrossel Benefícios', status: 'ACTIVE' },
    { id: 'ad3', adset_id: 'as2', name: 'Criativo 03 - Foto Oferta Frete Grátis', status: 'ACTIVE' },
  ]);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    const ts = new Date().toISOString();
    setSyncLogs(prev => [{
      id: `s_${Date.now()}`, status: 'SUCCESS',
      message: 'Sincronização manual: 4 campanhas e 3 conjuntos atualizados.',
      synced_at: ts, duration_ms: 2240,
    }, ...prev]);
    setAuditLogs(prev => [{
      id: `a_${Date.now()}`, action: 'SYNC_TRIGGERED',
      details: `Sync iniciado por ${session.user?.name}`, created_at: ts,
    }, ...prev]);
    setIsSyncing(false);
    if (isDbConnected) {
      fetch('/api/sync/manual', { method: 'POST' }).catch(() => {});
    }
  };

  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',  label: 'Visão Geral',            icon: <TrendingUp size={14} /> },
    { key: 'campaigns', label: 'Campanhas / Ad Sets',     icon: <Layers size={14} /> },
    { key: 'tokens',    label: 'Tokens Meta',             icon: <KeyRound size={14} /> },
    { key: 'logs',      label: 'Logs do Sistema',         icon: <FileText size={14} /> },
  ];

  // ── styles ──
  const cardStyle = {
    background: 'var(--color-bg-dark)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
  };
  const sectionTitle = {
    fontSize: 'var(--fs-body)',
    fontWeight: 700,
    color: 'var(--color-accent)',
    fontFamily: 'var(--font-heading)',
    marginBottom: 'var(--space-1)',
  };
  const sectionDesc = {
    fontSize: 'var(--fs-small)',
    color: 'var(--color-accent-dim)',
    marginBottom: 'var(--space-4)',
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg-darker)' }}>
      {/* Sidebar */}
      <Sidebar onSync={handleSync} isSyncing={isSyncing} />

      {/* Main content — offset by sidebar width */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 240 }}>
        <main className="flex-1 px-8 py-7 space-y-6 max-w-[1200px] w-full mx-auto">

          {/* Page Header */}
          <PageHeader
            title="Painel Geral"
            breadcrumb="Dashboard"
            description="Gerencie contas, monitore ROI e sincronize dados da API Meta."
            actions={
              <div className="flex items-center gap-3">
                <SyncStatus
                  lastSync={new Date(syncLogs[0]?.synced_at ?? Date.now())}
                  nextSync={new Date(Date.now() + 25 * 60 * 1000)}
                  status={isSyncing ? 'pending' : 'success'}
                />
                {/* DB indicator */}
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--fs-tiny)',
                    fontFamily: 'var(--font-mono)',
                    color: isDbConnected ? '#4CAF50' : '#FF9800',
                    background: isDbConnected ? 'rgba(76,175,80,0.08)' : 'rgba(255,152,0,0.08)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: isDbConnected ? '#4CAF50' : '#FF9800', animation: isDbConnected ? 'vx-pulse-orange 2s infinite' : undefined }}
                  />
                  {isDbConnected ? 'Supabase Ativo' : 'Demo Mode'}
                </span>
              </div>
            }
          />

          {/* Tab Bar */}
          <div className="flex gap-1" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 1 }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all rounded-t-md"
                style={{
                  fontSize: 'var(--fs-small)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-accent-muted)',
                  background: activeTab === tab.key ? 'rgba(241,133,53,0.05)' : 'transparent',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ──────────── TAB: OVERVIEW ──────────── */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<DollarSign size={16} />} label="Total Investido" value="R$ 18.450" change={14.2} trend="up" color="orange" index={0} />
                <MetricCard icon={<Eye size={16} />} label="Impressões" value="842.190" change={8.1} trend="up" color="info" index={1} />
                <MetricCard icon={<MousePointer size={16} />} label="Cliques (CTR)" value="22.840" unit="2.71%" change={5.3} trend="up" color="muted" index={2} />
                <MetricCard icon={<Percent size={16} />} label="Conversões (ROI)" value="748" unit="3.42x" change={3.2} trend="up" color="success" index={3} />
              </div>

              {/* Health Panel + Share */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Health */}
                <div className="lg:col-span-2" style={cardStyle}>
                  <p style={sectionTitle}>Saúde de Desempenho</p>
                  <p style={sectionDesc}>Recomendações geradas automaticamente pelo motor de análise.</p>
                  <ReportCard
                    title="Campanha Conversão — Black Friday 2026"
                    overallHealth="warning"
                    trend="stable"
                    issues={[
                      "Fadiga de criativo no Adset Público Quente 30D (CTR caiu 12% em 3 dias)",
                      "Sobreposição de públicos de 14% entre Campanha Conversão e Lookalike Leads",
                    ]}
                    recommendations={[
                      "Suba 2 novos vídeos de depoimento no Adset 01 para recuperar CTR",
                      "Adicione exclusão mútua de compradores nos conjuntos de tráfego frio",
                    ]}
                    onViewReport={() => {}}
                  />
                </div>

                {/* Share Panel */}
                <div style={cardStyle} className="flex flex-col">
                  <p style={sectionTitle}>Compartilhamento</p>
                  <p style={sectionDesc}>Links públicos com proteção por senha para clientes.</p>

                  <div className="space-y-3 flex-1">
                    <div
                      className="rounded-lg p-3"
                      style={{ background: 'rgba(241,133,53,0.06)', border: '1px solid rgba(241,133,53,0.2)' }}
                    >
                      <p className="font-bold" style={{ fontSize: 'var(--fs-small)', color: 'var(--color-accent)' }}>
                        Voxion Client — Relatório Mensal
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {['Campanha Conversão', 'Lookalike Leads'].map(t => (
                          <span key={t} className="vx-badge vx-badge-orange" style={{ fontSize: '10px' }}>{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4CAF50' }} />
                        <span style={{ fontSize: 'var(--fs-tiny)', color: '#4CAF50', fontFamily: 'var(--font-mono)' }}>
                          Link ativo
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link href="/configuracoes" className="mt-4">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ArrowRight size={13} />
                      Gerenciar compartilhamentos
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Campanhas Ativas', value: campaigns.filter(c => c.status === 'ACTIVE').length, color: '#4CAF50', icon: <Activity size={16} /> },
                  { label: 'Orçamento Total/Dia', value: `R$ ${campaigns.reduce((a, c) => a + (c.daily_budget ?? 0), 0).toFixed(0)}`, color: 'var(--color-primary)', icon: <DollarSign size={16} /> },
                  { label: 'Última Sync', value: 'Há 5 min', color: 'var(--color-accent-muted)', icon: <Zap size={16} /> },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    style={{
                      ...cardStyle,
                      display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)',
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}40`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--fs-tiny)', color: 'var(--color-accent-dim)', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {stat.label}
                      </p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ──────────── TAB: CAMPAIGNS ──────────── */}
          {activeTab === 'campaigns' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Campaigns table */}
              <div style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p style={sectionTitle}>Campanhas</p>
                    <p style={sectionDesc}>Campanhas importadas e sincronizadas da Meta.</p>
                  </div>
                  <span className="vx-badge vx-badge-orange">{campaigns.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="vx-table-header">
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Objetivo</th>
                        <th className="px-4 py-3 text-right">Orçamento/dia</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((camp, i) => (
                        <motion.tr
                          key={camp.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className="vx-table-row"
                        >
                          <td className="px-4 py-0 font-bold" style={{ color: 'var(--color-accent)' }}>{camp.name}</td>
                          <td className="px-4 py-0" style={{ color: 'var(--color-accent-muted)', fontSize: 'var(--fs-small)' }}>{camp.objective}</td>
                          <td className="px-4 py-0 text-right" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-small)', color: 'var(--color-primary)' }}>
                            R$ {camp.daily_budget?.toFixed(2) ?? '—'}
                          </td>
                          <td className="px-4 py-0">
                            <span
                              className="vx-badge"
                              style={camp.status === 'ACTIVE'
                                ? { background: 'rgba(76,175,80,0.1)', borderColor: 'rgba(76,175,80,0.4)', color: '#4CAF50' }
                                : { background: 'rgba(255,152,0,0.1)', borderColor: 'rgba(255,152,0,0.4)', color: '#FF9800' }}
                            >
                              {camp.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                            </span>
                          </td>
                          <td className="px-4 py-0 vx-mono">{new Date(camp.created_at).toLocaleDateString('pt-BR')}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ad Sets + Ads */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[
                  { label: 'Conjuntos de Anúncios', desc: 'Orçamentos e objetivos por conjunto.', rows: adSets, cols: ['Nome', 'Objetivo', 'Orçamento', 'Status'] },
                  { label: 'Anúncios (Ads)', desc: 'Criativos vinculados aos conjuntos.', rows: ads, cols: ['Nome', 'Ad Set ID', 'Status'] },
                ].map(section => (
                  <div key={section.label} style={cardStyle}>
                    <p style={sectionTitle}>{section.label}</p>
                    <p style={sectionDesc}>{section.desc}</p>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="vx-table-header">
                          {section.cols.map(c => <th key={c} className="px-3 py-2">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row: any) => (
                          <tr key={row.id} className="vx-table-row">
                            <td className="px-3 py-0 font-bold" style={{ color: 'var(--color-accent)', fontSize: 'var(--fs-small)' }}>{row.name}</td>
                            <td className="px-3 py-0 vx-mono">{row.optimization_goal ?? row.adset_id}</td>
                            {row.daily_budget !== undefined && (
                              <td className="px-3 py-0" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-tiny)', color: 'var(--color-primary)' }}>
                                R$ {row.daily_budget.toFixed(2)}
                              </td>
                            )}
                            <td className="px-3 py-0">
                              <span className="vx-badge vx-badge-success">{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ──────────── TAB: TOKENS ──────────── */}
          {activeTab === 'tokens' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div style={cardStyle}>
                <p style={sectionTitle}>Tokens da API Meta Graph</p>
                <p style={sectionDesc}>Chaves de acesso para sincronização automatizada via cron.</p>

                <div className="space-y-4">
                  {metaTokens.map(token => (
                    <div key={token.id} className="rounded-xl p-4 space-y-4"
                      style={{ background: 'rgba(216,197,182,0.04)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <div>
                          <p className="font-bold" style={{ color: 'var(--color-accent)' }}>{token.account_name}</p>
                          <p style={{ fontSize: 'var(--fs-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-dim)' }}>
                            Account ID: {token.account_id}
                          </p>
                        </div>
                        <span className="vx-badge vx-badge-success flex items-center gap-1">
                          <CheckCircle size={10} /> Token Ativo
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Access Token', value: token.access_token },
                          { label: 'Business Manager ID', value: token.business_manager_id ?? 'Não vinculado' },
                          { label: 'Vencimento', value: new Date(token.token_expires_at).toLocaleString('pt-BR'), icon: <Calendar size={12} /> },
                          { label: 'Criado em', value: new Date(token.created_at).toLocaleString('pt-BR'), icon: <Calendar size={12} /> },
                        ].map(field => (
                          <div key={field.label}>
                            <p className="mb-1 font-bold uppercase tracking-wider" style={{ fontSize: 'var(--fs-tiny)', color: 'var(--color-accent-dim)' }}>
                              {field.label}
                            </p>
                            <div
                              className="px-3 py-2 rounded-lg flex items-center gap-2"
                              style={{
                                background: 'var(--color-bg-darker)',
                                border: '1px solid var(--color-border)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--fs-tiny)',
                                color: 'var(--color-accent)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {field.icon && <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>{field.icon}</span>}
                              {field.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ──────────── TAB: LOGS ──────────── */}
          {activeTab === 'logs' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            >
              {/* Sync Logs */}
              <div style={cardStyle}>
                <p style={sectionTitle}>Logs de Sincronização</p>
                <p style={sectionDesc}>Histórico de execuções manuais e automáticas via cron.</p>
                <div className="space-y-2">
                  {syncLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-lg p-3 flex items-start justify-between gap-3"
                      style={{ background: 'rgba(216,197,182,0.03)', border: '1px solid var(--color-border-light)' }}
                    >
                      <div className="min-w-0">
                        <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-accent)' }}>{log.message}</p>
                        <p className="vx-mono mt-1">{new Date(log.synced_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="vx-badge vx-badge-success">{log.status}</span>
                        <p className="vx-mono mt-1">{log.duration_ms}ms</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Audit Logs */}
              <div style={cardStyle}>
                <p style={sectionTitle}>Logs de Segurança</p>
                <p style={sectionDesc}>Registro de ações críticas na plataforma.</p>
                <div className="space-y-2">
                  {auditLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-lg p-3 space-y-1"
                      style={{ background: 'rgba(216,197,182,0.03)', border: '1px solid var(--color-border-light)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--fs-tiny)',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="vx-mono">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-accent-muted)' }}>{log.details}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
