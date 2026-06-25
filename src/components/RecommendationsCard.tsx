'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  campaignName: string;
  impact: string;
  severity: 'success' | 'warning' | 'error';
  action: string;
}

export default function RecommendationsCard({ selectedAccountId }: { selectedAccountId?: string }) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: reports, error } = await supabase
          .from('reports')
          .select('*, campaigns(name, meta_campaign_id)')
          .eq('admin_id', user.id)
          .order('generated_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar relatórios:', error);
        }

        let filteredReports = reports || [];
        if (selectedAccountId && selectedAccountId !== 'all') {
          filteredReports = filteredReports.filter((rep) => {
            return rep.campaigns?.meta_campaign_id?.includes(selectedAccountId);
          });
        }

        const items: RecommendationItem[] = [];
        filteredReports.forEach((rep) => {
          const campaignName = rep.campaigns?.name || 'Campanha Consolidada';
          const health = rep.overall_health;
          const severity = health === 'good' || health === 'success' ? 'success' : health === 'warning' ? 'warning' : 'error';
          const impactText = health === 'good' || health === 'success' ? 'Alta Performance' : health === 'warning' ? 'Otimização' : 'Ação Crítica';

          if (rep.recommendations && rep.recommendations.length > 0) {
            rep.recommendations.forEach((recText: string, idx: number) => {
              items.push({
                id: `${rep.id}-${idx}`,
                title: `${campaignName}`,
                description: recText,
                campaignName,
                impact: impactText,
                severity,
                action: health === 'critical' ? 'Ajustar Campanha' : 'Otimizar Orçamento'
              });
            });
          }
        });

        // Fallback de demonstração estética caso o banco esteja vazio
        if (items.length === 0) {
          setRecommendations([
            {
              id: 'mock-1',
              title: 'Aumentar Budget da Campanha "Promoção Verão"',
              description: 'ROI está 35% acima da média. Recomendamos aumentar budget em 20%.',
              campaignName: 'Promoção Verão',
              impact: '+R$ 2.500/mês',
              severity: 'success',
              action: 'Ver Detalhes',
            },
            {
              id: 'mock-2',
              title: 'Anúncio com CTR Baixo',
              description: 'Anúncio "Oferta Black Friday" com CTR de 0.8%. Considere pausar ou recriar.',
              campaignName: 'Oferta Black Friday',
              impact: '-R$ 500/mês',
              severity: 'error',
              action: 'Pausar Anúncio',
            },
            {
              id: 'mock-3',
              title: 'Otimizar Público-Alvo',
              description: 'Público "Mulheres 25-35" com CPC alto. Sugerimos segmentar melhor.',
              campaignName: 'Conversão Geral',
              impact: '-15% CPC',
              severity: 'warning',
              action: 'Otimizar',
            },
          ]);
        } else {
          setRecommendations(items.slice(0, 4));
        }
      } catch (err) {
        console.error('Erro geral ao carregar recomendações:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [selectedAccountId, supabase]);

  if (loading) {
    return (
      <div className="bg-[#1f1915] border border-[#d8c5b6]/20 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin text-[#f18535] text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1915] border border-[#d8c5b6]/20 rounded-lg p-6">
      <h2 className="text-lg font-bold text-[#f18535] mb-4 flex items-center gap-2">
        💡 Recomendações de Anúncios e Campanhas (IA)
      </h2>
      
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded border-l-4 bg-[#13121a] transition-all hover:bg-[#1c1a26]/40 ${
              rec.severity === 'success'
                ? 'border-l-green-500'
                : rec.severity === 'error'
                ? 'border-l-red-500'
                : 'border-l-yellow-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[#d8c5b6] font-semibold text-sm">{rec.title}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                rec.severity === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : rec.severity === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-400'
              }`}>
                {rec.impact}
              </span>
            </div>
            
            <p className="text-[#d8c5b6]/85 text-xs mb-3 leading-relaxed">{rec.description}</p>
            
            <button className="text-[#f18535] text-xs font-semibold hover:underline flex items-center gap-1">
              {rec.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
