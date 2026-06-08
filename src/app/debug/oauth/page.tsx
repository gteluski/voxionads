'use client';

import { useState, useEffect } from 'react';

interface CheckResult {
  label: string;
  status: 'ok' | 'error' | 'warn' | 'pending';
  detail: string;
}

export default function DebugOAuthPage() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [callbackLogs, setCallbackLogs] = useState<string[]>([]);

  useEffect(() => {
    console.log('========================================');
    console.log('🔵 [DEBUG-OAUTH] Página de debug carregada');
    console.log('========================================');

    // Check URL params from callback redirect
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    const success = params.get('success');

    if (connected || success) {
      addLog('🟢 Callback retornou: connected=' + connected + ', success=' + success);
    }
    if (error) {
      addLog('🔴 Callback retornou erro: ' + error);
    }
  }, []);

  const addLog = (msg: string) => {
    setCallbackLogs(prev => [...prev, `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setChecks([]);
    const results: CheckResult[] = [];

    // 1. Check environment variables
    addLog('🔵 Verificando variáveis de ambiente...');
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;

    results.push({
      label: 'META_CLIENT_ID',
      status: clientId ? 'ok' : 'error',
      detail: clientId ? `✓ ${clientId}` : '✗ NEXT_PUBLIC_META_CLIENT_ID não configurado',
    });

    results.push({
      label: 'META_REDIRECT_URI',
      status: redirectUri ? 'ok' : 'error',
      detail: redirectUri ? `✓ ${redirectUri}` : '✗ NEXT_PUBLIC_META_REDIRECT_URI não configurado',
    });

    // Check if redirect URI uses HTTPS
    if (redirectUri) {
      const isHttps = redirectUri.startsWith('https://');
      results.push({
        label: 'HTTPS no Redirect URI',
        status: isHttps ? 'ok' : 'warn',
        detail: isHttps ? '✓ Usando HTTPS' : '⚠️ Usando HTTP — pode causar problemas com cookies secure',
      });
    }

    setChecks([...results]);
    addLog('🔵 Variáveis básicas verificadas');

    // 2. Check API redirect endpoint
    addLog('🔵 Testando /api/meta/auth/redirect (POST)...');
    try {
      const res = await fetch('/api/meta/auth/redirect', { method: 'POST' });
      const data = await res.json();

      results.push({
        label: 'API /redirect',
        status: res.ok ? 'ok' : 'error',
        detail: res.ok
          ? `✓ URL gerada: ${data.url?.substring(0, 60)}...`
          : `✗ Status ${res.status}: ${data.error || 'Falha'}`,
      });

      // Check if state cookie was set
      results.push({
        label: 'Cookie meta_oauth_state',
        status: 'warn',
        detail: '⚠️ Cookies httpOnly não são acessíveis via JS — verifique no DevTools > Application > Cookies',
      });
    } catch (err: any) {
      results.push({
        label: 'API /redirect',
        status: 'error',
        detail: `✗ Falha na requisição: ${err.message}`,
      });
    }

    setChecks([...results]);
    addLog('🔵 Teste de redirect concluído');

    // 3. Check Supabase connection
    addLog('🔵 Verificando Supabase...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    results.push({
      label: 'SUPABASE_URL',
      status: supabaseUrl ? 'ok' : 'error',
      detail: supabaseUrl ? `✓ ${supabaseUrl}` : '✗ Não configurado',
    });

    setChecks([...results]);

    // 4. Check Meta token endpoint (server-side check via health)
    addLog('🔵 Verificando health endpoint...');
    try {
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      results.push({
        label: 'Health Check',
        status: healthRes.ok ? 'ok' : 'warn',
        detail: healthRes.ok
          ? `✓ API respondendo: ${JSON.stringify(healthData).substring(0, 80)}`
          : `⚠️ Status ${healthRes.status}`,
      });
    } catch {
      results.push({
        label: 'Health Check',
        status: 'warn',
        detail: '⚠️ /api/health não disponível (não é crítico)',
      });
    }

    setChecks([...results]);
    addLog('🟢 Diagnóstico concluído!');
    setIsRunning(false);
  };

  const statusColor = (s: CheckResult['status']) => {
    switch (s) {
      case 'ok': return 'text-green-400 border-green-800/50 bg-green-950/20';
      case 'error': return 'text-red-400 border-red-800/50 bg-red-950/20';
      case 'warn': return 'text-amber-400 border-amber-800/50 bg-amber-950/20';
      case 'pending': return 'text-blue-400 border-blue-800/50 bg-blue-950/20';
    }
  };

  const statusIcon = (s: CheckResult['status']) => {
    switch (s) {
      case 'ok': return '✓';
      case 'error': return '✗';
      case 'warn': return '⚠';
      case 'pending': return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-[#31251f] p-6 md:p-8 font-mono text-[#d8c5b6]">
      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#f18535]/20 border border-[#f18535]/40 flex items-center justify-center text-lg">
            🔍
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#f18535]">Debug OAuth Meta</h1>
            <p className="text-xs text-[#d8c5b6]/60">Diagnóstico completo do fluxo de autenticação</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1f1915] p-5 rounded-lg border border-[#d8c5b6]/20 space-y-3">
          <h2 className="text-sm font-bold text-[#f18535] flex items-center gap-2">
            📋 Como usar este debug
          </h2>
          <ol className="space-y-1.5 text-xs text-[#d8c5b6]/80">
            <li className="flex gap-2"><span className="text-[#f18535] font-bold">1.</span> Abra <kbd className="bg-[#31251f] px-1.5 py-0.5 rounded text-[10px] border border-[#d8c5b6]/20">F12</kbd> (Developer Tools) → Console</li>
            <li className="flex gap-2"><span className="text-[#f18535] font-bold">2.</span> Clique em <strong>&quot;Executar Diagnóstico&quot;</strong> abaixo</li>
            <li className="flex gap-2"><span className="text-[#f18535] font-bold">3.</span> Se tudo OK, clique em <strong>&quot;Testar OAuth Completo&quot;</strong></li>
            <li className="flex gap-2"><span className="text-[#f18535] font-bold">4.</span> Após voltar do Facebook, veja os logs no console do <strong>servidor</strong> (terminal)</li>
            <li className="flex gap-2"><span className="text-[#f18535] font-bold">5.</span> Procure por <span className="text-red-400">🔴</span> = ERRO que explica ONDE falhou</li>
          </ol>
        </div>

        {/* Diagnostic buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-[#f18535] hover:bg-[#f5a35f] text-[#31251f] px-5 py-2.5 rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <span className="animate-spin">⏳</span>
                Diagnosticando...
              </>
            ) : (
              <>🩺 Executar Diagnóstico</>
            )}
          </button>

          <button
            onClick={() => {
              addLog('🔵 Iniciando fluxo OAuth completo...');
              addLog('🔵 Redirecionando para /api/meta/auth/redirect');
              console.log('========================================');
              console.log('🔵 [DEBUG] INICIANDO TESTE OAUTH COMPLETO');
              console.log('🔵 [DEBUG] Veja os logs no TERMINAL do servidor');
              console.log('========================================');
              window.location.href = '/api/meta/auth/redirect';
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2"
          >
            🚀 Testar OAuth Completo
          </button>

          <a
            href="/dashboard/configuracoes"
            className="bg-[#1f1915] hover:bg-[#2a1f19] text-[#d8c5b6] border border-[#d8c5b6]/20 px-5 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2"
          >
            ← Voltar para Configurações
          </a>
        </div>

        {/* Diagnostic Results */}
        {checks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#d8c5b6]/80 flex items-center gap-2">
              📊 Resultado do Diagnóstico
            </h2>
            <div className="space-y-1.5">
              {checks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${statusColor(check.status)}`}
                >
                  <span className="text-sm font-bold w-5 shrink-0">{statusIcon(check.status)}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs">{check.label}</span>
                    <p className="text-[11px] opacity-80 break-all">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1f1915] p-4 rounded-lg border border-red-900/30">
            <h2 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
              🔴 Se vir ERRO no console:
            </h2>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-[#31251f]/50 border border-red-900/20">
                <strong className="text-red-300">&quot;Usuário não autenticado&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Login expirou. Faça login novamente.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-red-900/20">
                <strong className="text-red-300">&quot;State inválido ou cookie expirado&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Cookie perdido no redirect. Cheque HTTPS e SameSite.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-red-900/20">
                <strong className="text-red-300">&quot;Falha ao trocar código pelo token&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ META_CLIENT_SECRET errado ou código expirado.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-red-900/20">
                <strong className="text-red-300">&quot;ERRO na encriptação&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Módulo crypto com problema. Cheque ENCRYPTION_KEY.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-red-900/20">
                <strong className="text-red-300">&quot;ERRO ao inserir Supabase&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ RLS bloqueando ou FK inválida. Cheque SERVICE_ROLE_KEY.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1f1915] p-4 rounded-lg border border-green-900/30">
            <h2 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
              🟢 Se vir SUCESSO:
            </h2>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-[#31251f]/50 border border-green-900/20">
                <strong className="text-green-300">&quot;✓✓✓ SUCESSO COMPLETO&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Token foi salvo no Supabase. Volte para Configurações.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-green-900/20">
                <strong className="text-green-300">&quot;✓ Token recebido&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Meta autorizou. Se falhar depois, é Supabase.</p>
              </div>
              <div className="p-2 rounded bg-[#31251f]/50 border border-green-900/20">
                <strong className="text-green-300">&quot;✓ Long-lived token recebido&quot;</strong>
                <p className="text-[#d8c5b6]/60 mt-0.5">→ Token de 60 dias gerado com sucesso.</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded bg-[#31251f]/50 border border-[#d8c5b6]/20">
              <h3 className="text-[10px] font-bold text-[#d8c5b6]/60 uppercase mb-1">Legenda dos logs:</h3>
              <div className="space-y-1 text-[11px]">
                <p><span className="text-blue-400">🔵</span> = Processando (info)</p>
                <p><span className="text-green-400">🟢</span> = Sucesso (passou)</p>
                <p><span className="text-red-400">🔴</span> = Erro (falhou AQUI!)</p>
                <p><span className="text-amber-400">⚠️</span> = Aviso (não-fatal)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Log Feed */}
        <div className="bg-[#1f1915] p-4 rounded-lg border border-[#d8c5b6]/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#d8c5b6]/80 flex items-center gap-2">
              📟 Log do Cliente (Frontend)
            </h2>
            <button
              onClick={() => setCallbackLogs([])}
              className="text-[10px] text-[#d8c5b6]/50 hover:text-[#d8c5b6] px-2 py-1 rounded border border-[#d8c5b6]/20"
            >
              Limpar
            </button>
          </div>
          <div className="bg-[#0d0a08] p-3 rounded-lg max-h-60 overflow-y-auto text-[11px] space-y-0.5 border border-[#d8c5b6]/10">
            {callbackLogs.length === 0 ? (
              <p className="text-[#d8c5b6]/30 italic">Nenhum log ainda. Execute o diagnóstico...</p>
            ) : (
              callbackLogs.map((log, i) => (
                <p key={i} className={
                  log.includes('🔴') ? 'text-red-400' :
                  log.includes('🟢') ? 'text-green-400' :
                  log.includes('⚠') ? 'text-amber-400' :
                  'text-[#d8c5b6]/70'
                }>
                  {log}
                </p>
              ))
            )}
          </div>
          <p className="text-[9px] text-[#d8c5b6]/40 mt-2">
            💡 Estes são logs do <strong>frontend</strong>. Para logs do <strong>servidor</strong> (callback, token exchange, Supabase), 
            veja o terminal onde <code>npm run dev</code> está rodando.
          </p>
        </div>

        {/* Environment Summary */}
        <div className="bg-[#1f1915] p-4 rounded-lg border border-[#d8c5b6]/20 text-xs space-y-2">
          <h2 className="text-sm font-bold text-[#d8c5b6]/80 flex items-center gap-2">
            🌐 Ambiente Atual
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex justify-between bg-[#31251f]/50 p-2 rounded">
              <span className="text-[#d8c5b6]/60">NODE_ENV</span>
              <span className="font-bold">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex justify-between bg-[#31251f]/50 p-2 rounded">
              <span className="text-[#d8c5b6]/60">CLIENT_ID</span>
              <span className="font-bold">{process.env.NEXT_PUBLIC_META_CLIENT_ID || '❌'}</span>
            </div>
            <div className="flex justify-between bg-[#31251f]/50 p-2 rounded">
              <span className="text-[#d8c5b6]/60">REDIRECT_URI</span>
              <span className="font-bold text-[10px] break-all">{process.env.NEXT_PUBLIC_META_REDIRECT_URI || '❌'}</span>
            </div>
            <div className="flex justify-between bg-[#31251f]/50 p-2 rounded">
              <span className="text-[#d8c5b6]/60">SUPABASE_URL</span>
              <span className="font-bold text-[10px] break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL || '❌'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
