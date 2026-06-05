'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Ad {
  id: string;
  admin_id: string;
  adset_id: string;
  campaign_id: string;
  meta_ad_id: string;
  name: string;
  status: string;
  synced_at: string;
  created_at: string;
}

export default function AnunciosPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchAds = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('ads')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setAds(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [user, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#31251f]">
        <div className="text-[#d8c5b6]">Carregando anúncios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31251f] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#d8c5b6] mb-2">Anúncios</h1>
        <p className="text-[#d8c5b6]/70">
          {ads.length} anúncios no total
        </p>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      {ads.length === 0 ? (
        <div className="text-center py-12 text-[#d8c5b6]/60">
          Nenhum anúncio encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-lg p-6 hover:border-[#f18535] transition-all cursor-pointer"
            >
              <h3 className="text-[#d8c5b6] font-bold text-lg mb-3 line-clamp-2">
                {ad.name}
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-[#d8c5b6]/70 text-sm">
                  <span className="text-[#f18535]">ID da Campanha:</span> {ad.campaign_id}
                </p>
                <p className="text-[#d8c5b6]/70 text-sm">
                  <span className="text-[#f18535]">Ad Set:</span> {ad.adset_id}
                </p>
              </div>
              <div className={`px-3 py-1 rounded inline-block text-sm font-semibold ${
                ad.status === 'ACTIVE'
                  ? 'bg-green-500/20 text-green-400'
                  : ad.status === 'PAUSED'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {ad.status}
              </div>
              <p className="text-[#d8c5b6]/70 text-xs mt-4">
                Criado em: {new Date(ad.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
