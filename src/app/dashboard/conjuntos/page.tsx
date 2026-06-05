'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export interface AdSet {
  id: string;
  admin_id: string;
  campaign_id: string;
  meta_adset_id: string;
  name: string;
  status: string;
  daily_budget: number | null;
  optimization_goal: string;
  created_at: string;
}

export default function ConjuntosPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [adsets, setAdsets] = useState<AdSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchAdsets = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('ad_sets')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setAdsets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar conjuntos');
      } finally {
        setLoading(false);
      }
    };

    fetchAdsets();
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
        <h1 className="text-4xl font-bold text-[#d8c5b6] mb-2">Conjuntos de Anúncios</h1>
        <p className="text-[#d8c5b6]/70">
          Gerencie e acompanhe o desempenho dos seus públicos e orçamentos.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 font-bold">
          {error}
        </div>
      )}

      <div className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl overflow-hidden shadow-xl">
        {adsets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <span className="text-5xl mb-4 block">🎯</span>
            <h3 className="text-[#d8c5b6] text-xl font-bold mb-2">Nenhum conjunto encontrado</h3>
            <p className="text-[#d8c5b6]/60">Sincronize sua conta do Meta Ads para visualizar os dados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[rgba(216,197,182,0.05)] text-[#d8c5b6]/70 text-sm border-b border-[rgba(216,197,182,0.1)]">
                  <th className="px-6 py-4 font-bold tracking-wider">Nome do Conjunto</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Orçamento</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Otimização</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Data de Criação</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(216,197,182,0.1)]">
                {adsets.map((adset) => (
                  <tr 
                    key={adset.id} 
                    onClick={() => router.push(`/detalhes/conjuntos/${adset.id}`)}
                    className="hover:bg-[rgba(216,197,182,0.03)] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-[#d8c5b6] font-bold">{adset.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        adset.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400'
                          : adset.status === 'PAUSED'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {adset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#f18535] font-mono">
                      {adset.daily_budget ? `R$ ${adset.daily_budget.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[#d8c5b6]/70 text-sm">{adset.optimization_goal}</td>
                    <td className="px-6 py-4 text-[#d8c5b6]/70 text-sm font-mono">
                      {new Date(adset.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#f18535] font-bold hover:text-[#f5a35f] text-sm underline decoration-[rgba(241,133,53,0.3)] underline-offset-4">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
