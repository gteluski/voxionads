import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function generateInsightsReport(
  adminId: string,
  campaignId: string,
  adsetId: string | null,
  adId: string | null,
  metrics: { ctr: number; roi: number; cpa: number; spend: number }
) {
  let overallHealth: 'good' | 'warning' | 'critical' = 'good';
  let performanceTrend: 'up' | 'down' | 'stable' = 'stable';
  const mainIssues: string[] = [];
  const recommendations: string[] = [];

  if (metrics.spend > 0) {
    if (metrics.roi < 100) {
      overallHealth = 'critical';
      performanceTrend = 'down';
      mainIssues.push('Retorno sobre investimento (ROI) abaixo de 100%.');
      recommendations.push('Avalie pausar a veiculação deste elemento ou reduzir o orçamento.');
    } else if (metrics.roi < 200) {
      overallHealth = 'warning';
      performanceTrend = 'stable';
      mainIssues.push('Desempenho mediano detectado com ROI abaixo de 200%.');
      recommendations.push('Ajuste o público-alvo ou teste novas variações de criativos.');
    } else {
      overallHealth = 'good';
      performanceTrend = 'up';
      recommendations.push('Desempenho excelente. Considere escalar o orçamento diário em 15-20%.');
    }

    if (metrics.ctr < 1.5) {
      mainIssues.push(`Taxa de cliques (CTR) baixa de ${metrics.ctr.toFixed(2)}%.`);
      recommendations.push('Rotacione criativos (vídeos/imagens) para combater fadiga e otimize o CTA.');
    }
  } else {
    recommendations.push('Nenhuma recomendação disponível. Elemento sem investimento ativo.');
  }

  // Insert report record into database
  const { data, error } = await supabase
    .from('reports')
    .insert({
      admin_id: adminId,
      campaign_id: campaignId,
      adset_id: adsetId,
      ad_id: adId,
      overall_health: overallHealth,
      main_issues: mainIssues,
      recommendations: recommendations,
      performance_trend: performanceTrend,
      date_range_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_range_end: new Date().toISOString().split('T')[0],
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error saving generated report to database:', error);
  }
  return data;
}
