import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAccessToken() {
  const { data } = await supabase.from('settings').select('meta_access_token').limit(1).single()
  return data?.meta_access_token || process.env.META_ACCESS_TOKEN
}

interface MetaAction {
  action_type: string
  value: string
}

interface MetaInsight {
  spend?: string
  clicks?: string
  cpc?: string
  cpm?: string
  ctr?: string
  reach?: string
  frequency?: string
  impressions?: string
  actions?: MetaAction[]
  ad_id?: string
  ad_name?: string
}

interface MetaCampaign {
  id: string
  name: string
  status: string
  insights?: {
    data?: MetaInsight[]
  }
}

interface MetaAdset {
  id: string
  name: string
  status: string
  campaign_id: string
  campaign?: {
    name: string
  }
  insights?: {
    data?: MetaInsight[]
  }
}

interface MetaAd {
  id: string
  name: string
  status: string
  adset_id: string
  adset?: {
    name: string
  }
  campaign_id?: string
  campaign?: {
    name: string
  }
  insights?: {
    data?: MetaInsight[]
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ account_id: string }> }
) {
  try {
    const { account_id } = await params
    const accessToken = await getAccessToken()
    
    // URL query params
    const { searchParams } = new URL(request.url)
    const datePreset = searchParams.get('date_preset') || 'last_30d'
    const campaignId = searchParams.get('campaign_id')
    const adsetId = searchParams.get('adset_id')
    const adId = searchParams.get('ad_id')

    if (!accessToken) {
      return NextResponse.json({ error: 'META_ACCESS_TOKEN not configured' }, { status: 500 })
    }
    if (!account_id) {
      return NextResponse.json({ error: 'account_id parameter is required' }, { status: 400 })
    }

    // Determine target ID for insights
    const targetId = adId || adsetId || campaignId || `act_${account_id}`
    const insightsBaseUrl = `https://graph.facebook.com/v20.0/${targetId}`
    const baseUrl = `https://graph.facebook.com/v20.0/act_${account_id}`
    
    const appsecretProof = process.env.META_APP_SECRET
      ? crypto.createHmac('sha256', process.env.META_APP_SECRET).update(accessToken).digest('hex')
      : undefined

    const baseParams = new URLSearchParams({
      access_token: accessToken,
      date_preset: datePreset,
      ...(appsecretProof ? { appsecret_proof: appsecretProof } : {})
    })

    // 1. General Insights
    const pInsights = fetch(`${insightsBaseUrl}/insights?${new URLSearchParams({
      ...Object.fromEntries(baseParams),
      fields: 'spend,clicks,cpc,cpm,ctr,reach,frequency,impressions,actions'
    })}`)

    // 2. Gender Breakdown
    const pGender = fetch(`${insightsBaseUrl}/insights?${new URLSearchParams({
      ...Object.fromEntries(baseParams),
      fields: 'spend,clicks',
      breakdowns: 'gender'
    })}`)

    // 3. Age Breakdown
    const pAge = fetch(`${insightsBaseUrl}/insights?${new URLSearchParams({
      ...Object.fromEntries(baseParams),
      fields: 'spend,clicks',
      breakdowns: 'age'
    })}`)

    // 4. Region Breakdown
    const pRegion = fetch(`${insightsBaseUrl}/insights?${new URLSearchParams({
      ...Object.fromEntries(baseParams),
      fields: 'reach',
      breakdowns: 'region'
    })}`)

    // 5. Campaigns stats (always at account level, fetching full details)
    const pCampaigns = fetch(`${baseUrl}/campaigns?${new URLSearchParams({
      access_token: accessToken,
      ...(appsecretProof ? { appsecret_proof: appsecretProof } : {}),
      fields: 'id,name,status,insights{spend,clicks,actions}',
      limit: '500'
    })}`)

    // 6. Adsets stats (always at account level, fetching full details)
    const pAdsets = fetch(`${baseUrl}/adsets?${new URLSearchParams({
      access_token: accessToken,
      ...(appsecretProof ? { appsecret_proof: appsecretProof } : {}),
      fields: 'id,name,status,campaign_id,campaign{name},insights{spend,clicks,actions}',
      limit: '500'
    })}`)

    // 7. Ads stats (always at account level, fetching full details)
    const pAllAds = fetch(`${baseUrl}/ads?${new URLSearchParams({
      access_token: accessToken,
      ...(appsecretProof ? { appsecret_proof: appsecretProof } : {}),
      fields: 'id,name,status,adset_id,adset{name},campaign_id,campaign{name},insights{spend,clicks,actions}',
      limit: '500'
    })}`)

    // 8. Top Ads by Messaging
    const pAds = fetch(`${insightsBaseUrl}/insights?${new URLSearchParams({
      ...Object.fromEntries(baseParams),
      level: 'ad',
      fields: 'ad_id,ad_name,spend,clicks,cpc,actions',
      limit: '100'
    })}`)

    // 9. Account details
    const pAccountInfo = fetch(`https://graph.facebook.com/v20.0/act_${account_id}?${new URLSearchParams({
      access_token: accessToken,
      fields: 'id,name,business_name,currency,timezone_name,balance,amount_spent,spend_cap,promotable_pages.limit(1){name}',
      ...(appsecretProof ? { appsecret_proof: appsecretProof } : {})
    })}`)

    const [
      resInsights,
      resGender,
      resAge,
      resRegion,
      resCampaigns,
      resAdsets,
      resAllAds,
      resAds,
      resAccountInfo
    ] = await Promise.all([
      pInsights, pGender, pAge, pRegion, pCampaigns, pAdsets, pAllAds, pAds, pAccountInfo
    ])

    const dataInsights = await resInsights.json()
    const dataGender = await resGender.json()
    const dataAge = await resAge.json()
    const dataRegion = await resRegion.json()
    const dataCampaigns = await resCampaigns.json()
    const dataAdsets = await resAdsets.json()
    const dataAllAds = await resAllAds.json()
    const dataAds = await resAds.json()
    const dataAccountInfo = await resAccountInfo.json().catch(() => ({}))

    if (dataInsights.error) {
      return NextResponse.json({ error: dataInsights.error.message }, { status: 400 })
    }

    const insights = dataInsights.data?.[0] || {}

    // Extract basic metrics
    const spend = parseFloat(insights.spend || '0')
    const clicks = parseInt(insights.clicks || '0', 10)
    const cpc = parseFloat(insights.cpc || '0')
    const cpm = parseFloat(insights.cpm || '0')
    const ctr = parseFloat(insights.ctr || '0')
    const reach = parseInt(insights.reach || '0', 10)
    const frequency = parseFloat(insights.frequency || '0')
    const impressions = parseInt(insights.impressions || '0', 10)

    let leads = 0
    let messages = 0

    if (Array.isArray(insights.actions)) {
      const leadAction = insights.actions.find((a: MetaAction) => a.action_type === 'lead')
      if (leadAction) leads = parseInt(leadAction.value || '0', 10)

      const msgAction = insights.actions.find((a: MetaAction) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')
      if (msgAction) messages = parseInt(msgAction.value || '0', 10)
    }

    const cpl = leads > 0 ? spend / leads : 0
    const costPerMessage = messages > 0 ? spend / messages : 0

    // Campaigns status count and list processing
    const campaignsList: MetaCampaign[] = dataCampaigns.data || []
    const campaignsCount = campaignsList.length
    const campaignsActive = campaignsList.filter((c: MetaCampaign) => c.status === 'ACTIVE').length

    const processedCampaigns = campaignsList.map((c: MetaCampaign) => {
      const insight = c.insights?.data?.[0] || {}
      const cSpend = parseFloat(insight.spend || '0')
      const cClicks = parseInt(insight.clicks || '0', 10)
      let cMessages = 0
      if (Array.isArray(insight.actions)) {
        const msgAction = insight.actions.find((a: MetaAction) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')
        if (msgAction) cMessages = parseInt(msgAction.value || '0', 10)
      }
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        spend: cSpend,
        clicks: cClicks,
        messages: cMessages
      }
    })

    // Adsets list processing
    const adsetsList: MetaAdset[] = dataAdsets.data || []
    const processedAdsets = adsetsList.map((a: MetaAdset) => {
      const insight = a.insights?.data?.[0] || {}
      const aSpend = parseFloat(insight.spend || '0')
      const aClicks = parseInt(insight.clicks || '0', 10)
      const campaignName = a.campaign?.name || ''
      return {
        id: a.id,
        name: a.name,
        status: a.status,
        campaign_id: a.campaign_id,
        campaign_name: campaignName,
        spend: aSpend,
        clicks: aClicks
      }
    })

    // Ads list processing
    const allAdsList: MetaAd[] = dataAllAds.data || []
    const processedAllAds = allAdsList.map((ad: MetaAd, index: number) => {
      const insight = ad.insights?.data?.[0] || {}
      const adSpend = parseFloat(insight.spend || '0')
      const adClicks = parseInt(insight.clicks || '0', 10)
      let adMessages = 0
      if (Array.isArray(insight.actions)) {
        const msgAction = insight.actions.find((a: MetaAction) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')
        if (msgAction) adMessages = parseInt(msgAction.value || '0', 10)
      }
      const adsetName = ad.adset?.name || ''
      return {
        id: ad.id || ad.name || String(index),
        name: ad.name,
        status: ad.status,
        adset_id: ad.adset_id,
        adset_name: adsetName,
        campaign_id: ad.campaign_id || '',
        spend: adSpend,
        clicks: adClicks,
        messages: adMessages
      }
    })

    // Sort Top Ads by messaging
    const adsList: MetaInsight[] = dataAds.data || []
    const processedAds = adsList.map((ad: MetaInsight, index: number) => {
      let adMsgs = 0
      if (Array.isArray(ad.actions)) {
        const msgAction = ad.actions.find((a: MetaAction) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')
        if (msgAction) adMsgs = parseInt(msgAction.value || '0', 10)
      }
      return {
        id: ad.ad_id || ad.ad_name || String(index),
        name: ad.ad_name,
        spend: parseFloat(ad.spend || '0'),
        clicks: parseInt(ad.clicks || '0', 10),
        cpc: parseFloat(ad.cpc || '0'),
        messages: adMsgs
      }
    })
    
    processedAds.sort((a, b) => b.messages - a.messages)
    const topAds = processedAds.slice(0, 5)

    const pageName = dataAccountInfo.promotable_pages?.data?.[0]?.name || ''

    return NextResponse.json({
      account: {
        id: dataAccountInfo.account_id || account_id,
        name: dataAccountInfo.name || '',
        business_name: dataAccountInfo.business_name || '',
        currency: dataAccountInfo.currency || 'BRL',
        timezone_name: dataAccountInfo.timezone_name || '',
        page_name: pageName,
        balance: parseFloat(dataAccountInfo.balance || '0') / 100,
        amount_spent: parseFloat(dataAccountInfo.amount_spent || '0') / 100,
        spend_cap: parseFloat(dataAccountInfo.spend_cap || '0') / 100,
      },
      summary: {
        spend, clicks, cpc, cpm, ctr, reach, frequency, impressions, leads, messages, costPerMessage, cpl
      },
      counts: {
        campaigns: { total: campaignsCount, active: campaignsActive }
      },
      breakdowns: {
        gender: dataGender.data || [],
        age: dataAge.data || [],
        region: dataRegion.data || []
      },
      topAds,
      campaigns: processedCampaigns,
      adsets: processedAdsets,
      ads: processedAllAds
    })

  } catch (error) {
    console.error('API Route Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

