import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ConfiguracoesClient } from './configuracoes-client';

export const metadata = {
  title: 'Configurações - Voxion Ads',
  description: 'Compartilhamentos de dashboard e configurações gerais.',
};

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  let shares: any[] = [];
  let metaTokens: any[] = [];
  let campaigns: any[] = [];
  let settings: any = null;
  let syncLogs: any[] = [];
  let isDbConnected = false;

  try {
    // Basic connectivity probe
    const { error: testError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (!testError) {
      isDbConnected = true;

      const { data: dbShares } = await supabase
        .from('shared_dashboards')
        .select('*')
        .eq('admin_id', session.user.admin_id)
        .order('created_at', { ascending: false });
      shares = dbShares || [];

      const { data: dbTokens } = await supabase
        .from('meta_tokens')
        .select('id, account_name, business_manager_id, account_id, updated_at')
        .eq('admin_id', session.user.admin_id);
      metaTokens = dbTokens || [];

      const { data: dbCampaigns } = await supabase
        .from('campaigns')
        .select('id, name, meta_campaign_id')
        .eq('admin_id', session.user.admin_id);
      campaigns = dbCampaigns || [];

      const { data: dbSettings } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('admin_id', session.user.admin_id)
        .maybeSingle();
      settings = dbSettings || null;

      const { data: dbSyncLogs } = await supabase
        .from('sync_log')
        .select('*')
        .eq('admin_id', session.user.admin_id)
        .order('synced_at', { ascending: false })
        .limit(10);
      syncLogs = dbSyncLogs || [];
    }
  } catch (err) {
    console.warn('DB queries failed inside Settings Page. Falling back to mock states.');
  }

  // Seeding mock shares in demo mode to prevent 404 on updates
  if (!isDbConnected) {
    const globalShares = (global as any).mockShares || {};
    const allMockShares = Object.values(globalShares).filter(
      (s: any) => s.admin_id === session.user.admin_id
    );

    if (allMockShares.length === 0) {
      const defaultShares = [
        {
          id: 'mock-share-1',
          admin_id: session.user.admin_id,
          share_name: 'Relatório Clientes VIP',
          business_manager_id: 'bm_98471029384',
          campaign_ids: ['c1'],
          has_password: true,
          password_hash: '$2a$10$w8T.K2Uj7PrcvGqYtY/YIu2/R9l1Wc4P5c8j.Q7L/2h6v3D7x6i3m', // adminpassword
          expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-share-2',
          admin_id: session.user.admin_id,
          share_name: 'Visão Geral Orgânica',
          business_manager_id: 'bm_98471029384',
          campaign_ids: [],
          has_password: false,
          password_hash: null,
          expires_at: null,
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      defaultShares.forEach((s: any) => {
        globalShares[s.id] = s;
      });
      (global as any).mockShares = globalShares;
      shares = defaultShares;
    } else {
      shares = allMockShares;
    }
  }

  return (
    <ConfiguracoesClient
      session={session}
      initialDbConnected={isDbConnected}
      initialShares={shares}
      initialMetaTokens={metaTokens}
      initialCampaigns={campaigns}
      initialSettings={settings}
      initialSyncLogs={syncLogs}
    />
  );
}
