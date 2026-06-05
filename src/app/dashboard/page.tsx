import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { DashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Painel Voxion Ads',
  description: 'Gerenciamento de campanhas, tokens Meta e relatórios de métricas.',
};

export default async function DashboardPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;

  if (!session || !session.user) {
    redirect('/login');
  }

  let isDbConnected = false;
  let campaigns: any[] = [];
  let metaTokens: any[] = [];
  let syncLogs: any[] = [];
  let auditLogs: any[] = [];

  try {
    // Basic connectivity probe
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (!testError) {
      isDbConnected = true;

      // Query initial campaigns
      const { data: capData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      campaigns = capData || [];

      // Query active tokens
      const { data: tokenData } = await supabase
        .from('meta_tokens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      metaTokens = tokenData || [];

      // Query sync log
      const { data: syncData } = await supabase
        .from('sync_log')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(5);
      syncLogs = syncData || [];

      // Query audit logs
      const { data: logData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      auditLogs = logData || [];
    }
  } catch (error) {
    console.warn(
      'Supabase client failed connection. Falling back to frontend mock mode.'
    );
  }

  return (
    <DashboardClient
      session={session}
      initialDbConnected={isDbConnected}
      initialCampaigns={campaigns}
      initialMetaTokens={metaTokens}
      initialSyncLogs={syncLogs}
      initialAuditLogs={auditLogs}
    />
  );
}
