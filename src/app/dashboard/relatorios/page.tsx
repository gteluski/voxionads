'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RelatoriosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReanalyze = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const reports = [
    {
      id: 'rep_1',
      campaign: 'Conversão Black Friday',
      health: 'good',
      trend: 'up',
      issues: 0,
      period: 'Últimos 30 dias',
      generatedAt: new Date().toISOString(),
    },
    {
      id: 'rep_2',
      campaign: 'Lookalike Leads Premium',
      health: 'warning',
      trend: 'down',
      issues: 2,
      period: 'Últimos 7 dias',
      generatedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-[#31251f] p-8 font-['Avenir']">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#d8c5b6] mb-2 flex items-center gap-3">
            <span className="text-3xl">📑</span> Relatórios de Análise
          </h1>
          <p className="text-[#d8c5b6]/70">Insights e análises geradas pelo motor inteligente.</p>
        </div>
        <button 
          onClick={handleReanalyze}
          disabled={loading}
          className="bg-[#f18535] text-[#31251f] px-6 py-3 rounded-lg font-bold hover:bg-[#f5a35f] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(241,133,53,0.3)] disabled:opacity-50"
        >
          <span className={loading ? 'animate-spin' : ''}>🔄</span>
          {loading ? 'Analisando...' : 'Reanalisar Campanhas'}
        </button>
      </div>

      <div className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[rgba(216,197,182,0.1)] bg-[rgba(216,197,182,0.02)]">
          <h2 className="text-[#f18535] text-xl font-bold flex items-center gap-2">
            ⚡ Motor de Análise Automática
          </h2>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[rgba(216,197,182,0.05)] text-[#d8c5b6]/70 text-sm border-b border-[rgba(216,197,182,0.1)]">
              <th className="px-6 py-4 font-bold tracking-wider">Campanha</th>
              <th className="px-6 py-4 font-bold tracking-wider">Saúde</th>
              <th className="px-6 py-4 font-bold tracking-wider">Problemas</th>
              <th className="px-6 py-4 font-bold tracking-wider">Intervalo</th>
              <th className="px-6 py-4 font-bold tracking-wider">Gerado em</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(216,197,182,0.1)]">
            {reports.map((rep) => (
              <tr key={rep.id} className="hover:bg-[rgba(216,197,182,0.02)] transition-colors cursor-pointer">
                <td className="px-6 py-4 text-[#d8c5b6] font-bold">{rep.campaign}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                    rep.health === 'good' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {rep.health === 'good' ? 'Saudável' : 'Alerta'}
                    {rep.trend === 'up' ? '↗' : '↘'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {rep.issues > 0 ? (
                    <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded-md text-xs font-bold">
                      {rep.issues} identificados
                    </span>
                  ) : (
                    <span className="text-[#d8c5b6]/50 text-xs">Nenhum</span>
                  )}
                </td>
                <td className="px-6 py-4 text-[#d8c5b6]/70 text-sm">{rep.period}</td>
                <td className="px-6 py-4 text-[#d8c5b6]/70 text-sm font-mono">
                  {new Date(rep.generatedAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#f18535] font-bold hover:text-[#f5a35f] text-sm underline decoration-[rgba(241,133,53,0.3)] underline-offset-4">
                    Ver Relatório
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
