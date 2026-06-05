'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdSet {
  id: string;
  admin_id: string;
  campaign_id: string;
  meta_adset_id: string;
  name: string;
  status: string;
  daily_budget: number | null;
  optimization_goal: string | null;
  synced_at: string;
  created_at: string;
}

export default function ConjuntosPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<string>('');

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchAdSets = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('ad_sets')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false });

        if (campaignFilter) {
          query = query.eq('campaign_id', campaignFilter);
        }

        const { data, error: err } = await query;

        if (err) throw err;
        setAdSets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchAdSets();
  }, [user, campaignFilter, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#31251f]">
        <div className="text-[#d8c5b6]">Carregando conjuntos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31251f] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#d8c5b6] mb-2">Conjuntos de Anúncios (Ad Sets)</h1>
        <p className="text-[#d8c5b6]/70">
          {adSets.length} conjuntos no total
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabela */}
      {adSets.length === 0 ? (
        <div className="text-center py-12 text-[#d8c5b6]/60">
          Nenhum conjunto encontrado
        </div>
      ) : (
        <div className="overflow-x-auto border border-[rgba(216,197,182,0.2)] rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(216,197,182,0.2)] bg-[rgba(241,133,53,0.1)]">
                <th className="px-6 py-4 text-left text-[#f18535] font-bold">Nome</th>
                <th className="px-6 py-4 text-left text-[#f18535] font-bold">Status</th>
                <th className="px-6 py-4 text-left text-[#f18535] font-bold">Budget</th>
                <th className="px-6 py-4 text-left text-[#f18535] font-bold">Otimização</th>
                <th className="px-6 py-4 text-left text-[#f18535] font-bold">Data</th>
              </tr>
            </thead>
            <tbody>
              {adSets.map((adSet) => (
                <tr
                  key={adSet.id}
                  className="border-b border-[rgba(216,197,182,0.1)] hover:bg-[rgba(241,133,53,0.05)] transition-all cursor-pointer"
                >
                  <td className="px-6 py-4 text-[#d8c5b6] font-medium">{adSet.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      adSet.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {adSet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#f18535] font-mono">
                    R$ {adSet.daily_budget ? (adSet.daily_budget / 100).toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-[#d8c5b6] text-sm">
                    {adSet.optimization_goal || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-[#d8c5b6]/70 text-sm">
                    {new Date(adSet.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
