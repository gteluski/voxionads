'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, BarChart2, DollarSign, MessageSquare, MousePointer, Activity, AlertCircle } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface AccountInfo {
  id: string
  name: string
  business_name: string
  currency: string
  page_name?: string
}

interface SummaryInfo {
  spend: number
  clicks: number
  cpc: number
  messages: number
  costPerMessage: number
}

interface CampaignInfo {
  id: string
  name: string
  status: string
  spend: number
  clicks: number
  messages: number
}

interface MetaDataResponse {
  account?: AccountInfo
  summary: SummaryInfo
  counts: {
    campaigns: {
      total: number
      active: number
    }
  }
  campaigns?: CampaignInfo[]
}

interface ClientItem {
  id: string
  name: string
  slug: string
  meta_account_id: string
}

interface ClientMiniReportDrawerProps {
  client: ClientItem | null
  onClose: () => void
}

export function ClientMiniReportDrawer({ client, onClose }: ClientMiniReportDrawerProps) {
  const [data, setData] = useState<MetaDataResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (client) {
      // Trigger animation entry asynchronously to avoid cascading render warning
      Promise.resolve().then(() => {
        setIsVisible(true)
      })
      
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(`/api/meta/${client.meta_account_id}?date_preset=last_30d`)
          const result = await res.json()
          if (!res.ok) {
            throw new Error(result.error || 'Erro ao buscar dados da API da Meta')
          }
          setData(result)
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Erro ao carregar dados'
          setError(errMsg)
        } finally {
          setLoading(false)
        }
      }

      Promise.resolve().then(() => {
        fetchData()
      })
    } else {
      // Trigger animation exit
      Promise.resolve().then(() => {
        setIsVisible(false)
      })
      // Clear data after animation transitions out
      const timer = setTimeout(() => {
        setData(null)
        setError(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [client])

  // Prevent background scroll when open
  useEffect(() => {
    if (client) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [client])

  if (!client && !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          client && isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className={`w-screen max-w-md bg-[#0e0e0e] border-l border-white/5 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            client && isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">Relatório Rápido</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate max-w-[280px]">
                {client?.name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-1">Conta de Anúncios</span>
              <code className="text-xs font-mono bg-white/5 text-[var(--primary)] px-2 py-1 rounded">
                {client?.meta_account_id}
              </code>
            </div>

            {loading ? (
              /* Loading Skeletons */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 h-24 animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-white/10 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
                  <div className="h-20 bg-white/5 rounded animate-pulse"></div>
                </div>
              </div>
            ) : error ? (
              /* Error Message */
              <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-5 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Falha ao carregar insights</h4>
                  <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            ) : data ? (
              /* Data Display */
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Meta details header if available */}
                {data.account && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest block mb-1">
                      Detalhes da Conta
                    </span>
                    <h4 className="text-sm font-medium text-white">
                      {data.account.business_name || data.account.name || 'Conta sem nome'}
                    </h4>
                    {data.account.page_name && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Página vinculada: <span className="text-white/70">{data.account.page_name}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Spend */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                      <span className="text-xs font-medium">Investimento</span>
                      <DollarSign className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <span className="text-lg font-bold text-white font-mono mt-1">
                      {formatCurrency(data.summary.spend)}
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">Últimos 30 dias</span>
                  </div>

                  {/* Messages */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                      <span className="text-xs font-medium">Mensagens</span>
                      <MessageSquare className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-lg font-bold text-white font-mono mt-1">
                      {formatNumber(data.summary.messages)}
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">Conversas iniciadas</span>
                  </div>

                  {/* Clicks */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                      <span className="text-xs font-medium">Cliques</span>
                      <MousePointer className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-lg font-bold text-white font-mono mt-1">
                      {formatNumber(data.summary.clicks)}
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">Total de cliques</span>
                  </div>

                  {/* CPC */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1">
                      <span className="text-xs font-medium">Custo / Clique</span>
                      <BarChart2 className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-lg font-bold text-white font-mono mt-1">
                      {formatCurrency(data.summary.cpc)}
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">CPC Médio</span>
                  </div>
                </div>

                {/* Status Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-[var(--primary)]" />
                      Status das Campanhas
                    </span>
                    <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                      {data.counts.campaigns.active} Ativas
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)]">Total de Campanhas:</span>
                    <span className="font-semibold text-white">{data.counts.campaigns.total}</span>
                  </div>
                  
                  {data.campaigns && data.campaigns.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto divide-y divide-white/5 pr-1">
                      {data.campaigns.slice(0, 5).map((camp) => (
                        <div key={camp.id} className="flex justify-between items-center py-2 text-xs">
                          <span className="text-white/80 truncate max-w-[200px]" title={camp.name}>
                            {camp.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                            camp.status === 'ACTIVE' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-white/5 text-[var(--text-secondary)] border border-white/10'
                          }`}>
                            {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                          </span>
                        </div>
                      ))}
                      {data.campaigns.length > 5 && (
                        <div className="text-[10px] text-center text-[var(--text-secondary)] pt-2">
                          + {data.campaigns.length - 5} outras campanhas
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer CTA Actions */}
          <div className="p-6 border-t border-white/5 bg-black/40 flex flex-col gap-3">
            {client && (
              <a 
                href={`/dashboard?account_id=${client.meta_account_id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#d6652c] transition-all cursor-pointer text-center"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Relatório Completo
              </a>
            )}
            <button 
              onClick={onClose}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
