'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Trash2,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Calendar,
  Layers,
  Globe,
  Settings,
  RefreshCw,
  Power,
  Database,
  Edit,
  AlertTriangle,
  History,
  Shield,
  Clock
} from 'lucide-react';

interface ConfiguracoesClientProps {
  session: Session;
  initialDbConnected: boolean;
  initialShares: any[];
  initialMetaTokens: any[];
  initialCampaigns: any[];
  initialSettings: any;
  initialSyncLogs: any[];
}

export function ConfiguracoesClient({
  session,
  initialDbConnected,
  initialShares,
  initialMetaTokens,
  initialCampaigns,
  initialSettings,
  initialSyncLogs
}: ConfiguracoesClientProps) {
  const router = useRouter();
  const [isDbConnected] = useState(initialDbConnected);
  
  // 1. Meta Account & Token states
  const [isMetaConnected, setIsMetaConnected] = useState(initialMetaTokens.length > 0);
  const [metaAccountName] = useState(initialMetaTokens[0]?.account_name || 'Voxion Ads BM Account');
  const [metaAccountId] = useState(initialMetaTokens[0]?.account_id || 'act_12093849102');
  const [metaBmId] = useState(initialMetaTokens[0]?.business_manager_id || 'bm_98471029384');
  const [lastRotationDate, setLastRotationDate] = useState(
    initialMetaTokens[0]?.updated_at || new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  );

  // 2. Settings states (Auto sync & data retention)
  const [syncFrequency, setSyncFrequency] = useState(initialSettings?.sync_frequency || '30min');
  const [autoSync, setAutoSync] = useState(initialSettings?.auto_sync ?? true);
  const [retentionPeriod, setRetentionPeriod] = useState(initialSettings?.data_retention_period || 'ilimitado');

  // 3. Sync logs state (last 10)
  const [syncLogs, setSyncLogs] = useState<any[]>(
    initialSyncLogs.length > 0 ? initialSyncLogs : [
      { id: 'mock-log-1', synced_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'SUCCESS', duration_ms: 12400, message: 'Sincronização concluída com sucesso.' },
      { id: 'mock-log-2', synced_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'SUCCESS', duration_ms: 9800, message: 'Sincronização concluída.' },
      { id: 'mock-log-3', synced_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(), status: 'ERROR', duration_ms: 3100, message: 'Erro Meta API: Token expirado.' }
    ]
  );

  // 4. Shares list state
  const [shares, setShares] = useState<any[]>(
    initialShares.length > 0 ? initialShares : [
      { id: 'mock-share-1', share_name: 'Relatório Clientes VIP', business_manager_id: 'bm_98471029384', campaign_ids: ['c1'], has_password: true, expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), is_active: true, created_at: new Date().toISOString() },
      { id: 'mock-share-2', share_name: 'Visão Geral Orgânica', business_manager_id: 'bm_98471029384', campaign_ids: [], has_password: false, expires_at: null, is_active: false, created_at: new Date().toISOString() }
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

  // Toast System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Modals & Forms States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Share form states
  const [shareName, setShareName] = useState('');
  const [bmId, setBmId] = useState(initialMetaTokens[0]?.business_manager_id || metaBmId || '');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Action loaders
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // 1. Meta Account disconnect
  const handleDisconnectMeta = async () => {
    if (!confirm('Deseja desconectar sua conta do Meta Ads? Isso desativará todas as sincronizações.')) {
      return;
    }
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/meta/disconnect', { method: 'DELETE' });
      if (res.ok) {
        setIsMetaConnected(false);
        showToast('Conta do Meta desconectada com sucesso!', 'success');
      } else {
        showToast('Erro ao desconectar conta.', 'error');
      }
    } catch (err) {
      setIsMetaConnected(false);
      showToast('Conta desconectada (Simulação).', 'info');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // 2. Token Rotation
  const handleRotateToken = async () => {
    setIsRotating(true);
    try {
      const res = await fetch('/api/meta/token/rotate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLastRotationDate(data.updated_at);
        showToast('Token rotacionado com sucesso!', 'success');
      } else {
        showToast('Erro ao rotacionar token.', 'error');
      }
    } catch (err) {
      setLastRotationDate(new Date().toISOString());
      showToast('Token rotacionado (Simulação).', 'info');
    } finally {
      setIsRotating(false);
    }
  };

  // 3. Save general settings (frequency, autosync, retention)
  const saveSettings = async (freq: string, auto: boolean, retention: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync_frequency: freq,
          auto_sync: auto,
          data_retention_period: retention
        })
      });
      if (res.ok) {
        showToast('Configurações atualizadas com sucesso!', 'success');
      } else {
        showToast('Erro ao atualizar configurações no banco.', 'error');
      }
    } catch (err) {
      showToast('Configurações salvas localmente (Simulação).', 'info');
    }
  };

  // 4. Trigger manual synchronization now
  const handleSyncNow = async () => {
    setIsSyncing(true);
    const syncStartTime = Date.now();
    try {
      const res = await fetch('/api/sync/manual', { method: 'POST' });
      const data = await res.json();
      const duration = Date.now() - syncStartTime;
      if (res.ok) {
        showToast('Sincronização manual executada com sucesso!', 'success');
        const newLog = {
          id: `log-${Math.random()}`,
          synced_at: new Date().toISOString(),
          status: 'SUCCESS',
          duration_ms: duration,
          message: `Sincronização manual: ${data.resumo?.campanhas || 1} campanha(s) synced.`
        };
        setSyncLogs(prev => [newLog, ...prev.slice(0, 9)]);
      } else {
        showToast(`Erro na sincronização: ${data.error || 'Falha no servidor.'}`, 'error');
        const newLog = {
          id: `log-${Math.random()}`,
          synced_at: new Date().toISOString(),
          status: 'ERROR',
          duration_ms: duration,
          message: `Erro: ${data.error || 'Erro na execução manual.'}`
        };
        setSyncLogs(prev => [newLog, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      const duration = Date.now() - syncStartTime;
      showToast('Sincronização concluída (Simulação).', 'info');
      const newLog = {
        id: `log-${Math.random()}`,
        synced_at: new Date().toISOString(),
        status: 'SUCCESS',
        duration_ms: duration,
        message: 'Sincronização manual concluída com dados simulados.'
      };
      setSyncLogs(prev => [newLog, ...prev.slice(0, 9)]);
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Data retention cleanup
  const handleDeleteOldData = async () => {
    if (retentionPeriod === 'ilimitado') {
      showToast('Não é possível limpar dados com o período de retenção definido como ilimitado.', 'error');
      return;
    }
    if (!confirm(`Tem certeza que deseja deletar dados de métricas com mais de ${retentionPeriod === '30d' ? '30 dias' : retentionPeriod === '90d' ? '90 dias' : '1 ano'}? Esta ação é permanente.`)) {
      return;
    }
    setIsCleaning(true);
    try {
      const res = await fetch('/api/settings/data-retention/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: retentionPeriod })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Limpeza efetuada com sucesso.', 'success');
      } else {
        showToast('Erro ao executar limpeza.', 'error');
      }
    } catch (err) {
      showToast('Limpeza executada (Simulação: 36 registros excluídos).', 'info');
    } finally {
      setIsCleaning(false);
    }
  };

  // 6. Share creation & edit methods
  const handleOpenCreateModal = () => {
    setEditingShareId(null);
    setShareName('');
    setBmId(initialMetaTokens[0]?.business_manager_id || metaBmId || '');
    setSelectedCampaigns([]);
    setPasswordProtected(false);
    setPassword('');
    setExpiresAt('');
    setIsActive(true);
    setGeneratedLink('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (share: any) => {
    setEditingShareId(share.id);
    setShareName(share.share_name);
    setBmId(share.business_manager_id);
    setSelectedCampaigns(share.campaign_ids || []);
    setPasswordProtected(share.has_password);
    setPassword(''); // keep blank unless resetting password
    setExpiresAt(share.expires_at ? share.expires_at.split('T')[0] : '');
    setIsActive(share.is_active);
    setGeneratedLink('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleCampaign = (id: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmitShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!shareName) {
      setErrorMsg('O nome do compartilhamento é obrigatório.');
      setIsSubmitting(false);
      return;
    }

    if (passwordProtected && !password && !editingShareId) {
      setErrorMsg('Defina uma senha de acesso.');
      setIsSubmitting(false);
      return;
    }

    const payload: any = {
      share_name: shareName,
      expires_at: expiresAt || null,
      campaign_ids: selectedCampaigns,
      is_active: isActive
    };
    
    // Only include password if set or explicitly changed
    if (passwordProtected) {
      if (password) {
        payload.password = password;
      }
    } else {
      payload.password = null; // removes password
    }

    try {
      if (editingShareId) {
        // Edit mode (PATCH)
        const res = await fetch(`/api/share/${editingShareId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setShares(prev => prev.map(s => s.id === editingShareId ? data.share : s));
          showToast('Compartilhamento atualizado com sucesso!', 'success');
          setIsModalOpen(false);
        } else {
          setErrorMsg(data.error || 'Erro ao salvar alterações.');
        }
      } else {
        // Create mode (POST)
        payload.business_manager_id = bmId;
        const res = await fetch('/api/share/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setShares(prev => [data.share, ...prev]);
          const origin = window.location.origin;
          setGeneratedLink(`${origin}/view/${data.share.id}`);
          showToast('Compartilhamento criado!', 'success');
        } else {
          setErrorMsg(data.error || 'Erro ao gerar link de compartilhamento.');
        }
      }
    } catch (err) {
      // Mock fallback state update
      const simulatedId = editingShareId || Math.random().toString(36).substring(2, 10);
      const simulatedShare = {
        id: simulatedId,
        share_name: shareName,
        business_manager_id: bmId,
        campaign_ids: selectedCampaigns,
        has_password: passwordProtected,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: isActive,
        created_at: new Date().toISOString()
      };

      // Mock update global simulated state in window
      const globalShares = (window as any).mockShares || {};
      globalShares[simulatedId] = {
        ...simulatedShare,
        password_hash: passwordProtected ? (password || 'existing_mock_hash') : null,
        admin_id: session.user.admin_id
      };
      (window as any).mockShares = globalShares;

      if (editingShareId) {
        setShares(prev => prev.map(s => s.id === editingShareId ? simulatedShare : s));
        showToast('Compartilhamento atualizado (Simulação).', 'info');
        setIsModalOpen(false);
      } else {
        setShares(prev => [simulatedShare, ...prev]);
        const origin = window.location.origin;
        setGeneratedLink(`${origin}/view/${simulatedId}`);
        showToast('Compartilhamento criado (Simulação).', 'info');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async (shareId: string) => {
    const origin = window.location.origin;
    const shareLink = `${origin}/view/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 2000);
      showToast('Link copiado para a área de transferência!', 'success');
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Deseja excluir permanentemente este link de compartilhamento?')) {
      return;
    }
    try {
      const res = await fetch(`/api/share/${shareId}`, { method: 'DELETE' });
      if (res.ok) {
        setShares(prev => prev.filter(s => s.id !== shareId));
        showToast('Link de compartilhamento excluído.', 'success');
      } else {
        setShares(prev => prev.filter(s => s.id !== shareId));
        showToast('Link removido.', 'success');
      }
    } catch (err) {
      setShares(prev => prev.filter(s => s.id !== shareId));
      showToast('Excluído localmente (Simulação).', 'info');
    }
  };

  const handleToggleActive = async (share: any) => {
    const updatedActive = !share.is_active;
    
    // Optimistic state toggle
    setShares(prev =>
      prev.map(s => (s.id === share.id ? { ...s, is_active: updatedActive } : s))
    );

    try {
      await fetch(`/api/share/${share.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedActive })
      });
      showToast(`Link ${updatedActive ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    } catch (err) {
      if ((window as any).mockShares && (window as any).mockShares[share.id]) {
        (window as any).mockShares[share.id].is_active = updatedActive;
      }
      showToast(`Estado alterado (Simulação).`, 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden pb-16">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      {/* Top Toast notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' :
          toast.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-300' :
          'bg-indigo-950/90 border-indigo-500 text-indigo-300'
        }`}>
          <span className={`h-2 w-2 rounded-full animate-pulse ${
            toast.type === 'success' ? 'bg-emerald-400' :
            toast.type === 'error' ? 'bg-red-400' :
            'bg-indigo-400'
          }`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Navigation top bar */}
      <nav className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white px-2 flex items-center gap-1.5"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <span className="text-slate-800">|</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white px-2"
                onClick={() => router.push('/relatorios')}
              >
                Relatórios
              </Button>
              <span className="text-slate-800">|</span>
              <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">Painel Administrativo</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-800">
              <span className={`h-1.5 w-1.5 rounded-full ${isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isDbConnected ? (
                <span className="text-slate-300">Base Ativa</span>
              ) : (
                <span className="text-amber-400">Ambiente Demo</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Page Header */}
        <div className="pb-4 border-b border-slate-900">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-indigo-400" />
            Configurações Gerais
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
            Gerencie integrações com a API do Meta Graph, configure a sincronização automática de métricas, crie links de compartilhamento protegidos para clientes e administre a retenção de dados históricos.
          </p>
        </div>

        {/* 2-Column Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Integration & Tokens */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* 1. Meta Account Section */}
            <Card className="bg-glass glow-indigo border-slate-900 hover:border-slate-800 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-indigo-400" />
                  1. Conta Meta Ads
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Dados da conta vinculada para carregamento de anúncios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMetaConnected ? (
                  <>
                    <div className="space-y-3 p-3 rounded-lg bg-slate-950/40 border border-slate-900/60">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Nome da Conta</span>
                        <span className="text-xs font-semibold text-slate-200">{metaAccountName}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">ID da Conta de Anúncios</span>
                        <span className="text-xs font-mono text-slate-350">{metaAccountId}</span>
                      </div>
                      {metaBmId && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Business Manager ID</span>
                          <span className="text-xs font-mono text-slate-350">{metaBmId}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      disabled={isDisconnecting}
                      onClick={handleDisconnectMeta}
                      className="w-full bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-900/30 text-xs font-bold py-1.5 h-8 flex items-center gap-1.5 justify-center transition-all"
                    >
                      <Power className="h-3.5 w-3.5" />
                      {isDisconnecting ? 'Desconectando...' : 'Desconectar conta Meta'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 py-3">
                    <div className="p-4 rounded-lg bg-amber-950/10 border border-amber-900/20 text-center space-y-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" />
                      <p className="text-[11px] text-amber-400">
                        Nenhuma conta do Meta Ads está conectada atualmente. O painel está em modo offline.
                      </p>
                    </div>
                    <Link href="/api/meta/auth/redirect" className="block">
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-xs font-bold py-1.5 h-8 flex items-center gap-1.5 justify-center">
                        <Globe className="h-3.5 w-3.5" />
                        Conectar Conta Meta Ads
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Token Meta Section */}
            <Card className="bg-glass glow-indigo border-slate-900 hover:border-slate-800 transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-indigo-400" />
                  2. Token de Acesso Meta
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Credencial de autenticação criptografada com chaves AES.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Meta API Token</span>
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-2.5 font-mono text-[10px] text-slate-500 tracking-widest text-center">
                      ••••••••••••••••••••••••••••
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 bg-slate-950/30 p-2 rounded border border-slate-900/40 font-medium">
                    <span>Última Rotação:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(lastRotationDate).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    disabled={isRotating || !isMetaConnected}
                    onClick={handleRotateToken}
                    className="border-slate-800 bg-slate-900/20 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold h-7 flex items-center gap-1 justify-center transition-all"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRotating ? 'animate-spin' : ''}`} />
                    {isRotating ? 'Rotacionando...' : 'Rotacionar Token'}
                  </Button>
                  
                  <Link href="/api/meta/auth/redirect" className="block w-full">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={!isMetaConnected}
                      className="w-full border-slate-800 bg-slate-900/20 hover:bg-slate-800 text-slate-350 text-[10px] font-semibold h-7 flex items-center gap-1 justify-center"
                    >
                      <Globe className="h-3 w-3" />
                      Reconectar OAuth
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Sync scheduler, Shares list, and Data Retention */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 3. Sincronização Section */}
            <Card className="bg-glass glow-indigo border-slate-900">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-indigo-400" />
                    3. Sincronização e Logs
                  </CardTitle>
                  <Button
                    size="sm"
                    disabled={isSyncing || !isMetaConnected}
                    onClick={handleSyncNow}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 h-7 transition-all flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
                  </Button>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Agende a coleta de dados e acompanhe o histórico das últimas execuções.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-950/35 border border-slate-900/60">
                  
                  {/* Frequency select */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Frequência da Sync</label>
                    <select
                      value={syncFrequency}
                      disabled={!autoSync}
                      onChange={(e) => {
                        setSyncFrequency(e.target.value);
                        saveSettings(e.target.value, autoSync, retentionPeriod);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 h-8 disabled:opacity-50"
                    >
                      <option value="5min">A cada 5 minutos</option>
                      <option value="30min">A cada 30 minutos (Recomendado)</option>
                      <option value="1h">A cada 1 hora</option>
                    </select>
                  </div>

                  {/* Auto Sync Toggle */}
                  <div className="flex items-center justify-between border-l border-slate-900/80 pl-0 md:pl-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-350 uppercase block">Sincronização Automática</span>
                      <span className="text-[9px] text-slate-500">Executar via Vercel Crons</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newAuto = !autoSync;
                        setAutoSync(newAuto);
                        saveSettings(syncFrequency, newAuto, retentionPeriod);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {autoSync ? (
                        <ToggleRight className="h-6.5 w-6.5 text-indigo-400" />
                      ) : (
                        <ToggleLeft className="h-6.5 w-6.5 text-slate-650" />
                      )}
                    </button>
                  </div>

                </div>

                {/* History table */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <History className="h-3.5 w-3.5 text-slate-500" />
                    Histórico Últimas 10 Sincronizações
                  </div>
                  
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20 max-h-48 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-500">
                          <th className="p-2 font-semibold">Data/Hora</th>
                          <th className="p-2 font-semibold">Status</th>
                          <th className="p-2 font-semibold">Duração</th>
                          <th className="p-2 font-semibold">Mensagem / Resultados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {syncLogs.map((log, idx) => (
                          <tr key={log.id || idx} className="hover:bg-slate-900/10 transition-colors">
                            <td className="p-2 font-mono text-[10px] text-slate-400">
                              {new Date(log.synced_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="p-2">
                              {log.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/10 border border-emerald-900/20 px-1.5 py-0.5 rounded text-[9px]">
                                  Sucesso
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-950/10 border border-red-900/20 px-1.5 py-0.5 rounded text-[9px]">
                                  Falha
                                </span>
                              )}
                            </td>
                            <td className="p-2 font-mono text-slate-350">
                              {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(2)}s` : '-'}
                            </td>
                            <td className="p-2 text-slate-400 truncate max-w-xs" title={log.message}>
                              {log.message || 'Sem detalhes.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 4. Compartilhamentos Section */}
            <Card className="bg-glass glow-indigo border-slate-900">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Share2 className="h-4.5 w-4.5 text-indigo-400" />
                    4. Compartilhamentos Criados
                  </CardTitle>
                  <Button
                    onClick={handleOpenCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3.5 h-7 transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Novo Compartilhamento
                  </Button>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Gerencie painéis externos read-only criados para visualização de clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shares.length > 0 ? (
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400">
                          <th className="p-3 font-semibold">Nome</th>
                          <th className="p-3 font-semibold">Vencimento</th>
                          <th className="p-3 font-semibold">Segurança</th>
                          <th className="p-3 font-semibold">Status</th>
                          <th className="p-3 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {shares.map((share) => {
                          const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
                          return (
                            <tr key={share.id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="p-3 font-bold text-slate-200 flex flex-col gap-0.5">
                                <span>{share.share_name}</span>
                                <span className="text-[9px] text-slate-500 font-mono">BM ID: {share.business_manager_id}</span>
                              </td>
                              <td className="p-3 text-slate-400 font-mono text-[11px]">
                                {share.expires_at ? new Date(share.expires_at).toLocaleDateString('pt-BR') : 'Sem limite'}
                              </td>
                              <td className="p-3">
                                {share.has_password ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[9px] font-bold bg-emerald-950/15 border border-emerald-900/20 px-1.5 py-0.5 rounded">
                                    <Lock className="h-3 w-3" />
                                    Senha
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-500 text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-bold">
                                    <Unlock className="h-3 w-3" />
                                    Aberto
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                {isExpired ? (
                                  <span className="text-[9px] bg-red-950/20 border border-red-900/25 text-red-400 px-2 py-0.5 rounded font-black">
                                    Expirado
                                  </span>
                                ) : share.is_active ? (
                                  <span className="text-[9px] bg-emerald-950/20 border border-emerald-900/25 text-emerald-400 px-2 py-0.5 rounded font-black">
                                    Ativo
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded">
                                    Inativo
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleActive(share)}
                                  className="text-slate-400 hover:text-white px-1.5 h-7"
                                  title={share.is_active ? 'Desativar link' : 'Ativar link'}
                                >
                                  {share.is_active ? (
                                    <ToggleRight className="h-5 w-5 text-indigo-400" />
                                  ) : (
                                    <ToggleLeft className="h-5 w-5 text-slate-650" />
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(share)}
                                  className="text-indigo-400 hover:text-indigo-300 px-1.5 h-7"
                                  title="Editar"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyLink(share.id)}
                                  className="text-indigo-400 hover:text-indigo-300 px-1.5 h-7"
                                  title="Copiar link"
                                >
                                  {copiedId === share.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-450" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteShare(share.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20 px-1.5 h-7"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-900 rounded-lg bg-slate-950/5">
                    Nenhum link de compartilhamento gerado.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Retenção de Dados Section */}
            <Card className="bg-glass glow-indigo border-slate-900">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-indigo-400" />
                  5. Retenção de Dados de Métricas
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Defina o limite de armazenamento das tabelas de estatísticas diárias no banco.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/30 border border-slate-900/50">
                  <div className="space-y-1 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Período de Armazenamento</span>
                    <span className="text-[10px] text-slate-500 block">
                      Dados antigos são automaticamente deletados para otimizar espaço de banco.
                    </span>
                    <select
                      value={retentionPeriod}
                      onChange={(e) => {
                        setRetentionPeriod(e.target.value);
                        saveSettings(syncFrequency, autoSync, e.target.value);
                      }}
                      className="mt-1 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 h-8 w-44"
                    >
                      <option value="30d">30 Dias</option>
                      <option value="90d">90 Dias</option>
                      <option value="365d">365 Dias (1 Ano)</option>
                      <option value="ilimitado">Ilimitado</option>
                    </select>
                  </div>

                  <div className="flex items-center shrink-0">
                    <Button
                      variant="outline"
                      disabled={isCleaning || retentionPeriod === 'ilimitado'}
                      onClick={handleDeleteOldData}
                      className="border-slate-800 bg-red-950/15 hover:bg-red-950/30 text-red-450 text-xs font-bold px-4 py-2 h-9 flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isCleaning ? 'Limpando...' : 'Deletar dados antigos agora'}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>

        </div>

      </main>

      {/* CREATE & EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-indigo-400" />
                {editingShareId ? 'Editar Compartilhamento' : 'Novo Compartilhamento de Dashboard'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/40 text-red-400 text-xs rounded-lg p-3 mb-4">
                {errorMsg}
              </div>
            )}

            {/* Success link panel (Only shown in create mode on successful generation) */}
            {generatedLink ? (
              <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-4 space-y-4 mb-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <Check className="h-4.5 w-4.5 text-emerald-455" />
                  Link gerado com sucesso!
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 font-mono text-[10px] text-slate-350 focus:outline-none"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopiedId('modal-link');
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold px-3.5 flex items-center gap-1"
                  >
                    {copiedId === 'modal-link' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Compartilhe este link com seu cliente. Se você ativou a proteção por senha, não esqueça de informá-la separadamente.
                </p>
                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-slate-800 text-xs font-bold h-7"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              /* FORM BUILDER */
              <form onSubmit={handleSubmitShare} className="space-y-4">
                
                {/* Share Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Compartilhamento</label>
                  <Input
                    type="text"
                    placeholder="Ex: Dashboard Cliente Voxion"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-xs h-9 focus:border-indigo-500"
                  />
                </div>

                {/* Account / BM selector (Read-only if editing) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Business Manager Conectada</label>
                  {editingShareId ? (
                    <Input
                      type="text"
                      readOnly
                      disabled
                      value={`${metaAccountName} (${bmId})`}
                      className="bg-slate-950/50 border-slate-800/80 text-slate-400 text-xs h-9"
                    />
                  ) : (
                    <select
                      value={bmId}
                      onChange={(e) => setBmId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-9"
                    >
                      {initialMetaTokens.map((token) => (
                        <option key={token.id} value={token.business_manager_id}>
                          {token.account_name} ({token.business_manager_id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Restricted Campaigns */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Restringir a Campanhas (Vazio = Todas)</label>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg max-h-36 overflow-y-auto space-y-2">
                    {campaigns.map((camp) => {
                      const isSelected = selectedCampaigns.includes(camp.id);
                      return (
                        <div
                          key={camp.id}
                          onClick={() => handleToggleCampaign(camp.id)}
                          className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors border ${
                            isSelected
                              ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300'
                              : 'border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-350'
                          }`}
                        >
                          <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </div>
                          <span className="text-[10px] font-semibold truncate">{camp.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expiration Date picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Data de Expiração (Opcional)
                  </label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs h-9 focus:border-indigo-500"
                  />
                </div>

                {/* Password Lock Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/30">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Proteger com Senha</span>
                    <span className="text-[9px] text-slate-500">Exigir senha para acessar o link compartilhado</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordProtected(!passwordProtected)}
                    className="text-slate-400 hover:text-white"
                  >
                    {passwordProtected ? (
                      <ToggleRight className="h-6.5 w-6.5 text-indigo-400" />
                    ) : (
                      <ToggleLeft className="h-6.5 w-6.5 text-slate-650" />
                    )}
                  </button>
                </div>

                {/* Password field - only if toggled */}
                {passwordProtected && (
                  <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      {editingShareId ? 'Redefinir Senha do Link (Opcional)' : 'Definir Senha do Link'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        type="password"
                        placeholder={editingShareId ? 'Deixe em branco para manter a senha atual' : 'Senha de acesso para o cliente'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={passwordProtected && !editingShareId}
                        className="bg-slate-950 border-slate-800 pl-9 text-xs h-9 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/30">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-300 uppercase block">Link Ativo</span>
                    <span className="text-[9px] text-slate-500">Ativa ou desativa temporariamente o compartilhamento</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isActive ? (
                      <ToggleRight className="h-6.5 w-6.5 text-indigo-400" />
                    ) : (
                      <ToggleLeft className="h-6.5 w-6.5 text-slate-650" />
                    )}
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate-800 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-slate-800 text-xs font-bold h-8"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-8 px-4"
                  >
                    {isSubmitting ? 'Salvando...' : editingShareId ? 'Salvar Alterações' : 'Gerar Link'}
                  </Button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
