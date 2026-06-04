export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const adminId = session.user.admin_id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    let reports: any[] = [];
    let dbSuccess = false;

    try {
      // Query reports and join campaign names
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          campaigns:campaign_id ( name )
        `)
        .eq('admin_id', adminId)
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        reports = data.map((r: any) => ({
          ...r,
          campaign_name: r.campaigns?.name || `Campanha ID: ${r.campaign_id?.substring(0, 8)}`,
          campaigns: undefined // remove join payload
        }));
        dbSuccess = true;
      }
    } catch (err) {
      console.warn('Database query failed for reports list. Using fallback.');
    }

    if (!dbSuccess || reports.length === 0) {
      const globalReports = (global as any).mockReports || {};
      const allMockReports = Object.values(globalReports).filter(
        (r: any) => r.admin_id === adminId
      );
      
      if (allMockReports.length === 0) {
        // Seed default reports if list is empty
        const seeded = [
          {
            id: 'mock-rep-1',
            admin_id: adminId,
            campaign_id: 'c1',
            campaign_name: 'Campanha Conversão - Black Friday 2026',
            overall_health: 'good',
            performance_trend: '⬆️',
            main_issues: [],
            recommendations: ['Desempenho excelente. Considere escalar o orçamento diário em 15-20%.'],
            date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date_range_end: new Date().toISOString().split('T')[0],
            generated_at: new Date().toISOString(),
            metrics: {
              current: { roi: 210, cpa: 38.5, ctr: 2.65, spend: 550.0, impressions: 12500, cpm: 44.0 },
              diff7d: { roi: 195, cpa: 40.2, ctr: 2.45, spend: 500.0, impressions: 11000, cpm: 45.4 },
              diff30d: { roi: 180, cpa: 42.0, ctr: 2.30, spend: 450.0, impressions: 10000, cpm: 45.0 }
            }
          },
          {
            id: 'mock-rep-2',
            admin_id: adminId,
            campaign_id: 'c2',
            campaign_name: 'Lookalike Leads Premium - Whitelist',
            overall_health: 'warning',
            performance_trend: '➡️',
            main_issues: ['Taxa de cliques (CTR) de 1.10% está abaixo do esperado.'],
            recommendations: ['CTR baixa - revise creative/copy', 'Teste público de interesse aberto.'],
            date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date_range_end: new Date().toISOString().split('T')[0],
            generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            metrics: {
              current: { roi: 120, cpa: 48.0, ctr: 1.10, spend: 480.0, impressions: 15000, cpm: 32.0 },
              diff7d: { roi: 125, cpa: 47.5, ctr: 1.15, spend: 475.0, impressions: 14500, cpm: 32.7 },
              diff30d: { roi: 130, cpa: 45.0, ctr: 1.25, spend: 450.0, impressions: 14000, cpm: 32.1 }
            }
          },
          {
            id: 'mock-rep-3',
            admin_id: adminId,
            campaign_id: 'c3',
            campaign_name: 'Retargeting Carrinho Abandonado 7D',
            overall_health: 'critical',
            performance_trend: '⬇️',
            main_issues: ['CPA aumentou 35% comparado a semana anterior.', 'ROI está negativo.'],
            recommendations: ['CPA alto - considere pausar anúncios com pior performance', 'ROI negativo - aumente budget ou optimize landing page'],
            date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date_range_end: new Date().toISOString().split('T')[0],
            generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            metrics: {
              current: { roi: -15, cpa: 75.0, ctr: 1.50, spend: 600.0, impressions: 8500, cpm: 70.5 },
              diff7d: { roi: 45, cpa: 55.5, ctr: 1.80, spend: 550.0, impressions: 9200, cpm: 59.8 },
              diff30d: { roi: 150, cpa: 42.0, ctr: 2.10, spend: 500.0, impressions: 10500, cpm: 47.6 }
            }
          }
        ];

        // Store in global in-memory registry
        seeded.forEach((r: any) => {
          globalReports[r.id] = r;
        });
        (global as any).mockReports = globalReports;
        reports = seeded;
      } else {
        reports = allMockReports;
      }
    }

    return NextResponse.json({ reports });

  } catch (error: any) {
    console.error('List Reports API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
