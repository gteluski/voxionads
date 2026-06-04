export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { reportId } = params;

    let report: any = null;
    let fallbackToMock = false;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          campaigns:campaign_id ( name )
        `)
        .eq('id', reportId)
        .maybeSingle();

      if (error || !data) {
        fallbackToMock = true;
      } else {
        report = {
          ...data,
          campaign_name: data.campaigns?.name || `Campanha ID: ${data.campaign_id?.substring(0, 8)}`,
          campaigns: undefined
        };
      }
    } catch (err) {
      fallbackToMock = true;
    }

    if (fallbackToMock || !report) {
      const globalReports = (global as any).mockReports || {};
      report = globalReports[reportId] || null;
    }

    if (!report) {
      return NextResponse.json({ error: 'Relatório não encontrado.' }, { status: 404 });
    }

    // If report was fetched from DB, load metrics snapshot on-the-fly
    if (!report.metrics) {
      let metricsCurrent: any = null;
      let metrics7d: any = null;
      let metrics30d: any = null;

      try {
        const { data: latestRecords } = await supabase
          .from('ads_metrics')
          .select('*')
          .eq('campaign_id', report.campaign_id)
          .is('adset_id', null)
          .order('date', { ascending: false })
          .limit(1);

        if (latestRecords && latestRecords.length > 0) {
          metricsCurrent = latestRecords[0];

          const dateCurrent = new Date(metricsCurrent.date);
          const date7d = new Date(dateCurrent.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const { data: rec7d } = await supabase
            .from('ads_metrics')
            .select('*')
            .eq('campaign_id', report.campaign_id)
            .is('adset_id', null)
            .eq('date', date7d)
            .limit(1);
          metrics7d = rec7d && rec7d.length > 0 ? rec7d[0] : null;

          const date30d = new Date(dateCurrent.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const { data: rec30d } = await supabase
            .from('ads_metrics')
            .select('*')
            .eq('campaign_id', report.campaign_id)
            .is('adset_id', null)
            .eq('date', date30d)
            .limit(1);
          metrics30d = rec30d && rec30d.length > 0 ? rec30d[0] : null;
        }
      } catch (err) {
        console.warn('Could not load on-the-fly metrics for report.');
      }

      report.metrics = {
        current: metricsCurrent,
        diff7d: metrics7d,
        diff30d: metrics30d
      };
    }

    return NextResponse.json({ report });

  } catch (error: any) {
    console.error('Report Detail API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
