import { NextResponse } from 'next/server'
import crypto from 'crypto'

interface MetaAction {
  action_type: string
  value: string
}

interface MetaInsight {
  spend?: string
  impressions?: string
  reach?: string
  clicks?: string
  cpc?: string
  cpm?: string
  ctr?: string
  frequency?: string
  actions?: MetaAction[]
  date_start?: string
  date_stop?: string
  gender?: string
  age?: string
}

/**
 * Helper to make requests to the Meta Graph API v20.0
 */
async function fetchMetaAPI(
  endpoint: string,
  params: Record<string, string>,
  accessToken: string,
  appsecretProof: string
) {
  const queryParams = new URLSearchParams({
    access_token: accessToken,
    appsecret_proof: appsecretProof,
    ...params
  })

  const url = `https://graph.facebook.com/v20.0/${endpoint}?${queryParams.toString()}`
  
  const response = await fetch(url)
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.error) {
    const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`
    throw new Error(errorMessage)
  }

  return data
}

/**
 * Helper to parse standard insight metrics from Meta API response
 */
function parseInsightMetrics(insight: MetaInsight) {
  const spend = parseFloat(insight.spend || '0')
  const impressions = parseInt(insight.impressions || '0', 10)
  const reach = parseInt(insight.reach || '0', 10)
  const clicks = parseInt(insight.clicks || '0', 10)
  const cpc = parseFloat(insight.cpc || '0')
  const cpm = parseFloat(insight.cpm || '0')
  const ctr = parseFloat(insight.ctr || '0')
  const frequency = parseFloat(insight.frequency || '0')

  let messaging_conversation_started_7d = 0
  let lead = 0

  if (Array.isArray(insight.actions)) {
    const msgAction = insight.actions.find(
      (a: MetaAction) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d'
    )
    if (msgAction) {
      messaging_conversation_started_7d = parseInt(msgAction.value || '0', 10)
    }

    const leadAction = insight.actions.find((a: MetaAction) => a.action_type === 'lead')
    if (leadAction) {
      lead = parseInt(leadAction.value || '0', 10)
    }
  }

  return {
    spend,
    impressions,
    reach,
    clicks,
    cpc,
    cpm,
    ctr,
    frequency,
    messaging_conversation_started_7d,
    lead
  }
}

export async function GET(request: Request) {
  try {
    // 1. Receber query params
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id')
    const since = searchParams.get('since')
    const until = searchParams.get('until')

    // Validação básica de parâmetros
    if (!accountId) {
      return NextResponse.json({ error: 'O parâmetro query "account_id" é obrigatório.' }, { status: 400 })
    }
    if (!since) {
      return NextResponse.json({ error: 'O parâmetro query "since" é obrigatório.' }, { status: 400 })
    }
    if (!until) {
      return NextResponse.json({ error: 'O parâmetro query "until" é obrigatório.' }, { status: 400 })
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(since) || !dateRegex.test(until)) {
      return NextResponse.json(
        { error: 'Os parâmetros "since" e "until" devem estar no formato YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    // 2. Obter e validar variáveis de ambiente
    const accessToken = process.env.META_ACCESS_TOKEN
    const appId = process.env.META_APP_ID
    const appSecret = process.env.META_APP_SECRET

    if (!accessToken || !appId || !appSecret) {
      return NextResponse.json(
        { error: 'As variáveis de ambiente META_ACCESS_TOKEN, META_APP_ID e META_APP_SECRET não estão devidamente configuradas.' },
        { status: 500 }
      )
    }

    // Gerar appsecret_proof para segurança adicional
    const appsecretProof = crypto
      .createHmac('sha256', appSecret)
      .update(accessToken)
      .digest('hex')

    // Garantir formato correto do Account ID
    const cleanAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`
    const timeRange = JSON.stringify({ since, until })

    // 3. Buscar dados da Meta Graph API v20.0
    const [
      summaryData,
      dailyData,
      genderData,
      ageData,
      campaignsData,
      adsetsData,
      adsData
    ] = await Promise.all([
      // A. Insights da conta (Geral)
      fetchMetaAPI(`${cleanAccountId}/insights`, {
        fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
        time_range: timeRange
      }, accessToken, appsecretProof),

      // B. Breakdown por dia (time_increment=1)
      fetchMetaAPI(`${cleanAccountId}/insights`, {
        fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
        time_increment: '1',
        time_range: timeRange
      }, accessToken, appsecretProof),

      // C. Breakdown por gênero (action_breakdowns=gender)
      (async () => {
        try {
          return await fetchMetaAPI(`${cleanAccountId}/insights`, {
            fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
            breakdowns: 'gender',
            action_breakdowns: 'gender',
            time_range: timeRange
          }, accessToken, appsecretProof)
        } catch (error) {
          console.warn('Erro ao requisitar com action_breakdowns=gender, tentando apenas breakdowns=gender:', error)
          return await fetchMetaAPI(`${cleanAccountId}/insights`, {
            fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
            breakdowns: 'gender',
            time_range: timeRange
          }, accessToken, appsecretProof)
        }
      })(),

      // D. Breakdown por faixa etária (action_breakdowns=age)
      (async () => {
        try {
          return await fetchMetaAPI(`${cleanAccountId}/insights`, {
            fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
            breakdowns: 'age',
            action_breakdowns: 'age',
            time_range: timeRange
          }, accessToken, appsecretProof)
        } catch (error) {
          console.warn('Erro ao requisitar com action_breakdowns=age, tentando apenas breakdowns=age:', error)
          return await fetchMetaAPI(`${cleanAccountId}/insights`, {
            fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,frequency,actions',
            breakdowns: 'age',
            time_range: timeRange
          }, accessToken, appsecretProof)
        }
      })(),

      // E. Lista de campanhas com status
      fetchMetaAPI(`${cleanAccountId}/campaigns`, {
        fields: 'name,status,effective_status',
        limit: '500'
      }, accessToken, appsecretProof),

      // F. Lista de conjuntos com status
      fetchMetaAPI(`${cleanAccountId}/adsets`, {
        fields: 'name,status,effective_status',
        limit: '500'
      }, accessToken, appsecretProof),

      // G. Lista de anúncios com status
      fetchMetaAPI(`${cleanAccountId}/ads`, {
        fields: 'name,status,effective_status',
        limit: '500'
      }, accessToken, appsecretProof)
    ])

    // 4. Formatação e preparação do retorno em JSON
    const summary = summaryData.data?.[0] ? parseInsightMetrics(summaryData.data[0]) : {
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      frequency: 0,
      messaging_conversation_started_7d: 0,
      lead: 0
    }

    const daily = (dailyData.data || []).map((day: MetaInsight) => ({
      date_start: day.date_start,
      date_stop: day.date_stop,
      ...parseInsightMetrics(day)
    }))

    const gender = (genderData.data || []).map((g: MetaInsight) => ({
      gender: g.gender,
      ...parseInsightMetrics(g)
    }))

    const age = (ageData.data || []).map((a: MetaInsight) => ({
      age: a.age,
      ...parseInsightMetrics(a)
    }))

    return NextResponse.json({
      summary,
      daily,
      breakdowns: {
        gender,
        age,
        // Também expomos os dados brutos para manter retrocompatibilidade com componentes que parseiam campos diretamente
        rawGender: genderData.data || [],
        rawAge: ageData.data || []
      },
      campaigns: campaignsData.data || [],
      adsets: adsetsData.data || [],
      ads: adsData.data || []
    })

  } catch (error) {
    // 5. Tratar erros da API com mensagens claras
    console.error('Erro na Rota GET /api/meta:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao processar a requisição.'
    return NextResponse.json(
      {
        error: errorMessage
      },
      { status: 400 }
    )
  }
}

