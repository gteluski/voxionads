import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

// GET /api/settings - Retrieve settings
export async function GET(req: Request) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const adminId = session.user.admin_id;
    let settings: any = null;
    let dbSuccess = false;

    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('admin_id', adminId)
        .maybeSingle();

      if (!error) {
        settings = data;
        dbSuccess = true;
      }
    } catch (err) {
      console.warn('Database query failed for admin_settings. Using fallback.');
    }

    // Default settings if not configured or DB fails
    if (!dbSuccess || !settings) {
      const globalSettings = (global as any).mockSettings || {};
      settings = globalSettings[adminId] || {
        admin_id: adminId,
        sync_frequency: '30min',
        auto_sync: true,
        data_retention_period: 'ilimitado',
      };
    }

    return NextResponse.json({ settings });

  } catch (error: any) {
    console.error('Get Settings API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Upsert settings
export async function POST(req: Request) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const adminId = session.user.admin_id;
    const { sync_frequency, auto_sync, data_retention_period } = await req.json();

    // Validations
    if (!sync_frequency || auto_sync === undefined || !data_retention_period) {
      return NextResponse.json(
        { error: 'Parâmetros sync_frequency, auto_sync e data_retention_period são obrigatórios.' },
        { status: 400 }
      );
    }

    const allowedFrequencies = ['5min', '30min', '1h'];
    if (!allowedFrequencies.includes(sync_frequency)) {
      return NextResponse.json(
        { error: 'Frequência de sincronização inválida.' },
        { status: 400 }
      );
    }

    const allowedRetentions = ['30d', '90d', '365d', 'ilimitado'];
    if (!allowedRetentions.includes(data_retention_period)) {
      return NextResponse.json(
        { error: 'Período de retenção de dados inválido.' },
        { status: 400 }
      );
    }

    let updatedSettings: any = null;
    let dbSuccess = false;

    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          admin_id: adminId,
          sync_frequency,
          auto_sync,
          data_retention_period,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (!error && data) {
        updatedSettings = data;
        dbSuccess = true;
      }
    } catch (err) {
      console.warn('Database upsert failed for admin_settings. Using fallback.');
    }

    // Save to global mock memory if DB is offline
    if (!dbSuccess || !updatedSettings) {
      const globalSettings = (global as any).mockSettings || {};
      const newMockSettings = {
        admin_id: adminId,
        sync_frequency,
        auto_sync,
        data_retention_period,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      globalSettings[adminId] = newMockSettings;
      (global as any).mockSettings = globalSettings;
      
      updatedSettings = newMockSettings;
    }

    // Log action to audit logs
    try {
      await supabase.from('audit_logs').insert({
        admin_id: adminId,
        action: 'SETTINGS_UPDATED',
        details: `Configurações salvas: frequência ${sync_frequency}, sinc automática: ${auto_sync}, retenção: ${data_retention_period}`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    } catch (auditError) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });

  } catch (error: any) {
    console.error('Post Settings API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
