'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Campaign {
  id: string;
  admin_id: string;
  meta_campaign_id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget: number | null;
  lifetime_budget: number | null;
  synced_at: string;
  created_at: string;
}

export default function CampaignasPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('campaigns')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false });

        if (filter !== 'ALL') {
          query = query.eq('status', filter);
        }

        const { data, error: err } = await query;

        if (err) throw err;
        setCampaigns(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user, filter, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#31251f]">
        <div className="text-[#d8c5b6]">Carregando campanhas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31251f] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#d8c5b6] mb-2">Campanhas</h1>
        <p className="text-[#d8c5b6]/70">
          {campaigns.length} campanhas no total
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === status
                ? 'bg-[#f18535] text-[#31251f]'
                : 'border border-[#d8c5b6] text-[#d8c5b6] hover:border-[#f18535]'
            }`}
          >
            {status === 'ALL' ? 'Todas' : status === 'ACTIVE' ? 'Ativas' : 'Pausadas'}
          </button>
        ))}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Lista */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-[#d8c5b6]/60">
          Nenhuma campanha encontrada
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-lg p-6 hover:border-[#f18535] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-[#d8c5b6] font-bold text-lg mb-2">
                    {campaign.name}
                  </h3>
                  <p className="text-[#d8c5b6]/70 text-sm mb-3">
                    Objetivo: {campaign.objective}
                  </p>
                  <div className="flex gap-4">
                    <span className="text-[#f18535] text-sm">
                      Budget: R$ {campaign.daily_budget ? campaign.daily_budget.toFixed(2) : 'N/A'}
                    </span>
                    <span className="text-[#d8c5b6] text-sm">
                      Criada: {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  campaign.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-400'
                    : campaign.status === 'PAUSED'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {campaign.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
