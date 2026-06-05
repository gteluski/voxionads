import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { ReportsClient } from './reports-client';

export const metadata = {
  title: 'Relatórios de Desempenho - Voxion Ads',
  description: 'Análise automática de métricas, detecção de problemas e recomendações.',
};

export default async function RelatoriosPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  let reports: any[] = [];
  let campaigns: any[] = [];
  let isDbConnected = false;

  try {
    const { error: testError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (!testError) {
      isDbConnected = true;

      // Query reports joined with campaigns
      const { data: dbReports } = await supabase
        .from('reports')
        .select(`
          *,
          campaigns:campaign_id ( name )
        `)
        .eq('admin_id', session.user.admin_id)
        .order('generated_at', { ascending: false })
        .limit(20);

      if (dbReports) {
        reports = dbReports.map((r: any) => ({
          ...r,
          campaign_name: r.campaigns?.name || `Campanha ID: ${r.campaign_id?.substring(0, 8)}`,
          campaigns: undefined
        }));
      }

      // Query campaigns for filters
      const { data: dbCampaigns } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('admin_id', session.user.admin_id);
      campaigns = dbCampaigns || [];
    }
  } catch (err) {
    console.warn('DB queries failed inside Reports Page. Using fallback mock states.');
  }

  return (
    <ReportsClient
      session={session}
      initialDbConnected={isDbConnected}
      initialReports={reports}
      initialCampaigns={campaigns}
    />
  );
}
