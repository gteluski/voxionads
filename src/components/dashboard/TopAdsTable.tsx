'use client'

import { formatCurrency, formatNumber } from '@/utils/formatters'

interface AdData {
  id: string
  name: string
  spend: number
  clicks: number
  cpc: number
  messages: number
}

export function TopAdsTable({ ads }: { ads: AdData[] }) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg">
      <h3 className="text-lg font-medium text-white mb-4">Melhores Anúncios (Por Mensagens)</h3>
      
      {ads.length === 0 ? (
        <div className="p-8 text-center text-[var(--text-secondary)] border-2 border-dashed border-white/5 rounded-lg">
          Sem dados suficientes no período.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Anúncio</th>
                <th className="py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Investimento</th>
                <th className="py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Cliques</th>
                <th className="py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">CPC</th>
                <th className="py-3 text-right text-xs font-medium text-[var(--primary)] uppercase tracking-wider">Mensagens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ads.map((ad, index) => (
                <tr key={ad.id || ad.name || index} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 text-sm font-medium text-white truncate max-w-xs" title={ad.name}>
                    {ad.name}
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)] text-right">
                    {formatCurrency(ad.spend)}
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)] text-right">
                    {formatNumber(ad.clicks)}
                  </td>
                  <td className="py-4 text-sm text-[var(--text-secondary)] text-right">
                    {formatCurrency(ad.cpc)}
                  </td>
                  <td className="py-4 text-sm font-bold text-[var(--primary)] text-right">
                    {formatNumber(ad.messages)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
