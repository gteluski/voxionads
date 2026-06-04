export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { performAdminSync } from '@/utils/sync-orchestrator';

export async function POST(req: Request) {
  const startTime = Date.now();
  let adminId = '';
  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get('test') === '1';

  try {
    // 1. Validate authenticated admin session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login como administrador.' },
        { status: 401 }
      );
    }

    adminId = session.user.admin_id;

    // 2. Fetch Meta Token record from DB
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('meta_tokens')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      console.error('Error fetching meta token:', tokenError);
      return NextResponse.json(
        { error: 'Erro ao consultar token de acesso do Meta.' },
        { status: 500 }
      );
    }

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Nenhum token do Meta conectado. Vincule sua conta do Facebook nas configurações.' },
        { status: 400 }
      );
    }

    // 3. Delegate to sync orchestrator
    const result = await performAdminSync(adminId, tokenRecord, isTest);

    const durationSecs = result.durationMs / 1000;
    const syncMsg = `Sincronização manual concluída ${isTest ? '(Modo Teste)' : ''}: ${result.campaignsCount} campanhas, ${result.adsetsCount} conjuntos de anúncios, ${result.adsCount} anúncios e ${result.metricsSavedCount} métricas importadas.`;

    // 4. Log run in sync_log
    await supabase.from('sync_log').insert({
      admin_id: adminId,
      status: 'SUCCESS',
      message: syncMsg,
      synced_at: new Date().toISOString(),
      duration_ms: result.durationMs
    });

    // 5. Write to audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: 'MANUAL_SYNC',
      details: syncMsg,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent') || 'REST API Client'
    });

    // 6. Return success summary response
    return NextResponse.json({
      campanhas: result.campaignsCount,
      adsets: result.adsetsCount,
      ads: result.adsCount,
      métricas_salvas: result.metricsSavedCount,
      duração: `${durationSecs.toFixed(2)}s`
    }, { status: 201 });

  } catch (error: any) {
    console.error('Manual Sync API Error:', error);
    
    // Write failure sync_log
    try {
      if (adminId) {
        await supabase.from('sync_log').insert({
          admin_id: adminId,
          status: 'ERROR',
          message: `Falha na sincronização manual: ${error.message || 'Erro desconhecido'}`,
          synced_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        });
      }
    } catch (dbLogErr) {
      console.error('Failed to save failure log:', dbLogErr);
    }

    return NextResponse.json(
      { error: error.message || 'Erro inesperado na sincronização.' },
      { status: 400 }
    );
  }
}
