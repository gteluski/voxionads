'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface Campaign {
  id: string
  name: string
  status: string
  spend: number
  clicks: number
  messages: number
}

interface Adset {
  id: string
  name: string
  status: string
  campaign_id: string
  campaign_name?: string
  spend: number
  clicks: number
}

interface Ad {
  id: string
  name: string
  status: string
  adset_id: string
  adset_name?: string
  campaign_id: string
  spend: number
  clicks: number
  messages: number
}

interface AccountStructureProps {
  campaigns?: Campaign[]
  adsets?: Adset[]
  ads?: Ad[]
}

export function AccountStructure({
  campaigns = [],
  adsets = [],
  ads = []
}: AccountStructureProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'adsets' | 'ads'>('campaigns')

  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
          ATIVO
        </span>
      )
    } else if (s === 'PAUSED') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-[var(--text-secondary)] border border-white/10">
          PAUSADO
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          {status}
        </span>
      )
    }
  }

  // Sort Campaigns by spend descending
  const sortedCampaigns = [...campaigns].sort((a, b) => b.spend - a.spend)

  // Sort Ads by messages descending
  const sortedAds = [...ads].sort((a, b) => b.messages - a.messages)

  console.log('AccountStructure Campaigns:', campaigns)

  return (
    <div className="bg-[var(--card)] rounded-xl border border-white/5 shadow-lg overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-white/5">
        <h3 className="text-lg font-medium text-white">Estruturas da Conta</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Detalhamento de campanhas, conjuntos de anúncios e anúncios
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs Headers */}
        <div className="flex border-b border-white/5 gap-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'campaigns'
                ? 'border-[var(--primary)] text-white font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Campanhas ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('adsets')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'adsets'
                ? 'border-[var(--primary)] text-white font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Conjuntos ({adsets.length})
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'ads'
                ? 'border-[var(--primary)] text-white font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            Anúncios ({ads.length})
          </button>
        </div>

        {/* Tab Panels */}
        <div className="overflow-x-auto">
          {activeTab === 'campaigns' && (
            <table className="min-w-full divide-y divide-white/5 text-left">
              <thead>
                <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/20">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Investimento</th>
                  <th className="px-6 py-3 font-medium text-right">Cliques</th>
                  <th className="px-6 py-3 font-medium text-right">Mensagens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {sortedCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhuma campanha encontrada.
                    </td>
                  </tr>
                ) : (
                  sortedCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-sm truncate" title={c.name}>
                        {c.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(c.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                        {formatCurrency(c.spend)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                        {formatNumber(c.clicks)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--primary)] font-bold font-mono">
                        {formatNumber(c.messages)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'adsets' && (
            <table className="min-w-full divide-y divide-white/5 text-left">
              <thead>
                <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/20">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Campanha Pai</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Investimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {adsets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhum conjunto de anúncios encontrado.
                    </td>
                  </tr>
                ) : (
                  adsets.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={a.name}>
                        {a.name}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={a.campaign_name || a.campaign_id}>
                        {a.campaign_name || a.campaign_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(a.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                        {formatCurrency(a.spend)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'ads' && (
            <table className="min-w-full divide-y divide-white/5 text-left">
              <thead>
                <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/20">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Conjunto Pai</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Investimento</th>
                  <th className="px-6 py-3 font-medium text-right">Mensagens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {sortedAds.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhum anúncio encontrado.
                    </td>
                  </tr>
                ) : (
                  sortedAds.map((ad, idx) => (
                    <tr key={ad.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={ad.name}>
                        {ad.name}
                      </td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={ad.adset_name || ad.adset_id}>
                        {ad.adset_name || ad.adset_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(ad.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                        {formatCurrency(ad.spend)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--primary)] font-bold font-mono">
                        {formatNumber(ad.messages)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
