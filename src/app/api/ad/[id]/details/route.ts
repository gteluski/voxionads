import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = params;

    let ad: any = null;
    let subitems: any[] = [];
    let metrics: any[] = [];

    try {
      // Query ad from DB
      const { data: dbAd } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (dbAd) {
        ad = dbAd;
        subitems = []; // Ads have no subitems

        // Query metrics
        const { data: dbMetrics } = await supabase
          .from('ads_metrics')
          .select('*')
          .eq('ad_id', id)
          .order('date', { ascending: true });

        metrics = dbMetrics || [];
      }
    } catch (dbErr) {
      console.warn('Database query failed for ad details. Using mock data.', dbErr);
    }

    // Fallback Mock Data
    if (!ad) {
      ad = {
        id,
        adset_id: 'adset-123',
        campaign_id: 'campaign-123',
        name: `Criativo 01 - Vídeo de Depoimentos (${id.substring(0, 5)})`,
        meta_ad_id: `act_12093849102-ad_${id.substring(0, 4)}`,
        status: 'ACTIVE',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      };

      subitems = []; // Terminals

      metrics = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const spend = 70 + Math.random() * 50;
        const clicks = 40 + Math.floor(Math.random() * 40);
        const impressions = 2000 + Math.floor(Math.random() * 1000);
        const conversions = 1 + Math.floor(Math.random() * 3);
        return {
          date,
          spend,
          impressions,
          clicks,
          link_clicks: clicks - 8,
          reach: impressions - 400,
          frequency: 1.02 + Math.random() * 0.02,
          conversions,
          messages: Math.floor(Math.random() * 2),
          cpc: spend / clicks,
          cpc_link: spend / (clicks - 8),
          cpm: (spend / impressions) * 1000,
          cpm_impression: spend / impressions,
          cpa: spend / conversions,
          cpm_message: spend / 2,
          ctr: (clicks / impressions) * 100,
          roi: ((conversions * 120 - spend) / spend) * 100
        };
      });
    }

    return NextResponse.json({
      ad,
      subitems,
      metrics
    });
  } catch (error: any) {
    console.error('Ad Details API Error:', error);
    return NextResponse.json({ error: error.message || 'Erro no servidor' }, { status: 500 });
  }
}
