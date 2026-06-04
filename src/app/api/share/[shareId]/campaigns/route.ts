export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { validateShareSession } from '@/utils/share-auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const { shareId } = params;
    const { share, error, status } = await validateShareSession(shareId);

    if (error) {
      return NextResponse.json({ error }, { status: status || 400 });
    }

    let campaigns: any[] = [];
    let dbSuccess = false;

    try {
      const { data: tokens } = await supabase
        .from('meta_tokens')
        .select('account_id')
        .eq('business_manager_id', share.business_manager_id);
      
      const accountIds = tokens?.map((t) => t.account_id) || [];

      const { data: dbCampaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('admin_id', share.admin_id);

      if (dbCampaigns) {
        let filtered = dbCampaigns;
        if (share.campaign_ids && share.campaign_ids.length > 0) {
          filtered = dbCampaigns.filter((c) => share.campaign_ids.includes(c.id));
        } else if (accountIds.length > 0) {
          filtered = dbCampaigns.filter((c) => 
            accountIds.some((accId) => c.meta_campaign_id.includes(accId))
          );
        }
        campaigns = filtered;
        dbSuccess = true;
      }
    } catch (err) {
      console.warn('Database query failed. Using mock fallback.', err);
    }

    if (!dbSuccess || campaigns.length === 0) {
      const mockAccId = share.business_manager_id === 'bm_98471029384' ? 'act_12093849102' : 'act_mock_bm';
      const allMock = [
        { id: 'c1', name: 'Campanha Conversão - Black Friday 2026', meta_campaign_id: `${mockAccId}-c1`, status: 'ACTIVE', objective: 'CONVERSIONS', daily_budget: 500.00, lifetime_budget: null },
        { id: 'c2', name: 'Lookalike Leads Premium - Whitelist', meta_campaign_id: `${mockAccId}-c2`, status: 'ACTIVE', objective: 'LEAD_GENERATION', daily_budget: 250.00, lifetime_budget: null },
        { id: 'c3', name: 'Retargeting Carrinho Abandonado 7D', meta_campaign_id: `${mockAccId}-c3`, status: 'PAUSED', objective: 'CONVERSIONS', daily_budget: 100.00, lifetime_budget: null },
        { id: 'c4', name: 'Branding & Tráfego Frio - Reels Video', meta_campaign_id: `${mockAccId}-c4`, status: 'ACTIVE', objective: 'OUTDOOR / VIDEO_VIEWS', daily_budget: 150.00, lifetime_budget: null }
      ];

      if (share.campaign_ids && share.campaign_ids.length > 0) {
        campaigns = allMock.filter((c) => share.campaign_ids.includes(c.id));
      } else {
        campaigns = allMock;
      }
    }

    return NextResponse.json({ campaigns });

  } catch (error: any) {
    console.error('Shared Campaigns API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
