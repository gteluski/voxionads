'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

interface Campaign {
  id: string
  name: string
  status: string
  objective?: string
  daily_budget?: string | number
  lifetime_budget?: string | number
  start_time?: string
  stop_time?: string
  spend?: number
  clicks?: number
  messages?: number
  insights?: {
    data: Array<{
      impressions?: string
      reach?: string
      spend?: string
      clicks?: string
      ctr?: string
      cpc?: string
    }>
  }
}

interface Adset {
  id: string
  name: string
  status: string
  campaign_id: string
  campaign?: {
    id: string
    name: string
  }
  campaign_name?: string
  daily_budget?: string | number
  lifetime_budget?: string | number
  start_time?: string
  stop_time?: string
  spend?: number
  clicks?: number
  insights?: {
    data: Array<{
      impressions?: string
      reach?: string
      spend?: string
      clicks?: string
      ctr?: string
      cpc?: string
    }>
  }
}

interface Ad {
  id: string
  name: string
  status: string
  adset_id: string
  adset?: {
    id: string
    name: string
  }
  adset_name?: string
  campaign_id: string
  spend?: number
  clicks?: number
  messages?: number
  insights?: {
    data: Array<{
      impressions?: string
      reach?: string
      spend?: string
      clicks?: string
      ctr?: string
      cpc?: string
    }>
  }
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

  const formatBudget = (daily?: string | number, lifetime?: string | number) => {
    if (daily) {
      const val = typeof daily === 'number' ? daily : parseFloat(daily) / 100
      return `Diário: ${formatCurrency(val)}`
    }
    if (lifetime) {
      const val = typeof lifetime === 'number' ? lifetime : parseFloat(lifetime) / 100
      return `Vitalício: ${formatCurrency(val)}`
    }
    return 'N/A'
  }

  const getCampaignMetrics = (c: Campaign) => {
    const hasRaw = typeof c.spend === 'number'
    const spend = hasRaw ? (c.spend || 0) : parseFloat(c.insights?.data?.[0]?.spend || '0')
    const clicks = hasRaw ? (c.clicks || 0) : parseInt(c.insights?.data?.[0]?.clicks || '0', 10)
    const messages = c.messages || 0
    const ctr = hasRaw ? (spend > 0 ? (clicks / spend) * 100 : 0) : parseFloat(c.insights?.data?.[0]?.ctr || '0')
    const cpc = hasRaw ? (clicks > 0 ? spend / clicks : 0) : parseFloat(c.insights?.data?.[0]?.cpc || '0')
    
    return { spend, clicks, messages, ctr, cpc }
  }

  const getAdsetMetrics = (a: Adset) => {
    const hasRaw = typeof a.spend === 'number'
    const spend = hasRaw ? (a.spend || 0) : parseFloat(a.insights?.data?.[0]?.spend || '0')
    const clicks = hasRaw ? (a.clicks || 0) : parseInt(a.insights?.data?.[0]?.clicks || '0', 10)
    return { spend, clicks }
  }

  const getAdMetrics = (ad: Ad) => {
    const hasRaw = typeof ad.spend === 'number'
    const spend = hasRaw ? (ad.spend || 0) : parseFloat(ad.insights?.data?.[0]?.spend || '0')
    const clicks = hasRaw ? (ad.clicks || 0) : parseInt(ad.insights?.data?.[0]?.clicks || '0', 10)
    const ctr = hasRaw ? 0 : parseFloat(ad.insights?.data?.[0]?.ctr || '0')
    const cpc = hasRaw ? 0 : parseFloat(ad.insights?.data?.[0]?.cpc || '0')
    return { spend, clicks, ctr, cpc }
  }

  // Sort Campaigns by spend descending
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aSpend = typeof a.spend === 'number' ? a.spend : parseFloat(a.insights?.data?.[0]?.spend || '0')
    const bSpend = typeof b.spend === 'number' ? b.spend : parseFloat(b.insights?.data?.[0]?.spend || '0')
    return bSpend - aSpend
  })

  // Sort Ads by clicks descending (since messages might not be present in insights fields)
  const sortedAds = [...ads].sort((a, b) => {
    const aClicks = typeof a.clicks === 'number' ? a.clicks : parseInt(a.insights?.data?.[0]?.clicks || '0', 10)
    const bClicks = typeof b.clicks === 'number' ? b.clicks : parseInt(b.insights?.data?.[0]?.clicks || '0', 10)
    return bClicks - aClicks
  })

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
                  <th className="px-6 py-3 font-medium">Objetivo</th>
                  <th className="px-6 py-3 font-medium">Orçamento</th>
                  <th className="px-6 py-3 font-medium text-right">Investimento</th>
                  <th className="px-6 py-3 font-medium text-right">Cliques</th>
                  <th className="px-6 py-3 font-medium text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {sortedCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhuma campanha encontrada.
                    </td>
                  </tr>
                ) : (
                  sortedCampaigns.map((c) => {
                    const metrics = getCampaignMetrics(c)
                    return (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-sm truncate" title={c.name}>
                          {c.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(c.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">
                          {c.objective || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {formatBudget(c.daily_budget, c.lifetime_budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatCurrency(metrics.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatNumber(metrics.clicks)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--primary)] font-bold font-mono">
                          {formatPercent(metrics.ctr)}
                        </td>
                      </tr>
                    )
                  })
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
                  <th className="px-6 py-3 font-medium">Orçamento</th>
                  <th className="px-6 py-3 font-medium text-right">Investimento</th>
                  <th className="px-6 py-3 font-medium text-right">Cliques</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {adsets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhum conjunto de anúncios encontrado.
                    </td>
                  </tr>
                ) : (
                  adsets.map((a) => {
                    const metrics = getAdsetMetrics(a)
                    return (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={a.name}>
                          {a.name}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={a.campaign?.name || a.campaign_name || a.campaign_id}>
                          {a.campaign?.name || a.campaign_name || a.campaign_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(a.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {formatBudget(a.daily_budget, a.lifetime_budget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatCurrency(metrics.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatNumber(metrics.clicks)}
                        </td>
                      </tr>
                    )
                  })
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
                  <th className="px-6 py-3 font-medium text-right">Cliques</th>
                  <th className="px-6 py-3 font-medium text-right">CTR</th>
                  <th className="px-6 py-3 font-medium text-right">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {sortedAds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      Nenhum anúncio encontrado.
                    </td>
                  </tr>
                ) : (
                  sortedAds.map((ad, idx) => {
                    const metrics = getAdMetrics(ad)
                    return (
                      <tr key={ad.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={ad.name}>
                          {ad.name}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={ad.adset?.name || ad.adset_name || ad.adset_id}>
                          {ad.adset?.name || ad.adset_name || ad.adset_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(ad.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatCurrency(metrics.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatNumber(metrics.clicks)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatPercent(metrics.ctr)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--primary)] font-bold font-mono">
                          {formatCurrency(metrics.cpc)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
