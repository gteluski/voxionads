import { adminDb } from '@/lib/firebase-admin'
import { notFound } from 'next/navigation'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { StatCards } from '@/components/dashboard/StatCards'
import { TrafficFunnel } from '@/components/dashboard/TrafficFunnel'
import { TopAdsTable } from '@/components/dashboard/TopAdsTable'
import { DemographicsCharts } from '@/components/dashboard/DemographicsCharts'
import { AIInsights } from '@/components/dashboard/AIInsights'
import { AccountStructure } from '@/components/dashboard/AccountStructure'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

async function getClientData(slug: string) {
  try {
    const snapshot = await adminDb
      .collection('clients')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const client = { id: doc.id, ...doc.data() } as any

    if (client.status === false || client.active === false) {
      return null
    }

    return client
  } catch (error) {
    console.error('Error fetching client by slug from Firestore:', error)
    return null
  }
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

export default async function ClientDashboardPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { date_preset, campaign_id, adset_id, ad_id } = await searchParams
  const datePreset = typeof date_preset === 'string' ? date_preset : 'last_30d'
  const campaignId = typeof campaign_id === 'string' ? campaign_id : ''
  const adsetId = typeof adset_id === 'string' ? adset_id : ''
  const adId = typeof ad_id === 'string' ? ad_id : ''
  
  const client = await getClientData(slug)
  if (!client) notFound()

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
    errorMsg = data?.error || 'Erro ao carregar dados'
  } else if (!campaignsData || campaignsData.error) {
    errorMsg = campaignsData?.error || 'Erro ao carregar dados das campanhas'
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in p-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Relatório Meta Ads | {client.name}</h2>
        <div className="bg-red-400/10 border border-red-400/20 rounded-md p-4 text-red-400">
          Não foi possível carregar os dados desta conta no momento. {errorMsg}
        </div>
      </div>
    )
  }

  const { summary, counts, breakdowns, topAds, account } = data
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>Relatório Meta Ads | {client.name}</span>
            {account && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-mono">
                {account.currency || 'BRL'}
              </span>
            )}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {account?.business_name || account?.name ? (
              <>
                Conta Meta: <span className="text-white/70 font-medium">{account.business_name || account.name}</span>{' '}
                <span className="text-white/40 font-mono">({account.id})</span>
              </>
            ) : (
              <>
                Métricas de performance e insights de público da conta <span className="font-mono text-white/50">{client.meta_account_id}</span>
              </>
            )}
            {account?.page_name && (
              <>
                <span className="mx-2">•</span>
                Página: <span className="text-white/70 font-medium">{account.page_name}</span>
              </>
            )}
          </p>
        </div>
      </div>

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
      </div>

      <StatCards stats={stats} />

      <AccountStructure campaigns={campaigns} adsets={adsets} ads={ads} />

      <AIInsights summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TrafficFunnel data={funnelData} />
        </div>
        <div className="lg:col-span-2">
          <TopAdsTable ads={topAds} />
        </div>
      </div>

      <DemographicsCharts genderData={breakdowns.gender} ageData={breakdowns.age} />
      
      <div className="pt-12 pb-6 flex justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
         <span className="text-xs font-semibold text-white/50 tracking-widest flex items-center gap-2">
           GERADO POR <span className="text-white">VOXION</span>
         </span>
      </div>
    </div>
  )
}
