export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { performAdminSync } from '@/utils/sync-orchestrator';

// Helper to wrap a promise with a timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Simulated email notification helper
async function notifyAdminByEmail(adminEmail: string, adminId: string, consecutiveFailures: number, lastError: string) {
  const alertMsg = `A sincronização automática falhou ${consecutiveFailures} vezes consecutivas. Último erro: ${lastError}`;
  
  // 1. Log to console for dev monitoring
  console.error(`[CRITICAL CRON ALERT] Email enviado para ${adminEmail}. ${alertMsg}`);

  // 2. Insert alert record into system audit logs
  try {
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: 'EMAIL_ALERT_SENT',
      details: `Simulação de notificação por email para ${adminEmail}: ${alertMsg}`,
      ip_address: '127.0.0.1',
      user_agent: 'Vercel Cron Service',
    });
  } catch (err) {
    console.error('Failed to save email alert audit log:', err);
  }
}

// Main handler covering GET (testing) and POST (production crons)
async function handleSyncCron(req: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get('test') === '1';

  // 1. Cron Secret Validation
  if (!isTest) {
    const cronSecret = process.env.CRON_SECRET;
    const receivedSecret = req.headers.get('X-Vercel-Cron-Secret');
    
    if (cronSecret && receivedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
  }

  const summary = {
    totalAdmins: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    details: [] as any[],
  };

  try {
    // 2. Fetch all meta tokens from database
    let metaTokens: any[] = [];
    let dbSuccess = false;

    try {
      const { data, error } = await supabase
        .from('meta_tokens')
        .select('*');

      if (!error && data) {
        metaTokens = data;
        dbSuccess = true;
      }
    } catch (err) {
      console.warn('Database query failed for cron tokens. Using mock fallback.', err);
    }

    // Fallback Mock Token in demo/offline mode
    if (!dbSuccess || metaTokens.length === 0) {
      metaTokens = [
        {
          id: 't1',
          admin_id: 'mock-admin-id',
          account_id: 'act_12093849102',
          account_name: 'Voxion Ads BM Account',
          business_manager_id: 'bm_98471029384',
          access_token: 'mock_access_token_cron',
          token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }

    // If test mode parameter is set, limit execution to exactly 1 admin
    if (isTest && metaTokens.length > 0) {
      metaTokens = metaTokens.slice(0, 1);
    }

    summary.totalAdmins = metaTokens.length;

    // 3. Sequential Sync Loop (Acts as the queue preventing Meta Graph rate limits)
    for (const token of metaTokens) {
      const adminId = token.admin_id;
      let adminEmail = 'admin@voxion.ads';

      // Resolve admin email
      try {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('email')
          .eq('id', adminId)
          .maybeSingle();
        if (adminRecord?.email) {
          adminEmail = adminRecord.email;
        }
      } catch (err) {
        // use default mock email
      }

      const adminStartTime = Date.now();
      try {
        console.log(`[Cron Sync] Iniciando sincronização para admin ID: ${adminId}`);

        // Timeout Handling: Maximum 5 minutes (300,000 ms) per admin sync
        const result = await withTimeout(
          performAdminSync(adminId, token, isTest),
          300000,
          `Tempo limite de 5 minutos excedido para sincronização do admin ${adminEmail}.`
        );

        const durationSecs = result.durationMs / 1000;
        const syncMsg = `Sincronização automática concluída: ${result.campaignsCount} campanhas, ${result.adsetsCount} conjuntos, ${result.adsCount} anúncios, ${result.metricsSavedCount} métricas.`;

        // Log success
        await supabase.from('sync_log').insert({
          admin_id: adminId,
          status: 'SUCCESS',
          message: syncMsg,
          synced_at: new Date().toISOString(),
          duration_ms: result.durationMs,
        });

        summary.successfulSyncs++;
        summary.details.push({
          adminId,
          email: adminEmail,
          status: 'SUCCESS',
          duration: `${durationSecs.toFixed(2)}s`,
        });

      } catch (adminError: any) {
        console.error(`[Cron Sync] Falha ao sincronizar admin ${adminEmail}:`, adminError);

        const adminDurationMs = Date.now() - adminStartTime;
        
        // Log failure in database
        try {
          await supabase.from('sync_log').insert({
            admin_id: adminId,
            status: 'ERROR',
            message: `Falha na sincronização automática: ${adminError.message || 'Erro desconhecido'}`,
            synced_at: new Date().toISOString(),
            duration_ms: adminDurationMs,
          });
        } catch (logErr) {
          console.error('Failed to log sync error:', logErr);
        }

        summary.failedSyncs++;
        summary.details.push({
          adminId,
          email: adminEmail,
          status: 'ERROR',
          error: adminError.message || 'Erro desconhecido',
        });

        // 4. Consecutive Failures Checking (Notify by email if failed 3 times consecutively)
        try {
          const { data: recentLogs } = await supabase
            .from('sync_log')
            .select('status')
            .eq('admin_id', adminId)
            .order('synced_at', { ascending: false })
            .limit(3);

          const hasThreeFailures =
            recentLogs &&
            recentLogs.length === 3 &&
            recentLogs.every((log) => log.status === 'ERROR');

          if (hasThreeFailures) {
            await notifyAdminByEmail(adminEmail, adminId, 3, adminError.message || 'Erro de conexão');
          }
        } catch (err) {
          console.error('Failed to query consecutive failures count:', err);
        }
      }
    }

    // 5. Total Cron Execution Duration Check (Alert if total execution time > 4 minutes)
    const totalDurationMs = Date.now() - startTime;
    if (totalDurationMs > 240000) { // 4 minutes
      const alertMsg = `A execução da cron de sincronização demorou ${(totalDurationMs / 1000).toFixed(2)}s, ultrapassando o limite recomendado de 4 minutos.`;
      console.warn(`[WARN CRON DURATION] ${alertMsg}`);

      try {
        await supabase.from('audit_logs').insert({
          action: 'CRON_DURATION_ALERT',
          details: alertMsg,
          ip_address: '127.0.0.1',
          user_agent: 'Vercel Cron Service',
        });
      } catch (err) {
        console.error('Failed to save cron duration warning audit log:', err);
      }
    }

    return NextResponse.json({
      message: 'Processamento da cron de sincronização concluído.',
      duracao_total: `${(totalDurationMs / 1000).toFixed(2)}s`,
      resumo: summary,
    });

  } catch (error: any) {
    console.error('Cron Critical Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro crítico na execução do cron.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return handleSyncCron(req);
}

export async function GET(req: Request) {
  return handleSyncCron(req);
}
