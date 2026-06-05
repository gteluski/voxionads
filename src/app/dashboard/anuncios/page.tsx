'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export interface Ad {
  id: string;
  admin_id: string;
  adset_id: string;
  campaign_id: string;
  meta_ad_id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function AnunciosPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
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
        setError(err instanceof Error ? err.message : 'Erro ao carregar anúncios');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [user, authLoading, supabase]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#31251f]">
        <div className="animate-spin text-[#f18535] text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#31251f] p-8 font-['Avenir']">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#d8c5b6] mb-2">Anúncios</h1>
        <p className="text-[#d8c5b6]/70">
          Gerencie e acompanhe o desempenho dos seus criativos.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 font-bold">
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl overflow-hidden shadow-xl text-center py-16 px-4">
          <span className="text-5xl mb-4 block">🖼️</span>
          <h3 className="text-[#d8c5b6] text-xl font-bold mb-2">Nenhum anúncio encontrado</h3>
          <p className="text-[#d8c5b6]/60">Sincronize sua conta do Meta Ads para visualizar os dados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ads.map((ad) => (
            <div 
              key={ad.id}
              onClick={() => router.push(`/detalhes/anuncio/${ad.id}`)}
              className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-6 cursor-pointer hover:border-[#f18535] hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl bg-[rgba(216,197,182,0.05)] p-2 rounded-xl">📸</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                  ad.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : ad.status === 'PAUSED'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {ad.status}
                </span>
              </div>
              
              <h3 className="text-[#d8c5b6] font-bold text-lg mb-4 flex-1 line-clamp-2">
                {ad.name}
              </h3>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d8c5b6]/50 uppercase font-bold">Campaign ID</span>
                  <span className="text-[#d8c5b6]/80 font-mono">{ad.campaign_id.slice(0,8)}...</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d8c5b6]/50 uppercase font-bold">Adset ID</span>
                  <span className="text-[#d8c5b6]/80 font-mono">{ad.adset_id.slice(0,8)}...</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[rgba(216,197,182,0.1)]">
                  <span className="text-[#d8c5b6]/50 uppercase font-bold">Criado</span>
                  <span className="text-[#d8c5b6]/80 font-mono">
                    {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
