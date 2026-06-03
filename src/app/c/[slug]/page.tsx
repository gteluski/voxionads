import { adminDb } from '@/lib/firebase-admin'
import { notFound } from 'next/navigation'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { StatCards } from '@/components/dashboard/StatCards'
import { TrafficFunnel } from '@/components/dashboard/TrafficFunnel'
import { TopAdsTable } from '@/components/dashboard/TopAdsTable'
import { AIInsights } from '@/components/dashboard/AIInsights'
import { AlertCircle, HelpCircle } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function fetchMetaInsights(
  accountId: string, 
  datePreset: string,
  campaignId?: string,
  adsetId?: string,
  adId?: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const queryParams = new URLSearchParams({
      date_preset: datePreset,
      ...(campaignId ? { campaign_id: campaignId } : {}),
      ...(adsetId ? { adset_id: adsetId } : {}),
      ...(adId ? { ad_id: adId } : {})
    })

    const res = await fetch(`${baseUrl}/api/meta/${accountId}?${queryParams.toString()}`, {
      next: { revalidate: 300 } // Cache for 5 mins
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    return result
  } catch (error) {
    console.error('Error fetching meta insights:', error)
    return null
  }
}

async function fetchMetaCampaigns(accountId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/meta/campaigns?account_id=${accountId}`, {
      next: { revalidate: 300 } // Cache for 5 mins
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error)
    return result
  } catch (error) {
    console.error('Error fetching meta campaigns:', error)
    return null
  }
}

export default async function ClientDashboardPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams

  const datePreset = typeof resolvedSearchParams.date_preset === 'string' ? resolvedSearchParams.date_preset : 'last_30d'
  const campaignId = typeof resolvedSearchParams.campaign_id === 'string' ? resolvedSearchParams.campaign_id : ''
  const adsetId = typeof resolvedSearchParams.adset_id === 'string' ? resolvedSearchParams.adset_id : ''
  const adId = typeof resolvedSearchParams.ad_id === 'string' ? resolvedSearchParams.ad_id : ''

  let client = null
  try {
    const snapshot = await adminDb
      .collection('clients')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      const data = doc.data()
      if (data.status !== false && data.active !== false) {
        client = {
          name: data.name,
          meta_account_id: data.meta_account_id
        }
      }
    }
  } catch (error) {
    console.error('Error fetching client by slug from Firestore:', error)
  }

  if (!client || !client.meta_account_id) {
    notFound()
  }


  let data = null
  let campaignsData = null
  let errorMsg = null

  const [insightsRes, campaignsRes] = await Promise.all([
    fetchMetaInsights(client.meta_account_id, datePreset, campaignId, adsetId, adId),
    fetchMetaCampaigns(client.meta_account_id)
  ])
  data = insightsRes
  campaignsData = campaignsRes

  if (!data || data.error) {
    errorMsg = data?.error || 'Erro ao carregar dados do Meta Ads'
  } else if (!campaignsData || campaignsData.error) {
    errorMsg = campaignsData?.error || 'Erro ao carregar dados das campanhas do Meta Ads'
  }

  const renderContent = () => {
    if (errorMsg) {
      return (
        <div className="bg-red-400/10 border border-red-400/20 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )
    }

    if (!data || !campaignsData) return null

    const { summary, counts, topAds, account } = data
    const campaigns = campaignsData.campaigns || []
    const adsets = campaignsData.adsets || []
    const ads = campaignsData.ads || []

    const stats = [
      { name: 'Investimento Total', value: formatCurrency(summary.spend), tooltip: 'Valor total gasto na Meta Ads no período selecionado.' },
      { name: 'Alcance', value: formatNumber(summary.reach), tooltip: 'Quantas pessoas únicas viram seu anúncio.' },
      { name: 'Impressões', value: formatNumber(summary.impressions), tooltip: 'Quantas vezes seus anúncios foram exibidos no total.' },
      { name: 'Frequência', value: summary.frequency.toFixed(2), tooltip: 'Quantas vezes em média cada pessoa viu seu anúncio.' },
      { name: 'Cliques (Todos)', value: formatNumber(summary.clicks), tooltip: 'Total de cliques recebidos nos anúncios.' },
      { name: 'Mensagens Iniciadas', value: formatNumber(summary.messages), tooltip: 'Novas conversas iniciadas a partir dos anúncios.' },
      { name: 'Custo por Clique (CPC)', value: formatCurrency(summary.cpc), tooltip: 'Custo médio de cada clique recebido.' },
      { name: 'Custo por Mensagem', value: formatCurrency(summary.costPerMessage), tooltip: 'Quanto custou em média cada mensagem iniciada.' },
      { name: 'CPM', value: formatCurrency(summary.cpm), tooltip: 'Custo por mil impressões — quanto você paga para 1000 pessoas verem seu anúncio.' },
      { name: 'CTR', value: formatPercent(summary.ctr), tooltip: 'Taxa de cliques — % de pessoas que viram e clicaram no anúncio.' },
    ]

    const funnelData = {
      impressions: summary.impressions,
      reach: summary.reach,
      clicks: summary.clicks,
      messages: summary.messages,
    }

    return (
      <>
        <div className="mb-6">
          <DashboardFilters campaigns={campaigns} adsets={adsets} ads={ads} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[var(--card)] p-4 rounded-xl border border-white/5 flex flex-col justify-center">
            <span className="text-[var(--text-secondary)] text-sm">Campanhas</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{counts.campaigns.total}</span>
              <span className="text-sm text-green-400 mb-0.5">({counts.campaigns.active} ativas)</span>
            </div>
          </div>

          <div className="bg-[var(--card)] p-4 rounded-xl border border-white/5 flex flex-col justify-center relative">
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm">
              <span>Saldo Disponível</span>
              <span className="relative inline-block cursor-help group/tooltip text-white/40 hover:text-white transition-colors">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-[#1a1410] text-white text-xs font-normal py-1.5 px-3 rounded-lg border border-white/10 shadow-xl z-50 pointer-events-none w-48 text-center leading-normal">
                  Valor disponível na conta para veicular anúncios
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1a1410]" />
                </span>
              </span>
            </div>
            <div className="flex items-end mt-1">
              <span className={`text-2xl font-bold font-mono ${
                (account?.balance ?? 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(account?.balance ?? 0)}
              </span>
            </div>
          </div>
        </div>

        <StatCards stats={stats} />

        <AIInsights summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TrafficFunnel data={funnelData} />
          </div>
          <div className="lg:col-span-2">
            <TopAdsTable ads={topAds} />
          </div>
        </div>
      </>
    )
  }

  const account = data?.account

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-wider text-white">
              VOXION <span className="text-[var(--primary)]">Ads</span>
            </h1>
            <span className="h-5 w-[1px] bg-white/10" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Relatório de Desempenho</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Relatório Meta Ads | {client.name}
          </h2>
          {account && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Conta de Anúncios: <span className="font-mono text-white/70">{account.name}</span>
              {account.business_name && account.business_name !== account.name && (
                <span className="text-white/70"> ({account.business_name})</span>
              )}
              <span className="mx-2">•</span>
              ID: <span className="font-mono text-white/70">{account.id}</span>
            </p>
          )}
        </div>
      </header>

      {renderContent()}
    </div>
  )
}
