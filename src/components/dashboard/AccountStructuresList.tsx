'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Layers, Folder, PlayCircle, PauseCircle } from 'lucide-react'
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
  spend: number
  clicks: number
}

interface Ad {
  id: string
  name: string
  status: string
  adset_id: string
  spend: number
  clicks: number
  messages: number
}

interface Props {
  campaigns: Campaign[]
  adsets: Adset[]
  ads: Ad[]
}

type TabType = 'campaigns' | 'adsets' | 'ads'

export function AccountStructuresList({ campaigns = [], adsets = [], ads = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('campaigns')

  // Maps for quick parent name resolution
  const campaignsMap = new Map(campaigns.map(c => [c.id, c.name]))
  const adsetsMap = new Map(adsets.map(a => [a.id, a.name]))

  const renderStatusBadge = (status: string) => {
    const isActive = status === 'ACTIVE'
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive 
          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
          : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
      }`}>
        {isActive ? (
          <>
            <PlayCircle className="h-3 w-3" />
            ATIVO
          </>
        ) : (
          <>
            <PauseCircle className="h-3 w-3" />
            PAUSADO
          </>
        )}
      </span>
    )
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-white/5 shadow-lg overflow-hidden transition-all duration-300 mb-6">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-[var(--primary)]" />
          <div className="text-left">
            <h3 className="text-lg font-medium text-white">Estruturas da Conta (Campanhas, Conjuntos e Anúncios)</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Clique para expandir e ver o detalhamento completo de itens ativos e pausados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-white/5 px-2.5 py-1 rounded-md text-[var(--text-secondary)] font-mono">
            {campaigns.length}C / {adsets.length}S / {ads.length}A
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-white/50" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/50" />
          )}
        </div>
      </button>

      {/* Content Area */}
      {isOpen && (
        <div className="border-t border-white/5 p-6 space-y-6 animate-in fade-in duration-300">
          {/* Tabs Selector */}
          <div className="flex border-b border-white/5 gap-2">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'campaigns'
                  ? 'border-[var(--primary)] text-white'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Campanhas ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('adsets')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'adsets'
                  ? 'border-[var(--primary)] text-white'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Conjuntos de Anúncios ({adsets.length})
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'ads'
                  ? 'border-[var(--primary)] text-white'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Anúncios ({ads.length})
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="overflow-x-auto">
            {activeTab === 'campaigns' && (
              <table className="min-w-full divide-y divide-white/5 text-left">
                <thead>
                  <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/10">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Investimento</th>
                    <th className="px-6 py-3 font-medium text-right">Cliques</th>
                    <th className="px-6 py-3 font-medium text-right">Mensagens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                        Nenhuma campanha encontrada.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
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
                  <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/10">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Campanha Pai</th>
                    <th className="px-6 py-3 font-medium text-right">Investimento</th>
                    <th className="px-6 py-3 font-medium text-right">Cliques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {adsets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                        Nenhum conjunto de anúncios encontrado.
                      </td>
                    </tr>
                  ) : (
                    adsets.map((a) => (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={a.name}>
                          {a.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(a.status)}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={campaignsMap.get(a.campaign_id) || a.campaign_id}>
                          <span className="inline-flex items-center gap-1.5">
                            <Folder className="h-3.5 w-3.5 opacity-40" />
                            {campaignsMap.get(a.campaign_id) || a.campaign_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatCurrency(a.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatNumber(a.clicks)}
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
                  <tr className="text-xs text-[var(--text-secondary)] uppercase tracking-wider bg-black/10">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Conjunto Pai</th>
                    <th className="px-6 py-3 font-medium text-right">Investimento</th>
                    <th className="px-6 py-3 font-medium text-right">Cliques</th>
                    <th className="px-6 py-3 font-medium text-right">Mensagens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {ads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                        Nenhum anúncio encontrado.
                      </td>
                    </tr>
                  ) : (
                    ads.map((ad, idx) => (
                      <tr key={ad.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white max-w-xs truncate" title={ad.name}>
                          {ad.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(ad.status)}
                        </td>
                        <td className="px-6 py-4 text-[var(--text-secondary)] max-w-xs truncate" title={adsetsMap.get(ad.adset_id) || ad.adset_id}>
                          <span className="inline-flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 opacity-40" />
                            {adsetsMap.get(ad.adset_id) || ad.adset_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatCurrency(ad.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--text-secondary)] font-mono">
                          {formatNumber(ad.clicks)}
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
      )}
    </div>
  )
}
